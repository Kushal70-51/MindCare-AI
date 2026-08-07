'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AiVoiceOrbProps {
  mode?: 'idle' | 'listening' | 'speaking' | 'thinking';
  size?: 'sm' | 'md' | 'lg';
}

export const AiVoiceOrb: React.FC<AiVoiceOrbProps> = ({
  mode = 'speaking',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-28 h-28',
    md: 'w-52 h-52 sm:w-64 sm:h-64',
    lg: 'w-64 h-64 sm:w-80 sm:h-80',
  };

  const getOrbGradient = () => {
    switch (mode) {
      case 'listening':
        return 'from-emerald-400 via-teal-500 to-blue-600';
      case 'thinking':
        return 'from-purple-500 via-indigo-500 to-blue-600';
      case 'speaking':
        return 'from-blue-500 via-cyan-400 to-emerald-400';
      default:
        return 'from-slate-700 via-slate-800 to-slate-900';
    }
  };

  const isVoiceActive = mode === 'speaking' || mode === 'listening';

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      {/* Outer Glow Halo - Only pulses when active voice speaking */}
      {isVoiceActive && (
        <motion.div
          animate={{
            scale: mode === 'speaking' ? [1.1, 1.35, 1.1] : [1.05, 1.15, 1.05],
            opacity: mode === 'listening' ? [0.4, 0.7, 0.4] : [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: mode === 'speaking' ? 2 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${getOrbGradient()} blur-2xl opacity-60`}
        />
      )}

      {/* Ripple Rings when Listening & Active */}
      {mode === 'listening' && (
        <>
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-emerald-400/50"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
            className="absolute inset-0 rounded-full border border-teal-300/40"
          />
        </>
      )}

      {/* Rotating Ring */}
      <motion.div
        animate={{ rotate: isVoiceActive ? 360 : 0 }}
        transition={{ duration: mode === 'thinking' ? 4 : 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-8%] rounded-full border border-white/20 p-1"
      >
        <div className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_12px_#14b8a6]" />
      </motion.div>

      {/* Main Glassmorphic Sphere */}
      <motion.div
        animate={{
          scale: mode === 'speaking' ? [1, 1.06, 0.98, 1.04, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: mode === 'speaking' ? 1.8 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative w-full h-full rounded-full bg-gradient-to-tr ${getOrbGradient()} shadow-2xl p-1 overflow-hidden backdrop-blur-xl border-2 border-white/40 flex items-center justify-center`}
      >
        {/* Central Audio Waves / Pulse Bars - ONLY bounce when mode === 'speaking' */}
        <div className="relative z-10 flex items-center justify-center gap-2 h-16">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              animate={
                mode === 'speaking'
                  ? { height: ['12px', '48px', '20px', '54px', '12px'] }
                  : { height: ['10px', '12px', '10px'] }
              }
              transition={{
                duration: mode === 'speaking' ? 0.65 : 2,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'easeInOut',
              }}
              className={`w-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] ${
                mode === 'speaking' ? 'bg-white' : 'bg-slate-400/60'
              }`}
            />
          ))}
        </div>

        {/* Glass Specular Reflection Highlight */}
        <div className="absolute top-2 left-4 w-1/2 h-1/3 rounded-full bg-gradient-to-b from-white/50 to-transparent blur-[2px] pointer-events-none" />
      </motion.div>
    </div>
  );
};
