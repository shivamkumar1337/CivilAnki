import { User, Subject, YearRange, Question } from '../types';

export const mockUser: User = {
  id: "1",
  name: "Priya Sharma",
  mobile: "+91 98765 43210",
  email: "priya.sharma@example.com",
  streak: 12,
  avatar: "👩‍🎓",
  isAuthenticated: false,
};

export const mockSubjects: Subject[] = [
  {
    id: 'polity',
    name: 'Polity',
    icon: '🏛️',
    progress: 75,
    totalQuestions: 450,
    masteredCount: 338,
    pendingToday: 12,
    subtopics: [
      { id: 'constitution', name: 'Constitution', progress: 80, pendingCount: 5 },
      { id: 'parliament', name: 'Parliament', progress: 70, pendingCount: 7 },
      { id: 'judiciary', name: 'Judiciary', progress: 85, pendingCount: 0 }
    ]
  },
  {
    id: 'history',
    name: 'History',
    icon: '📜',
    progress: 60,
    totalQuestions: 380,
    masteredCount: 228,
    pendingToday: 18,
    subtopics: [
      { id: 'ancient', name: 'Ancient India', progress: 65, pendingCount: 8 },
      { id: 'medieval', name: 'Medieval India', progress: 55, pendingCount: 10 },
      { id: 'modern', name: 'Modern India', progress: 60, pendingCount: 0 }
    ]
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: '🗺️',
    progress: 45,
    totalQuestions: 320,
    masteredCount: 144,
    pendingToday: 25,
    subtopics: [
      { id: 'physical', name: 'Physical Geography', progress: 50, pendingCount: 15 },
      { id: 'indian', name: 'Indian Geography', progress: 40, pendingCount: 10 },
      { id: 'world', name: 'World Geography', progress: 45, pendingCount: 0 }
    ]
  },
  {
    id: 'economy',
    name: 'Economy',
    icon: '💰',
    progress: 55,
    totalQuestions: 290,
    masteredCount: 160,
    pendingToday: 15,
    subtopics: [
      { id: 'basics', name: 'Economic Basics', progress: 60, pendingCount: 8 },
      { id: 'indian-economy', name: 'Indian Economy', progress: 50, pendingCount: 7 },
      { id: 'world-economy', name: 'World Economy', progress: 55, pendingCount: 0 }
    ]
  }
];

export const mockYearRanges: YearRange[] = [
  { id: 'old', label: '1980-2010', range: '1980-2010', questionCount: 120 },
  { id: 'recent', label: '2010-2020', range: '2010-2020', questionCount: 200 },
  { id: 'latest', label: '2020-2025', range: '2020-2025', questionCount: 45 }
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'Which Article of the Indian Constitution deals with the Right to Equality?',
    options: ['Article 12', 'Article 14', 'Article 16', 'Article 19'],
    correctAnswer: 1,
    year: 2019,
    subject: 'polity',
    subtopic: 'constitution'
  },
  {
    id: '2', 
    text: 'The Quit India Movement was launched in which year?',
    options: ['1940', '1941', '1942', '1943'],
    correctAnswer: 2,
    year: 2018,
    subject: 'history',
    subtopic: 'modern'
  },
  {
    id: '3',
    text: 'Which river is known as the "Sorrow of Bengal"?',
    options: ['Ganges', 'Brahmaputra', 'Damodar', 'Hooghly'],
    correctAnswer: 2,
    year: 2020,
    subject: 'geography',
    subtopic: 'indian'
  }
];