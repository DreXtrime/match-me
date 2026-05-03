import { getProfileByUserId, getBioDataByUserId, getPreferenceByUserId } from '../models/user.ts';
import { getConnectedUsers, getDismissedRecommendations } from '../models/connection.ts';
import { query } from '../config/database.ts';
import type { BioData, Profile } from '../models/types.ts';

interface RecommendationScore {
  userId: string;
  score: number;
  matchReasons: string[];
}

/**
 * Matching algorithm that scores potential matches based on:
 * 1. Bio data similarity (interests, hobbies, preferences)
 * 2. Location proximity
 * 3. Preference matching
 * 4. Common interests weighting
 */
export const getRecommendations = async (userId: string, limit: number = 10): Promise<{ id: string }[]> => {
  try {
    // Get user's profile, bio data, and preferences
    const userProfile = await getProfileByUserId(userId);
    const userBioData = await getBioDataByUserId(userId);
    const userPreference = await getPreferenceByUserId(userId);
    const connectedUsers = await getConnectedUsers(userId);
    const dismissedUsers = await getDismissedRecommendations(userId);

    // Can't make recommendations if profile isn't complete
    if (!userProfile || userBioData.length === 0) {
      return [];
    }

    const connectedUserIds = connectedUsers.map((u) => u.id);
    const allExcludedUserIds = [userId, ...connectedUserIds, ...dismissedUsers];

    // Get all eligible users
    const allUsersResult = await query(
      `SELECT u.id, p.id as profile_id FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id != $1 AND NOT (u.id = ANY($2::uuid[]))`,
      [userId, allExcludedUserIds]
    );

    const eligibleUsers = allUsersResult.rows;

    // Score each eligible user
    const scores: RecommendationScore[] = [];

    for (const eligibleUser of eligibleUsers) {
      const candidateProfile = await getProfileByUserId(eligibleUser.id);
      const candidateBioData = await getBioDataByUserId(eligibleUser.id);

      // Skip if candidate doesn't have complete profile
      if (!candidateProfile || candidateBioData.length === 0) {
        continue;
      }

      let score = 0;
      const matchReasons: string[] = [];

      // 1. Location proximity matching
      if (userProfile.latitude && userProfile.longitude && candidateProfile.latitude && candidateProfile.longitude) {
        const distance = calculateDistance(
          userProfile.latitude,
          userProfile.longitude,
          candidateProfile.latitude,
          candidateProfile.longitude
        );

        const maxDistance = userPreference?.max_distance_km || 50;
        if (distance <= maxDistance) {
          const proximityScore = Math.max(0, 20 - distance / 2.5); // 20 points max
          score += proximityScore;
          if (proximityScore > 5) {
            matchReasons.push(`Same region (${Math.round(distance)}km away)`);
          }
        } else {
          continue; // Too far, skip this candidate
        }
      }

      // 2. Bio data compatibility (interests, hobbies, etc.)
      const bioMatches = calculateBioDataMatches(userBioData, candidateBioData);
      score += bioMatches.score;
      matchReasons.push(...bioMatches.reasons);

      // 3. Preference matching
      if (userPreference?.looking_for_key && userPreference?.looking_for_value) {
        for (const bioItem of candidateBioData) {
          if (bioItem.key === userPreference.looking_for_key && bioItem.value.toLowerCase().includes(userPreference.looking_for_value.toLowerCase())) {
            score += bioItem.weight * 15; // 15 points per matching preference
            matchReasons.push(`Matches your preference: ${userPreference.looking_for_key}`);
          }
        }
      }

      // Only include if score is meaningful
      if (score > 5) {
        scores.push({
          userId: eligibleUser.id,
          score,
          matchReasons,
        });
      }
    }

    // Sort by score descending and return top N
    const topRecommendations = scores.sort((a, b) => b.score - a.score).slice(0, limit);

    return topRecommendations.map((rec) => ({ id: rec.userId }));
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bio data matches between two users
 */
function calculateBioDataMatches(userBioData: BioData[], candidateBioData: BioData[]): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Group bio data by key
  const userBioMap = new Map<string, string[]>();
  const candidateBioMap = new Map<string, string[]>();

  userBioData.forEach((bio) => {
    if (!userBioMap.has(bio.key)) {
      userBioMap.set(bio.key, []);
    }
    userBioMap.get(bio.key)?.push(bio.value.toLowerCase());
  });

  candidateBioData.forEach((bio) => {
    if (!candidateBioMap.has(bio.key)) {
      candidateBioMap.set(bio.key, []);
    }
    candidateBioMap.get(bio.key)?.push(bio.value.toLowerCase());
  });

  // Find matching interests
  const matchedCategories = new Set<string>();
  userBioMap.forEach((userValues, key) => {
    const candidateValues = candidateBioMap.get(key);
    if (candidateValues) {
      const matches = userValues.filter((v) => candidateValues.includes(v));
      if (matches.length > 0) {
        const weight = userBioData.find((b) => b.key === key)?.weight ?? 1;
        score += matches.length * 10 * weight;
        matchedCategories.add(key);
      }
    }
  });

  if (matchedCategories.size > 0) {
    reasons.push(`Shared interests: ${Array.from(matchedCategories).join(', ')}`);
  }

  return { score, reasons };
}
