import React from 'react';
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { StatsCard } from './components/StatsCard';
import { ProblemSection } from './components/ProblemSection';
import { CreatePostPage } from './components/CreatePostPage';
import { Search, Menu, X } from 'lucide-react';
import { Input } from './components/ui/input';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  starred: boolean;
  hasVideo: boolean;
}

interface ProblemSection {
  id: string;
  title: string;
  problems: Problem[];
}

// Mock data for problems organized by topic
const problemSections: ProblemSection[] = [
  {
    id: 'arrays-hashing',
    title: 'Arrays & Hashing',
    problems: [
      {
        id: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        completed: true,
        starred: true,
        hasVideo: true,
      },
      {
        id: 2,
        title: 'Valid Anagram',
        difficulty: 'Easy',
        completed: true,
        starred: false,
        hasVideo: true,
      },
      {
        id: 3,
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        completed: true,
        starred: false,
        hasVideo: true,
      },
      {
        id: 4,
        title: 'Group Anagrams',
        difficulty: 'Medium',
        completed: true,
        starred: true,
        hasVideo: true,
      },
      {
        id: 5,
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 6,
        title: 'Product of Array Except Self',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 7,
        title: 'Valid Sudoku',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    problems: [
      {
        id: 8,
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        completed: true,
        starred: false,
        hasVideo: true,
      },
      {
        id: 9,
        title: 'Two Sum II - Input Array Is Sorted',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 10,
        title: '3Sum',
        difficulty: 'Medium',
        completed: false,
        starred: true,
        hasVideo: true,
      },
      {
        id: 11,
        title: 'Container With Most Water',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    problems: [
      {
        id: 12,
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        completed: true,
        starred: false,
        hasVideo: true,
      },
      {
        id: 13,
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        completed: false,
        starred: true,
        hasVideo: true,
      },
      {
        id: 14,
        title: 'Longest Repeating Character Replacement',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 15,
        title: 'Minimum Window Substring',
        difficulty: 'Hard',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'stack',
    title: 'Stack',
    problems: [
      {
        id: 16,
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        completed: true,
        starred: true,
        hasVideo: true,
      },
      {
        id: 17,
        title: 'Min Stack',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 18,
        title: 'Daily Temperatures',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 19,
        title: 'Largest Rectangle in Histogram',
        difficulty: 'Hard',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    problems: [
      {
        id: 20,
        title: 'Binary Search',
        difficulty: 'Easy',
        completed: true,
        starred: false,
        hasVideo: true,
      },
      {
        id: 21,
        title: 'Search in Rotated Sorted Array',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 22,
        title: 'Find Minimum in Rotated Sorted Array',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    problems: [
      {
        id: 23,
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        completed: true,
        starred: true,
        hasVideo: true,
      },
      {
        id: 24,
        title: 'Merge Two Sorted Lists',
        difficulty: 'Easy',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 25,
        title: 'Reorder List',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 26,
        title: 'Remove Nth Node From End of List',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'trees',
    title: 'Trees',
    problems: [
      {
        id: 27,
        title: 'Invert Binary Tree',
        difficulty: 'Easy',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 28,
        title: 'Maximum Depth of Binary Tree',
        difficulty: 'Easy',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 29,
        title: 'Binary Tree Level Order Traversal',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 30,
        title: 'Validate Binary Search Tree',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'graphs',
    title: 'Graphs',
    problems: [
      {
        id: 31,
        title: 'Number of Islands',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 32,
        title: 'Clone Graph',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 33,
        title: 'Course Schedule',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 34,
        title: 'Word Ladder',
        difficulty: 'Hard',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    problems: [
      {
        id: 35,
        title: 'Climbing Stairs',
        difficulty: 'Easy',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 36,
        title: 'House Robber',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 37,
        title: 'Longest Increasing Subsequence',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
      {
        id: 38,
        title: 'Coin Change',
        difficulty: 'Medium',
        completed: false,
        starred: false,
        hasVideo: true,
      },
    ],
  },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('home');
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  // Calculate stats
  const totalProblems = problemSections.reduce(
    (acc, section) => acc + section.problems.length,
    0
  );
  const completedProblems = problemSections.reduce(
    (acc, section) => acc + section.problems.filter(p => p.completed).length,
    0
  );

  const easyCompleted = problemSections.reduce(
    (acc, section) =>
      acc +
      section.problems.filter(p => p.completed && p.difficulty === 'Easy')
        .length,
    0
  );
  const easyTotal = problemSections.reduce(
    (acc, section) =>
      acc + section.problems.filter(p => p.difficulty === 'Easy').length,
    0
  );

  const mediumCompleted = problemSections.reduce(
    (acc, section) =>
      acc +
      section.problems.filter(p => p.completed && p.difficulty === 'Medium')
        .length,
    0
  );
  const mediumTotal = problemSections.reduce(
    (acc, section) =>
      acc + section.problems.filter(p => p.difficulty === 'Medium').length,
    0
  );

  const hardCompleted = problemSections.reduce(
    (acc, section) =>
      acc +
      section.problems.filter(p => p.completed && p.difficulty === 'Hard')
        .length,
    0
  );
  const hardTotal = problemSections.reduce(
    (acc, section) =>
      acc + section.problems.filter(p => p.difficulty === 'Hard').length,
    0
  );

  // Filter problems based on search
  const filteredSections = searchQuery
    ? problemSections
        .map(section => ({
          ...section,
          problems: section.problems.filter(problem =>
            problem.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(section => section.problems.length > 0)
    : problemSections;

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
            <HomePage />
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
            <CreatePostPage />
          </>
        ) : activeView === 'practice' ? (
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

            {/* Header */}
            <div className="mb-8">
              <h1
                className={`mb-2 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                DSA Problem Roadmap
              </h1>
              <p
                className={
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }
              >
                Master Data Structures & Algorithms with codestorywithMIK
              </p>
            </div>

            {/* Stats Card */}
            <StatsCard
              total={completedProblems}
              totalProblems={totalProblems}
              easy={easyCompleted}
              easyTotal={easyTotal}
              medium={mediumCompleted}
              mediumTotal={mediumTotal}
              hard={hardCompleted}
              hardTotal={hardTotal}
            />

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}
                />
                <Input
                  type="text"
                  placeholder="Search problems by keyword or topic..."
                  className={`pl-12 h-14 rounded-xl focus:border-purple-500 focus:ring-purple-500/20 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Problem Sections */}
            <div className="space-y-6">
              {filteredSections.map((section, index) => (
                <ProblemSection
                  key={section.id}
                  title={section.title}
                  problems={section.problems}
                  defaultOpen={index === 0}
                />
              ))}
            </div>

            {filteredSections.length === 0 && (
              <div className="text-center py-16">
                <p
                  className={
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }
                >
                  No problems found matching your search.
                </p>
              </div>
            )}
          </div>
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
