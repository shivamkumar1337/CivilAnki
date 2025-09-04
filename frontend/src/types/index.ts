export type Screen = 
  | 'onboarding'
  | 'home' 
  | 'subjects' 
  | 'subtopics' 
  | 'practice' 
  | 'summary' 
  | 'settings' 
  | 'history';

export interface User {
  name: string;
  streak: number;
  avatar: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  progress: number;
  totalQuestions: number;
  masteredCount: number;
  pendingToday: number;
  subtopics: SubTopic[];
}

export interface SubTopic {
  id: string;
  name: string;
  progress: number;
  pendingCount: number;
}

export interface YearRange {
  id: string;
  label: string;
  range: string;
  questionCount: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  year: number;
  subject: string;
  subtopic: string;
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

export type ReviewInterval = '7min' | '21min' | '21days' | 'too-easy';