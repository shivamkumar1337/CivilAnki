import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Subject } from '../../types';
import { mockSubjects } from '../../constants/mockData';

interface SubjectsState {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubjectsState = {
  subjects: mockSubjects,
  isLoading: false,
  error: null,
};

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setSubjects: (state, action: PayloadAction<Subject[]>) => {
      state.subjects = action.payload;
    },
    updateSubjectProgress: (state, action: PayloadAction<{
      subjectId: string;
      progress: number;
      masteredCount: number;
    }>) => {
      const subject = state.subjects.find(s => s.id === action.payload.subjectId);
      if (subject) {
        subject.progress = action.payload.progress;
        subject.masteredCount = action.payload.masteredCount;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSubjects, updateSubjectProgress, setLoading, setError } = subjectsSlice.actions;
export default subjectsSlice.reducer;