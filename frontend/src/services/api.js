import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const newsAPI = {
  autoTranslate: (englishData) => api.post('/news/auto-translate', englishData),
  generateEnglishTags: (englishData) => api.post('/news/generate-english-tags', englishData),
  createNews: (newsData) => api.post('/news', newsData),
  getAllNews: () => api.get('/news'),
  getNewsById: (id) => api.get(`/news/${id}`),
};

export default api;