import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  // Use a RefObject to access the analyser, or pass the AnalyserNode directly.
  // Passing the RefObject allows us to access the current value even if it changes without re-render of parent.
  analyzerRef: React.MutableRefObject<AnalyserNode | null>;
  isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyzerRef, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dataArray = new Uint8Array(256); // Fits FFT size 256

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let volume = 0;

      // Calculate volume directly from the ref
      if (isActive && analyzerRef.current) {
        try {
            analyzerRef.current.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((a, b) => a + b, 0);
            const avg = sum / dataArray.length;
            volume = avg;
        } catch (e) {
            // Analyser might be disconnected
        }
      }

      if (!isActive || volume === 0) {
        // Draw a flat line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#334155'; // Slate 700
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Keep animating even if idle to smoothly transition? No, just stop if not active to save battery.
        // But we need to keep checking if volume appears (if isActive is true).
        if(isActive) {
           animationId = requestAnimationFrame(draw);
        }
        return;
      }

      // Draw wave based on volume
      // Normalize volume (0-255) to a scale factor
      const scale = Math.min(volume / 50, 1.5); 
      
      ctx.beginPath();
      ctx.moveTo(0, height / 2);

      for (let i = 0; i < width; i++) {
        // Create a sine wave that moves and scales with volume
        const frequency = 0.1;
        const amplitude = 20 * scale;
        const y = height / 2 + Math.sin(i * frequency + Date.now() / 100) * amplitude;
        ctx.lineTo(i, y);
      }

      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#3b82f6'); // Blue 500
      gradient.addColorStop(0.5, '#8b5cf6'); // Violet 500
      gradient.addColorStop(1, '#ec4899'); // Pink 500

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.stroke();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isActive, analyzerRef]); // Dependencies

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={100} 
      className="w-full h-24 rounded-lg bg-slate-900 border border-slate-800"
    />
  );
};