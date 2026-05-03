import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api.js';

const INTERESTS = ['hiking', 'rock climbing', 'painting', 'photography', 'cooking', 'baking', 'reading', 'writing', 'dancing', 'yoga', 'fitness'];
const MUSIC_GENRES = ['rock', 'pop', 'jazz', 'classical', 'hip-hop', 'electronic', 'indie'];
const FOOD_PREFERENCES = ['vegan', 'vegetarian', 'omnivore', 'pescatarian', 'gluten-free'];
const OCCUPATIONS = ['Software Engineer', 'Designer', 'Data Scientist', 'Teacher', 'Musician', 'Artist', 'Doctor'];
const LOOKING_FOR_KEYS = ['interests', 'music', 'occupation'];

export const CompleteProfilePage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    bio: '',
    location: 'San Francisco',
    profile_picture_url: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [selectedFood, setSelectedFood] = useState('vegan');
  const [occupation, setOccupation] = useState(OCCUPATIONS[0]);
  const [lookingForKey, setLookingForKey] = useState(LOOKING_FOR_KEYS[0]);
  const [lookingForValue, setLookingForValue] = useState('hiking');
  const [maxDistanceKm, setMaxDistanceKm] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleMusicToggle = (genre: string) => {
    setSelectedMusic((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }

    setLocationMessage('Getting your current location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLocationMessage('Location captured successfully.');
      },
      () => {
        setLocationMessage('Unable to retrieve your location.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Complete profile
      await profileService.completeProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username || formData.first_name,
        bio: formData.bio,
        location: formData.location,
        profile_picture_url: formData.profile_picture_url,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      const bioDataItems = [
        ...selectedInterests.map((interest) => ({ key: 'interests', value: interest, weight: 1.0 })),
        ...selectedMusic.map((genre) => ({ key: 'music', value: genre, weight: 0.8 })),
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

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2>Complete Your Profile</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit} style={formStyle}>
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
            <button type="button" onClick={handleUseCurrentLocation} style={{ ...buttonStyle, marginTop: '0.75rem', width: 'fit-content' }}>
              Use My Current Location
            </button>
            {locationMessage && <small style={{ color: '#555' }}>{locationMessage}</small>}
          </div>
          <div style={formGroupStyle}>
            <label>Favorite Music</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {MUSIC_GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleMusicToggle(genre)}
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
              <select value={lookingForKey} onChange={(e) => setLookingForKey(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '120px' }}>
                {LOOKING_FOR_KEYS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="text"
                value={lookingForValue}
                onChange={(e) => setLookingForValue(e.target.value)}
                placeholder="Value e.g. hiking"
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
            <label>Select Your Interests (at least 1)</label>
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
          <button type="submit" disabled={loading || selectedInterests.length === 0} style={buttonStyle}>
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: 'var(--background)',
  padding: '1rem',
};

const formContainerStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  padding: '2rem',
  borderRadius: '16px',
  boxShadow: 'var(--shadow)',
  width: '100%',
  maxWidth: '600px',
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
};
