import { Subject, SubTopic, YearRange, SessionData } from '../types';

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

  // Home: undefined;
  // Onboarding: undefined;
};

export type MainStackParamList = {
  Profile: undefined;
  HomeTabs: undefined;
  Subjects: undefined;
  SubTopics: {
    subject: Subject;
  };
  Practice: {
    sessionData: SessionData;
  };
  Summary: {
    sessionData: SessionData;
  };
};

export type HomeTabParamList = {
  Home: undefined;
  Search: undefined;
  History: undefined;
  Courses: undefined;
};