// src/store/slices/progressSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { UserProgress, DashboardStats } from '../../types';
import { HomeService } from '@/src/services/HomeService';

interface ProgressState {
  userProgress: UserProgress | null;
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  userProgress: null,
  dashboardStats: null,
  isLoading: false,
  error: null,
};

export const fetchUserProgress = createAsyncThunk(
  'progress/fetchUserProgress',
  async (_, { rejectWithValue }) => {
    try {
      const data = await HomeService.getUserProgress();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user progress');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'progress/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await HomeService.getDashboardStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchTodayProgress = createAsyncThunk(
  'progress/fetchTodayProgress',
  async (_, { rejectWithValue }) => {
    try {
      const data = await HomeService.getTodayProgress();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today progress');
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    updateTodayProgress: (state, action: PayloadAction<{
      completed: number;
      target: number;
    }>) => {
      if (state.userProgress) {
        state.userProgress.todayCompleted = action.payload.completed;
        state.userProgress.todayTarget = action.payload.target;
      }
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
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProgress = action.payload;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      .addCase(fetchTodayProgress.fulfilled, (state, action) => {
        if (state.userProgress) {
          state.userProgress = { ...state.userProgress, ...action.payload };
        }
      });
  },
});

export const { updateTodayProgress, setLoading, setError } = progressSlice.actions;
export default progressSlice.reducer;