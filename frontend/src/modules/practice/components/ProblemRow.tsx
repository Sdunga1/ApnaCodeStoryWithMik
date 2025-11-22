'use client';

import React from 'react';
import { CheckCircle2, Circle, Star, Video, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Problem } from '@/modules/practice/types';

type ProblemRowProps = {
  problem: Problem;
  isDraggable?: boolean;
  onDragStart?: (problemId: number) => void;
  onDrop?: (problemId: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (problemId: number) => void;
  isDragOver?: boolean;
  isDragging?: boolean;
  showHandle?: boolean;
} & Omit<React.ComponentProps<'div'>, 'children'>;

export function ProblemRow({
  problem,
  isDraggable = false,
  onDragStart,
  onDrop,
  onDragEnd,
  onDragOver,
  isDragOver = false,
  isDragging = false,
  showHandle = false,
  ...props
}: ProblemRowProps) {
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

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer?.setData('text/plain', String(problem.id));
    onDragStart?.(problem.id);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    onDrop?.(problem.id);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (isDraggable) {
      event.preventDefault();
      onDragOver?.(problem.id);
    }
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div
      className={`group transition-colors ${
        theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/50'
      } ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''} ${
        isDragOver ? 'ring-2 ring-purple-500/40 bg-purple-500/5' : ''
      } ${isDragging ? 'opacity-60' : ''}`}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDrop={isDraggable ? handleDrop : undefined}
      onDragOver={isDraggable ? handleDragOver : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      data-problem-id={problem.id}
      {...props}
      {...props}
    >
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
        {/* Status */}
        <div className="col-span-1 flex justify-center">
          {showHandle && (
            <span className="text-slate-500 flex items-center mr-2">
              <GripVertical className="w-4 h-4" />
            </span>
          )}
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
            {showHandle && (
              <span className="text-slate-500 flex items-center">
                <GripVertical className="w-4 h-4" />
              </span>
            )}
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
