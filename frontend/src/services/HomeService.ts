// src/services/HomeService.ts
import axios from 'axios';
import { store } from '../store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

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
    console.log('Fetched profile:', res.data);
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

  // Updated progress methods for spaced repetition
  async getProgress(params: {
    status?: 'all' | 'unattempted' | 'due' | 'today' | 'learning' | 'review' | 'relearning';
    subject_id?: number;
    topic_id?: number;
    exam_id?: number;
    year?: number;
    limit?: number;
  }) {
    const res = await api.get('/progress', { params });
    return res.data;
  },

  async submitAnswer(data: {
    question_id: number;
    quality: number; // 0-5 quality rating
    time_taken?: number;
  }) {
    const res = await api.post('/progress', data);
    return res.data;
  },

  async getProgressStats() {
    const res = await api.get('/progress/stats');
    return res.data;
  },

  async getQuestions(params: {
    subject?: number;
    topic?: number;
    year?: number;
    limit?: number;
    offset?: number;
    include_progress?: boolean;
  }) {
    const res = await api.get('/questions', { params });
    return res.data;
  },

  async getQuestion(id: number) {
    const res = await api.get(`/questions/${id}`);
    return res.data;
  },

  async resetProgress(questionId: number) {
    const res = await api.delete(`/progress/${questionId}`);
    return res.data;
  },

  async getSpacedRepetitionSettings() {
    const res = await api.get('/settings/spaced-repetition');
    return res.data;
  },

  async updateSpacedRepetitionSettings(settings: any) {
    const res = await api.put('/settings/spaced-repetition', settings);
    return res.data;
  },

  async getTopics(subjectId: number) {
    const res = await api.get(`/topics/${subjectId}`);
    return res.data;
  },
};