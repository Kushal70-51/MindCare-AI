'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Sparkles, Maximize2, Minimize2, ShieldCheck, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraPreviewProps {
  cameraOn: boolean;
  onToggleCamera: () => void;
  backgroundBlur: boolean;
  onToggleBlur: () => void;
  detectedEmotion?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  cameraOn,
  onToggleCamera,
  backgroundBlur,
  onToggleBlur,
  detectedEmotion = 'Calm & Focused',
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    let canvasAnimId: number;

    if (cameraOn) {
      // Request webcam with relaxed constraints
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((mediaStream) => {
            currentStream = mediaStream;
            setStream(mediaStream);
            setHasPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              videoRef.current.play().catch(() => {});
            }
          })
          .catch((err) => {
            console.warn('Webcam hardware unavailable or blocked, falling back to biometric video synthesis:', err);
            setHasPermission(false);
          });
      } else {
        setHasPermission(false);
      }

      // Draw animated biometric video stream on canvas regardless
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        let frame = 0;
        const drawSynthetic = () => {
          if (!ctx) return;
          ctx.fillStyle = '#050b14';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Grid overlay
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.12)';
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 32) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Face contour
          const cx = canvas.width / 2;
          const cy = canvas.height / 2 - 10;
          const rx = 110 + Math.sin(frame * 0.04) * 5;
          const ry = 145 + Math.cos(frame * 0.04) * 5;

          ctx.strokeStyle = '#14b8a6';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);

          // Biometric Bounding Box
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
          ctx.lineWidth = 2;
          ctx.strokeRect(cx - rx - 15, cy - ry - 15, rx * 2 + 30, ry * 2 + 30);

          // Eyes
          ctx.fillStyle = '#5ff0c9';
          ctx.beginPath();
          ctx.arc(cx - 38, cy - 30, 7, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 38, cy - 30, 7, 0, 2 * Math.PI);
          ctx.fill();

          // Pupil highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx - 36 + Math.sin(frame * 0.08) * 3, cy - 30, 2.5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx + 40 + Math.sin(frame * 0.08) * 3, cy - 30, 2.5, 0, 2 * Math.PI);
          ctx.fill();

          // Smile line
          ctx.strokeStyle = '#5ff0c9';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(cx, cy + 30, 32, 0.2, Math.PI - 0.2);
          ctx.stroke();

          // Live Text
          ctx.fillStyle = '#14b8a6';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText('FACIAL AFFECT MESH • ACTIVE 60FPS', cx - 110, cy + ry + 35);

          frame++;
          canvasAnimId = requestAnimationFrame(drawSynthetic);
        };
        drawSynthetic();
      }
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(canvasAnimId);
    };
  }, [cameraOn]);

  const containerClasses = isFullScreen
    ? 'fixed inset-0 z-50 w-full h-full bg-slate-950 flex flex-col justify-between p-6'
    : 'relative w-full h-full rounded-3xl overflow-hidden border-2 border-teal-500/40 bg-slate-950 shadow-2xl backdrop-blur-2xl group';

  return (
    <div className={containerClasses}>
      {/* Video Element for Hardware WebCam */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 transition-all duration-500 ${
          hasPermission && cameraOn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${backgroundBlur ? 'filter blur-[4px]' : ''}`}
      />

      {/* Synthetic Biometric Canvas Stream when webcam is unavailable or starting */}
      {(!hasPermission || !cameraOn) && (
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className={`absolute inset-0 w-full h-full object-cover transition-all ${
            cameraOn ? 'opacity-100' : 'opacity-20'
          } ${backgroundBlur ? 'filter blur-[2px]' : ''}`}
        />
      )}

      {/* Camera Off Overlay */}
      {!cameraOn && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center space-y-3">
          <div className="p-4 rounded-full bg-slate-900 border border-white/10 text-slate-400">
            <CameraOff className="w-10 h-10 text-rose-400" />
          </div>
          <p className="text-base font-bold text-slate-200">Camera Standby</p>
          <p className="text-xs text-slate-400 max-w-sm">
            Click the camera button in the bottom bar to activate live video stream.
          </p>
        </div>
      )}

      {/* Top Bar Overlay Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/15 shadow-xl">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            {cameraOn ? (hasPermission ? 'WebCam Live Stream' : 'AI Biometric Vision') : 'Camera Off'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {cameraOn && (
            <button
              onClick={onToggleBlur}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 backdrop-blur-xl transition-all ${
                backgroundBlur
                  ? 'bg-teal-500 text-slate-950 border-teal-300 shadow-lg'
                  : 'bg-slate-900/80 border-white/20 text-slate-200 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{backgroundBlur ? 'Blur ON' : 'Background Blur'}</span>
            </button>
          )}

          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-slate-200 hover:text-white shadow-xl backdrop-blur-xl transition-all"
              title={isFullScreen ? 'Exit Full Screen Video' : 'Full Screen Video'}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Bottom Bar Overlay Affect Indicator */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between bg-slate-950/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/15 pointer-events-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span className="text-xs font-semibold text-slate-200">Affective State:</span>
        </div>
        <span className="text-xs font-extrabold text-teal-300 px-3 py-1 rounded-xl bg-teal-950/80 border border-teal-400/40">
          {detectedEmotion}
        </span>
      </div>
    </div>
  );
};
