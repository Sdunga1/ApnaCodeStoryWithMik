import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import {
  HomePage,
  type Post as DailyPost,
} from './modules/student/components/HomePage';
import { CreatePostPage } from './modules/creator/components/CreatePostPage';
import { StudentPracticePage } from './modules/student/components/practice/PracticePage';
import { CreatorPracticePage } from './modules/creator/components/practice/PracticePage';
import { problemSections } from './modules/practice/data/problemSections';
import { Menu, X } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';


export default function App() {
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
        {(() => {
          console.log('Current activeView:', activeView);
          return null;
        })()}
        {activeView === 'home' ? (
          <>
            {/* Mobile menu button */}
            <div className="lg:hidden p-4">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
            <HomePage onEditPost={handleEditPost} />
          </>
        ) : activeView === 'create-post' ? (
          <>
            {/* Mobile menu button */}
            <div className="lg:hidden p-4">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
            <CreatePostPage onPostComplete={handlePostComplete} />
          </>
        ) : activeView === 'practice' ? (
          <>
            <div className="lg:hidden p-4 max-w-7xl mx-auto">
              <button
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-slate-100 hover:bg-slate-200'
                }`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
            {isCreator ? <CreatorPracticePage /> : <StudentPracticePage />}
          </>
        ) : (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Mobile menu button */}
            <button
              className={`lg:hidden mb-4 p-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

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
  );
}
