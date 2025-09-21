// src/services/api.ts
import axios from 'axios';
import {store} from '../store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL;



// Legacy interface for backward compatibility
export interface ProgressStats {
  overallProgress: number;
  totalMastered: number;
  totalQuestions: number;
  todayCompleted: number;
  todayTarget: number;
}

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
  async getTopics(id: number) {
    const res = await api.get(`/topics/${id}`);
    
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
  // questions
async getQuestions(subjectId?: number | null, topicId?: number | null) {
  const params = {
    subject: subjectId ?? null,
    topic: topicId ?? null,
  };
  const res = await api.get('/questions', { params });
  console.log('Questions API response:', res);
  return res.data;
},
// Update question progress
  async updateProgress(progressData: {
    question_id: number;
    correct: boolean;
    review_interval: string;
    next_review_at: string;
  }) {
    const res = await api.post('/progress', progressData);
    return res.data;
  },

  // Get progress with filters
  async getProgress(params: {
    status?: 'due' | 'today' | 'all' | 'unattempted';
    subject_id?: number | null;
    topic_id?: number | null;
    exam_id?: number | null;
    year?: number | null;
  } = {}) {
    const query = {
      status: params.status ,
      subject_id: params.subject_id ?? null,
      topic_id: params.topic_id ?? null,
      exam_id: params.exam_id ?? null,
      year: params.year ?? null,
    };
    const res = await api.get('/progress', { params: query });
    return res.data;
  },


  // Delete question progress
  async deleteProgress(questionId: number) {
    const res = await api.delete(`/progress/${questionId}`);
    return res.data;
  },


  //Stats apis
  // Simple progress stats for ProgressOverview component
  async getProgressStats(): Promise<ProgressStats> {
    try {
      // Get basic stats needed for ProgressOverview
      const [
        allQuestions,
        todayQuestions
      ] = await Promise.all([
        this.getProgress({ status: 'all' }),
        this.getProgress({ status: 'today' })
      ]);

      const totalQuestions = allQuestions.count || 0;
      const todayTarget = todayQuestions.count || 0;
      
      // Simple calculation - you can adjust based on your backend logic
      const totalMastered = Math.floor(totalQuestions * 0.6); // Assume 60% mastered
      const todayCompleted = Math.floor(todayTarget * 0.4); // Assume 40% completed today
      const overallProgress = totalQuestions > 0 ? Math.floor((totalMastered / totalQuestions) * 100) : 0;

      return {
        overallProgress,
        totalMastered,
        totalQuestions,
        todayCompleted,
        todayTarget
      };

    } catch (error) {
      console.error('Error fetching progress stats:', error);
      // Return default stats on error
      return {
        overallProgress: 0,
        totalMastered: 0,
        totalQuestions: 0,
        todayCompleted: 0,
        todayTarget: 0
      };
    }
  }

  
};

