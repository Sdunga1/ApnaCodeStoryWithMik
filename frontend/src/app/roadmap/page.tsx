'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/components/Header';
import RoadmapLoading from '@/components/roadmap/RoadmapLoading';
import { useTheme } from '@/contexts/ThemeContext';

// Dynamically import SpaceMap with SSR disabled (3D canvas is client-side only)
// This reduces initial bundle size and compilation time
const SpaceMap = dynamic(
  () => import('@/components/roadmap/SpaceMap').then(mod => ({ default: mod.SpaceMap })),
  {
    ssr: false,
    loading: () => null, // We handle loading state with RoadmapLoading component
  }
);

export default function RoadmapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Preload SpaceMap chunk immediately when page loads (parallel to loading animation)
  useEffect(() => {
    // Prefetch the SpaceMap chunk immediately so it loads while showing loading animation
    // This reduces perceived loading time
    import('@/components/roadmap/SpaceMap').catch(() => {
      // Ignore errors - component will handle its own loading
    });
  }, []);

  useEffect(() => {
    // Calculate total loading time:
    // - DecryptedText animation takes time (sequential reveal with ~10 iterations at 60ms speed)
    // - Add buffer for animation to complete fully
    // - Wait 0.2 seconds (200ms) after animation completes
    // Total: ~1.5 seconds minimum + 200ms delay = 1700ms

    // The text animation with sequential start reveal and 10 iterations at 60ms
    // should complete around 1.0-1.5 seconds, then we wait 0.2s more
    const animationDuration = 1200; // Time for animation to complete (text is shorter now)
    const postAnimationDelay = 200; // 0.2 seconds wait after animation completes

    const totalLoadingTime = animationDuration + postAnimationDelay;

    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, totalLoadingTime);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);

  // Default stats for sidebar (you can fetch real stats if needed)
  const completedProblems = 0;
  const totalProblems = 0;

  return (
    <div
      className={`flex h-screen text-slate-100 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#000000] via-[#050505] to-[#0a0015] text-slate-100'
          : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900'
      }`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            theme === 'dark' ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          completedProblems={completedProblems}
          totalProblems={totalProblems}
          onClose={() => setSidebarOpen(false)}
          activeView="roadmap"
          onViewChange={() => {}}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        {/* Loading Overlay */}
        <AnimatePresence>{isLoading && <RoadmapLoading />}</AnimatePresence>

        {/* Spacer to push content below the fixed header - mobile header is taller due to stacking */}
        <div className="shrink-0 h-[200px] sm:h-[160px] md:h-[130px] lg:h-[160px]" />
        <div
          className="flex-1 relative overflow-hidden"
          style={{ paddingTop: 0 }}
        >
          {!isLoading && <SpaceMap />}
        </div>
      </div>
    </div>
  );
}
