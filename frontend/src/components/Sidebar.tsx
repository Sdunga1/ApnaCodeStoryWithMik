'use client';

import React from 'react';
import { Home, BookOpen, List, X, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  completedProblems: number;
  totalProblems: number;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({
  completedProblems,
  totalProblems,
  onClose,
  activeView,
  onViewChange,
}: SidebarProps) {
  const progressPercentage = (completedProblems / totalProblems) * 100;
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const username =
    isAuthenticated && user?.email ? user.email.split('@')[0] : 'dsa_learner';
  const showProgress = isAuthenticated && user?.role !== 'creator';

  const navItems = [
    { icon: Home, label: 'Home', value: 'home' },
    { icon: List, label: 'Practice Problems', value: 'practice' },
    { icon: BookOpen, label: 'Courses / Roadmaps', value: 'courses' },
  ];

  return (
    <div
      className={`h-full border-r flex flex-col relative ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#050505] to-[#1f0139] border-purple-900/30'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-200'
      }`}
    >
      {/* Theme Toggle Button - Floating Right */}
      <button
        onClick={toggleTheme}
        className={`absolute z-50 p-2 rounded-lg transition-colors ${
          theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
        }`}
        style={{ top: '1rem', right: '1rem' }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun
            className={`w-5 h-5 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            }`}
          />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {/* Logo/Brand Header */}
      <div
        className={`p-6 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div>
          <h2
            className={`mb-1 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`}
          >
            codestorywithMIK
          </h2>
          <p className={theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}>
            DSA Platform
          </p>
        </div>
        <button
          onClick={onClose}
          className={`lg:hidden ml-2 p-2 rounded-lg transition-colors ${
            theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.value;
          return (
            <button
              key={item.label}
              onClick={() => {
                onViewChange(item.value);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? `bg-purple-500/10 border border-purple-500/20 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`
                  : `${
                      theme === 'dark'
                        ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                    }`
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Summary */}
      <div
        className={`p-6 border-t ${
          theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-700">
            <AvatarFallback className="bg-transparent text-white">
              {isAuthenticated && user
                ? user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U'
                : 'MK'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p
              className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}
            >
              {isAuthenticated && user ? user.name : "Mik's Student"}
            </p>
            <p
              className={`${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
              } text-sm`}
            >
              @{username}
              {isAuthenticated && user?.role === 'creator' && (
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    theme === 'dark'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-purple-100 text-purple-600'
                  }`}
                >
                  Creator
                </span>
              )}
            </p>
          </div>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className={
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }
              >
                Progress
              </span>
              <span
                className={
                  theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                }
              >
                {completedProblems}/{totalProblems}
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className={`h-2 ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
