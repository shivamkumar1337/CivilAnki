import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

const initialState: User = {
  id: '',
  name: '',
  mobile: '',
  email: '',
  streak: 0,
  avatar: '👤',
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<User>>) => {
      return { ...state, ...action.payload };
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.streak = action.payload;
    },
    clearUser: () => initialState,
  },
});

export const { setUser, updateStreak, clearUser } = userSlice.actions;
export default userSlice.reducer;