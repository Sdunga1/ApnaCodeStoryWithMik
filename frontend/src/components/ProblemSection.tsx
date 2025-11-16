import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ProblemRow } from './ProblemRow';
import { useState } from 'react';

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

  const completedCount = problems.filter(p => p.completed).length;
  const totalCount = problems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div
      className="bg-gradient-to-br from-[#050505] to-[#1f0139] rounded-2xl border border-purple-900/30 overflow-hidden"
      {...props}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <ChevronDown
            className={`w-5 h-5 text-slate-400 transition-transform ${
              isOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
          <div className="text-left">
            <h3 className="text-slate-100">{title}</h3>
            <p className="text-slate-500">
              {completedCount} / {totalCount} Completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-slate-400 min-w-[3rem] text-right">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
      </button>

      {/* Problems Table */}
      {isOpen && (
        <div className="border-t border-slate-800">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-800/50 text-slate-400">
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Star</div>
            <div className="col-span-6">Problem</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2 text-center">Solution</div>
          </div>

          {/* Problem Rows */}
          <div className="divide-y divide-slate-800">
            {problems.map(problem => (
              <ProblemRow key={problem.id} problem={problem} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
