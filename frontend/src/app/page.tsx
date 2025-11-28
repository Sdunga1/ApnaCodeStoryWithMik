'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { HomePage, type Post as DailyPost } from '@/components/HomePage';
import { ProfileContent } from '@/components/ProfileContent';
import { CreatePostPage } from '@/components/CreatePostPage';
import Header from '@/components/Header';
import { StatsCard } from '@/components/StatsCard';
import { ProblemSection } from '@/components/ProblemSection';
import { Search, Plus, Pencil, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronsUpDown } from '@/components/icons/ChevronsUpDown';
import type {
  PracticeTopic,
  PracticeProblem,
  PracticeProblemPayload,
  PracticeTopicPayload,
} from '@/types/practice';

const sortProblems = (problems: PracticeProblem[] = []) =>
  [...problems].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

const normalizeTopics = (topics: PracticeTopic[] = []): PracticeTopic[] =>
  [...topics]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(topic => ({
      ...topic,
      problems: sortProblems(topic.problems ?? []),
    }));

const applyProblemOrder = (problems: PracticeProblem[]) =>
  problems.map((problem, index) => ({ ...problem, position: index + 1 }));

const applyTopicOrder = (topics: PracticeTopic[]) =>
  topics.map((topic, index) => ({
    ...topic,
    position: index + 1,
    problems: sortProblems(topic.problems),
  }));
