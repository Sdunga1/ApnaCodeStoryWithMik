export interface PracticeProblem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  starred: boolean;
  hasVideo: boolean;
}

export interface PracticeSection {
  id: string;
  title: string;
  problems: PracticeProblem[];
}

export type Problem = PracticeProblem;
export type ProblemSection = PracticeSection;

