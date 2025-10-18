// navigation/types.ts
import { Subject, SubTopic, YearRange, SessionData, Question } from '../types';

// interface SubjectScreenProps {
//   subject: Subject;
// }

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
      status?: string;
      question_ids?: number[];
      limit?: number;
      subject_id?: number;
      topic_id?: number;
    };
  };
  SessionSummary: {
    sessionData: SessionData;
  };
  Profile: undefined;
  SubTopics: {
    subject: Subject;
  };
  TopicOptions: {
    subject: Subject;
    subTopic: SubTopic;
  };
};

// Add your other types here...


export type HomeTabParamList = {
  Home: undefined;
  Search: undefined;
  History: undefined;
  Courses: undefined;
};
