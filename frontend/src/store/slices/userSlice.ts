// src/store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id?: string;
  name?: string;
  email?: string;
  phone?: number;
  avatar_url?: string;
  goal?: string;
  target_year?: string;
  streak?: number;
  status?: number;
  created_at?: string;
  isAuthenticated: boolean;
  session?: any;
  onboarding_completed?: boolean;
}

const initialState: UserState = {
  streak: 0,
  isAuthenticated: false,
  onboarding_completed: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
    updateStreak: (state, action: PayloadAction<number>) => {
      state.streak = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboarding_completed = action.payload;
    },
  },
});

export const { 
  setUser, 
  clearUser, 
  updateStreak, 
  setAuthenticated, 
  setOnboardingCompleted 
} = userSlice.actions;
export default userSlice.reducer;