export type SubjectType = 'math' | 'language';
export type ExerciseFormat = 'multiple_choice' | 'drag_and_drop' | 'fill_in_blank';

export interface ParentUser {
  uid: string;
  email: string;
  displayName: string;
  pin: string; // PIN din 4-6 cifre pentru acces în panou
  createdAt: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string; // emoji sau cheie avatar (ex: 🚀, 🦄, 🦊, etc.)
  pin: string;    // PIN 4 cifre
  totalStars: number;
  unlockedBadges: string[];
  themeColor: string;
}

export interface ExerciseData {
  options?: string[];
  correctAnswer?: string | number;
  items?: string[];
  slots?: string[];
  targetOrder?: string[];
  visualItem?: string;
  visualCount?: number;
  hint?: string;
}

export interface Exercise {
  id: string;
  title: string;
  subject: SubjectType;
  topic: string;
  difficulty: 1 | 2 | 3;
  format: ExerciseFormat;
  prompt: string;
  data: ExerciseData;
  stars: number;
  isTemplate?: boolean;
}

export interface Assignment {
  id: string;
  childId: string;
  title: string;
  subject: SubjectType;
  exerciseIds: string[];
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface AttemptHistory {
  id: string;
  childId: string;
  exerciseId: string;
  exerciseTitle: string;
  subject: SubjectType;
  isCorrect: boolean;
  attemptsCount: number;
  durationSeconds: number;
  starsEarned: number;
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'math' | 'language' | 'streak' | 'general';
  requiredStars: number;
}
