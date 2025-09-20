// navigation/types.ts
import { Subject, SubTopic, YearRange, SessionData, Question } from '../types';

interface SubjectScreenProps {
  subject: Subject;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  AuthOptions: undefined;
  MobileAuth: undefined;
  OTPVerification: {
    mobile: string;
    isLogin: boolean;
    name?: string;
  };
  UserOnboarding: {
    userId: string;
    mobile: string;
  };
};
// navigation/types.ts
export type MainStackParamList = {
  HomeTabs: undefined;
  SubjectScreen: { 
    subject: Subject;
  };
  QuestionScreen: { 
    subject?: Subject;
    subTopic?: SubTopic;
    questionParams?: {
      status?: 'due' | 'today' | 'all' | 'unattempted';
      subject_id?: number | null;
      topic_id?: number | null;
      exam_id?: number | null;
      year?: number | null;
    };
  };
  SessionSummary: undefined;
  Profile: undefined;
};

// Add your other types here...


export type HomeTabParamList = {
  Home: undefined;
  Search: undefined;
  History: undefined;
  Courses: undefined;
};
