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


export interface YearRange {
  id: string;
  label: string;
  range: string;
  questionCount: number;
}


export interface AuthState {
  mobile: string;
  isLogin: boolean;
  name?: string;
}

export interface SubTopic {
  id: number;
  name: string;
  subject_id: number;
  created_at: string;
  progress?: number;
  totalQuestions?: number;
  dueCount?: number;
}

export interface Question {
  id: string;
  question_id: number;
  question: string;
  question_text: string;
  options: string[] | { "1": string; "2": string; "3": string; "4": string; };
  correctAnswer: number;
  correct_option: number;
  explanation?: string;
  year: number;
  subject_id: number;
  topic_id: number;
  exam_id?: number;
  image_url?: string;
  // Spaced repetition fields
  card_type?: 'new' | 'learning' | 'review' | 'relearning';
  ease_factor?: number;
  interval_days?: number;
  repetitions?: number;
  next_review_at?: string;
  attempts?: number;
  lapses?: number;
  topic_name?: string;
}

export interface ProgressStats {
  new: number;
  learning: number;
  review: number;
  due: number;
  today: number;
  total: number;
}

export interface SpacedRepetitionSettings {
  learning_steps: number[];
  graduating_interval: number;
  easy_interval: number;
  starting_ease: number;
  easy_bonus: number;
  interval_modifier: number;
  hard_interval: number;
  new_interval: number;
  minimum_interval: number;
  leech_threshold: number;
}

export interface SessionData {
  selectedSubject: Subject;
  selectedSubtopics: SubTopic[];
  mode: 'timed' | 'untimed';
  answers: {
    questionId: number;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
    quality?: number;
    reviewInterval?: string;
  }[];
}

export type ReviewInterval = '7min' | '21min' | '21days' | 'too-easy';