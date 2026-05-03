import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api.js';
import type { Profile, BioData } from '../types/index.js';

const INTERESTS = ['hiking', 'rock climbing', 'painting', 'photography', 'cooking', 'baking', 'reading', 'writing', 'dancing', 'yoga', 'fitness'];
const MUSIC_GENRES = ['rock', 'pop', 'jazz', 'classical', 'hip-hop', 'electronic', 'indie'];
const FOOD_PREFERENCES = ['vegan', 'vegetarian', 'omnivore', 'pescatarian', 'gluten-free'];
const OCCUPATIONS = ['Software Engineer', 'Designer', 'Data Scientist', 'Teacher', 'Musician', 'Artist', 'Doctor'];
const LOOKING_FOR_KEYS = ['interests', 'music', 'occupation'];

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bioData, setBioData] = useState<BioData[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    location: 'San Francisco',
    profile_picture_url: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState('vegan');
  const [occupation, setOccupation] = useState(OCCUPATIONS[0]);
  const [lookingForKey, setLookingForKey] = useState(LOOKING_FOR_KEYS[0]);
  const [lookingForValue, setLookingForValue] = useState('hiking');
  const [maxDistanceKm, setMaxDistanceKm] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await profileService.getOwnProfile();
      setProfile(userProfile);
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        username: userProfile.username || '',
        bio: userProfile.bio || '',
        location: userProfile.location || 'San Francisco',
        profile_picture_url: userProfile.profile_picture_url || '',
      });

      // Load bio data
      try {
        const bioInfo = await profileService.getMyBio();
        if (bioInfo.bioData) {
          setBioData(bioInfo.bioData);
          setSelectedInterests(bioInfo.bioData.filter((b: BioData) => b.key === 'interests').map((b: BioData) => b.value));
          setSelectedMusic(bioInfo.bioData.filter((b: BioData) => b.key === 'music').map((b: BioData) => b.value));
          const food = bioInfo.bioData.find((b: BioData) => b.key === 'dietary_preference');
          if (food) setSelectedFood(food.value);
          const occupationValue = bioInfo.bioData.find((b: BioData) => b.key === 'occupation');
          if (occupationValue) setOccupation(occupationValue.value);
        }
      } catch (err) {
        console.error('Failed to load bio data:', err);
      }

      // Load preferences
      try {
        const preferences = await profileService.getPreferences();
        if (preferences) {
          if (preferences.looking_for_key) setLookingForKey(preferences.looking_for_key);
          if (preferences.looking_for_value) setLookingForValue(preferences.looking_for_value);
          if (preferences.max_distance_km) setMaxDistanceKm(preferences.max_distance_km);
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev: string[]) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update profile
      await profileService.completeProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username || formData.first_name,
        bio: formData.bio,
        location: formData.location,
        profile_picture_url: formData.profile_picture_url,
      });

      const bioDataItems = [
        ...selectedInterests.map((interest: string) => ({ key: 'interests', value: interest, weight: 1.0 })),
        ...selectedMusic.map((genre: string) => ({ key: 'music', value: genre, weight: 0.8 })),
        { key: 'dietary_preference', value: selectedFood, weight: 0.9 },
        { key: 'occupation', value: occupation, weight: 0.7 },
      ];

      if (bioDataItems.length > 0) {
        await profileService.addBioData(bioDataItems);
      }

      await profileService.setPreferences({
        looking_for_key: lookingForKey,
        looking_for_value: lookingForValue,
        max_distance_km: maxDistanceKm,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={containerStyle}>Loading profile...</div>;

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2>Edit Your Profile</h2>
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <form onSubmit={handleSave} style={formStyle}>
          <div style={formGroupStyle}>
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Profile Picture URL</label>
            <input
              type="text"
              name="profile_picture_url"
              value={formData.profile_picture_url}
              onChange={handleInputChange}
              placeholder="https://example.com/photo.jpg"
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              style={{...inputStyle, minHeight: '100px', fontFamily: 'inherit'}}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Location</label>
            <select name="location" value={formData.location} onChange={handleInputChange} style={inputStyle}>
              <option>San Francisco</option>
              <option>New York</option>
              <option>Los Angeles</option>
              <option>Chicago</option>
              <option>Austin</option>
              <option>Denver</option>
              <option>Seattle</option>
              <option>Portland</option>
              <option>Boston</option>
              <option>Miami</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label>Favorite Music</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {MUSIC_GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => setSelectedMusic((prev) => prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre])}
                  style={{
                    ...interestButtonStyle,
                    backgroundColor: selectedMusic.includes(genre) ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                    color: selectedMusic.includes(genre) ? 'white' : 'var(--text)',
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label>Dietary Preference</label>
            <select value={selectedFood} onChange={(e) => setSelectedFood(e.target.value)} style={inputStyle}>
              {FOOD_PREFERENCES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label>Occupation</label>
            <select value={occupation} onChange={(e) => setOccupation(e.target.value)} style={inputStyle}>
              {OCCUPATIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label>What are you looking for?</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select value={lookingForKey} onChange={(e) => setLookingForKey(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '140px' }}>
                {LOOKING_FOR_KEYS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="text"
                value={lookingForValue}
                onChange={(e) => setLookingForValue(e.target.value)}
                placeholder="e.g. hiking"
                style={{ ...inputStyle, flex: 2, minWidth: '160px' }}
              />
            </div>
          </div>

          <div style={formGroupStyle}>
            <label>Maximum distance (km)</label>
            <input
              type="number"
              min={5}
              max={200}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Your Interests</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  style={{
                    ...interestButtonStyle,
                    backgroundColor: selectedInterests.includes(interest) ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                    color: selectedInterests.includes(interest) ? 'white' : 'var(--text)',
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} style={buttonStyle}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem 1rem',
};

const formContainerStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  padding: '2rem',
  borderRadius: '16px',
  boxShadow: 'var(--shadow)',
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  border: '1px solid var(--border)',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: '1rem',
  backgroundColor: 'var(--surface-light)',
  color: 'var(--text)',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1rem',
  cursor: 'pointer',
};

const interestButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#451616',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '12px',
  marginBottom: '1rem',
};

const successStyle: React.CSSProperties = {
  backgroundColor: '#1d3524',
  color: '#b7f3d0',
  padding: '1rem',
  borderRadius: '12px',
  marginBottom: '1rem',
};
