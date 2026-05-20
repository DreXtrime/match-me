export interface AuthResponse {
  userId: string;
  token: string;
}

export interface User {
  id: string;
  name?: string;
  profilePicture?: string;
  isOnline?: boolean;
}

export interface Profile {
  id: string;
  // camelCase from backend
  firstName?: string;
  lastName?: string;
  aboutMe?: string;
  profilePicture?: string;
  maxDistanceKm?: number;
  latitude?: number;
  longitude?: number;
  // snake_case aliases used in pages (normalized in api.ts)
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_picture_url?: string;
  location?: string;
}

export interface BioData {
  id: string;
  age?: number;
  interests?: string[];
  fridayNightActivities?: string[];
  musicGenres?: string[];
  relationshipGoal?: string;
}

export interface Connection {
  id: string;
  requester_id?: string;
  receiver_id?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  accepted_at?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Chat {
  id: string;
  lastMessageTime: string;
}
