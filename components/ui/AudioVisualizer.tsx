'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  isRecording?: boolean;
  barCount?: number;
  height?: number;
  isSpeaking?: boolean; // explicit flag when user/AI is talking
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording = true,
  barCount = 28,
  height = 56,
  isSpeaking = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [activeVolume, setActiveVolume] = useState<number>(0);

  useEffect(() => {
    let animationFrameId: number;
    let micStream: MediaStream | null = null;

    if (isRecording) {
      navigator.mediaDevices
        ?.getUserMedia({ audio: true })
        .then((stream) => {
          micStream = stream;
          streamRef.current = stream;
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            audioCtxRef.current = ctx;
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyserRef.current = analyser;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);
          }
        })
        .catch(() => {
          // Mic permission denied or unattached
        });
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(32);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const barWidth = (width - (barCount - 1) * 4) / barCount;

      let currentVolume = 0;
      if (analyserRef.current && isRecording) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        currentVolume = sum / (dataArray.length * 255);
      }

      setActiveVolume(currentVolume);

      // ONLY draw active bouncing waves if mic is recording and volume exceeds threshold or isSpeaking is explicitly true
      const isVoiceActive = isRecording && (currentVolume > 0.04 || isSpeaking);

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4; // Flat static baseline when quiet / not talking

        if (isVoiceActive) {
          const freqVal = dataArray[i % dataArray.length] || 0;
          const normalized = freqVal / 255;
          barHeight = Math.max(6, normalized * canvas.height * 0.95);
        }

        const x = i * (barWidth + 4);
        const y = (canvas.height - barHeight) / 2;

        // Gradient for active talking vs flat silent baseline
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isVoiceActive) {
          gradient.addColorStop(0, '#14B8A6');
          gradient.addColorStop(0.5, '#2563EB');
          gradient.addColorStop(1, '#3B82F6');
        } else {
          gradient.addColorStop(0, 'rgba(148, 163, 184, 0.2)');
          gradient.addColorStop(1, 'rgba(148, 163, 184, 0.2)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 4);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [isRecording, isSpeaking, barCount]);

  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      <canvas
        ref={canvasRef}
        width={340}
        height={height}
        className="w-full max-w-[340px] h-[56px] rounded-xl bg-slate-950/60 p-1 border border-white/10"
      />
      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
        <span
          className={`w-2 h-2 rounded-full ${
            activeVolume > 0.04 || isSpeaking
              ? 'bg-emerald-400 shadow-[0_0_8px_#22c55e] animate-pulse'
              : 'bg-slate-600'
          }`}
        />
        <span>
          {activeVolume > 0.04 || isSpeaking ? 'Voice Signal Active' : 'Silent (No Voice Signal)'}
        </span>
      </div>
    </div>
  );
};
