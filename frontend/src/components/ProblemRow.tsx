import React from 'react';
import { CheckCircle2, Circle, Star, Video } from 'lucide-react';
import { Badge } from './ui/badge';
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

type ProblemRowProps = {
  problem: Problem;
} & Omit<React.ComponentProps<'div'>, 'children'>;

export function ProblemRow({ problem, ...props }: ProblemRowProps) {
  const [isCompleted, setIsCompleted] = useState(problem.completed);
  const [isStarred, setIsStarred] = useState(problem.starred);
  const { theme } = useTheme();

  const difficultyConfig = {
    Easy: {
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    Medium: {
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    Hard: {
      className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
  };

  return (
    <div
      className={`group transition-colors ${
        theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/50'
      }`}
      {...props}
    >
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
        {/* Status */}
        <div className="col-span-1 flex justify-center">
          <button
            onClick={() => setIsCompleted(!isCompleted)}
            className="transition-all hover:scale-110"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Circle
                className={`w-6 h-6 ${
                  theme === 'dark'
                    ? 'text-slate-600 hover:text-slate-500'
                    : 'text-slate-400 hover:text-slate-500'
                }`}
              />
            )}
          </button>
        </div>

        {/* Star */}
        <div className="col-span-1 flex justify-center">
          <button
            onClick={() => setIsStarred(!isStarred)}
            className="transition-all hover:scale-110"
          >
            <Star
              className={`w-5 h-5 ${
                isStarred
                  ? 'fill-amber-400 text-amber-400'
                  : theme === 'dark'
                  ? 'text-slate-600 hover:text-slate-500'
                  : 'text-slate-400 hover:text-slate-500'
              }`}
            />
          </button>
        </div>

        {/* Problem Title */}
        <div className="col-span-6">
          <button className="text-left hover:text-purple-400 transition-colors">
            {problem.title}
          </button>
        </div>

        {/* Difficulty */}
        <div className="col-span-2">
          <Badge
            variant="outline"
            className={`${
              difficultyConfig[problem.difficulty].className
            } border rounded-full px-3 py-1`}
          >
            {problem.difficulty}
          </Badge>
        </div>

        {/* Solution */}
        <div className="col-span-2 flex justify-center">
          {problem.hasVideo && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all group-hover:scale-105">
              <Video className="w-4 h-4" />
              <span className="hidden lg:inline">Watch</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden px-4 py-4 space-y-3">
        <div className="flex items-start gap-3">
          {/* Status and Star */}
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className="transition-all hover:scale-110"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              ) : (
                <Circle
                  className={`w-6 h-6 ${
                    theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                  }`}
                />
              )}
            </button>
            <button
              onClick={() => setIsStarred(!isStarred)}
              className="transition-all hover:scale-110"
            >
              <Star
                className={`w-5 h-5 ${
                  isStarred
                    ? 'fill-amber-400 text-amber-400'
                    : theme === 'dark'
                    ? 'text-slate-600'
                    : 'text-slate-400'
                }`}
              />
            </button>
          </div>

          {/* Problem Details */}
          <div className="flex-1">
            <button className="text-left hover:text-purple-400 transition-colors mb-2">
              {problem.title}
            </button>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${
                  difficultyConfig[problem.difficulty].className
                } border rounded-full px-3 py-1`}
              >
                {problem.difficulty}
              </Badge>
              {problem.hasVideo && (
                <button className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Video className="w-4 h-4" />
                  <span>Watch</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
