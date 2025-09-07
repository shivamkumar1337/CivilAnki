import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from '../../types';

interface AuthSliceState {
  isAuthenticated: boolean;
  authData: AuthState;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  authData: {
    mobile: '',
    isLogin: true,
  },
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<AuthState>) => {
      state.authData = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.authData = initialState.authData;
      state.error = null;
    },
  },
});

export const { setAuthData, setAuthenticated, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;