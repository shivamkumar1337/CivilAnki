// src/services/api.ts
import axios from 'axios';
import {store} from '../store';

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

  // New APIs for home screen
  async getUserProgress() {
    const res = await api.get('/user/progress');
    return res.data;
  },

  async getCurrentSubjects() {
    const res = await api.get('/user/current-subjects');
    return res.data;
  },

  async getStaticSubjects() {
    const res = await api.get('/subjects/static');
    return res.data;
  },

  async getDashboardStats() {
    const res = await api.get('/user/dashboard-stats');
    return res.data;
  },

  async getTodayProgress() {
    const res = await api.get('/user/today-progress');
    return res.data;
  },

  async getSubjectProgress(subjectId: string) {
    const res = await api.get(`/subjects/${subjectId}/progress`);
    return res.data;
  },
};