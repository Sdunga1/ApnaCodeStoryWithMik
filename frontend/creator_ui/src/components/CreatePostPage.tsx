import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { LogOut, Plus, X } from 'lucide-react';

interface CreatePostPageProps {
  onLogout: () => void;
}

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

export function CreatePostPage({ onLogout }: CreatePostPageProps) {
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
      setSelectedTags([...selectedTags, newTag]);
      setNewTag('');
    }
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
    <div 
      className="min-h-screen p-6"
      style={{ background: 'linear-gradient(to bottom right, #000000, #050505, #0a0015)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-slate-100 mb-1">Create Daily Post</h1>
            <p className="text-slate-300">Share today's challenge</p>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="text-slate-100 hover:text-slate-100 hover:bg-slate-800/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Form */}
        <Card className="p-8 bg-slate-900/50 backdrop-blur-xl border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Motivational Quote */}
            <div>
              <Label htmlFor="quote" className="text-slate-100 mb-2 block">
                Daily Motivational Quote
              </Label>
              <Textarea
                id="quote"
                placeholder="Enter an inspiring quote to motivate learners..."
                value={motivationalQuote}
                onChange={(e) => setMotivationalQuote(e.target.value)}
                required
                rows={3}
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 resize-none"
              />
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Problem Name */}
            <div>
              <Label htmlFor="problemName" className="text-slate-100 mb-2 block">
                Problem Name
              </Label>
              <Input
                id="problemName"
                placeholder="e.g., Two Sum"
                value={problemName}
                onChange={(e) => setProblemName(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 h-11"
              />
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Links */}
            <div className="space-y-5">
              <Label className="text-slate-100 block">Resource Links</Label>
              
              <div>
                <Label htmlFor="youtube" className="text-slate-300 mb-2 block text-sm">
                  YouTube Video
                </Label>
                <Input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 h-11"
                />
              </div>

              <div>
                <Label htmlFor="leetcode" className="text-slate-300 mb-2 block text-sm">
                  LeetCode Problem
                </Label>
                <Input
                  id="leetcode"
                  type="url"
                  placeholder="https://leetcode.com/problems/..."
                  value={leetcodeLink}
                  onChange={(e) => setLeetcodeLink(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 h-11"
                />
              </div>

              <div>
                <Label htmlFor="github" className="text-slate-300 mb-2 block text-sm">
                  GitHub Code
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/..."
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 h-11"
                />
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Tags */}
            <div>
              <Label className="text-slate-100 mb-3 block">Problem Tags</Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-900/30'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 border border-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Create new tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 h-11"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!newTag}
                  className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-100 disabled:opacity-40 h-11"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Separator className="bg-slate-700/50" />

            {/* Optional Links */}
            <div>
              <Label className="text-slate-100 mb-3 block">Optional Links</Label>
              
              {optionalLinks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {optionalLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-100">{link.label}</p>
                        <p className="text-slate-400 text-sm truncate">{link.url}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOptionalLinks(optionalLinks.filter((_, i) => i !== index))}
                        className="ml-3 text-slate-400 hover:text-purple-400 transition-colors"
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
                  className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 h-11"
                />
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-purple-500 h-11"
                  />
                  <Button
                    type="button"
                    onClick={handleAddOptionalLink}
                    disabled={!newLinkLabel || !newLinkUrl}
                    className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-100 disabled:opacity-40 h-11"
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
                className="text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
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
