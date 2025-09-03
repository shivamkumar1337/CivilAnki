import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { Home } from "./src/components/Home";
import { SubjectSelection } from "./src/components/SubjectSelection";
import { SubTopicSelection } from "./src/components/SubTopicSelection";
import { QuestionCard } from "./src/components/QuestionCard";
import { SessionSummary } from "./src/components/SessionSummary";
import { Settings } from "./src/components/Settings";
import { QuestionHistory } from "./src/components/QuestionHistory";
import { Onboarding } from "./src/components/Onboarding";
import { Welcome } from "./src/components/Welcome";
import { AuthOptions } from "./src/components/AuthOptions";
import { MobileAuth } from "./src/components/MobileAuth";
import { OTPVerification } from "./src/components/OTPVerification";
import { Colors } from "./src/constants/Colors";

export type Screen =
  | "welcome"
  | "auth-options"
  | "mobile-auth"
  | "otp-verification"
  | "onboarding"
  | "home"
  | "subjects"
  | "subtopics"
  | "practice"
  | "summary"
  | "settings"
  | "history";

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  streak: number;
  avatar: string;
  isAuthenticated: boolean;
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
  mode: "timed" | "untimed";
  questions: Question[];
  currentQuestionIndex: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    reviewInterval?: string;
  }[];
}

const mockUser: User = {
  id: "1",
  name: "Priya Sharma",
  mobile: "+91 98765 43210",
  email: "priya.sharma@example.com",
  streak: 12,
  avatar: "👩‍🎓",
  isAuthenticated: false,
};

const mockSubjects: Subject[] = [
  {
    id: "polity",
    name: "Polity",
    icon: "🏛️",
    progress: 75,
    totalQuestions: 450,
    masteredCount: 338,
    pendingToday: 12,
    subtopics: [
      {
        id: "constitution",
        name: "Constitution",
        progress: 80,
        pendingCount: 5,
      },
      {
        id: "parliament",
        name: "Parliament",
        progress: 70,
        pendingCount: 7,
      },
      {
        id: "judiciary",
        name: "Judiciary",
        progress: 85,
        pendingCount: 0,
      },
    ],
  },
  {
    id: "history",
    name: "History",
    icon: "📜",
    progress: 60,
    totalQuestions: 380,
    masteredCount: 228,
    pendingToday: 18,
    subtopics: [
      {
        id: "ancient",
        name: "Ancient India",
        progress: 65,
        pendingCount: 8,
      },
      {
        id: "medieval",
        name: "Medieval India",
        progress: 55,
        pendingCount: 10,
      },
      {
        id: "modern",
        name: "Modern India",
        progress: 60,
        pendingCount: 0,
      },
    ],
  },
  {
    id: "geography",
    name: "Geography",
    icon: "🗺️",
    progress: 45,
    totalQuestions: 320,
    masteredCount: 144,
    pendingToday: 25,
    subtopics: [
      {
        id: "physical",
        name: "Physical Geography",
        progress: 50,
        pendingCount: 15,
      },
      {
        id: "indian",
        name: "Indian Geography",
        progress: 40,
        pendingCount: 10,
      },
      {
        id: "world",
        name: "World Geography",
        progress: 45,
        pendingCount: 0,
      },
    ],
  },
  {
    id: "economy",
    name: "Economy",
    icon: "💰",
    progress: 55,
    totalQuestions: 290,
    masteredCount: 160,
    pendingToday: 15,
    subtopics: [
      {
        id: "basics",
        name: "Economic Basics",
        progress: 60,
        pendingCount: 8,
      },
      {
        id: "indian-economy",
        name: "Indian Economy",
        progress: 50,
        pendingCount: 7,
      },
      {
        id: "world-economy",
        name: "World Economy",
        progress: 55,
        pendingCount: 0,
      },
    ],
  },
];

const mockYearRanges: YearRange[] = [
  {
    id: "old",
    label: "1980-2010",
    range: "1980-2010",
    questionCount: 120,
  },
  {
    id: "recent",
    label: "2010-2020",
    range: "2010-2020",
    questionCount: 200,
  },
  {
    id: "latest",
    label: "2020-2025",
    range: "2020-2025",
    questionCount: 45,
  },
];

