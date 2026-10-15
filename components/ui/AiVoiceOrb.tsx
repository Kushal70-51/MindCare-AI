'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AiVoiceOrbProps {
  mode?: 'idle' | 'listening' | 'speaking' | 'thinking';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const AiVoiceOrb: React.FC<AiVoiceOrbProps> = ({
  mode = 'speaking',
  size = 'md',
}) => {
  const sizeClasses = {
    xs: 'w-11 h-11',
    sm: 'w-14 h-14',
    md: 'w-44 h-44 sm:w-52 sm:h-52',
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
  const isCompact = size === 'xs' || size === 'sm';

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${sizeClasses[size] || sizeClasses.md}`}>
      {/* Outer Glow Halo - Only pulses when active voice speaking */}
      {isVoiceActive && (
        <motion.div
          animate={{
            scale: mode === 'speaking' ? (isCompact ? [1.1, 1.25, 1.1] : [1.1, 1.35, 1.1]) : [1.05, 1.15, 1.05],
            opacity: mode === 'listening' ? [0.4, 0.7, 0.4] : [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: mode === 'speaking' ? 2 : 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${getOrbGradient()} ${
            isCompact ? 'blur-md opacity-50' : 'blur-2xl opacity-60'
          }`}
        />
      )}

      {/* Ripple Rings when Listening & Active */}
      {mode === 'listening' && (
        <>
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: isCompact ? 1.3 : 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-emerald-400/50"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: isCompact ? 1.3 : 1.5, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
            className="absolute inset-0 rounded-full border border-teal-300/40"
          />
        </>
      )}

      {/* Rotating Ring */}
      <motion.div
        animate={{ rotate: isVoiceActive ? 360 : 0 }}
        transition={{ duration: mode === 'thinking' ? 4 : 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-6%] rounded-full border border-white/20 p-0.5"
      >
        <div className={`${isCompact ? 'w-1.5 h-1.5' : 'w-3 h-3'} rounded-full bg-teal-400 shadow-[0_0_8px_#14b8a6]`} />
      </motion.div>

      {/* Main Glassmorphic Sphere */}
      <motion.div
        animate={{
          scale: mode === 'speaking' ? [1, 1.05, 0.98, 1.03, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: mode === 'speaking' ? 1.8 : 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`relative w-full h-full rounded-full bg-gradient-to-tr ${getOrbGradient()} shadow-lg p-0.5 overflow-hidden backdrop-blur-xl border border-white/40 flex items-center justify-center`}
      >
        {/* Central Audio Waves / Pulse Bars */}
        <div className={`relative z-10 flex items-center justify-center ${isCompact ? 'gap-0.5 h-6' : 'gap-2 h-16'}`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              animate={
                mode === 'speaking'
                  ? isCompact
                    ? { height: ['4px', '16px', '7px', '18px', '4px'] }
                    : { height: ['12px', '48px', '20px', '54px', '12px'] }
                  : isCompact
                  ? { height: ['3px', '5px', '3px'] }
                  : { height: ['10px', '12px', '10px'] }
              }
              transition={{
                duration: mode === 'speaking' ? 0.65 : 2,
                repeat: Infinity,
                delay: i * 0.12,
                ease: 'easeInOut',
              }}
              className={`${isCompact ? 'w-1 rounded-full' : 'w-2 rounded-full'} ${
                isCompact ? 'shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'shadow-[0_0_10px_rgba(255,255,255,0.8)]'
              } ${mode === 'speaking' ? 'bg-white' : 'bg-slate-400/60'}`}
            />
          ))}
        </div>

        {/* Glass Specular Reflection Highlight */}
        <div className="absolute top-1 left-2 w-1/2 h-1/3 rounded-full bg-gradient-to-b from-white/50 to-transparent blur-[1px] pointer-events-none" />
      </motion.div>
    </div>
  );
};

