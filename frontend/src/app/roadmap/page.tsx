'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SpaceMap } from '@/components/roadmap/SpaceMap';
import { useTheme } from '@/contexts/ThemeContext';
import { Menu } from 'lucide-react';

export default function RoadmapPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  
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
      <div className="flex-1 relative overflow-hidden">
        {/* Mobile Menu Button - Positioned below SpaceMap UI to avoid overlap */}
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed top-24 left-4 z-[110] lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/70 text-white shadow-sm transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <SpaceMap />
      </div>
    </div>
  );
}