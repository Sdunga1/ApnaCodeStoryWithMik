'use client';

import React, { useEffect, useId, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from './ui/radio-group';
import { Button } from './ui/button';
import type { PracticeProblemPayload, PracticeProblem } from '@/types/practice';

interface PracticeProblemFormProps {
  mode: 'create' | 'edit';
  initialValues?: PracticeProblem;
  onSubmit: (values: PracticeProblemPayload) => Promise<void>;
  onCancel: () => void;
}

export function PracticeProblemForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
}: PracticeProblemFormProps) {
  const fieldPrefix = useId();
  const inputClasses =
    'bg-slate-900/60 text-slate-100 border-slate-700 placeholder:text-slate-500 hover:border-purple-400/60 focus-visible:border-purple-400 focus-visible:ring-purple-500/40';
  const labelClasses = 'text-xs uppercase tracking-wide text-slate-400';
  const [values, setValues] = useState<PracticeProblemPayload>({
    title: initialValues?.title ?? '',
    leetcodeUrl: initialValues?.leetcodeUrl ?? '',
    difficulty: initialValues?.difficulty ?? 'Easy',
    solutionVideoUrl: initialValues?.solutionVideoUrl ?? '',
  });
  useEffect(() => {
    setValues({
      title: initialValues?.title ?? '',
      leetcodeUrl: initialValues?.leetcodeUrl ?? '',
      difficulty: initialValues?.difficulty ?? 'Easy',
      solutionVideoUrl: initialValues?.solutionVideoUrl ?? '',
    });
  }, [initialValues, mode]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof PracticeProblemPayload, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: values.title.trim(),
        leetcodeUrl: values.leetcodeUrl.trim(),
        difficulty: values.difficulty,
        solutionVideoUrl: values.solutionVideoUrl?.trim(),
      });
      setValues({
        title: '',
        leetcodeUrl: '',
        difficulty: 'Easy',
        solutionVideoUrl: '',
      });
    } catch (err: any) {
      setError(err?.message ?? 'Unable to save problem');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}-problem-title`} className={labelClasses}>
            Problem Name
          </Label>
          <Input
            id={`${fieldPrefix}-problem-title`}
            value={values.title}
            onChange={event => handleChange('title', event.target.value)}
            placeholder="e.g. Two Sum"
            required
            disabled={submitting}
            className={inputClasses}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}-problem-leetcode`} className={labelClasses}>
            LeetCode Link
          </Label>
          <Input
            id={`${fieldPrefix}-problem-leetcode`}
            value={values.leetcodeUrl}
            onChange={event => handleChange('leetcodeUrl', event.target.value)}
            placeholder="https://leetcode.com/problems/..."
            type="url"
            required
            disabled={submitting}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className={labelClasses}>Difficulty</Label>
          <RadioGroup
            className="flex flex-wrap gap-4"
            value={values.difficulty}
            onValueChange={value =>
              handleChange('difficulty', value as PracticeProblemPayload['difficulty'])
            }
          >
            {['Easy', 'Medium', 'Hard'].map(option => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${fieldPrefix}-${option}`}
                  disabled={submitting}
                  className="border-slate-600 text-purple-400 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white"
                />
                <Label htmlFor={`${fieldPrefix}-${option}`} className="text-slate-200">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label
            htmlFor={`${fieldPrefix}-problem-solution`}
            className={labelClasses}
          >
            Solution Video Link
          </Label>
          <Input
            id={`${fieldPrefix}-problem-solution`}
            value={values.solutionVideoUrl ?? ''}
            onChange={event => handleChange('solutionVideoUrl', event.target.value)}
            placeholder="https://youtube.com/..."
            type="url"
            disabled={submitting}
            className={inputClasses}
          />
        </div>
      </div>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : mode === 'create' ? 'Add Problem' : 'Save Changes'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


