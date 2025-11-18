'use client';

import React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Youtube,
  Github,
  ExternalLink,
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useTheme } from '../contexts/ThemeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { format } from 'date-fns';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Post {
  id: string;
  problemName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  postDate: string;
  thumbnailUrl: string;
  youtubeLink: string;
  leetcodeLink: string;
  githubLink: string;
  motivationalQuote: string | null;
  tags: string[];
  extraLinks: Record<string, string>;
  createdAt: string;
}

interface RecentUpdate {
  id: number;
  title: string;
  type: 'Article' | 'Video' | 'Update';
  date: string;
  link: string;
}

// Legacy dummy data - will be replaced by API data
const ALL_PROBLEMS_LEGACY: any[] = [
  // November 2024
  {
    year: 2024,
    month: 10,
    day: 14,
    title: 'Minimized Maximum of Products Distributed to Any Store',
    difficulty: 'Medium',
    description:
      'You are given an integer n indicating there are n specialty retail stores. There are m product types of varying amounts, which are given as a 0-indexed integer array quantities.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/minimized-maximum',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Binary Search', 'Array', 'Greedy'],
  },
  {
    year: 2024,
    month: 10,
    day: 13,
    title: 'Count the Number of Fair Pairs',
    difficulty: 'Medium',
    description:
      'Given a 0-indexed integer array nums of size n and two integers lower and upper, return the number of fair pairs. A pair (i, j) is fair if: 0 <= i < j < n, and lower <= nums[i] + nums[j] <= upper',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink:
      'https://leetcode.com/problems/count-the-number-of-fair-pairs',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Two Pointers', 'Binary Search', 'Array', 'Sorting'],
  },
  {
    year: 2024,
    month: 10,
    day: 12,
    title: 'Most Beautiful Item for Each Query',
    difficulty: 'Medium',
    description:
      'You are given a 2D integer array items where items[i] = [pricei, beautyi] denotes the price and beauty of an item respectively.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/most-beautiful-item',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Binary Search', 'Sorting'],
  },
  {
    year: 2024,
    month: 10,
    day: 11,
    title: 'Prime Subtraction Operation',
    difficulty: 'Medium',
    description:
      'You are given a 0-indexed integer array nums of length n. You can perform the following operation as many times as you want.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/prime-subtraction-operation',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Math', 'Greedy'],
  },
  {
    year: 2024,
    month: 10,
    day: 10,
    title: 'Shortest Subarray With OR at Least K II',
    difficulty: 'Medium',
    description:
      'You are given an array nums of non-negative integers and an integer k. An array is called special if the bitwise OR of all of its elements is at least k.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/shortest-subarray-with-or',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Bit Manipulation', 'Sliding Window'],
  },
  {
    year: 2024,
    month: 10,
    day: 9,
    title: 'Minimum Array End',
    difficulty: 'Medium',
    description:
      'You are given two integers n and x. You have to construct an array of positive integers nums of size n.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/minimum-array-end',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Bit Manipulation', 'Array'],
  },
  {
    year: 2024,
    month: 10,
    day: 8,
    title: 'Maximum XOR for Each Query',
    difficulty: 'Medium',
    description:
      'You are given a sorted array nums of n non-negative integers and an integer maximumBit.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/maximum-xor-for-each-query',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Bit Manipulation', 'Prefix Sum'],
  },
  {
    year: 2024,
    month: 10,
    day: 7,
    title: 'Largest Combination With Bitwise AND Greater Than Zero',
    difficulty: 'Medium',
    description:
      'The bitwise AND of an array nums is the bitwise AND of all integers in nums.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/largest-combination',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Hash Table', 'Bit Manipulation'],
  },
  {
    year: 2024,
    month: 10,
    day: 6,
    title: 'Find if Array Can Be Sorted',
    difficulty: 'Medium',
    description:
      'You are given a 0-indexed array of positive integers nums. In one operation, you can swap any two adjacent elements if they have the same number of set bits.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/find-if-array-can-be-sorted',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Bit Manipulation', 'Sorting'],
  },
  {
    year: 2024,
    month: 10,
    day: 5,
    title: 'Minimum Number of Changes to Make Binary String Beautiful',
    difficulty: 'Medium',
    description:
      "You are given a 0-indexed binary string s having an even length. A string is beautiful if it's possible to partition it into one or more substrings.",
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/minimum-changes-binary-string',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['String', 'Greedy'],
  },
  {
    year: 2024,
    month: 10,
    day: 4,
    title: 'String Compression III',
    difficulty: 'Medium',
    description:
      'Given a string word, compress it using the following algorithm: Begin with an empty string comp.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/string-compression-iii',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['String'],
  },
  {
    year: 2024,
    month: 10,
    day: 3,
    title: 'Rotate String',
    difficulty: 'Easy',
    description:
      'Given two strings s and goal, return true if and only if s can become goal after some number of shifts on s.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/rotate-string',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['String', 'String Matching'],
  },
  {
    year: 2024,
    month: 10,
    day: 2,
    title: 'Circular Sentence',
    difficulty: 'Easy',
    description:
      'A sentence is a list of words that are separated by a single space with no leading or trailing spaces.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/circular-sentence',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['String'],
  },
  {
    year: 2024,
    month: 10,
    day: 1,
    title: 'Delete Characters to Make Fancy String',
    difficulty: 'Easy',
    description:
      'A fancy string is a string where no three consecutive characters are equal.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink:
      'https://leetcode.com/problems/delete-characters-fancy-string',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['String'],
  },

  // October 2024
  {
    year: 2024,
    month: 9,
    day: 31,
    title: 'Minimum Total Distance Traveled',
    difficulty: 'Hard',
    description:
      'There are some robots and factories on the X-axis. You are given an integer array robot where robot[i] is the position of the ith robot.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/minimum-total-distance',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Dynamic Programming', 'Sorting'],
  },
  {
    year: 2024,
    month: 9,
    day: 30,
    title: 'Minimum Number of Removals to Make Mountain Array',
    difficulty: 'Hard',
    description:
      'You may recall that an array arr is a mountain array if and only if certain conditions are met.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink:
      'https://leetcode.com/problems/minimum-removals-mountain-array',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Binary Search', 'Dynamic Programming'],
  },
  {
    year: 2024,
    month: 9,
    day: 29,
    title: 'Maximum Number of Moves in a Grid',
    difficulty: 'Medium',
    description:
      'You are given a 0-indexed m x n matrix grid consisting of positive integers.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/maximum-moves-in-grid',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Dynamic Programming', 'Matrix'],
  },
  {
    year: 2024,
    month: 9,
    day: 28,
    title: 'Longest Square Streak in an Array',
    difficulty: 'Medium',
    description:
      'You are given an integer array nums. A subsequence of nums is called a square streak if the length of the subsequence is at least 2.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/longest-square-streak',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Hash Table', 'Binary Search'],
  },
  {
    year: 2024,
    month: 9,
    day: 27,
    title: 'Count Square Submatrices with All Ones',
    difficulty: 'Medium',
    description:
      'Given a m * n matrix of ones and zeros, return how many square submatrices have all ones.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/count-square-submatrices',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Dynamic Programming', 'Matrix'],
  },

  // September 2024
  {
    year: 2024,
    month: 8,
    day: 30,
    title: 'Design a Stack With Increment Operation',
    difficulty: 'Medium',
    description: 'Design a stack which supports the following operations.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/design-stack-increment',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Stack', 'Design', 'Array'],
  },
  {
    year: 2024,
    month: 8,
    day: 29,
    title: 'All O`one Data Structure',
    difficulty: 'Hard',
    description:
      "Design a data structure to store the strings' count with the ability to return the strings with minimum and maximum counts.",
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/all-oone-data-structure',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Hash Table', 'Linked List', 'Design'],
  },
  {
    year: 2024,
    month: 8,
    day: 28,
    title: 'My Calendar II',
    difficulty: 'Medium',
    description:
      'You are implementing a program to use as your calendar. We can add a new event if adding the event will not cause a triple booking.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/my-calendar-ii',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Design', 'Segment Tree', 'Ordered Set'],
  },

  // December 2024
  {
    year: 2024,
    month: 11,
    day: 1,
    title: 'Check If N and Its Double Exist',
    difficulty: 'Easy',
    description:
      'Given an array arr of integers, check if there exists two integers N and M such that N is the double of M.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/check-if-n-and-double-exist',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'Hash Table', 'Two Pointers'],
  },
  {
    year: 2024,
    month: 11,
    day: 2,
    title: 'Check If a Word Occurs As a Prefix',
    difficulty: 'Easy',
    description:
      'Given a sentence that consists of some words separated by a single space, and a searchWord.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/check-word-prefix',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['String', 'String Matching'],
  },
  {
    year: 2024,
    month: 11,
    day: 3,
    title: 'Adding Spaces to a String',
    difficulty: 'Medium',
    description:
      'You are given a 0-indexed string s and a 0-indexed integer array spaces that describes the indices in the original string.',
    youtubeLink: 'https://youtube.com/codestorywithmik',
    leetcodeLink: 'https://leetcode.com/problems/adding-spaces-to-string',
    githubLink: 'https://github.com/codestorywithmik',
    tags: ['Array', 'String', 'Simulation'],
  },
];

