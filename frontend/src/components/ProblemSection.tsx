'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ProblemRow } from './ProblemRow';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  starred: boolean;
  hasVideo: boolean;
}

type ProblemSectionProps = {
  title: string;
  problems: Problem[];
  defaultOpen?: boolean;
} & Omit<React.ComponentProps<'div'>, 'children'>;

export function ProblemSection({
  title,
  problems,
  defaultOpen = false,
  ...props
}: ProblemSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { theme } = useTheme();

  const completedCount = problems.filter(p => p.completed).length;
  const totalCount = problems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#050505] to-[#1f0139] border-purple-900/30'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-200'
      }`}
      {...props}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
          theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/50'
        }`}
      >
        <div className="flex items-center gap-4">
          <ChevronDown
            className={`w-5 h-5 transition-transform ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
            } ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          />
          <div className="text-left">
            <h3
              className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}
            >
              {title}
            </h3>
            <p
              className={theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}
            >
              {completedCount} / {totalCount} Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div
              className={`w-32 h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span
              className={`min-w-[3rem] text-right ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </button>

      {/* Problems Table */}
      {isOpen && (
        <div
          className={`border-t ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          {/* Table Header */}
          <div
            className={`hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 ${
              theme === 'dark'
                ? 'bg-slate-800/50 text-slate-400'
                : 'bg-slate-100/50 text-slate-600'
            }`}
          >
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Star</div>
            <div className="col-span-6">Problem</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2 text-center">Solution</div>
          </div>

          {/* Problem Rows */}
          <div
            className={`divide-y ${
              theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'
            }`}
          >
            {problems.map(problem => (
              <ProblemRow key={problem.id} problem={problem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
