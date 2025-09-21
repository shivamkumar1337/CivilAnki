// src/store/slices/subjectsSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Subject } from '../../types';
import { HomeService } from '@/src/services/HomeService';
interface SubjectsState {
  subjects: Subject[];
  staticSubjects: Subject[];
  currentSubjects: Subject[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SubjectsState = {
  subjects: [],
  staticSubjects: [],
  currentSubjects: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const data = await HomeService.getSubjects();
      console.log('Fetched subjects:', data);
      return data;
    } catch (error: any) {
      console.error('Error fetching subjects:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subjects');
    }
  }
);

const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setSubjects: (state, action: PayloadAction<Subject[]>) => {
      state.subjects = action.payload;
      // Automatically separate by type
      state.staticSubjects = action.payload.filter(subject => subject.type === 1);
      state.currentSubjects = action.payload.filter(subject => subject.type === 2);
    },
    updateSubjectProgress: (state, action: PayloadAction<{
      subjectId: string;
      progress: number;
      masteredCount: number;
    }>) => {
      const updateSubject = (subjects: Subject[]) => {
        const subject = subjects.find(s => s.id.toString() === action.payload.subjectId);
        if (subject) {
          subject.progress = action.payload.progress;
          subject.masteredCount = action.payload.masteredCount;
        }
      };
      
      updateSubject(state.subjects);
      updateSubject(state.staticSubjects);
      updateSubject(state.currentSubjects);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = action.payload;
        // Automatically separate subjects by type
        state.staticSubjects = action.payload.filter((subject: Subject) => subject.type === 1);
        state.currentSubjects = action.payload.filter((subject: Subject) => subject.type === 2);
        
        console.log('Static subjects:', state.staticSubjects);
        console.log('Current subjects:', state.currentSubjects);
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSubjects, updateSubjectProgress, setLoading, setError } = subjectsSlice.actions;
export default subjectsSlice.reducer;