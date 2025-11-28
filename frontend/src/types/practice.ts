export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface PracticeProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  leetcodeUrl: string;
  solutionVideoUrl?: string | null;
  position: number;
}

export interface PracticeTopic {
  id: string;
  title: string;
  position: number;
  problems: PracticeProblem[];
}

export interface PracticeProblemPayload {
  title: string;
  difficulty: Difficulty;
  leetcodeUrl: string;
  solutionVideoUrl?: string;
}

export interface PracticeTopicPayload {
  title: string;
}


