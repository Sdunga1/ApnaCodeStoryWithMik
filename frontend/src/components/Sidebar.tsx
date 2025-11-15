import { Home, BookOpen, List, GraduationCap, Trophy, X } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';

interface SidebarProps {
  completedProblems: number;
  totalProblems: number;
  onClose: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ completedProblems, totalProblems, onClose, activeView, onViewChange }: SidebarProps) {
  const progressPercentage = (completedProblems / totalProblems) * 100;

  const navItems = [
    { icon: Home, label: 'Home', value: 'home' },
    { icon: List, label: 'Practice Problems', value: 'practice' },
    { icon: BookOpen, label: 'Courses / Roadmaps', value: 'courses' },
    { icon: GraduationCap, label: 'Quizzes / Assessments', value: 'quizzes' },
    { icon: Trophy, label: 'Leaderboard', value: 'leaderboard' },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-[#050505] to-[#1f0139] border-r border-purple-900/30 flex flex-col">
      {/* Logo/Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-purple-400 mb-1">codestorywithmik</h2>
          <p className="text-slate-500">DSA Platform</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.value;
          return (
            <button
              key={item.label}
              onClick={() => {
                onViewChange(item.value);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Summary */}
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-700">
            <AvatarFallback className="bg-transparent text-white">
              MK
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-slate-100">Mik's Student</p>
            <p className="text-slate-500">@dsa_learner</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Progress</span>
            <span className="text-purple-400">
              {completedProblems}/{totalProblems}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-slate-800" />
        </div>
      </div>
    </div>
  );
}