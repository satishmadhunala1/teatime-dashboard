import axios from 'axios';

const API_BASE_URL = 'https://ttcheck.onrender.com/api'
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const newsAPI = {
  // Existing endpoints
  autoTranslate: (englishData) => api.post('/news/auto-translate', englishData),
  generateEnglishTags: (englishData) => api.post('/news/generate-english-tags', englishData),
  createNews: (newsData) => api.post('/news', newsData),
  getAllNews: () => api.get('/news'),
  getNewsById: (id) => api.get(`/news/${id}`),
  
  // Auto-news endpoints
  triggerManualFetch: () => api.post('/auto-news/fetch-now'),
  getAutoNewsStats: () => api.get('/auto-news/stats'),
  controlScheduler: (action) => api.post(`/auto-news/scheduler/${action}`),
};

export default api;