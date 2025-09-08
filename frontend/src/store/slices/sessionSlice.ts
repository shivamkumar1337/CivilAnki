import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionData, Subject, SubTopic, YearRange, Question } from '../../types';

const initialState: SessionData = {
  selectedSubject: null,
  selectedSubtopics: [],
  selectedYearRanges: [],
  mode: 'untimed',
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSelectedSubject: (state, action: PayloadAction<Subject>) => {
      state.selectedSubject = action.payload;
    },
    setSelectedSubtopics: (state, action: PayloadAction<SubTopic[]>) => {
      state.selectedSubtopics = action.payload;
    },
    setSelectedYearRanges: (state, action: PayloadAction<YearRange[]>) => {
      state.selectedYearRanges = action.payload;
    },
    setMode: (state, action: PayloadAction<'timed' | 'untimed'>) => {
      state.mode = action.payload;
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
      state.currentQuestionIndex = 0;
      state.answers = [];
    },
    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    addAnswer: (state, action: PayloadAction<{
      questionId: string;
      selectedAnswer: number;
      isCorrect: boolean;
      reviewInterval?: string;
    }>) => {
      state.answers.push(action.payload);
    },
    resetSession: () => initialState,
    updateSession: (state, action: PayloadAction<Partial<SessionData>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setSelectedSubject,
  setSelectedSubtopics,
  setSelectedYearRanges,
  setMode,
  setQuestions,
  setCurrentQuestionIndex,
  addAnswer,
  resetSession,
  updateSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;