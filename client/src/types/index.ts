export interface User {
  id: string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_online?: boolean;
}

export interface Profile {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_picture_url?: string;
  location?: string;
  is_online?: boolean;
}

export interface BioData {
  id: string;
  key: string;
  value: string;
  weight: number;
}

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
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

export interface AuthResponse {
  user: { id: string; email: string };
  token: string;
}
