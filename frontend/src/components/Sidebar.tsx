'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, List, X, Sun, Moon, PlusCircle, Map } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import ShinyText from './ShinyText';
import TextType from './TextType';

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
  const pathname = usePathname();
  const router = useRouter();
  const username =
    isAuthenticated && user?.username
      ? user.username
      : isAuthenticated && user?.email
      ? user.email.split('@')[0]
      : 'dsa_learner';
  const showProgress = isAuthenticated && user?.role !== 'creator';
  const isCreator = isAuthenticated && user?.role === 'creator';
  
  // Handle navigation - if on a different route, navigate to home first
  const handleNavClick = (value: string) => {
    if (pathname !== '/') {
      // Store the view in sessionStorage and navigate to home
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('activeView', value);
      }
      router.push('/');
    } else {
      onViewChange(value);
    }
    onClose();
  };

  // Dynamic nav items based on user role
  const navItems: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    href?: string;
  }> = isCreator
    ? [
        { icon: Home, label: 'Home', value: 'home' },
        { icon: PlusCircle, label: 'Create Post', value: 'create-post' },
        { icon: List, label: 'Practice Problems', value: 'practice' },
        { icon: Map, label: 'Roadmap', value: 'roadmap', href: '/roadmap' },
      ]
    : [
        { icon: Home, label: 'Home', value: 'home' },
        { icon: List, label: 'Practice Problems', value: 'practice' },
        { icon: Map, label: 'Roadmap', value: 'roadmap', href: '/roadmap' },
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
          <div className="mb-1">
            <ShinyText text="ApnaCodestorywithMik" disabled={false} speed={3} />
          </div>
          <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            <TextType
              text="Lets learn </> and grow together.!!"
              typingSpeed={100}
              pauseDuration={1000}
              deletingSpeed={50}
              cursorBlinkDuration={0.4}
              showCursor={true}
              cursorCharacter="_"
              loop={true}
              as="p"
            />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          // Check if active based on route (for href items) or activeView (for view items)
          const isActive = item.href 
            ? pathname === item.href 
            : activeView === item.value;
          
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => onClose()}
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
              </Link>
            );
          }
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item.value)}
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
            {isAuthenticated && user?.avatarUrl && (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            )}
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
              {isAuthenticated && user
                ? user.name.length > 20
                  ? `${user.name.slice(0, 20)}..`
                  : user.name
                : "Mik's Student"}
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

        {isAuthenticated && (
          <button
            onClick={() => {
              onViewChange('profile');
              onClose();
            }}
            className={`mt-4 w-full rounded-xl border px-4 py-2 text-sm font-medium transition ${
              activeView === 'profile'
                ? theme === 'dark'
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-200'
                  : 'bg-purple-50 border-purple-200 text-purple-700'
                : theme === 'dark'
                ? 'border-purple-900/40 text-purple-200 hover:bg-purple-900/20'
                : 'border-purple-200 text-purple-700 hover:bg-purple-50'
            }`}
          >
            Manage profile
          </button>
        )}
      </div>
    </div>
  );
}
