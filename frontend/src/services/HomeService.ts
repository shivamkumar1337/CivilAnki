import axios from 'axios';
import {store} from '../store'; // adjust path if needed

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

// Automatically add access token from Redux store to every request
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user?.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const HomeService = {
  async getProfile() {
    const res = await api.get('/profile/getprofile');
    return res.data;
  },

  async updateProfile(updates: Record<string, any>) {
    const res = await api.post('/profile/updateprofile', updates);
    return res.data;
  },

  async getSubjects() {
    const res = await api.get('/subjects');
    return res.data;
  },
};