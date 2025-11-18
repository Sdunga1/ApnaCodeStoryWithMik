import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Plus, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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
  'Sliding Window'
];

export function CreatePostPage() {
  const { theme } = useTheme();
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [problemName, setProblemName] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [leetcodeLink, setLeetcodeLink] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);
  const [newTag, setNewTag] = useState('');
  const [optionalLinks, setOptionalLinks] = useState<{ label: string; url: string }[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
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

  const handleAddOptionalLink = () => {
    if (newLinkLabel && newLinkUrl) {
      setOptionalLinks([...optionalLinks, { label: newLinkLabel, url: newLinkUrl }]);
      setNewLinkLabel('');
      setNewLinkUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const postData = {
      motivationalQuote,
      problemName,
      youtubeLink,
      leetcodeLink,
      githubLink,
      tags: selectedTags,
      optionalLinks,
      createdAt: new Date().toISOString()
    };
    console.log('Post created:', postData);
    alert('Post published successfully!');
  };

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="mb-8 pt-4">
          <h1 className={`mb-2 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
            Create Daily Post
          </h1>
          <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            Share today's challenge with your students
          </p>
        </div>

        {/* Form */}
        <Card className={`p-8 rounded-2xl ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
            : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Motivational Quote */}
            <div>
              <Label htmlFor="quote" className={`mb-2 block ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                Daily Motivational Quote
              </Label>
              <Textarea
                id="quote"
                placeholder="Enter an inspiring quote to motivate learners..."
                value={motivationalQuote}
                onChange={(e) => setMotivationalQuote(e.target.value)}
                required
                rows={3}
                className={`resize-none ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                } focus:border-purple-500 focus:ring-purple-500/20`}
              />
            </div>

            <Separator className={theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'} />

            {/* Problem Name */}
            <div>
              <Label htmlFor="problemName" className={`mb-2 block ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                Problem Name
              </Label>
              <Input
                id="problemName"
                placeholder="e.g., Two Sum"
                value={problemName}
                onChange={(e) => setProblemName(e.target.value)}
                required
                className={`h-11 ${
                  theme === 'dark'
                    ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                } focus:border-purple-500 focus:ring-purple-500/20`}
              />
            </div>

            <Separator className={theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'} />

            {/* Links */}
            <div className="space-y-5">
              <Label className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>Resource Links</Label>
              
              <div>
                <Label htmlFor="youtube" className={`mb-2 block text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  YouTube Video
                </Label>
                <Input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  required
                  className={`h-11 ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  } focus:border-purple-500 focus:ring-purple-500/20`}
                />
              </div>

              <div>
                <Label htmlFor="leetcode" className={`mb-2 block text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  LeetCode Problem
                </Label>
                <Input
                  id="leetcode"
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={leetcodeLink}
                  onChange={(e) => setLeetcodeLink(e.target.value)}
                  required
                  className={`h-11 ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  } focus:border-purple-500 focus:ring-purple-500/20`}
                />
              </div>

              <div>
                <Label htmlFor="github" className={`mb-2 block text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                  GitHub Code
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  required
                  className={`h-11 ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  } focus:border-purple-500 focus:ring-purple-500/20`}
                />
              </div>
            </div>

            <Separator className={theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'} />

            {/* Tags */}
            <div>
              <Label className={`mb-3 block ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Problem Tags</Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableTags.map((tag) => (
                  <div
                    key={tag}
                    className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-900/30'
                        : theme === 'dark'
                        ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 border border-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="flex-1"
                    >
                      {tag}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag);
                      }}
                      className={`opacity-70 hover:opacity-100 transition-opacity ${
                        selectedTags.includes(tag)
                          ? 'text-white hover:text-red-200'
                          : theme === 'dark'
                          ? 'text-slate-400 hover:text-red-400'
                          : 'text-slate-500 hover:text-red-500'
                      }`}
                      title="Delete tag"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Create new tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
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

            <Separator className={theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-300'} />

            {/* Optional Links */}
            <div>
              <Label className={`mb-3 block ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Optional Links</Label>
              
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
                        <p className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>{link.label}</p>
                        <p className={`text-sm truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>{link.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOptionalLinks(optionalLinks.filter((_, i) => i !== index))}
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
                  onChange={(e) => setNewLinkLabel(e.target.value)}
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
                    onChange={(e) => setNewLinkUrl(e.target.value)}
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
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8"
              >
                Publish Post
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

