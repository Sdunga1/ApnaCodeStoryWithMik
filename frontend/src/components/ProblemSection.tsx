'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, Plus, Pencil, Check } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { ProblemRow } from './ProblemRow';
import { PracticeProblemForm } from './PracticeProblemForm';
import { useTheme } from '../contexts/ThemeContext';
import type { PracticeProblem, PracticeProblemPayload } from '@/types/practice';

type ProblemSectionProps = {
  id: string;
  title: string;
  problems: PracticeProblem[];
  defaultOpen?: boolean;
  onProblemsReorder?: (updatedProblems: PracticeProblem[]) => void;
  isEditing?: boolean;
  onStartEditing?: (sectionId: string) => void;
  onStopEditing?: (sectionId: string) => void;
  editingDisabled?: boolean;
  canManage?: boolean;
  onAddProblem?: (
    topicId: string,
    payload: PracticeProblemPayload
  ) => Promise<void>;
  onUpdateProblem?: (
    topicId: string,
    problemId: string,
    payload: PracticeProblemPayload
  ) => Promise<void>;
} & Omit<React.ComponentProps<'div'>, 'children'>;

export function ProblemSection({
  id: sectionId,
  title,
  problems,
  defaultOpen = false,
  onProblemsReorder,
  isEditing = false,
  onStartEditing,
  onStopEditing,
  editingDisabled = false,
  canManage = false,
  onAddProblem,
  onUpdateProblem,
  ...props
}: ProblemSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [localProblems, setLocalProblems] = useState(problems);
  const [activeForm, setActiveForm] = useState<{
    mode: 'create' | 'edit';
    problem?: PracticeProblem;
  } | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setLocalProblems(problems);
  }, [problems]);

  useEffect(() => {
    if (!isEditing) {
      setActiveForm(null);
    }
  }, [isEditing]);

  const totalCount = localProblems.length;
  const completedCount = 0;
  const progressPercentage = 0;
  const baseActionButtonClasses =
    'inline-flex items-center justify-center rounded-2xl p-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  const addButtonClasses =
    theme === 'dark'
      ? `${baseActionButtonClasses} text-slate-100 border border-white/15 bg-white/5 hover:bg-white/10`
      : `${baseActionButtonClasses} text-slate-900 border border-slate-200 bg-white hover:bg-slate-50`;
  const editButtonClasses =
    theme === 'dark'
      ? `${baseActionButtonClasses} text-white/80 bg-white/6 border border-white/10 hover:text-white`
      : `${baseActionButtonClasses} text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50`;

  const effectiveEditing = canManage && isEditing;

  const handleReorder = (updated: PracticeProblem[]) => {
    setLocalProblems(updated);
    onProblemsReorder?.(updated);
  };

  const handleEditToggle = () => {
    if (!canManage) return;
    if (effectiveEditing) {
      setActiveForm(null);
      onStopEditing?.(sectionId);
    } else if (!editingDisabled) {
      onStartEditing?.(sectionId);
    }
  };

  const editingBanner =
    isEditing &&
    'border border-purple-500/50 bg-purple-500/5 shadow-inner shadow-purple-500/10';

  return (
    <div
      id={sectionId}
      className={`rounded-2xl border overflow-hidden ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#050505] to-[#1f0139] border-purple-900/30'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 border-purple-200'
      } ${isEditing ? 'ring-2 ring-purple-500/60' : ''}`}
      {...props}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between transition-colors ${
          theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/50'
        } ${editingBanner ?? ''}`}
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
            {canManage ? (
              <>
                <p
                  className={
                    theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
                  }
                >
                  {completedCount} / {totalCount} Completed
                </p>
                {effectiveEditing && (
                  <p className="mt-1 text-xs font-semibold text-purple-300">
                    Drag to reorder problems
                  </p>
                )}
              </>
            ) : (
              <p
                className={
                  theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
                }
              >
                {totalCount} Problems
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          {!canManage && (
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
          )}

          {canManage && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={addButtonClasses}
                aria-label={`Add problem to ${title}`}
                disabled={editingDisabled && !effectiveEditing}
                onClick={() => {
                  if (editingDisabled && !effectiveEditing) return;
                  if (!effectiveEditing) {
                    onStartEditing?.(sectionId);
                  }
                  setActiveForm({ mode: 'create' });
                }}
              >
                <Plus className="w-4 h-4" />
                <span className="sr-only">Add problem</span>
              </button>
              <button
                type="button"
                className={editButtonClasses}
                aria-label={`Edit ${title}`}
                onClick={handleEditToggle}
                disabled={editingDisabled && !effectiveEditing}
              >
                {effectiveEditing ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="sr-only">Done editing</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4 text-rose-400" />
                    <span className="sr-only">Edit</span>
                  </>
                )}
              </button>
              {editingDisabled && !effectiveEditing && (
                <span className="text-xs text-amber-400">
                  Clear search to edit
                </span>
              )}
            </div>
          )}
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
          {effectiveEditing ? (
            <div className="space-y-4 p-4">
              {activeForm && canManage && (
                <PracticeProblemForm
                  mode={activeForm.mode}
                  initialValues={activeForm.problem}
                  onSubmit={async values => {
                    if (activeForm.mode === 'create') {
                      await onAddProblem?.(sectionId, values);
                    } else if (activeForm.problem) {
                      await onUpdateProblem?.(
                        sectionId,
                        activeForm.problem.id,
                        values
                      );
                    }
                    setActiveForm(null);
                  }}
                  onCancel={() => setActiveForm(null)}
                />
              )}
              <Reorder.Group
                axis="y"
                values={localProblems}
                onReorder={handleReorder}
                className="divide-y divide-transparent space-y-3"
              >
                {localProblems.map(problem => (
                  <Reorder.Item
                    key={problem.id}
                    value={problem}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40"
                    whileDrag={{ scale: 1.01 }}
                  >
                    <ProblemRow
                      problem={problem}
                      isEditing
                      canEdit
                      onEdit={() => setActiveForm({ mode: 'edit', problem })}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          ) : (
            <div
              className={`divide-y ${
                theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'
              }`}
            >
              {localProblems.map(problem => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  onEdit={
                    canManage
                      ? () => {
                          if (editingDisabled) return;
                          onStartEditing?.(sectionId);
                          setActiveForm({ mode: 'edit', problem });
                        }
                      : undefined
                  }
                  canEdit={canManage && !editingDisabled}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
