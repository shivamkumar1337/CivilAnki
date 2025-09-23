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

// ProgressStats interface to match the backend response
export interface ProgressStats {
  overallProgress: number;
  totalMastered: number;
  totalQuestions: number;
  todayCompleted: number;
  todayTarget: number;
  new?: number;
  learning?: number;
  review?: number;
  due?: number;
  today?: number;
  total?: number;
}

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

  async getProgressStats(): Promise<ProgressStats> {
    try {
      const res = await api.get('/progress/stats');
      const data = res.data.data || res.data;
      
      // Transform backend response to match frontend interface
      return {
        overallProgress: data.total > 0 ? Math.round(((data.learning || 0) + (data.review || 0)) / data.total * 100) : 0,
        totalMastered: (data.review || 0), // Review cards are considered mastered
        totalQuestions: data.total || 0,
        todayCompleted: Math.min(data.today || 0, data.due || 0), // Estimate today's completed
        todayTarget: (data.due || 0) + 5, // Set a target slightly above due cards
        new: data.new || 0,
        learning: data.learning || 0,
        review: data.review || 0,
        due: data.due || 0,
        today: data.today || 0,
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error fetching progress stats:', error);
      // Return fallback data
      return {
        overallProgress: 0,
        totalMastered: 0,
        totalQuestions: 0,
        todayCompleted: 0,
        todayTarget: 0,
        new: 0,
        learning: 0,
        review: 0,
        due: 0,
        today: 0,
        total: 0
      };
    }
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