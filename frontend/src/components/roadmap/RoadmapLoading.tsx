'use client';

import React from 'react';
import { motion } from 'framer-motion';
import DecryptedText from './DecryptedText';
import { Starfield } from '@/components/Starfield';

interface RoadmapLoadingProps {
  className?: string;
}

export default function RoadmapLoading({
  className = '',
}: RoadmapLoadingProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#000000] via-[#050505] to-[#0a0015] ${className}`}
    >
      {/* Galaxy background - Starfield only */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Starfield className="opacity-25" starCount={160} />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Spinning galaxy/orbit animation */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
          <div
            className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-spin"
            style={{ animationDuration: '8s' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          </div>
          <div
            className="absolute inset-4 border-2 border-purple-500/30 rounded-full animate-spin"
            style={{ animationDuration: '6s', animationDirection: 'reverse' }}
          >
            <div className="absolute top-0 right-0 w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.8)]" />
          </div>
          <div
            className="absolute inset-8 border-2 border-cyan-500/30 rounded-full animate-spin"
            style={{ animationDuration: '4s' }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
          </div>
          {/* Center pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full animate-ping shadow-[0_0_20px_rgba(59,130,246,1)]" />
          </div>
        </div>

        {/* Decrypted text animation */}
        <div className="text-center px-4 sm:px-6">
          <DecryptedText
            text="Building World of DSA..."
            speed={60}
            maxIterations={10}
            sequential={true}
            revealDirection="start"
            animateOn="view"
            className="text-blue-400 font-orbitron tracking-wider text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold"
            encryptedClassName="text-slate-600 font-mono"
            parentClassName="block"
          />
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
