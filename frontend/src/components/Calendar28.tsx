'use client';

import * as React from 'react';

import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { Calendar } from '@/components/ui/calendar';

import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';

import { useTheme } from '@/contexts/ThemeContext';

function toLocalDate(value?: string | Date | null): Date {
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
}

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

interface Calendar28Props {
  date?: Date;
  onDateChange?: (date: Date) => void;
  posts?: Array<{ postDate: string | Date }>;
}

export function Calendar28({
  date: initialDate,
  onDateChange,
  posts = [],
}: Calendar28Props) {
  const { theme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const today = new Date();
  const [date, setDate] = React.useState<Date | undefined>(
    initialDate || today
  );
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(formatDate(date));
  const currentYear = month ? month.getFullYear() : today.getFullYear();
  const currentMonth = month ? month.getMonth() : today.getMonth();

  // Get posts for the current viewing month
  const monthPosts = React.useMemo(() => {
    return posts.filter(post => {
      const postDate = toLocalDate(post.postDate);
      return (
        postDate.getFullYear() === currentYear &&
        postDate.getMonth() === currentMonth
      );
    });
  }, [posts, currentYear, currentMonth]);

  // Check if a day has a post
  const hasPost = React.useCallback(
    (day: number) => {
      return monthPosts.some(post => {
        const postDate = toLocalDate(post.postDate);
        return postDate.getDate() === day;
      });
    },
    [monthPosts]
  );

  // Check if a date is today
  const isToday = React.useCallback(
    (day: number) => {
      return (
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear()
      );
    },
    [today, currentMonth, currentYear]
  );

  React.useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
      setMonth(initialDate);
      setValue(formatDate(initialDate));
    }
  }, [initialDate]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setValue(formatDate(selectedDate));
      setMonth(selectedDate);
      setOpen(false);
      if (onDateChange) {
        onDateChange(selectedDate);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setValue(inputValue);
    const parsedDate = new Date(inputValue);
    if (isValidDate(parsedDate)) {
      setDate(parsedDate);
      setMonth(parsedDate);
      if (onDateChange) {
        onDateChange(parsedDate);
      }
    }
  };

  // Prevent body scroll when calendar is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle Escape key to close calendar
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <>
      {/* Backdrop blur overlay when calendar is open */}
      {open && (
        <div
          className="fixed inset-0 z-[45] transition-all duration-300 ease-out"
          style={{
            backgroundColor:
              theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(2.75px)',
            WebkitBackdropFilter: 'blur(2.75px)',
          }}
          onClick={() => setOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          aria-hidden="true"
        />
      )}

      {/* Custom positioned calendar container when open */}
      {open && (
        <div
          className="fixed top-1/2 left-1/2 z-[50] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95"
          onClick={e => e.stopPropagation()}
          data-calendar-container
        >
          <div
            className={`rounded-lg overflow-hidden p-0 shadow-2xl border ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 shadow-xl text-slate-900'
            }`}
          >
            <div className={theme === 'dark' ? 'p-3' : 'p-3'}>
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                month={month}
                onMonthChange={setMonth}
                onSelect={handleDateSelect}
                className={theme === 'dark' ? 'dark' : ''}
                classNames={{
                  months: 'flex flex-col sm:flex-row gap-2',
                  month: 'flex flex-col gap-4',
                  caption:
                    'flex justify-center pt-1 relative items-center w-full',
                  caption_label: `text-sm font-medium ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`,
                  caption_dropdowns: 'flex gap-2 justify-center',
                  dropdown: `px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`,
                  dropdown_month: `px-3 py-1.5 rounded-md text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`,
                  dropdown_year: `px-3 py-1.5 rounded-md text-sm border ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-100 border-slate-300 text-slate-900'
                  }`,
                  dropdown_icon: 'ml-1 h-4 w-4 opacity-50',
                  nav: 'flex items-center gap-1',
                  nav_button: `size-7 p-0 rounded-md ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300'
                  }`,
                  nav_button_previous: `absolute left-1 size-7 p-0 rounded-md ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300'
                  }`,
                  nav_button_next: `absolute right-1 size-7 p-0 rounded-md ${
                    theme === 'dark'
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300'
                  }`,
                  table: 'w-full border-collapse space-x-1',
                  head_row: 'flex',
                  head_cell: `rounded-md w-8 font-normal text-[0.8rem] ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`,
                  row: 'flex w-full mt-2',
                  day: `aspect-square flex items-center justify-center rounded-lg transition-all text-sm size-8 p-0 font-normal ${
                    theme === 'dark'
                      ? 'text-slate-600 hover:bg-slate-900'
                      : 'text-slate-500 hover:bg-slate-200'
                  }`,
                  day_selected: `bg-purple-500/30 border border-purple-500 ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`,
                  day_today: `bg-purple-500 text-white ring-2 ring-purple-400 ring-offset-2 ${
                    theme === 'dark'
                      ? 'ring-offset-slate-900'
                      : 'ring-offset-white'
                  }`,
                  day_outside: `${
                    theme === 'dark' ? 'text-slate-600' : 'text-slate-400'
                  }`,
                }}
                modifiers={{
                  hasPost: day => {
                    if (!day) return false;
                    const dayNum = day.getDate();
                    const isCurrentMonth =
                      day.getMonth() === currentMonth &&
                      day.getFullYear() === currentYear;
                    return isCurrentMonth && hasPost(dayNum);
                  },
                }}
                modifiersClassNames={{
                  hasPost:
                    theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300',
                }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 relative z-0">
        <Label
          htmlFor="date"
          className={`px-1 ${
            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          Select Date
        </Label>
        <div className="relative flex gap-2">
          <Input
            id="date"
            value={value}
            placeholder="June 01, 2025"
            className={`pr-10 ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
            onChange={handleInputChange}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
              }
            }}
          />
          <Button
            id="date-picker"
            variant="ghost"
            className={`absolute top-1/2 right-2 size-6 -translate-y-1/2 ${
              theme === 'dark'
                ? 'text-slate-300 hover:text-slate-100 hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            onClick={() => setOpen(true)}
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </div>
      </div>
    </>
  );
}