const mockQuestions: Question[] = [
  {
    id: "1",
    text: "Which Article of the Indian Constitution deals with the Right to Equality?",
    options: [
      "Article 12",
      "Article 14",
      "Article 16",
      "Article 19",
    ],
    correctAnswer: 1,
    year: 2019,
    subject: "polity",
    subtopic: "constitution",
  },
  {
    id: "2",
    text: "The Quit India Movement was launched in which year?",
    options: ["1940", "1941", "1942", "1943"],
    correctAnswer: 2,
    year: 2018,
    subject: "history",
    subtopic: "modern",
  },
  {
    id: "3",
    text: 'Which river is known as the "Sorrow of Bengal"?',
    options: ["Ganges", "Brahmaputra", "Damodar", "Hooghly"],
    correctAnswer: 2,
    year: 2020,
    subject: "geography",
    subtopic: "indian",
  },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [user, setUser] = useState<User>(mockUser);
  const [authState, setAuthState] = useState<{
    mobile: string;
    isLogin: boolean;
    name?: string;
  }>({ mobile: "", isLogin: true });
  const [sessionData, setSessionData] = useState<SessionData>({
    selectedSubject: null,
    selectedSubtopics: [],
    selectedYearRanges: [],
    mode: "untimed",
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
  });

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const handleMobileAuth = (
    mobile: string,
    isLogin: boolean,
    name?: string,
  ) => {
    setAuthState({ mobile, isLogin, name });
    navigateTo("otp-verification");
  };

  const handleOTPVerification = (userData: any) => {
    setUser((prev) => ({
      ...prev,
      ...userData,
      isAuthenticated: true,
    }));
    navigateTo("onboarding");
  };

  const handleSocialLogin = (
    provider: "google" | "apple",
    userData: any,
  ) => {
    setUser((prev) => ({
      ...prev,
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar:
        userData.avatar ||
        (provider === "google" ? "👤" : "🍎"),
      isAuthenticated: true,
      streak: 0, // New user from social login
    }));
    navigateTo("onboarding");
  };

  const handleResendOTP = async () => {
    // This will be handled by the OTPVerification component
    console.log("Resending OTP to", authState.mobile);
  };

  const startSession = (
    subject: Subject,
    subtopics: SubTopic[],
    yearRanges: YearRange[],
    mode: "timed" | "untimed",
  ) => {
    // Filter questions based on selection
    const filteredQuestions = mockQuestions
      .filter(
        (q) =>
          q.subject === subject.id &&
          subtopics.some((st) => st.id === q.subtopic),
      )
      .slice(0, 30); // Limit to 30 questions

    setSessionData({
      selectedSubject: subject,
      selectedSubtopics: subtopics,
      selectedYearRanges: yearRanges,
      mode,
      questions: filteredQuestions,
      currentQuestionIndex: 0,
      answers: [],
    });

    setCurrentScreen("practice");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "welcome":
        return (
          <Welcome
            onContinue={() => navigateTo("auth-options")}
          />
        );
      case "auth-options":
        return (
          <AuthOptions
            onMobileAuth={() => navigateTo("mobile-auth")}
            onSocialLogin={handleSocialLogin}
          />
        );
      case "mobile-auth":
        return (
          <MobileAuth
            onSubmit={handleMobileAuth}
            onBack={() => navigateTo("auth-options")}
          />
        );
      case "otp-verification":
        return (
          <OTPVerification
            mobile={authState.mobile}
            isLogin={authState.isLogin}
            userName={authState.name}
            onVerify={handleOTPVerification}
            onBack={() => navigateTo("mobile-auth")}
            onResendOTP={handleResendOTP}
          />
        );
      case "onboarding":
        return (
          <Onboarding onComplete={() => navigateTo("home")} />
        );
      case "home":
        return (
          <Home
            user={user}
            subjects={mockSubjects}
            onNavigate={navigateTo}
          />
        );
      case "subjects":
        return (
          <SubjectSelection
            subjects={mockSubjects}
            onSubjectSelect={(subject) => {
              setSessionData((prev) => ({
                ...prev,
                selectedSubject: subject,
              }));
              navigateTo("subtopics");
            }}
            onBack={() => navigateTo("home")}
          />
        );
      case "subtopics":
        return (
          <SubTopicSelection
            subject={sessionData.selectedSubject!}
            yearRanges={mockYearRanges}
            onStartSession={startSession}
            onBack={() => navigateTo("subjects")}
          />
        );
      case "practice":
        return (
          <QuestionCard
            sessionData={sessionData}
            onUpdateSession={setSessionData}
            onSessionComplete={() => navigateTo("summary")}
          />
        );
      case "summary":
        return (
          <SessionSummary
            sessionData={sessionData}
            onContinue={() => navigateTo("home")}
            onReviewMissed={() => {
              // Filter missed questions and restart session
              const missedQuestions = sessionData.answers
                .filter((a) => !a.isCorrect)
                .map(
                  (a) =>
                    sessionData.questions.find(
                      (q) => q.id === a.questionId,
                    )!,
                )
                .filter(Boolean);

              setSessionData((prev) => ({
                ...prev,
                questions: missedQuestions,
                currentQuestionIndex: 0,
                answers: [],
              }));
              navigateTo("practice");
            }}
          />
        );
      case "settings":
        return <Settings onBack={() => navigateTo("home")} />;
      case "history":
        return (
          <QuestionHistory onBack={() => navigateTo("home")} />
        );
      default:
        return (
          <Home
            user={user}
            subjects={mockSubjects}
            onNavigate={navigateTo}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appContainer}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  appContainer: {
    flex: 1,
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
    backgroundColor: Colors.light.background,
  },
});