export type Screen = 
 | "welcome"
  | "auth-options"
  | "mobile-auth"
  | "otp-verification"
  | 'onboarding'
  | 'home' 
  | 'subjects' 
  | 'subtopics' 
  | 'practice' 
  | 'summary' 
  | 'settings' 
  | 'history';

// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email?: string;
  phone: number;
  avatar_url?: string;
  goal: string;
  target_year: string;
  streak: number;
  status: number;
  created_at: string;
  isAuthenticated: boolean; // Keep this field
  session?: any; // Keep session data
  onboarding_completed?: boolean; // Add this for onboarding flow
}

// src/types/index.ts (or wherever your types are defined)
export interface Subject {
  id: number;
  name: string;
  icon: string;
  created_at: string;
  url: string;
  type: number; // Add this field: 1 = static, 2 = current
  // Optional fields for progress tracking
  progress?: number;
  masteredCount?: number;
  totalQuestions?: number;
  pendingToday?: number;
}

export interface UserProgress {
  overallProgress: number;
  totalMastered: number;
  totalQuestions: number;
  todayCompleted: number;
  todayTarget: number;
}

export interface DashboardStats {
  totalSubjects: number;
  activeSubjects: number;
  completedToday: number;
  streakDays: number;
  weeklyProgress: number[];
}

// types/index.ts (or wherever your types are defined)
export interface SubTopic {
  id: string;
  name: string;
  subject_id: number;
  created_at: string;
}


export interface YearRange {
  id: string;
  label: string;
  range: string;
  questionCount: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  // Remove these properties that don't exist in your mock data
  // year: number;
  // subject: string;
  // subtopic: string;
}


export interface SessionData {
  selectedSubject: Subject | null;
  selectedSubtopics: SubTopic[];
  selectedYearRanges: YearRange[];
  mode: 'timed' | 'untimed';
  questions: Question[];
  currentQuestionIndex: number;
  answers: { 
    questionId: string; 
    selectedAnswer: number; 
    isCorrect: boolean; 
    reviewInterval?: string 
  }[];
}
export interface AuthState {
  mobile: string;
  isLogin: boolean;
  name?: string;
}

export type ReviewInterval = '7min' | '21min' | '21days' | 'too-easy';