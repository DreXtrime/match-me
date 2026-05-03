import { createUser, getUserByEmail, getUserById, updateUserOnlineStatus, createProfile, getProfileByUserId, updateProfile, addBioData, getBioDataByUserId, createOrUpdatePreference, getPreferenceByUserId } from '../models/user.ts';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.ts';
import type { User, Profile, BioData, Preference } from '../models/types.ts';

export const registerUser = async (email: string, password: string): Promise<{ user: { id: string; email: string }; token: string }> => {
  // Check if user exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const user = await createUser(email, passwordHash);

  const token = generateToken(user.id);

  return {
    user: { id: user.id, email: user.email },
    token,
  };
};

export const loginUser = async (email: string, password: string): Promise<{ user: { id: string; email: string }; token: string }> => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id);

  // Update online status
  await updateUserOnlineStatus(user.id, true);

  return {
    user: { id: user.id, email: user.email },
    token,
  };
};

export const logoutUser = async (userId: string): Promise<void> => {
  await updateUserOnlineStatus(userId, false);
};

export const completeProfile = async (
  userId: string,
  profileData: {
    username?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<Profile> => {
  let profile = await getProfileByUserId(userId);

  if (!profile) {
    profile = await createProfile(userId, profileData);
  } else {
    profile = await updateProfile(userId, profileData);
  }

  return profile;
};

export const addUserBioData = async (userId: string, bioDataItems: Array<{ key: string; value: string; weight?: number }>): Promise<BioData[]> => {
  const results: BioData[] = [];

  for (const item of bioDataItems) {
    const bioData = await addBioData(userId, item.key, item.value, item.weight);
    results.push(bioData);
  }

  return results;
};

export const setUserPreferences = async (userId: string, preferences: { looking_for_key?: string; looking_for_value?: string; max_distance_km?: number }): Promise<Preference> => {
  return await createOrUpdatePreference(userId, preferences);
};

export const getUserPublicInfo = async (userId: string): Promise<{ id: string; username?: string; first_name?: string; profile_picture_url?: string; is_online: boolean } | null> => {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    username: profile.username,
    first_name: profile.first_name,
    profile_picture_url: profile.profile_picture_url || '👤',
    is_online: user.is_online,
  };
};

export const getUserPreferences = async (userId: string): Promise<Preference | null> => {
  return await getPreferenceByUserId(userId);
};

export const getUserProfile = async (userId: string): Promise<{ id: string; username?: string; first_name?: string; last_name?: string; bio?: string; profile_picture_url?: string; location?: string } | null> => {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    username: profile.username,
    first_name: profile.first_name,
    last_name: profile.last_name,
    bio: profile.bio,
    profile_picture_url: profile.profile_picture_url || '👤',
  };
};

export const getUserBioInfo = async (userId: string): Promise<{ id: string; bioData: BioData[] } | null> => {
  const user = await getUserById(userId);
  if (!user) {
    return null;
  }

  const bioData = await getBioDataByUserId(userId);

  return {
    id: user.id,
    bioData,
  };
};