const MOTIVATIONAL_QUOTES = [
  'Consistency is the key to mastery. One problem a day keeps the interview anxiety away!',
  'The expert in anything was once a beginner. Keep solving, keep growing!',
  'Success is the sum of small efforts repeated day in and day out.',
  "Don't watch the clock; do what it does. Keep going!",
  'The only way to do great work is to love what you do. Happy coding!',
];

const RECENT_UPDATES: RecentUpdate[] = [
  {
    id: 1,
    title: 'New Dynamic Programming Course Released',
    type: 'Update',
    date: 'Nov 10',
    link: 'https://youtube.com/codestorywithmik',
  },
  {
    id: 2,
    title: 'Graph Algorithms Masterclass',
    type: 'Video',
    date: 'Nov 8',
    link: 'https://youtube.com/codestorywithmik',
  },
  {
    id: 3,
    title: 'Top 10 Interview Tips',
    type: 'Article',
    date: 'Nov 5',
    link: 'https://youtube.com/codestorywithmik',
  },
  {
    id: 4,
    title: 'Binary Search Deep Dive',
    type: 'Video',
    date: 'Nov 2',
    link: 'https://youtube.com/codestorywithmik',
  },
  {
    id: 5,
    title: 'System Design Fundamentals',
    type: 'Article',
    date: 'Oct 28',
    link: 'https://youtube.com/codestorywithmik',
  },
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function HomePage() {
  const { theme } = useTheme();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts?limit=100');
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get posts for the current viewing month
  const monthPosts = useMemo(() => {
    return posts.filter(post => {
      const postDate = new Date(post.postDate);
      return postDate.getFullYear() === currentYear && postDate.getMonth() === currentMonth;
    }).sort((a, b) => {
      const dateA = new Date(a.postDate);
      const dateB = new Date(b.postDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [posts, currentYear, currentMonth]);

  // Get the selected post
  const selectedPost = useMemo(() => {
    const selectedDateStr = format(
      new Date(selectedDate.year, selectedDate.month, selectedDate.day),
      'yyyy-MM-dd'
    );

    return (
      posts.find(
        p => format(new Date(p.postDate), 'yyyy-MM-dd') === selectedDateStr
      ) ||
      posts.find(
        p => format(new Date(p.postDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      ) ||
      posts[0]
    );
  }, [posts, selectedDate, today]);

  // Get recent posts list
  const recentPosts = useMemo(() => {
    return monthPosts.slice(0, 4);
  }, [monthPosts]);

  const updateCalendarDate = useCallback((date: Date) => {
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
    setSelectedDate({
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
    });
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    updateCalendarDate(new Date(currentYear, currentMonth, day));
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.day &&
      currentMonth === selectedDate.month &&
      currentYear === selectedDate.year
    );
  };

  const hasPost = (day: number) => {
    return monthPosts.some(post => {
      const postDate = new Date(post.postDate);
      return postDate.getDate() === day;
    });
  };

  const difficultyColors = {
    Easy: 'text-green-400 border-green-400/30 bg-green-400/10',
    Medium: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    Hard: 'text-red-400 border-red-400/30 bg-red-400/10',
  };

  const updateTypeColors = {
    Article: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Video: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Update: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  // Get motivational quote from selected post or fallback
  const motivationalQuote = selectedPost?.motivationalQuote || 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMMM d, yyyy');
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d');
  };

  if (loading) {
    return (
      <div className="h-full overflow-auto flex items-center justify-center">
        <div className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          Loading posts...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pt-0">
        {/* Motivational Quote */}
        <Card
          className={`p-6 mt-4 sm:mt-6 rounded-2xl ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
              : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-12 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
            <p
              className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}
            >
              {motivationalQuote}
            </p>
          </div>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Today's Problem & Monthly List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selected Post Card */}
            {selectedPost ? (
              <Card
                className={`p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
                    : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p
                        className={`mb-2 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {formatDate(selectedPost.postDate)}
                      </p>
                      <div className="flex items-center gap-3 mb-3">
                        <h2
                          className={`${
                            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {new Date(selectedPost.postDate).toDateString() === today.toDateString()
                            ? "Today's LeetCode Problem"
                            : 'Selected LeetCode Problem'}
                        </h2>
                        <Badge
                          className={difficultyColors[selectedPost.difficulty]}
                        >
                          {selectedPost.difficulty}
                        </Badge>
                      </div>
                      <h3
                        className={`text-xl font-semibold ${
                          theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                        }`}
                      >
                        {selectedPost.problemName}
                      </h3>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  {selectedPost.thumbnailUrl && (
                    <div className="w-full rounded-lg overflow-hidden border border-slate-700">
                      <ImageWithFallback
                        src={selectedPost.thumbnailUrl}
                        alt={selectedPost.problemName}
                        className="w-full h-auto object-contain"
                        style={{ aspectRatio: '16/9' }}
                      />
                    </div>
                  )}

                  {/* Tags */}
                  {selectedPost.tags && selectedPost.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          className={`border ${
                            theme === 'dark'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    <a
                      href={selectedPost.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      Watch Solution
                    </a>
                    <a
                      href={selectedPost.leetcodeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors border border-slate-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      LeetCode
                    </a>
                    <a
                      href={selectedPost.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors border border-slate-700"
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </a>
                  </div>
                </div>
              </Card>
            ) : (
              <Card
                className={`p-6 rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
                    : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
                }`}
              >
                <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                  No post available for the selected date.
                </p>
              </Card>
            )}

            {/* Recent Posts List */}
            <Card
              className={`p-6 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
                  : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
              }`}
            >
              <h3
                className={`mb-4 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Recent Problems
              </h3>
              <div className="space-y-3">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post, index) => {
                    const postDate = new Date(post.postDate);
                    const isSelectedPost = selectedPost?.id === post.id;

                    return (
                      <button
                        key={post.id}
                    onClick={() => updateCalendarDate(postDate)}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all border ${
                          isSelectedPost
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : theme === 'dark'
                            ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded ${
                          theme === 'dark'
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {postDate.getDate()}
                      </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                theme === 'dark'
                                  ? 'text-slate-300'
                                  : 'text-slate-700'
                              }
                            >
                              {post.problemName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={
                                theme === 'dark'
                                  ? 'text-slate-500'
                                  : 'text-slate-600'
                              }
                            >
                              {formatShortDate(post.postDate)}
                            </span>
                            <span
                              className={`text-sm ${
                                post.difficulty === 'Easy'
                                  ? 'text-green-400'
                                  : post.difficulty === 'Medium'
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {post.difficulty}
                            </span>
                          </div>
                        </div>
                        <div
                          className={
                            theme === 'dark' ? 'text-slate-600' : 'text-slate-500'
                          }
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                    No recent posts available.
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Calendar & Recent Updates */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card
              className={`p-6 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
                  : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentMonth.toString()}
                      onValueChange={value => setCurrentMonth(parseInt(value))}
                    >
                      <SelectTrigger
                        className={`w-[120px] ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <SelectValue>{MONTHS[currentMonth]}</SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-white border-slate-300'
                        }
                      >
                        {MONTHS.map((month, index) => (
                          <SelectItem
                            key={index}
                            value={index.toString()}
                            className={
                              theme === 'dark'
                                ? 'text-slate-100 focus:bg-slate-700'
                                : 'text-slate-900 focus:bg-slate-100'
                            }
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={currentYear.toString()}
                      onValueChange={value => setCurrentYear(parseInt(value))}
                    >
                      <SelectTrigger
                        className={`w-[100px] ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        <SelectValue>{currentYear}</SelectValue>
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-white border-slate-300'
                        }
                      >
                        {Array.from({ length: 100 }, (_, i) => {
                          const year = today.getFullYear() - 50 + i;
                          return year;
                        })
                          .reverse()
                          .map(year => (
                            <SelectItem
                              key={year}
                              value={year.toString()}
                              className={
                                theme === 'dark'
                                  ? 'text-slate-100 focus:bg-slate-700'
                                  : 'text-slate-900 focus:bg-slate-100'
                              }
                            >
                              {year}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className={`p-2 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div
                      key={day}
                      className={`text-center p-1 text-sm ${
                        theme === 'dark' ? 'text-slate-500' : 'text-slate-600'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Calendar days */}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    day => {
                      const todayCheck = isToday(day);
                      const selectedCheck = isSelected(day);
                      const postCheck = hasPost(day);

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateClick(day)}
                          className={`aspect-square flex items-center justify-center rounded-lg transition-all text-sm ${
                            todayCheck
                              ? `bg-purple-500 text-white ring-2 ring-purple-400 ring-offset-2 ${
                                  theme === 'dark'
                                    ? 'ring-offset-[#050505]'
                                    : 'ring-offset-white'
                                }`
                              : selectedCheck
                              ? 'bg-purple-500/30 border border-purple-500'
                              : postCheck
                              ? theme === 'dark'
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : theme === 'dark'
                              ? 'text-slate-600 hover:bg-slate-900'
                              : 'text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </Card>

            {/* Recent Updates */}
            <Card
              className={`p-6 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/30'
                  : 'bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200'
              }`}
            >
              <h3
                className={`mb-4 ${
                  theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Recent Updates
              </h3>
              <div className="space-y-3">
                {RECENT_UPDATES.map(update => (
                  <a
                    key={update.id}
                    href={update.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-4 rounded-lg border transition-colors cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-900/50 border-slate-800 hover:border-purple-500/50'
                        : 'bg-white border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={`mb-1 ${
                            theme === 'dark'
                              ? 'text-slate-300'
                              : 'text-slate-700'
                          }`}
                        >
                          {update.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${
                              updateTypeColors[update.type]
                            } text-xs`}
                          >
                            {update.type}
                          </Badge>
                          <span
                            className={`text-xs ${
                              theme === 'dark'
                                ? 'text-slate-500'
                                : 'text-slate-600'
                            }`}
                          >
                            {update.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
