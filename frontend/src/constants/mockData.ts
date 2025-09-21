// import { images } from '../../assets/images';
import { Question, Subject, User, YearRange } from '../types';

export const mockUser: User = {
  id: "1",
  name: "Priya Sharma",
  mobile: "+91 98765 43210",
  email: "priya.sharma@example.com",
  streak: 12,
  avatar: "👩‍🎓",
  isAuthenticated: false,
};

export const mockSubjects = [
  {
    id: 'economy',
    name: 'Economy',
    // imageUrl: images.economy,
    progress: 23,
    totalQuestions: 540,
    completedQuestions: 124,
  },
  {
    id: 'geography',
    name: 'Geography',
    // imageUrl: images.geography,
    progress: 78,
    totalQuestions: 650,
    completedQuestions: 507,
  },
  {
    id: 'history',
    name: 'History',
    // imageUrl: images.history,
    progress: 42,
    totalQuestions: 720,
    completedQuestions: 302,
  },
  {
    id: 'polity',
    name: 'Polity',
    // imageUrl: images.polity,
    progress: 65,
    totalQuestions: 850,
    completedQuestions: 553,
  },
  {
    id: 'environment',
    name: 'Environment',
    // imageUrl: images.environment,
    progress: 34,
    totalQuestions: 380,
    completedQuestions: 129,
  },
 
  {
    id: 'art-culture',
    name: 'Art&Culture',
    // imageUrl: images.artCulture,
    progress: 47,
    totalQuestions: 420,
    completedQuestions: 197,
  },
  
] as unknown as Subject[];

export const mockcurrentSubjects = [
  {
    id: 'mapping',
    name: 'Mapping',
    // imageUrl: images.mapping,
    progress: 89,
    totalQuestions: 320,
    completedQuestions: 285,
  },
  {
    id: 'govt-schemes',
    name: 'GovernmentSchemes',
    // imageUrl: images.governmentSchemes,
    progress: 72,
    totalQuestions: 290,
    completedQuestions: 209,
  },
  {
    id: 'current-affairs',
    name: 'CurrentAffiars',
    // imageUrl: images.currentAffairs,
    progress: 45,
    totalQuestions: 450,
    completedQuestions: 203,
  },
   {
    id: 'science',
    name: 'Science&Tech',
    // imageUrl: images.scienceTech,
    progress: 55,
    totalQuestions: 480,
    completedQuestions: 264,
  },
] as unknown as Subject[];

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