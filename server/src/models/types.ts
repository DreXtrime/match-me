export interface User {
  id: string;
  email: string;
  password_hash: string;
  is_online: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_picture_url?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface BioData {
  id: string;
  user_id: string;
  key: string;
  value: string;
  weight: number;
  created_at: string;
  updated_at: string;
}

export interface Preference {
  id: string;
  user_id: string;
  looking_for_key?: string;
  looking_for_value?: string;
  max_distance_km: number;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  accepted_at?: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface DismissedRecommendation {
  id: string;
  user_id: string;
  dismissed_user_id: string;
  created_at: string;
}
