'use client';

import React from 'react';
import { CheckCircle2, Circle, Star, Video, Pencil } from 'lucide-react';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import type { PracticeProblem } from '@/types/practice';

type ProblemRowProps = {
  problem: PracticeProblem;
  isEditing?: boolean;
  onEdit?: () => void;
  canEdit?: boolean;
} & Omit<React.ComponentProps<'div'>, 'children'>;

export function ProblemRow({
  problem,
  isEditing = false,
  onEdit,
  canEdit = false,
  ...props
}: ProblemRowProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
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
      } ${isEditing ? 'ring-2 ring-purple-500/40 bg-purple-500/5' : ''}`}
      style={{ cursor: isEditing ? 'grab' : 'default' }}
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
        <div className="col-span-5 lg:col-span-6">
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-left hover:text-purple-400 transition-colors underline-offset-4 decoration-purple-400/60 hover:underline"
          >
            {problem.title}
          </a>
        </div>

        {/* Difficulty */}
        <div className="col-span-2 flex items-center">
          <Badge
            variant="outline"
            className={`${
              difficultyConfig[problem.difficulty].className
            } border rounded-full px-3 py-1`}
          >
            {problem.difficulty}
          </Badge>
        </div>

        {/* Solution & Edit */}
        <div className="col-span-3 lg:col-span-2 flex justify-center gap-2">
          {problem.solutionVideoUrl && (
            <a
              href={problem.solutionVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all group-hover:scale-105"
            >
              <Video className="w-4 h-4" />
              <span className="hidden lg:inline">Watch</span>
            </a>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              disabled={!canEdit}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                canEdit
                  ? 'border-purple-500/40 text-purple-200 hover:bg-purple-500/10'
                  : 'border-slate-700 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Pencil className="w-4 h-4" />
              Edit
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
          <a
            href={problem.leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-left hover:text-purple-400 transition-colors mb-2 block underline-offset-4 decoration-purple-400/60 hover:underline"
          >
            {problem.title}
          </a>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${
                  difficultyConfig[problem.difficulty].className
                } border rounded-full px-3 py-1`}
              >
                {problem.difficulty}
              </Badge>
              {problem.solutionVideoUrl && (
                <a
                  href={problem.solutionVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20"
                >
                  <Video className="w-4 h-4" />
                  <span>Watch</span>
                </a>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  disabled={!canEdit}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-semibold ${
                    canEdit
                      ? 'border-purple-500/40 text-purple-200'
                      : 'border-slate-700 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
