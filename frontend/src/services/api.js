import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const noteAPI = {
  uploadNote: async (title, content) => {
    try {
      const response = await apiClient.post('/api/upload', {
        title,
        content,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to upload note'
      );
    }
  },

  listNotes: async () => {
    try {
      const response = await apiClient.get('/api/list');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to fetch notes list'
      );
    }
  },

  downloadNote: async (filename) => {
    try {
      const response = await apiClient.get(`/api/download/${filename}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to download note'
      );
    }
  },

  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('API server is not available');
    }
  },
};

export default noteAPI;