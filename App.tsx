import React, { useState, useEffect } from 'react';
import { useLiveApi } from './hooks/use-live-api';
import { PolicyPanel } from './components/PolicyPanel';
import { AudioVisualizer } from './components/AudioVisualizer';
import { HistoryPanel } from './components/HistoryPanel';
import { DEFAULT_POLICY_TEXT } from './constants';
import { ConnectionState, StoredSession } from './types';
import { Mic, MicOff, Phone, PhoneOff, ShieldCheck, Activity, AlertCircle, History } from 'lucide-react';

const App: React.FC = () => {
  const [policyText, setPolicyText] = useState(DEFAULT_POLICY_TEXT);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<StoredSession[]>([]);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
    
    // Load history
    const stored = localStorage.getItem('insure_voice_history');
    if (stored) {
        try {
            setSessionHistory(JSON.parse(stored));
        } catch (e) {
            console.error("Failed to parse history", e);
        }
    }
  }, []);

  const {
    connect,
    disconnect,
    connectionState,
    logs,
    isMicMuted,
    setIsMicMuted,
    isMicMutedRef,
    analyzerRef
  } = useLiveApi({ policyContext: policyText });

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;
  const isReconnecting = connectionState === ConnectionState.RECONNECTING;

  // Sync ref
  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted, isMicMutedRef]);

  const saveCurrentSession = () => {
      if (logs.length === 0) return;
      
      const newSession: StoredSession = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          logs: [...logs],
      };
      
      const updatedHistory = [newSession, ...sessionHistory];
      setSessionHistory(updatedHistory);
      localStorage.setItem('insure_voice_history', JSON.stringify(updatedHistory));
  };

  const toggleConnection = () => {
    if (isConnected || isConnecting || isReconnecting) {
      saveCurrentSession();
      disconnect();
    } else {
      connect();
    }
  };

  const handleClearHistory = () => {
      if(confirm("Are you sure you want to clear all conversation history?")) {
        setSessionHistory([]);
        localStorage.removeItem('insure_voice_history');
      }
  }

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Missing API Key</h1>
          <p className="text-slate-400">
            Please provide a valid Gemini API Key in the <code>process.env.API_KEY</code> environment variable to use this application.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">InsureVoice AI</h1>
              <p className="text-xs text-blue-400 font-medium">REAL-TIME AGENT • GEMINI LIVE</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isConnected 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : isReconnecting
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                  : connectionState === ConnectionState.ERROR 
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : isReconnecting ? 'bg-yellow-500' : 'bg-current'}`} />
              {connectionState}
            </div>
            
            <button
                onClick={() => setIsHistoryOpen(true)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative"
                title="View History"
            >
                <History className="w-5 h-5" />
                {sessionHistory.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Left Panel: Policy / Knowledge Base */}
        <div className="lg:col-span-5 h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)]">
          <PolicyPanel 
            policyText={policyText} 
            onUpdatePolicy={setPolicyText} 
            disabled={isConnected || isConnecting || isReconnecting}
          />
        </div>

        {/* Right Panel: Live Agent Interface */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">
          
          {/* Agent Status Card */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
            
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
            
            <div className="z-10 text-center space-y-6 w-full max-w-lg">
              <div className="relative inline-block">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isConnected 
                    ? 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.3)]' 
                    : isReconnecting
                        ? 'bg-yellow-600 shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-pulse'
                        : 'bg-slate-700'
                }`}>
                  <Activity className={`w-10 h-10 ${isConnected ? 'text-white' : 'text-slate-500'}`} />
                </div>
                {isConnected && (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-green-500 border-2 border-slate-800"></span>
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  {isConnected ? 'Agent Alex is Listening' : isReconnecting ? 'Reconnecting...' : 'Agent Offline'}
                </h2>
                <p className="text-slate-400">
                  {isConnected 
                    ? 'Speak naturally to ask about the policy.' 
                    : isReconnecting
                        ? 'Lost connection. Attempting to restore...'
                        : 'Connect to start a voice session.'}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  disabled={!isConnected}
                  className={`p-4 rounded-full transition-all duration-200 ${
                    !isConnected 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : isMicMuted 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                  title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                  {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                  onClick={toggleConnection}
                  className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg ${
                    isConnected 
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20' 
                      : isConnecting || isReconnecting
                        ? 'bg-yellow-600 cursor-wait text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <PhoneOff className="w-6 h-6" /> End Call
                    </>
                  ) : isConnecting ? (
                    <>Connecting...</>
                  ) : isReconnecting ? (
                    <>Cancel</> 
                  ) : (
                    <>
                      <Phone className="w-6 h-6" /> Start Call
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Visualizer at bottom of card */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-50">
               <AudioVisualizer analyzerRef={analyzerRef} isActive={isConnected} />
            </div>
          </div>

          {/* Transcript / Logs */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 shadow-xl flex flex-col overflow-hidden min-h-[200px]">
             <div className="p-3 border-b border-slate-700 bg-slate-900/30">
               <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Session Logs</h3>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                {logs.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-10 italic">
                    Connection logs and events will appear here.
                  </div>
                )}
                {logs.map((log, i) => (
                  <div key={i} className={`flex gap-3 text-sm ${log.role === 'system' ? 'opacity-75' : ''}`}>
                    <span className="text-slate-500 font-mono text-xs whitespace-nowrap mt-0.5">
                      {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                    </span>
                    <span className={`
                      ${log.role === 'agent' ? 'text-blue-400' : ''}
                      ${log.role === 'user' ? 'text-green-400' : ''}
                      ${log.role === 'system' ? 'text-yellow-500' : ''}
                    `}>
                      <span className="font-bold uppercase text-xs mr-2">{log.role}:</span>
                      {log.message}
                    </span>
                  </div>
                ))}
                {/* Auto-scroll anchor */}
                <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
             </div>
          </div>
        </div>

        {/* History Drawer */}
        {isHistoryOpen && (
            <HistoryPanel 
                sessions={sessionHistory} 
                onClose={() => setIsHistoryOpen(false)} 
                onClearHistory={handleClearHistory}
            />
        )}
      </main>
    </div>
  );
};

export default App;