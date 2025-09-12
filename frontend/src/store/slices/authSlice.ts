import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  mobile: string;
  name: string;
  isLogin: boolean; // true for sign in, false for sign up
}

interface AuthSliceState {
  isAuthenticated: boolean;
  authData: AuthState;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  pendingVerification: boolean;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  authData: {
    mobile: '',
    name: '',
    isLogin: true,
  },
  isLoading: false,
  error: null,
  otpSent: false,
  pendingVerification: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action: PayloadAction<Partial<AuthState>>) => {
      state.authData = { ...state.authData, ...action.payload };
    },
    setAuthMode: (state, action: PayloadAction<boolean>) => {
      state.authData.isLogin = action.payload;
      // Clear form data when switching modes
      if (!action.payload) { // switching to sign up
        state.authData.name = '';
      }
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
    setOtpSent: (state, action: PayloadAction<boolean>) => {
      state.otpSent = action.payload;
    },
    setPendingVerification: (state, action: PayloadAction<boolean>) => {
      state.pendingVerification = action.payload;
    },
    resetAuthFlow: (state) => {
      state.otpSent = false;
      state.pendingVerification = false;
      state.error = null;
      state.isLoading = false;
    },
    logout: (state) => {
      return { ...initialState };
    },
  },
});

export const { 
  setAuthData, 
  setAuthMode,
  setAuthenticated, 
  setLoading, 
  setError, 
  setOtpSent,
  setPendingVerification,
  resetAuthFlow,
  logout 
} = authSlice.actions;
export default authSlice.reducer;