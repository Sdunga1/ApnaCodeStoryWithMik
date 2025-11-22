'use client';

import React, { useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ProfileContent } from '@/components/ProfileContent';
import Header from '@/components/Header';
import {
  HomePage,
  type Post as DailyPost,
} from '@/modules/student/components/HomePage';
import { CreatePostPage } from '@/modules/creator/components/CreatePostPage';
import { StudentPracticePage } from '@/modules/student/components/practice/PracticePage';
import { CreatorPracticePage } from '@/modules/creator/components/practice/PracticePage';
import { problemSections } from '@/modules/practice/data/problemSections';
import { Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';


export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const isCreator = isAuthenticated && user?.role === 'creator';

  // Calculate stats
  const totalProblems = problemSections.reduce(
    (acc, section) => acc + section.problems.length,
    0
  );
  const completedProblems = problemSections.reduce(
    (acc, section) => acc + section.problems.filter(p => p.completed).length,
    0
  );

  const handleEditPost = useCallback((post: DailyPost) => {
    if (!post?.id) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('post_edit_post_id', post.id);
    }
    setActiveView('create-post');
  }, []);

  const handlePostComplete = useCallback(
    (date: { year: number; month: number; day: number }) => {
      if (typeof window !== 'undefined' && date) {
        sessionStorage.setItem('post_focus_date', JSON.stringify(date));
      }
      setActiveView('home');
    },
    []
  );

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
          activeView={activeView}
          onViewChange={setActiveView}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="pt-[220px] md:pt-[152px]">
          {activeView === 'home' ? (
            <HomePage onEditPost={handleEditPost} />
          ) : activeView === 'profile' ? (
            <ProfileContent />
          ) : activeView === 'create-post' ? (
            <CreatePostPage onPostComplete={handlePostComplete} />
          ) : activeView === 'practice' ? (
            isCreator ? <CreatorPracticePage /> : <StudentPracticePage />
          ) : (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

            <div className="text-center py-16">
              <h2
                className={`mb-4 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Coming Soon
              </h2>
              <p
                className={
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }
              >
                This section is under development.
              </p>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

