import React from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';

interface StatsCardProps {
  total: number;
  totalProblems: number;
  easy: number;
  easyTotal: number;
  medium: number;
  mediumTotal: number;
  hard: number;
  hardTotal: number;
}

export function StatsCard({
  total,
  totalProblems,
  easy,
  easyTotal,
  medium,
  mediumTotal,
  hard,
  hardTotal,
}: StatsCardProps) {
  const stats = [
    {
      label: 'Easy',
      completed: easy,
      total: easyTotal,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      label: 'Medium',
      completed: medium,
      total: mediumTotal,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      label: 'Hard',
      completed: hard,
      total: hardTotal,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#050505] to-[#1f0139] rounded-2xl border border-purple-900/30 p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <Trophy className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-slate-100">Your Progress</h2>
          <p className="text-slate-400">Keep up the great work!</p>
        </div>
      </div>

      {/* Total Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-violet-600/10 rounded-xl border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-slate-400">Total Solved</p>
              <p className="text-purple-400">
                {total} / {totalProblems} Problems
              </p>
            </div>
          </div>
          <div className="text-purple-400">
            {Math.round((total / totalProblems) * 100)}%
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className={`p-4 rounded-xl border ${stat.bgColor} ${stat.borderColor}`}
          >
            <p className="text-slate-400 mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className={`${stat.color}`}>{stat.completed}</span>
              <span className="text-slate-500">/ {stat.total}</span>
            </div>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color.replace('text-', 'bg-')}`}
                style={{ width: `${(stat.completed / stat.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