import { Reorder } from 'framer-motion';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('home');
  const [topicSections, setTopicSections] = useState<PracticeTopic[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [topicOrderDirty, setTopicOrderDirty] = useState(false);
  const [newTopicIds, setNewTopicIds] = useState<Set<string>>(new Set());
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const canManagePractice = isAuthenticated && user?.role === 'creator';
  const baseActionButtonClasses =
    'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const primaryActionButtonClasses =
    theme === 'dark'
      ? `${baseActionButtonClasses} bg-white/95 text-slate-900 border border-white/40 shadow-[0_25px_65px_rgba(2,6,23,0.75)] hover:bg-white`
      : `${baseActionButtonClasses} bg-slate-900/90 text-white border border-slate-200 shadow-[0_15px_45px_rgba(15,23,42,0.18)] hover:bg-slate-900`;
  const secondaryActionButtonClasses =
    theme === 'dark'
      ? `${baseActionButtonClasses} border border-white/20 text-white/80 hover:text-white hover:bg-white/05`
      : `${baseActionButtonClasses} border border-slate-200 text-slate-800 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:bg-slate-50`;
  const editingConfirmationClasses = `${baseActionButtonClasses} bg-[#0BB489] border border-[#0BB489] text-white shadow-[0_12px_32px_rgba(11,180,137,0.35)] hover:bg-[#0aa779] hover:border-[#0aa779]`;
  const isFiltering = searchQuery.trim().length > 0;

  // Calculate stats
  const totalProblems = topicSections.reduce(
    (acc, section) => acc + section.problems.length,
    0
  );
  const difficultyTotals = topicSections.reduce(
    (acc, section) => {
      section.problems.forEach(problem => {
        if (problem.difficulty === 'Easy') acc.easy += 1;
        if (problem.difficulty === 'Medium') acc.medium += 1;
        if (problem.difficulty === 'Hard') acc.hard += 1;
      });
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

  const completedProblems = 0;
  const easyCompleted = 0;
  const mediumCompleted = 0;
  const hardCompleted = 0;
  const easyTotal = difficultyTotals.easy;
  const mediumTotal = difficultyTotals.medium;
  const hardTotal = difficultyTotals.hard;

  const updateTopicProblems = useCallback(
    (
      topicId: string,
      updater: (problems: PracticeProblem[]) => PracticeProblem[]
    ) => {
      setTopicSections(prev =>
        prev.map(section =>
          section.id === topicId
            ? { ...section, problems: updater(section.problems ?? []) }
            : section
        )
      );
    },
    []
  );

  const fetchPracticeData = useCallback(async () => {
    setPracticeLoading(true);
    try {
      const response = await fetch('/api/practice');
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load practice roadmap');
      }
      setTopicSections(normalizeTopics(data.topics ?? []));
      setPracticeError(null);
    } catch (error: any) {
      console.error('Failed to load practice topics', error);
      setPracticeError(error?.message ?? 'Unable to load practice roadmap');
    } finally {
      setPracticeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPracticeData();
  }, [fetchPracticeData]);

  useEffect(() => {
    if (!canManagePractice) {
      setIsGlobalEditing(false);
      setEditingSectionId(null);
      setTopicOrderDirty(false);
    }
  }, [canManagePractice]);

  // Filter problems based on search
  const filteredSections = searchQuery
    ? topicSections
        .map(section => ({
          ...section,
          problems: section.problems.filter(problem =>
            problem.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(section => section.problems.length > 0)
    : topicSections;
  const sectionsToRender = isGlobalEditing ? topicSections : filteredSections;

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

  const handleProblemsReorder = useCallback(
    (sectionId: string, updatedProblems: PracticeProblem[]) => {
      setTopicSections(prev =>
        prev.map(section =>
          section.id === sectionId
            ? { ...section, problems: applyProblemOrder(updatedProblems) }
            : section
        )
      );
    },
    []
  );

  const persistProblemOrder = useCallback(
    async (sectionId: string) => {
      if (!canManagePractice) return;
      const section = topicSections.find(topic => topic.id === sectionId);
      if (!section || section.problems.length === 0) return;
      try {
        await fetch('/api/practice/problems/reorder', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicId: sectionId,
            orderedIds: section.problems.map(problem => problem.id),
          }),
        });
      } catch (error) {
        console.error('Failed to persist problem order', error);
      }
    },
    [canManagePractice, topicSections]
  );

  const persistTopicOrder = useCallback(async () => {
    if (!canManagePractice || !topicOrderDirty || topicSections.length === 0)
      return;
    try {
      await fetch('/api/practice/topics/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderedIds: topicSections.map(topic => topic.id),
        }),
      });
      setTopicOrderDirty(false);
    } catch (error) {
      console.error('Failed to persist topic order', error);
    }
  }, [canManagePractice, topicOrderDirty, topicSections]);

  const handleProblemCreate = useCallback(
    async (topicId: string, payload: PracticeProblemPayload) => {
      if (!canManagePractice) {
        throw new Error('Not authorized');
      }
      const response = await fetch('/api/practice/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, topicId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to add problem');
      }
      updateTopicProblems(topicId, problems =>
        sortProblems([...problems, data.problem as PracticeProblem])
      );
    },
    [canManagePractice, updateTopicProblems]
  );

  const handleProblemUpdate = useCallback(
    async (
      topicId: string,
      problemId: string,
      payload: PracticeProblemPayload
    ) => {
      if (!canManagePractice) {
        throw new Error('Not authorized');
      }
      const response = await fetch(`/api/practice/problems/${problemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to update problem');
      }
      updateTopicProblems(topicId, problems =>
        sortProblems(
          problems.map(problem =>
            problem.id === problemId
              ? (data.problem as PracticeProblem)
              : problem
          )
        )
      );
    },
    [canManagePractice, updateTopicProblems]
  );

  const handleGlobalEditToggle = useCallback(async () => {
    if (!canManagePractice) return;
    if (!isGlobalEditing) {
      if (isFiltering) {
        return;
      }
      if (searchQuery) {
        setSearchQuery('');
      }
      setEditingSectionId(null);
      setIsGlobalEditing(true);
      setTopicOrderDirty(false);
      return;
    }
    setIsGlobalEditing(false);
    setEditingSectionId(null);
    await persistTopicOrder();
  }, [
    canManagePractice,
    isGlobalEditing,
    isFiltering,
    persistTopicOrder,
    searchQuery,
  ]);

  const handleSectionEditStart = useCallback(
    (sectionId: string) => {
      if (!canManagePractice) return;
      if (isFiltering) {
        return;
      }
      if (searchQuery) {
        setSearchQuery('');
      }
      setIsGlobalEditing(false);
      setEditingSectionId(sectionId);
    },
    [canManagePractice, isFiltering, searchQuery]
  );

  const handleSectionEditStop = useCallback(
    async (sectionId: string) => {
      if (!canManagePractice) return;
      setEditingSectionId(null);
      await persistProblemOrder(sectionId);
    },
    [canManagePractice, persistProblemOrder]
  );

  const handleAddTopic = useCallback(() => {
    if (!canManagePractice) return;
    
    // Create a temporary topic with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const newTopic: PracticeTopic = {
      id: tempId,
      title: '',
      position: topicSections.length + 1,
      problems: [],
    };
    
    setTopicSections(prev => [newTopic, ...prev]);
    setNewTopicIds(prev => new Set(prev).add(tempId));
  }, [canManagePractice, topicSections.length]);

  const handleTopicTitleSave = useCallback(
    async (topicId: string, newTitle: string) => {
      if (!canManagePractice) {
        console.error('User does not have permission to manage practice');
        throw new Error('Not authorized to edit topics');
      }
      
      const isNewTopic = newTopicIds.has(topicId);
      
      console.log('Saving topic:', { topicId, newTitle, isNewTopic });
      
      try {
        if (isNewTopic) {
          // Create new topic
          console.log('Creating new topic...');
          const response = await fetch('/api/practice/topics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle }),
          });
          const data = await response.json();
          
          console.log('Create topic response:', { status: response.status, data });
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to create topic');
          }
          
          // Replace temporary topic with the real one
          setTopicSections(prev =>
            prev.map(topic =>
              topic.id === topicId
                ? { ...data.topic, problems: [] }
                : topic
            )
          );
          setNewTopicIds(prev => {
            const next = new Set(prev);
            next.delete(topicId);
            return next;
          });
        } else {
          // Update existing topic
          console.log('Updating existing topic...');
          const response = await fetch(`/api/practice/topics/${topicId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle }),
          });
          const data = await response.json();
          
          console.log('Update topic response:', { status: response.status, data });
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Unable to update topic');
          }
          
          // Update the topic title in state
          setTopicSections(prev =>
            prev.map(topic =>
              topic.id === topicId
                ? { ...topic, title: data.topic.title }
                : topic
            )
          );
        }
      } catch (error: any) {
        console.error('Failed to save topic:', error);
        throw error;
      }
    },
    [canManagePractice, newTopicIds]
  );

  const handleTopicCancel = useCallback(
    (topicId: string) => {
      if (!canManagePractice) return;
      
      const isNewTopic = newTopicIds.has(topicId);
      
      if (isNewTopic) {
        // Remove the temporary topic
        setTopicSections(prev => prev.filter(topic => topic.id !== topicId));
        setNewTopicIds(prev => {
          const next = new Set(prev);
          next.delete(topicId);
          return next;
        });
      }
    },
    [canManagePractice, newTopicIds]
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
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="pt-[220px] md:pt-[152px]">
          {activeView === 'home' ? (
            <HomePage onEditPost={handleEditPost} />
          ) : activeView === 'profile' ? (
            <ProfileContent />
          ) : activeView === 'create-post' ? (
            <CreatePostPage onPostComplete={handlePostComplete} />
          ) : activeView === 'practice' ? (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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

              {practiceError && (
                <div className="my-6 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {practiceError}
                </div>
              )}

            {/* Search Bar */}
              <div className="mb-8 space-y-4">
              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}
                />
                <Input
                  type="text"
                  placeholder="Search problems by keyword or topic..."
                    className={`pl-12 h-14 rounded-xl border transition-all focus:border-purple-400 focus:ring-purple-500/30 ${
                    theme === 'dark'
                        ? 'bg-[#101729] border-white/10 text-slate-100 placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-500'
                  }`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
                {canManagePractice && (
                  <>
                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleAddTopic}
                        className={primaryActionButtonClasses}
                        disabled={isFiltering || isGlobalEditing}
                      >
                        <Plus className="w-4 h-4" />
                        Add Topic
                      </button>
                      <button
                        type="button"
                        onClick={handleGlobalEditToggle}
                        className={
                          isGlobalEditing
                            ? editingConfirmationClasses
                            : secondaryActionButtonClasses
                        }
                        disabled={isFiltering && !isGlobalEditing}
                      >
                        {isGlobalEditing ? (
                          <>
                            <Check className="w-4 h-4" />
                            Done
                          </>
                        ) : (
                          <>
                            <ChevronsUpDown
                              width={18}
                              height={18}
                              stroke={theme === 'dark' ? '#ffffff' : '#0f172a'}
                            />
                            Reorder
                          </>
                        )}
                      </button>
                    </div>
                    {isFiltering && !isGlobalEditing && (
                      <p className="text-right text-xs text-amber-400">
                        Clear search to reorder topics
                      </p>
                    )}
                  </>
                )}
            </div>

              {isGlobalEditing && canManagePractice && (
                <div className="mb-6 rounded-2xl border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm text-purple-100 flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wide text-xs">
                    Topic reorder mode
                  </span>
                  <span className="text-purple-200">
                    Drag & drop topic cards to rearrange your roadmap.
                  </span>
                </div>
              )}

              {practiceLoading ? (
                <div className="py-16 text-center text-slate-400">
                  Loading practice roadmap...
                </div>
              ) : (
                <>
            {/* Problem Sections */}
            <div className="space-y-6">
                    {isGlobalEditing && canManagePractice ? (
                      <Reorder.Group
                        axis="y"
                        values={topicSections}
                        onReorder={newOrder => {
                          setTopicSections(applyTopicOrder(newOrder));
                          setTopicOrderDirty(true);
                        }}
                        className="space-y-6"
                      >
                        {topicSections.map(section => (
                          <Reorder.Item
                            key={section.id}
                            value={section}
                            className="rounded-[22px] ring-2 ring-purple-500/40 bg-purple-500/5 cursor-grab"
                            whileDrag={{ scale: 1.02 }}
                          >
                            <ProblemSection
                              id={section.id}
                              title={section.title}
                              problems={section.problems}
                              defaultOpen={false}
                              onProblemsReorder={updated =>
                                handleProblemsReorder(section.id, updated)
                              }
                              editingDisabled
                              canManage={canManagePractice}
                              onAddProblem={
                                canManagePractice
                                  ? handleProblemCreate
                                  : undefined
                              }
                              onUpdateProblem={
                                canManagePractice
                                  ? handleProblemUpdate
                                  : undefined
                              }
                              onStartEditing={handleSectionEditStart}
                              onStopEditing={handleSectionEditStop}
                              isNewTopic={newTopicIds.has(section.id)}
                              onTopicTitleSave={handleTopicTitleSave}
                              onTopicCancel={handleTopicCancel}
                            />
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    ) : (
                      sectionsToRender.map((section, index) => {
                        const isSectionEditing =
                          editingSectionId === section.id;
                        const sectionEditingDisabled =
                          isGlobalEditing ||
                          (editingSectionId !== null && !isSectionEditing) ||
                          isFiltering ||
                          practiceLoading ||
                          !canManagePractice;

                        return (
                <ProblemSection
                  key={section.id}
                            id={section.id}
                            title={section.title}
                            problems={section.problems}
                            defaultOpen={index === 0 || newTopicIds.has(section.id)}
                            onProblemsReorder={updated =>
                              handleProblemsReorder(section.id, updated)
                            }
                            isEditing={isSectionEditing}
                            onStartEditing={handleSectionEditStart}
                            onStopEditing={handleSectionEditStop}
                            editingDisabled={sectionEditingDisabled}
                            canManage={canManagePractice}
                            onAddProblem={
                              canManagePractice
                                ? handleProblemCreate
                                : undefined
                            }
                            onUpdateProblem={
                              canManagePractice
                                ? handleProblemUpdate
                                : undefined
                            }
                            isNewTopic={newTopicIds.has(section.id)}
                            onTopicTitleSave={handleTopicTitleSave}
                            onTopicCancel={handleTopicCancel}
                          />
                        );
                      })
                    )}
            </div>

                  {!isGlobalEditing && filteredSections.length === 0 && (
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
                </>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
    </div>
  );
}
