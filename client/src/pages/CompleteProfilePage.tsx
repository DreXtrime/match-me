import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api.js';

const INTERESTS = ['gaming', 'fitness', 'music', 'programming', 'art', 'reading', 'travel', 'food', 'movies', 'sports'];
const FRIDAY_NIGHT_ACTIVITIES = [
  'bar_hopping',
  'house_party',
  'gaming',
  'movies_at_home',
  'restaurant',
  'clubbing',
  'board_games',
  'concert',
  'takeaway_and_chill',
  'outdoor_bonfire',
];
const MUSIC_GENRES = ['rock', 'pop', 'hiphop', 'electronic', 'jazz', 'classical', 'metal', 'indie'];
const RELATIONSHIP_GOALS = ['friendship', 'dating', 'networking', 'activity'];

export const CompleteProfilePage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [age, setAge] = useState<number>(18);
  const [relationshipGoal, setRelationshipGoal] = useState(RELATIONSHIP_GOALS[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<string[]>([]);
  const [maxDistanceKm, setMaxDistanceKm] = useState(50);
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [locationMessage, setLocationMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);

  const toggle = (_list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }
    setLocationMessage('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationMessage('Location captured.');
      },
      () => setLocationMessage('Unable to retrieve your location.'),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0) {
      setError('Select at least one interest.');
      return;
    }
    if (selectedActivities.length === 0) {
      setError('Select at least one Friday night activity.');
      return;
    }
    if (selectedMusic.length === 0) {
      setError('Select at least one music genre.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await profileService.completeProfile({
        first_name: firstName,
        last_name: lastName,
        bio: aboutMe,
        profile_picture_url: profilePictureUrl || undefined,
        maxDistanceKm,
        latitude,
        longitude,
      });

      await profileService.updateBio({
        age,
        interests: selectedInterests,
        fridayNightActivities: selectedActivities,
        musicGenres: selectedMusic,
        relationshipGoal,
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
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Fill in your details to start getting matched.</p>
        {error && (
          <div ref={errorRef} style={errorStyle}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGroupStyle}>
            <label>First Name *</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
          </div>

          <div style={formGroupStyle}>
            <label>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
          </div>

          <div style={formGroupStyle}>
            <label>About Me</label>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder="Tell us about yourself..."
              style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Profile Picture URL (optional)</label>
            <input
              type="url"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Age *</label>
            <input type="number" min={18} max={120} value={age} onChange={(e) => setAge(Number(e.target.value))} required style={inputStyle} />
          </div>

          <div style={formGroupStyle}>
            <label>What are you looking for? *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {RELATIONSHIP_GOALS.map((goal) => (
                <button key={goal} type="button" onClick={() => setRelationshipGoal(goal)} style={chipStyleFor(relationshipGoal === goal)}>
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label>Interests * (pick at least 1)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {INTERESTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(selectedInterests, setSelectedInterests, item)}
                  style={chipStyleFor(selectedInterests.includes(item))}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label>Friday Night Activities * (pick at least 1)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {FRIDAY_NIGHT_ACTIVITIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(selectedActivities, setSelectedActivities, item)}
                  style={chipStyleFor(selectedActivities.includes(item))}
                >
                  {item.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label>Favourite Music * (pick at least 1)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {MUSIC_GENRES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(selectedMusic, setSelectedMusic, item)}
                  style={chipStyleFor(selectedMusic.includes(item))}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label>Maximum match distance (km)</label>
            <input
              type="number"
              min={5}
              max={500}
              value={maxDistanceKm}
              onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Location</label>
            <button type="button" onClick={handleUseCurrentLocation} style={secondaryButtonStyle}>
              Use My Current Location
            </button>
            {locationMessage && <small style={{ color: 'var(--muted)', marginTop: '0.25rem' }}>{locationMessage}</small>}
            {latitude && (
              <small style={{ color: '#44d190' }}>
                GPS: {latitude.toFixed(4)}, {longitude?.toFixed(4)}
              </small>
            )}
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  minHeight: '100vh',
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
  border: '1px solid var(--border)',
};

const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '1.5rem' };
const formGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  fontSize: '1rem',
  backgroundColor: 'var(--surface-light)',
  color: 'var(--text)',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.875rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  width: 'fit-content',
};

const chipStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
  backgroundColor: 'rgba(255,255,255,0.08)',
  color: 'var(--text)',
};

const chipStyleFor = (selected: boolean): React.CSSProperties => ({
  ...chipStyle,
  background: selected ? 'var(--primary)' : 'rgba(124, 152, 255, 0.04)',
  border: selected ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  fontWeight: selected ? 700 : 400,
  boxShadow: selected ? '0 0 10px rgba(124, 152, 255, 0.5)' : 'none',
  transform: selected ? 'scale(1.05)' : 'scale(1)',
});

const errorStyle: React.CSSProperties = {
  backgroundColor: '#451616',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '12px',
  marginBottom: '1rem',
};
