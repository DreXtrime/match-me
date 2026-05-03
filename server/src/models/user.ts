import { query } from '../config/database.ts';
import type { User, Profile, BioData, Preference } from './types.ts';

// User operations
export const createUser = async (email: string, passwordHash: string): Promise<User> => {
  const result = await query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *`,
    [email, passwordHash]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const updateUserOnlineStatus = async (userId: string, isOnline: boolean): Promise<void> => {
  await query(
    'UPDATE users SET is_online = $1, last_seen_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [isOnline, userId]
  );
};

// Profile operations
export const createProfile = async (userId: string, profileData: Partial<Profile>): Promise<Profile> => {
  const { username, first_name, last_name, bio, location, latitude, longitude } = profileData;
  const result = await query(
    `INSERT INTO profiles (user_id, username, first_name, last_name, bio, location, latitude, longitude)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [userId, username, first_name, last_name, bio, location, latitude, longitude]
  );
  return result.rows[0];
};

export const getProfileByUserId = async (userId: string): Promise<Profile | null> => {
  const result = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
};

export const updateProfile = async (userId: string, profileData: Partial<Profile>): Promise<Profile> => {
  const { username, first_name, last_name, bio, profile_picture_url, location, latitude, longitude } = profileData;
  const result = await query(
    `UPDATE profiles SET username = COALESCE($1, username), first_name = COALESCE($2, first_name),
     last_name = COALESCE($3, last_name), bio = COALESCE($4, bio),
     profile_picture_url = COALESCE($5, profile_picture_url), location = COALESCE($6, location),
     latitude = COALESCE($7, latitude), longitude = COALESCE($8, longitude),
     updated_at = CURRENT_TIMESTAMP WHERE user_id = $9 RETURNING *`,
    [username, first_name, last_name, bio, profile_picture_url, location, latitude, longitude, userId]
  );
  return result.rows[0];
};

// Bio data operations
export const addBioData = async (userId: string, key: string, value: string, weight?: number): Promise<BioData> => {
  const result = await query(
    `INSERT INTO bio_data (user_id, key, value, weight) VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, key, value, weight || 1.0]
  );
  return result.rows[0];
};

export const getBioDataByUserId = async (userId: string): Promise<BioData[]> => {
  const result = await query('SELECT * FROM bio_data WHERE user_id = $1', [userId]);
  return result.rows;
};

export const updateBioData = async (bioDataId: string, value: string, weight?: number): Promise<BioData> => {
  const result = await query(
    `UPDATE bio_data SET value = $1, weight = COALESCE($2, weight), updated_at = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *`,
    [value, weight, bioDataId]
  );
  return result.rows[0];
};

export const deleteBioData = async (bioDataId: string): Promise<void> => {
  await query('DELETE FROM bio_data WHERE id = $1', [bioDataId]);
};

// Preference operations
export const createOrUpdatePreference = async (userId: string, preferenceData: Partial<Preference>): Promise<Preference> => {
  const { looking_for_key, looking_for_value, max_distance_km } = preferenceData;
  const result = await query(
    `INSERT INTO preferences (user_id, looking_for_key, looking_for_value, max_distance_km)
     VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET
     looking_for_key = COALESCE($2, preferences.looking_for_key),
     looking_for_value = COALESCE($3, preferences.looking_for_value),
     max_distance_km = COALESCE($4, preferences.max_distance_km),
     updated_at = CURRENT_TIMESTAMP RETURNING *`,
    [userId, looking_for_key, looking_for_value, max_distance_km]
  );
  return result.rows[0];
};

export const getPreferenceByUserId = async (userId: string): Promise<Preference | null> => {
  const result = await query('SELECT * FROM preferences WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
};
