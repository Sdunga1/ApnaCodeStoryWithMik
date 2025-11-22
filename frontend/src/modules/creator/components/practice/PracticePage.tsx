'use client';

import { PracticePageBase } from '@/modules/practice/components/PracticePageBase';
import { problemSections } from '@/modules/practice/data/problemSections';
import type { PracticeSection } from '@/modules/practice/types';
import { PencilLine, Plus } from 'lucide-react';
import React from 'react';

const STORAGE_KEY = 'creator_practice_sections_v1';

const primaryButtonClasses =
  'flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all';

export function CreatorPracticePage() {
  const [sections, setSections] = React.useState<PracticeSection[]>(problemSections);
  const [isTopicReorderMode, setIsTopicReorderMode] = React.useState(false);
  const [draggingSectionId, setDraggingSectionId] = React.useState<string | null>(null);
  const [activeProblemReorderSectionId, setActiveProblemReorderSectionId] =
    React.useState<string | null>(null);
  const [draggingProblem, setDraggingProblem] = React.useState<{
    sectionId: string;
    problemId: number;
  } | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = React.useState<string | null>(null);
  const [dragOverProblem, setDragOverProblem] = React.useState<{
    sectionId: string;
    problemId: number;
  } | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PracticeSection[];
        if (Array.isArray(parsed) && parsed.length) {
          setSections(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load practice order from storage', error);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    } catch (error) {
      console.warn('Failed to persist practice order', error);
    }
  }, [sections]);

  React.useEffect(() => {
    if (!isTopicReorderMode) {
      setDraggingSectionId(null);
    }
  }, [isTopicReorderMode]);

  React.useEffect(() => {
    if (!activeProblemReorderSectionId) {
      setDraggingProblem(null);
    }
  }, [activeProblemReorderSectionId]);

  const toggleTopicReorder = () => {
    setIsTopicReorderMode(prev => !prev);
    setActiveProblemReorderSectionId(null);
    setDragOverSectionId(null);
    setDragOverProblem(null);
  };

  const toggleProblemReorder = (sectionId: string) => {
    setActiveProblemReorderSectionId(prev => (prev === sectionId ? null : sectionId));
    setIsTopicReorderMode(false);
    setDragOverSectionId(null);
    setDragOverProblem(null);
  };

  const handleSectionDragStart = (sectionId: string) => {
    if (!isTopicReorderMode) return;
    setDraggingSectionId(sectionId);
  };

  const handleSectionDrop = (targetSectionId: string) => {
    if (
      !isTopicReorderMode ||
      !draggingSectionId ||
      draggingSectionId === targetSectionId
    ) {
      return;
    }

    setSections(prev => {
      const next = [...prev];
      const fromIndex = next.findIndex(section => section.id === draggingSectionId);
      const toIndex = next.findIndex(section => section.id === targetSectionId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggingSectionId(null);
    setDragOverSectionId(null);
  };

  const handleSectionDragEnd = () => {
    setDraggingSectionId(null);
    setDragOverSectionId(null);
  };

  const handleSectionDragOver = (sectionId: string) => {
    if (!isTopicReorderMode || draggingSectionId === sectionId) return;
    setDragOverSectionId(sectionId);
  };

  const handleProblemDragStart = (sectionId: string, problemId: number) => {
    if (activeProblemReorderSectionId !== sectionId) return;
    setDraggingProblem({ sectionId, problemId });
  };

  const handleProblemDrop = (sectionId: string, targetProblemId: number) => {
    if (
      !draggingProblem ||
      draggingProblem.sectionId !== sectionId ||
      draggingProblem.problemId === targetProblemId
    ) {
      return;
    }

    setSections(prev => {
      const sectionIndex = prev.findIndex(section => section.id === sectionId);
      if (sectionIndex === -1) {
        return prev;
      }
      const next = [...prev];
      const problems = [...next[sectionIndex].problems];
      const fromIndex = problems.findIndex(p => p.id === draggingProblem.problemId);
      const toIndex = problems.findIndex(p => p.id === targetProblemId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }
      const [moved] = problems.splice(fromIndex, 1);
      problems.splice(toIndex, 0, moved);
      next[sectionIndex] = { ...next[sectionIndex], problems };
      return next;
    });
    setDraggingProblem(null);
    setDragOverProblem(null);
  };

  const handleProblemDragEnd = () => {
    setDraggingProblem(null);
    setDragOverProblem(null);
  };

  const handleProblemDragOver = (sectionId: string, problemId: number) => {
    if (!draggingProblem || draggingProblem.sectionId !== sectionId) return;
    if (dragOverProblem && dragOverProblem.problemId === problemId) return;
    setDragOverProblem({ sectionId, problemId });
  };

  const searchActions = (
    <>
      <button type="button" className={primaryButtonClasses}>
        <Plus className="w-4 h-4" />
        Add Topic
      </button>
      <button type="button" className={primaryButtonClasses} onClick={toggleTopicReorder}>
        <PencilLine className="w-4 h-4" />
        {isTopicReorderMode ? 'Done' : 'Edit Topic'}
      </button>
    </>
  );

  const renderSectionActions = (section: PracticeSection) => {
    const isEditing = activeProblemReorderSectionId === section.id;
    return (
      <>
        <button type="button" className={primaryButtonClasses}>
          <Plus className="w-4 h-4" />
          Add
        </button>
        <button
          type="button"
          className={primaryButtonClasses}
          onClick={() => toggleProblemReorder(section.id)}
        >
          <PencilLine className="w-4 h-4" />
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <PracticePageBase
        title="DSA Problem Roadmap"
        subtitle="Master Data Structures & Algorithms with codestorywithMIK"
        problemSections={sections}
        searchActions={searchActions}
        sectionActions={renderSectionActions}
        isSectionDragEnabled={isTopicReorderMode}
        onSectionDragStart={handleSectionDragStart}
        onSectionDrop={handleSectionDrop}
        onSectionDragEnd={handleSectionDragEnd}
        onSectionDragOver={handleSectionDragOver}
        draggingSectionId={draggingSectionId}
        dragOverSectionId={dragOverSectionId}
        activeProblemDragSectionId={activeProblemReorderSectionId}
        onProblemDragStart={handleProblemDragStart}
        onProblemDrop={handleProblemDrop}
        onProblemDragEnd={handleProblemDragEnd}
        onProblemDragOver={handleProblemDragOver}
        draggingProblem={draggingProblem}
        dragOverProblem={dragOverProblem}
      />
    </div>
  );
}

