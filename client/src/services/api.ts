import axios from 'axios';
import type { AuthResponse, User, Profile, Message, BioData } from '../types/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;

    const friendlyMessages: Record<number, string> = {
      400: backendMessage || 'Invalid request.',
      401: 'You are not logged in. Please log in and try again.',
      403: 'You do not have permission to do that.',
      404: backendMessage || 'The requested resource was not found.',
      500: 'Something went wrong on the server. Please try again later.',
    };

    const message = friendlyMessages[status] ?? backendMessage ?? 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Normalize backend camelCase profile response to the shape pages expect
function normalizeProfile(data: any): Profile {
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    aboutMe: data.aboutMe,
    profilePicture: data.profilePicture,
    maxDistanceKm: data.maxDistanceKm,
    latitude: data.latitude,
    longitude: data.longitude,
    // snake_case aliases consumed by existing pages
    first_name: data.firstName,
    last_name: data.lastName,
    bio: data.aboutMe,
    profile_picture_url: data.profilePicture,
  };
}

function normalizeUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    profilePicture: data.profilePicture,
    isOnline: data.isOnline ?? false,
  };
}

function normalizeMessage(msg: any): Message {
  return {
    id: msg.id,
    sender_id: msg.senderId,
    receiver_id: msg.receiverId,
    content: msg.content,
    is_read: msg.isRead,
    created_at: msg.createdAt,
  };
}

export const authService = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
};

export const profileService = {
  completeProfile: async (data: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    profile_picture_url?: string;
    maxDistanceKm?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<any> => {
    const payload = {
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      aboutMe: data.bio,
      profilePictureUrl: data.profile_picture_url || null,
      maxDistanceKm: data.maxDistanceKm ?? null,
      latitude: data.latitude != null ? data.latitude : null,
      longitude: data.longitude != null ? data.longitude : null,
    };
    const response = await apiClient.put('/me/profile', payload);
    return response.data;
  },

  updateBio: async (bioData: {
    age: number;
    interests: string[];
    fridayNightActivities: string[];
    musicGenres: string[];
    relationshipGoal: string;
  }): Promise<any> => {
    const response = await apiClient.put('/me/bio', bioData);
    return response.data;
  },

  getProfile: async (userId: string): Promise<Profile> => {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return normalizeProfile(response.data);
  },

  getOwnProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/me/profile');
    return normalizeProfile(response.data);
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return normalizeUser(response.data);
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/me');
    return normalizeUser(response.data);
  },

  getMyBio: async (): Promise<BioData> => {
    const response = await apiClient.get('/me/bio');
    return response.data as BioData;
  },

  getUserBio: async (userId: string): Promise<BioData> => {
    const response = await apiClient.get(`/users/${userId}/bio`);
    return response.data as BioData;
  },
};

export const recommendationService = {
  // Backend returns { recommendations: ["uuid", ...] }
  getRecommendations: async (): Promise<string[]> => {
    const response = await apiClient.get('/recommendations');
    return response.data.recommendations ?? [];
  },

  dismissRecommendation: async (userId: string): Promise<void> => {
    await apiClient.post(`/recommendations/${userId}/dismiss`, {});
  },
};

export const connectionService = {
  // Backend returns { connections: ["uuid", ...] }
  getConnections: async (): Promise<string[]> => {
    const response = await apiClient.get('/connections');
    return response.data.connections ?? [];
  },

  // Backend returns { requests: ["uuid", ...] }
  getPendingRequests: async (): Promise<string[]> => {
    const response = await apiClient.get('/connections/requests');
    return response.data.requests ?? [];
  },

  requestConnection: async (userId: string): Promise<void> => {
    await apiClient.post(`/connections/${userId}/request`, {});
  },

  acceptConnection: async (userId: string): Promise<void> => {
    await apiClient.post(`/connections/${userId}/accept`, {});
  },

  rejectConnection: async (userId: string): Promise<void> => {
    await apiClient.post(`/connections/${userId}/decline`, {});
  },

  deleteConnection: async (userId: string): Promise<void> => {
    await apiClient.delete(`/connections/${userId}`);
  },
};

export const messageService = {
  sendMessage: async (receiverId: string, content: string): Promise<Message> => {
    const response = await apiClient.post(`/messages?receiverId=${receiverId}`, { content });
    return normalizeMessage(response.data);
  },

  getConversation: async (userId: string, page: number = 0, size: number = 50): Promise<Message[]> => {
    const response = await apiClient.get(`/chats/${userId}/messages`, { params: { page, size } });
    // Backend returns Spring Page: { content: [...], totalPages, ... }
    const content = response.data.content ?? [];
    // Messages are returned newest-first; reverse for display
    return content.map(normalizeMessage).reverse();
  },

  getChats: async (): Promise<{ id: string; lastMessageTime: string }[]> => {
    const response = await apiClient.get('/chats');
    const chats = response.data.chats ?? [];
    return chats.map((c: any) => ({ id: c.id, lastMessageTime: c.lastMessageTime }));
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/messages/unread/count');
    return response.data.unreadCount ?? 0;
  },

  markAsRead: async (messageId: string): Promise<void> => {
    await apiClient.put(`/messages/${messageId}/read`, {});
  },
};

export default apiClient;
