import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Card } from './ui/card';
import { Button, buttonVariants } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Plus, X, CalendarIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { getStoredToken } from '../lib/api';
import { cn } from './ui/utils';
import { ImageWithFallback } from './figma/ImageWithFallback';

const DEFAULT_TAGS = [
  'Array',
  'String',
  'Hash Table',
  'Dynamic Programming',
  'Math',
  'Sorting',
  'Greedy',
  'DFS',
  'Binary Search',
  'BFS',
  'Tree',
  'Matrix',
  'Two Pointers',
  'Stack',
  'Graph',
  'Sliding Window',
];

interface CreatePostPageProps {
  onPostComplete?: (date: { year: number; month: number; day: number }) => void;
}

const toLocalDate = (value?: string | Date | null) => {
  if (!value) return new Date();
  if (value instanceof Date) return isNaN(value.getTime()) ? new Date() : value;

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  const parts = value.split('-').map(part => parseInt(part, 10));
  if (parts.length >= 3 && parts.every(num => !isNaN(num))) {
    const [year, month, day] = parts;
    return new Date(year, (month || 1) - 1, day || 1);
  }

  return new Date();
};

export function CreatePostPage({ onPostComplete }: CreatePostPageProps = {}) {
  const { theme } = useTheme();
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [problemName, setProblemName] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>(
    'Medium'
  );
  const [postDate, setPostDate] = useState<Date>(new Date());
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFileName, setThumbnailFileName] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [leetcodeLink, setLeetcodeLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);
  const [newTag, setNewTag] = useState('');
  const [optionalLinks, setOptionalLinks] = useState<
    { label: string; url: string }[]
  >([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isLoadingExistingPost, setIsLoadingExistingPost] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTagEditMode, setIsTagEditMode] = useState(false);
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editingTagValue, setEditingTagValue] = useState('');

  const MAX_THUMBNAIL_SIZE = 1.5 * 1024 * 1024; // ~1.5MB

  const resetForm = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('post_edit_post_id');
    }
    setMotivationalQuote('');
    setProblemName('');
    setDifficulty('Medium');
    setPostDate(new Date());
    setThumbnailUrl('');
    setThumbnailFileName('');
    setYoutubeLink('');
    setLeetcodeLink('');
    setGithubLink('');
    setSelectedTags([]);
    setOptionalLinks([]);
    setNewTag('');
    setNewLinkLabel('');
    setNewLinkUrl('');
    setEditingPostId(null);
    setLoadError(null);
    setIsDatePickerOpen(false);
  }, []);

  const loadPostForEditing = useCallback(
    async (postId: string) => {
      setIsLoadingExistingPost(true);
      setLoadError(null);
      try {
        const response = await fetch(`/api/posts?id=${postId}`);
        const data = await response.json();

        if (!response.ok || !data?.success || !data.post) {
          throw new Error(data?.error || 'Failed to load post');
        }

        const post = data.post;
        setEditingPostId(post.id);
        setMotivationalQuote(post.motivationalQuote || '');
        setProblemName(post.problemName || '');
        setDifficulty(post.difficulty || 'Medium');
        setPostDate(toLocalDate(post.postDate));
        setThumbnailUrl(post.thumbnailUrl || '');
        setThumbnailFileName(
          post.thumbnailUrl?.startsWith('data:image')
            ? 'Uploaded thumbnail'
            : post.thumbnailUrl
            ? (() => {
                try {
                  const url = new URL(post.thumbnailUrl);
                  return url.hostname;
                } catch {
                  return '';
                }
              })()
            : ''
        );
        setYoutubeLink(post.youtubeLink || '');
        setLeetcodeLink(post.leetcodeLink || '');
        setGithubLink(post.githubLink || '');

        const loadedTags = Array.isArray(post.tags) ? post.tags : [];
        setSelectedTags(loadedTags);
        setAvailableTags(prev => {
          const missing = loadedTags.filter(
            (tag: string) => !prev.includes(tag)
          );
          return missing.length ? [...prev, ...missing] : prev;
        });

        const loadedLinks = Array.isArray(post.extraLinks)
          ? post.extraLinks
          : [];
        setOptionalLinks(loadedLinks);
      } catch (error: any) {
        console.error('Failed to load post for editing:', error);
        setLoadError(
          error?.message || 'Failed to load post. Please try again later.'
        );
      } finally {
        setIsLoadingExistingPost(false);
      }
    },
    [setAvailableTags]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedId = sessionStorage.getItem('post_edit_post_id');
    if (storedId) {
      sessionStorage.removeItem('post_edit_post_id');
      loadPostForEditing(storedId);
    }
  }, [loadPostForEditing]);

  const handleThumbnailUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG).');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      alert('Thumbnail is too large. Please keep it under 1.5MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setThumbnailUrl(result);
      setThumbnailFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleClearThumbnailUpload = () => {
    setThumbnailFileName('');
    setThumbnailUrl('');
    const fileInput = document.getElementById(
      'thumbnailUpload'
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setAvailableTags(availableTags.filter(tag => tag !== tagToDelete));
    setSelectedTags(selectedTags.filter(tag => tag !== tagToDelete));
  };

  const handleStartEditingTag = (index: number, currentValue: string) => {
    if (isTagEditMode) {
      setEditingTagIndex(index);
      setEditingTagValue(currentValue);
    }
  };

  const handleSaveTagEdit = () => {
    if (editingTagIndex !== null && editingTagValue.trim()) {
      const oldTag = availableTags[editingTagIndex];
      const newTag = editingTagValue.trim();

      // Update available tags
      const updatedTags = [...availableTags];
      updatedTags[editingTagIndex] = newTag;
      setAvailableTags(updatedTags);

      // Update selected tags if the old tag was selected
      if (selectedTags.includes(oldTag)) {
        setSelectedTags(
          selectedTags.map(tag => (tag === oldTag ? newTag : tag))
        );
      }
    }
    setEditingTagIndex(null);
    setEditingTagValue('');
  };

  const handleAddOptionalLink = () => {
    if (newLinkLabel && newLinkUrl) {
      setOptionalLinks([
        ...optionalLinks,
        { label: newLinkLabel, url: newLinkUrl },
      ]);
      setNewLinkLabel('');
      setNewLinkUrl('');
    }
  };

  const notifyPostComplete = (date: Date) => {
    onPostComplete?.({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    });
  };

  const handleExitEditMode = () => {
    notifyPostComplete(postDate);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const postData = {
        motivationalQuote,
        problemName,
        difficulty,
        postDate: format(postDate, 'yyyy-MM-dd'),
        thumbnailUrl,
        youtubeLink,
        leetcodeLink,
        githubLink,
        tags: selectedTags,
        optionalLinks,
      };

      const token = getStoredToken();
      if (!token) {
        throw new Error('You must be logged in to create or edit posts');
      }

      const method = editingPostId ? 'PUT' : 'POST';
      const response = await fetch('/api/posts', {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          editingPostId ? { ...postData, id: editingPostId } : postData
        ),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save post');
      }

      alert(
        editingPostId
          ? 'Post updated successfully!'
          : 'Post published successfully!'
      );
      notifyPostComplete(postDate);
      resetForm();
    } catch (error: any) {
      console.error('Error saving post:', error);
      alert(error.message || 'Failed to save post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="mb-8 pt-4">
          <h1
            className={`mb-2 ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            Create Daily Post
          </h1>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            Share today's challenge with your students
          </p>
        </div>

        {/* Form */}
        <Card
          className={`p-8 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
              : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {editingPostId && !isLoadingExistingPost && (
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-2xl bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-orange-600 via-purple-600 to-indigo-600 opacity-60 blur-2xl" />
                <div
                  className={`relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 rounded-2xl border ${
                    theme === 'dark'
                      ? 'bg-slate-950/80 border-purple-500/40 text-slate-100 shadow-2xl shadow-purple-950/40'
                      : 'bg-white border-purple-200 text-slate-900 shadow-2xl shadow-purple-200/50'
                  }`}
                >
                  <div>
                    <p className="font-semibold tracking-tight">
                      Editing post for {format(postDate, 'PPP')}
                    </p>
                    <p
                      className={`text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Saving will replace the existing entry assigned to this
                      date.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleExitEditMode}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-black/10 text-white bg-gradient-to-bl from-[#991b1b] via-[#dc2626] to-[#f87171] hover:brightness-105 transition-transform hover:-translate-y-0.5 shadow-lg shadow-red-900/30"
                  >
                    Exit edit mode
                  </Button>
                </div>
              </div>
            )}

            {loadError && (
              <div
                className={`p-4 rounded-xl border text-sm ${
                  theme === 'dark'
                    ? 'border-red-500/40 bg-red-500/10 text-red-200'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {loadError}
              </div>
            )}

            {isLoadingExistingPost && (
              <div
                className={`p-4 rounded-xl border text-sm ${
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900/40 text-slate-200'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                Loading post details...
              </div>
            )}

            <fieldset disabled={isLoadingExistingPost} className="space-y-8">
              {/* Motivational Quote */}
              <div className={editingPostId ? 'pt-8' : ''}>
                <Label
                  htmlFor="quote"
                  className={`mb-2 block ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Daily Motivational Quote
                </Label>
                <Textarea
                  id="quote"
                  placeholder="Enter an inspiring quote to motivate learners..."
                  value={motivationalQuote}
                  onChange={e => setMotivationalQuote(e.target.value)}
                  required
                  rows={3}
                  className={`resize-none ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  } focus:border-purple-500 focus:ring-purple-500/20`}
                />
              </div>

              <Separator
                className={
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'
                }
              />

              {/* Problem Name */}
              <div>
                <Label
                  htmlFor="problemName"
                  className={`mb-2 block ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Problem Name
                </Label>
                <Input
                  id="problemName"
                  placeholder="e.g., Two Sum"
                  value={problemName}
                  onChange={e => setProblemName(e.target.value)}
                  required
                  className={`h-11 ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  } focus:border-purple-500 focus:ring-purple-500/20`}
                />
              </div>

              <Separator
                className={
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'
                }
              />

              {/* Difficulty */}
              <div>
                <Label
                  className={`mb-3 block ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Difficulty Level
                </Label>
                <RadioGroup
                  value={difficulty}
                  onValueChange={value =>
                    setDifficulty(value as 'Easy' | 'Medium' | 'Hard')
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Easy" id="easy" />
                    <Label
                      htmlFor="easy"
                      className={`cursor-pointer ${
                        difficulty === 'Easy'
                          ? 'text-green-400 font-semibold'
                          : theme === 'dark'
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                    >
                      Easy
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Medium" id="medium" />
                    <Label
                      htmlFor="medium"
                      className={`cursor-pointer ${
                        difficulty === 'Medium'
                          ? 'text-amber-400 font-semibold'
                          : theme === 'dark'
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                    >
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Hard" id="hard" />
                    <Label
                      htmlFor="hard"
                      className={`cursor-pointer ${
                        difficulty === 'Hard'
                          ? 'text-red-400 font-semibold'
                          : theme === 'dark'
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                    >
                      Hard
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator
                className={
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'
                }
              />

              {/* Post Date */}
              <div>
                <Label
                  className={`mb-2 block ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Post Date
                </Label>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-full justify-start text-left font-normal h-11 ${
                        theme === 'dark'
                          ? 'bg-slate-800/50 border-slate-700 text-slate-100 hover:bg-slate-700/50'
                          : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {postDate ? format(postDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className={`w-auto p-3 ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-slate-300'
                    }`}
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={postDate}
                      onSelect={date => {
                        if (date) {
                          setPostDate(date);
                          setIsDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                      classNames={{
                        months: 'flex flex-col sm:flex-row gap-2',
                        month: 'flex flex-col gap-4',
                        caption:
                          'flex justify-center pt-1 relative items-center w-full',
                        caption_label: `text-sm font-medium ${
                          theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                        }`,
                        nav: 'flex items-center gap-1',
                        nav_button: cn(
                          buttonVariants({ variant: 'outline' }),
                          `size-7 p-0 ${
                            theme === 'dark'
                              ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`
                        ),
                        nav_button_previous: 'absolute left-1',
                        nav_button_next: 'absolute right-1',
                        table: 'w-full border-collapse',
                        head_row: 'flex',
                        head_cell: `text-center p-1 text-sm font-normal ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`,
                        row: 'flex w-full mt-2',
                        cell: 'relative p-0 text-center text-sm',
                        day: cn(
                          `size-8 p-0 font-normal rounded-md transition-colors ${
                            theme === 'dark'
                              ? 'text-slate-300 hover:bg-slate-700'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`
                        ),
                        day_selected: `bg-purple-600 text-white hover:bg-purple-700 ${
                          theme === 'dark'
                            ? 'hover:bg-purple-700'
                            : 'hover:bg-purple-700'
                        }`,
                        day_today: `bg-purple-500/20 border border-purple-500 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-700'
                        }`,
                        day_outside: `${
                          theme === 'dark'
                            ? 'text-slate-600 opacity-50'
                            : 'text-slate-400 opacity-50'
                        }`,
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Separator
                className={
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'
                }
              />

              {/* Thumbnail */}
              <div>
                <Label
                  htmlFor="thumbnailUrl"
                  className={`mb-2 block ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Thumbnail
                </Label>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  placeholder="https://i.ytimg.com/vi/..."
                  value={thumbnailUrl}
                  onChange={e => {
                    setThumbnailUrl(e.target.value);
                    setThumbnailFileName('');
                  }}
                  required
                  className={`h-11 ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  } focus:border-purple-500 focus:ring-purple-500/20`}
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    id="thumbnailUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                  <label
                    htmlFor="thumbnailUpload"
                    className={`inline-flex items-center px-4 py-2 rounded-md cursor-pointer text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-slate-800/60 text-slate-100 hover:bg-slate-700/80 border border-slate-700'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    Upload Image
                  </label>
                  {thumbnailFileName && (
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {thumbnailFileName}
                    </span>
                  )}
                  {thumbnailUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearThumbnailUpload}
                      className={`text-sm ${
                        theme === 'dark'
                          ? 'text-slate-300 hover:text-red-300'
                          : 'text-slate-600 hover:text-red-600'
                      }`}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Paste an image URL or upload a thumbnail (PNG/JPG, &lt;
                  1.5MB).
                </p>
                {thumbnailUrl && (
                  <div className="mt-3">
                    <ImageWithFallback
                      src={thumbnailUrl}
                      alt="Thumbnail preview"
                      className="max-w-full h-auto rounded-lg border border-slate-700 max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>

              <Separator
                className={
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'
                }
              />

              {/* Links */}
              <div className="space-y-5">
                <Label
                  className={
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }
                >
                  Resource Links
                </Label>

                <div>
                  <Label
                    htmlFor="youtube"
                    className={`mb-2 block text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    YouTube Video
                  </Label>
                  <Input
                    id="youtube"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeLink}
                    onChange={e => setYoutubeLink(e.target.value)}
                    required
                    className={`h-11 ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    } focus:border-purple-500 focus:ring-purple-500/20`}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="leetcode"
                    className={`mb-2 block text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    LeetCode Problem
                  </Label>
                  <Input
                    id="leetcode"
                    type="url"
                    placeholder="https://leetcode.com/problems/..."
                    value={leetcodeLink}
                    onChange={e => setLeetcodeLink(e.target.value)}
                    required
                    className={`h-11 ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    } focus:border-purple-500 focus:ring-purple-500/20`}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="github"
                    className={`mb-2 block text-sm ${
                      theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    GitHub Code
                  </Label>
                  <Input
                    id="github"
                    type="url"
                    placeholder="https://github.com/..."
                    value={githubLink}
                    onChange={e => setGithubLink(e.target.value)}
                    required
                    className={`h-11 ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    } focus:border-purple-500 focus:ring-purple-500/20`}
                  />
                </div>
              </div>

              <Separator
                className={
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'
                }
              />

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label
                    className={
                      theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                    }
                  >
                    Problem Tags
                  </Label>
                  <Button
                    type="button"
                    onClick={() => {
                      setIsTagEditMode(!isTagEditMode);
                      setEditingTagIndex(null);
                      setEditingTagValue('');
                    }}
                    className={`h-9 px-4 text-sm font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-transparent hover:bg-slate-700/50 text-slate-100 border border-slate-600'
                        : 'bg-transparent hover:bg-slate-200 text-slate-900 border border-slate-300'
                    }`}
                  >
                    {isTagEditMode ? 'Done' : 'Edit'}
                  </Button>
                </div>
                <div
                  className="flex flex-wrap gap-2 mb-4"
                  onClick={e => {
                    // Close editing when clicking empty space
                    if (e.target === e.currentTarget) {
                      setEditingTagIndex(null);
                      setEditingTagValue('');
                    }
                  }}
                >
                  {availableTags.map((tag, index) => (
                    <div
                      key={`${tag}-${index}`}
                      className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-900/30'
                          : theme === 'dark'
                          ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 border border-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300'
                      } ${isTagEditMode ? 'pr-2' : ''}`}
                    >
                      {editingTagIndex === index ? (
                        <input
                          type="text"
                          value={editingTagValue}
                          onChange={e => setEditingTagValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveTagEdit();
                            } else if (e.key === 'Escape') {
                              setEditingTagIndex(null);
                              setEditingTagValue('');
                            }
                          }}
                          onBlur={handleSaveTagEdit}
                          autoFocus
                          className={`px-0 py-0 text-sm bg-transparent border-none outline-none ${
                            selectedTags.includes(availableTags[index])
                              ? 'text-white placeholder:text-white/50'
                              : theme === 'dark'
                              ? 'text-slate-300 placeholder:text-slate-500'
                              : 'text-slate-700 placeholder:text-slate-400'
                          }`}
                          style={{
                            width: `${Math.max(
                              editingTagValue.length * 8,
                              40
                            )}px`,
                          }}
                        />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (isTagEditMode) {
                                handleStartEditingTag(index, tag);
                              } else {
                                handleTagClick(tag);
                              }
                            }}
                            className={`flex-1 ${
                              isTagEditMode ? 'cursor-text' : 'cursor-pointer'
                            }`}
                          >
                            {tag}
                          </button>
                          {isTagEditMode && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteTag(tag);
                              }}
                              className={`opacity-70 hover:opacity-100 transition-all hover:scale-110 ${
                                selectedTags.includes(tag)
                                  ? 'text-white hover:text-red-200'
                                  : theme === 'dark'
                                  ? 'text-slate-400 hover:text-red-400'
                                  : 'text-slate-500 hover:text-red-500'
                              }`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Create new tag..."
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyPress={e =>
                      e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                    }
                    className={`h-11 ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    } focus:border-purple-500 focus:ring-purple-500/20`}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTag}
                    className={`h-11 ${
                      theme === 'dark'
                        ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-100'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                    } disabled:opacity-40`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Separator
                className={
                  theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'
                }
              />

              {/* Optional Links */}
              <div>
                <Label
                  className={`mb-3 block ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  Optional Links
                </Label>

                {optionalLinks.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {optionalLinks.map((link, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-slate-800/50 border-slate-700'
                            : 'bg-slate-100 border-slate-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p
                            className={
                              theme === 'dark'
                                ? 'text-slate-100'
                                : 'text-slate-900'
                            }
                          >
                            {link.label}
                          </p>
                          <p
                            className={`text-sm truncate ${
                              theme === 'dark'
                                ? 'text-slate-400'
                                : 'text-slate-600'
                            }`}
                          >
                            {link.url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setOptionalLinks(
                              optionalLinks.filter((_, i) => i !== index)
                            )
                          }
                          className={`ml-3 transition-colors ${
                            theme === 'dark'
                              ? 'text-slate-400 hover:text-purple-400'
                              : 'text-slate-500 hover:text-purple-600'
                          }`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Link label"
                    value={newLinkLabel}
                    onChange={e => setNewLinkLabel(e.target.value)}
                    className={`h-11 ${
                      theme === 'dark'
                        ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    } focus:border-purple-500 focus:ring-purple-500/20`}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={newLinkUrl}
                      onChange={e => setNewLinkUrl(e.target.value)}
                      className={`h-11 ${
                        theme === 'dark'
                          ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                      } focus:border-purple-500 focus:ring-purple-500/20`}
                    />
                    <Button
                      type="button"
                      onClick={handleAddOptionalLink}
                      disabled={!newLinkLabel || !newLinkUrl}
                      className={`h-11 ${
                        theme === 'dark'
                          ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-100'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                      } disabled:opacity-40`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className={
                    theme === 'dark'
                      ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Post'}
                </Button>
              </div>
            </fieldset>
          </form>
        </Card>
      </div>
    </div>
  );
}
