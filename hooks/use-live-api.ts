import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, LogMessage } from '../types';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/audio-utils';
import { MODEL_NAME, SYSTEM_INSTRUCTION_PREFIX } from '../constants';

interface UseLiveApiProps {
  policyContext: string;
}

export function useLiveApi({ policyContext }: UseLiveApiProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isMicMuted, setIsMicMuted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Analyzer for visuals - Exposed via Ref to avoid state re-renders
  const analyzerRef = useRef<AnalyserNode | null>(null);

  // Auto-reconnect state
  const isIntentionalDisconnect = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 5;

  const addLog = (role: LogMessage['role'], message: string) => {
    setLogs(prev => [...prev.slice(-99), { timestamp: new Date(), role, message }]);
  };

  const cleanupAudioContexts = () => {
    if (inputContextRef.current) {
        inputContextRef.current.close();
        inputContextRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    // Stop all playing sources
    sourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    analyzerRef.current = null;
  };

  const disconnect = useCallback(async (intentional: boolean = true) => {
    isIntentionalDisconnect.current = intentional;
    
    if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
    }

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch (e) {
        console.error("Error closing session", e);
      }
      sessionPromiseRef.current = null;
    }

    cleanupAudioContexts();

    if (intentional) {
        setConnectionState(ConnectionState.DISCONNECTED);
        addLog('system', 'Disconnected from agent.');
    } else {
        // If not intentional, we might be in RECONNECTING state already or ERROR
        // The caller (onError/onClose) handles state setting
    }
  }, []);

  const connect = useCallback(async (isRetry: boolean = false) => {
    if (!process.env.API_KEY) {
      alert("API_KEY not found in environment variables.");
      return;
    }

    // If it's a new connection (not a retry), reset retry count and intentional flag
    if (!isRetry) {
        isIntentionalDisconnect.current = false;
        retryCountRef.current = 0;
    }

    setConnectionState(isRetry ? ConnectionState.RECONNECTING : ConnectionState.CONNECTING);
    addLog('system', isRetry ? `Attempting to reconnect (${retryCountRef.current + 1}/${MAX_RETRIES})...` : 'Connecting to Gemini Live API...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Initialize Audio Contexts
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Setup Analyzer for visualizer
      const analyzer = audioContextRef.current.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;
      
      const outputGain = audioContextRef.current.createGain();
      outputGain.connect(analyzer);
      analyzer.connect(audioContextRef.current.destination);

      // Start Input Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputContextRef.current.createMediaStreamSource(stream);
      
      // OPTIMIZATION: Reduce buffer size to 2048 (approx 128ms latency) from 4096 (256ms)
      const scriptProcessor = inputContextRef.current.createScriptProcessor(2048, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        if (isMicMutedRef.current) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        
        if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => {
             // Only send if connected
             session.sendRealtimeInput({ media: pcmBlob });
          }).catch(err => {
              // Ignore send errors during reconnection
          });
        }
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(inputContextRef.current.destination);

      // Establish Connection
      const config = {
        model: MODEL_NAME,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: SYSTEM_INSTRUCTION_PREFIX + policyContext,
      };

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: config as any,
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            addLog('system', 'Connected! Start speaking.');
            nextStartTimeRef.current = audioContextRef.current?.currentTime || 0;
            retryCountRef.current = 0; // Reset retries on success
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
               try {
                  const ctx = audioContextRef.current;
                  const audioBytes = base64ToUint8Array(base64Audio);
                  const audioBuffer = await decodeAudioData(audioBytes, ctx);
                  
                  const now = ctx.currentTime;
                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, now);
                  
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outputGain);
                  
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  
                  sourcesRef.current.add(source);
                  source.onended = () => sourcesRef.current.delete(source);
               } catch (error) {
                 console.error("Error decoding/playing audio", error);
               }
            }
            
            if (message.serverContent?.interrupted) {
              addLog('system', 'Agent interrupted.');
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e){}
              });
              sourcesRef.current.clear();
              if (audioContextRef.current) {
                nextStartTimeRef.current = audioContextRef.current.currentTime;
              }
            }
          },
          onclose: () => {
            if (!isIntentionalDisconnect.current) {
                 handleReconnect();
            } else {
                setConnectionState(ConnectionState.DISCONNECTED);
                addLog('system', 'Session closed.');
            }
          },
          onerror: (err) => {
            console.error("Session error:", err);
            if (!isIntentionalDisconnect.current) {
                handleReconnect();
            } else {
                setConnectionState(ConnectionState.ERROR);
                addLog('system', 'Error occurred.');
            }
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

      // Note: We removed the visualizer loop from here to avoid re-rendering the component 60fps via setState.
      // The visualizer component will now access analyzerRef directly.

    } catch (error) {
      console.error("Connection failed", error);
      handleReconnect();
    }
  }, [policyContext]);

  const handleReconnect = useCallback(() => {
     if (isIntentionalDisconnect.current) return;
     
     if (retryCountRef.current < MAX_RETRIES) {
         setConnectionState(ConnectionState.RECONNECTING);
         const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000); // Exponential backoff
         addLog('system', `Connection lost. Reconnecting in ${delay/1000}s...`);
         
         reconnectTimeoutRef.current = setTimeout(() => {
             retryCountRef.current++;
             cleanupAudioContexts();
             connect(true);
         }, delay);
     } else {
         setConnectionState(ConnectionState.ERROR);
         addLog('system', 'Unable to reconnect after multiple attempts. Please try again later.');
         disconnect(true); // Final cleanup
     }
  }, [connect, disconnect]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect(true);
    };
  }, [disconnect]);

  const isMicMutedRef = useRef(isMicMuted);
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);
  
  return {
    connect: () => connect(false),
    disconnect: () => disconnect(true),
    connectionState,
    logs,
    isMicMuted,
    setIsMicMuted,
    isMicMutedRef,
    analyzerRef // Expose the ref directly
  };
}