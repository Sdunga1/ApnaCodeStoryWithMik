'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { StatsCard } from '@/modules/practice/components/StatsCard';
import { ProblemSection } from '@/modules/practice/components/ProblemSection';
import { ProblemSection as PracticeSection } from '@/modules/practice/types';

interface PracticePageBaseProps {
  title: string;
  subtitle: string;
  problemSections: PracticeSection[];
  headerActions?: React.ReactNode;
  searchActions?: React.ReactNode;
  sectionActions?: (section: PracticeSection) => React.ReactNode;
  isSectionDragEnabled?: boolean;
  onSectionDragStart?: (sectionId: string) => void;
  onSectionDrop?: (sectionId: string) => void;
  onSectionDragEnd?: () => void;
  activeProblemDragSectionId?: string | null;
  onProblemDragStart?: (sectionId: string, problemId: number) => void;
  onProblemDrop?: (sectionId: string, problemId: number) => void;
  onProblemDragEnd?: () => void;
  onSectionDragOver?: (sectionId: string) => void;
  dragOverSectionId?: string | null;
  draggingSectionId?: string | null;
  draggingProblem?: { sectionId: string; problemId: number } | null;
  dragOverProblem?: { sectionId: string; problemId: number } | null;
  onProblemDragOver?: (sectionId: string, problemId: number) => void;
}

export function PracticePageBase({
  title,
  subtitle,
  problemSections,
  headerActions,
  searchActions,
  sectionActions,
  isSectionDragEnabled = false,
  onSectionDragStart,
  onSectionDrop,
  onSectionDragEnd,
  activeProblemDragSectionId = null,
  onProblemDragStart,
  onProblemDrop,
  onProblemDragEnd,
  onSectionDragOver,
  dragOverSectionId = null,
  draggingSectionId = null,
  draggingProblem = null,
  dragOverProblem = null,
  onProblemDragOver,
}: PracticePageBaseProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
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
        acc + section.problems.filter(p => p.completed && p.difficulty === 'Easy').length,
      0
    );
    const easyTotal = problemSections.reduce(
      (acc, section) => acc + section.problems.filter(p => p.difficulty === 'Easy').length,
      0
    );
    const mediumCompleted = problemSections.reduce(
      (acc, section) =>
        acc + section.problems.filter(p => p.completed && p.difficulty === 'Medium').length,
      0
    );
    const mediumTotal = problemSections.reduce(
      (acc, section) => acc + section.problems.filter(p => p.difficulty === 'Medium').length,
      0
    );
    const hardCompleted = problemSections.reduce(
      (acc, section) =>
        acc + section.problems.filter(p => p.completed && p.difficulty === 'Hard').length,
      0
    );
    const hardTotal = problemSections.reduce(
      (acc, section) => acc + section.problems.filter(p => p.difficulty === 'Hard').length,
      0
    );

    return {
      totalProblems,
      completedProblems,
      easyCompleted,
      easyTotal,
      mediumCompleted,
      mediumTotal,
      hardCompleted,
      hardTotal,
    };
  }, [problemSections]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) {
      return problemSections;
    }

    return problemSections
      .map(section => ({
        ...section,
        problems: section.problems.filter(problem =>
          problem.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter(section => section.problems.length > 0);
  }, [problemSections, searchQuery]);

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className={`mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              {title}
            </h1>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>{subtitle}</p>
          </div>
          {headerActions && <div className="flex flex-wrap gap-2">{headerActions}</div>}
        </div>
      </div>

      <StatsCard
        total={stats.completedProblems}
        totalProblems={stats.totalProblems}
        easy={stats.easyCompleted}
        easyTotal={stats.easyTotal}
        medium={stats.mediumCompleted}
        mediumTotal={stats.mediumTotal}
        hard={stats.hardCompleted}
        hardTotal={stats.hardTotal}
      />

      <div className="mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 min-w-[280px]">
            <Search
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
              }`}
            />
            <Input
              type="text"
              placeholder="Search problems by keyword or topic..."
              className={`pl-12 h-14 w-full rounded-2xl border-2 focus:border-purple-500 focus:ring-purple-500/20 ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'
              }`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {searchActions && (
            <div className="flex flex-shrink-0 flex-wrap gap-2 justify-end md:justify-start">
              {searchActions}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredSections.map((section, index) => {
          const problemDragEnabled = activeProblemDragSectionId === section.id;
          return (
            <div
              key={section.id}
              className={`${isSectionDragEnabled ? 'cursor-grab active:cursor-grabbing' : ''} ${
                dragOverSectionId === section.id ? 'ring-2 ring-purple-500/40 rounded-2xl' : ''
              } ${draggingSectionId === section.id ? 'opacity-60' : ''}`}
              draggable={isSectionDragEnabled}
              onDragStart={
                isSectionDragEnabled
                  ? () => onSectionDragStart?.(section.id)
                  : undefined
              }
              onDragOver={
                isSectionDragEnabled
                  ? e => {
                      e.preventDefault();
                      onSectionDragOver?.(section.id);
                    }
                  : undefined
              }
              onDrop={
                isSectionDragEnabled
                  ? e => {
                      e.preventDefault();
                      onSectionDrop?.(section.id);
                    }
                  : undefined
              }
              onDragEnd={isSectionDragEnabled ? onSectionDragEnd : undefined}
            >
              <ProblemSection
                title={section.title}
                problems={section.problems}
                defaultOpen={index === 0}
                actions={sectionActions?.(section)}
                problemDragEnabled={problemDragEnabled}
                onProblemDragStart={
                  problemDragEnabled
                    ? problemId => onProblemDragStart?.(section.id, problemId)
                    : undefined
                }
                onProblemDrop={
                  problemDragEnabled
                    ? problemId => onProblemDrop?.(section.id, problemId)
                    : undefined
                }
                onProblemDragEnd={problemDragEnabled ? onProblemDragEnd : undefined}
                onProblemDragOver={
                  problemDragEnabled
                    ? problemId => onProblemDragOver?.(section.id, problemId)
                    : undefined
                }
                showSectionHandle={isSectionDragEnabled}
                isDragOver={dragOverSectionId === section.id}
                isDragging={draggingSectionId === section.id}
                dragOverProblemId={
                  dragOverProblem && dragOverProblem.sectionId === section.id
                    ? dragOverProblem.problemId
                    : null
                }
                draggingProblemId={
                  draggingProblem && draggingProblem.sectionId === section.id
                    ? draggingProblem.problemId
                    : null
                }
              />
            </div>
          );
        })}
      </div>

      {filteredSections.length === 0 && (
        <div className="text-center py-16">
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            No problems found matching your search.
          </p>
        </div>
      )}
    </>
  );
}

