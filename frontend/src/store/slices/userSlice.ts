import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  streak: number;
  avatar: string;
  isAuthenticated: boolean;
  session?: any;
  // Profile specific fields
  authUserId?: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

const initialState: User = {
  id: '',
  name: '',
  mobile: '',
  email: '',
  streak: 0,
  avatar: '👤',
  isAuthenticated: false,
  session: undefined,
  authUserId: '',
  avatarUrl: null,
  createdAt: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<User>>) => {
      return { ...state, ...action.payload };
    },
    setUserFromAuth: (state, action: PayloadAction<{
      user: any;
      session: any;
      profile: any;
    }>) => {
      const { user, session, profile } = action.payload;
      
      return {
        ...state,
        id: profile?.id || '',
        authUserId: user.id,
        name: profile?.name || '',
        mobile: user.phone || '',
        email: user.email || '',
        streak: profile?.streak || 0,
        avatar: profile?.avatar_url || '👤',
        avatarUrl: profile?.avatar_url,
        createdAt: profile?.created_at,
        isAuthenticated: true,
        session,
      };
    },
    updateProfile: (state, action: PayloadAction<{
      name?: string;
      avatarUrl?: string;
      streak?: number;
    }>) => {
      const { name, avatarUrl, streak } = action.payload;
      
      if (name !== undefined) state.name = name;
      if (avatarUrl !== undefined) {
        state.avatarUrl = avatarUrl;
        state.avatar = avatarUrl || '👤';
      }
      if (streak !== undefined) state.streak = streak;
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.streak = action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { 
  setUser, 
  setUserFromAuth, 
  updateProfile, 
  updateStreak, 
  clearUser 
} = userSlice.actions;
export default userSlice.reducer;