import axios from 'axios';
import type { AuthResponse, User, Profile, Message, Connection } from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout', {});
  },
};

export const profileService = {
  completeProfile: async (data: {
    username?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    profile_picture_url?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<Profile> => {
    const response = await apiClient.post('/profile', data);
    return response.data;
  },

  getProfile: async (userId: string): Promise<Profile> => {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return response.data;
  },

  getOwnProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/me/profile');
    return response.data;
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/me');
    return response.data;
  },

  getMyBio: async (): Promise<{ id: string; bioData: any[] }> => {
    const response = await apiClient.get('/me/bio');
    return response.data;
  },

  getUserBio: async (userId: string): Promise<{ id: string; bioData: any[] }> => {
    const response = await apiClient.get(`/users/${userId}/bio`);
    return response.data;
  },

  addBioData: async (bioDataItems: Array<{ key: string; value: string; weight?: number }>): Promise<any> => {
    const response = await apiClient.post('/bio-data', { bioDataItems });
    return response.data;
  },

  setPreferences: async (preferences: { looking_for_key?: string; looking_for_value?: string; max_distance_km?: number }): Promise<any> => {
    const response = await apiClient.post('/preferences', preferences);
    return response.data;
  },

  getPreferences: async (): Promise<any> => {
    const response = await apiClient.get('/preferences');
    return response.data;
  },
};

export const recommendationService = {
  getRecommendations: async (): Promise<{ id: string }[]> => {
    const response = await apiClient.get('/recommendations');
    return response.data;
  },

  dismissRecommendation: async (userId: string): Promise<void> => {
    await apiClient.post(`/recommendations/${userId}/dismiss`, {});
  },
};

export const connectionService = {
  getConnections: async (): Promise<{ id: string }[]> => {
    const response = await apiClient.get('/connections');
    return response.data;
  },

  requestConnection: async (userId: string): Promise<Connection> => {
    const response = await apiClient.post(`/connections/${userId}`, {});
    return response.data;
  },

  getPendingRequests: async (): Promise<Connection[]> => {
    const response = await apiClient.get('/connections/requests/pending');
    return response.data;
  },

  acceptConnection: async (connectionId: string): Promise<Connection> => {
    const response = await apiClient.post(`/connections/${connectionId}/accept`, {});
    return response.data;
  },

  rejectConnection: async (connectionId: string): Promise<Connection> => {
    const response = await apiClient.post(`/connections/${connectionId}/reject`, {});
    return response.data;
  },

  deleteConnection: async (connectionId: string): Promise<void> => {
    await apiClient.delete(`/connections/${connectionId}`);
  },
};

export const messageService = {
  sendMessage: async (receiverId: string, content: string): Promise<Message> => {
    const response = await apiClient.post('/messages', { receiverId, content });
    return response.data;
  },

  getConversation: async (userId: string, limit: number = 50, offset: number = 0): Promise<Message[]> => {
    const response = await apiClient.get(`/messages/${userId}`, { params: { limit, offset } });
    return response.data;
  },

  getChats: async (limit: number = 50): Promise<any[]> => {
    const response = await apiClient.get('/chats', { params: { limit } });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/unread-count');
    return response.data.unreadCount;
  },
};

export default apiClient;
