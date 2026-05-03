import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService, profileService, connectionService } from '../services/api.js';
import type { Profile } from '../types/index.js';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (recommendations.length > 0 && currentIndex < recommendations.length) {
      loadProfile(recommendations[currentIndex]);
    }
  }, [recommendations, currentIndex]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const recs = await recommendationService.getRecommendations();
      setRecommendations(recs.map((r) => r.id));
      if (recs.length === 0) {
        setError('No more recommendations available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const profile = await profileService.getProfile(userId);
      setCurrentProfile(profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleLike = async () => {
    if (!currentProfile) return;
    try {
      await connectionService.requestConnection(currentProfile.id);
      handleNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send connection request');
    }
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    try {
      await recommendationService.dismissRecommendation(currentProfile.id);
      handleNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss recommendation');
    }
  };

  const handleNext = () => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadRecommendations();
      setCurrentIndex(0);
    }
  };

  if (loading) return <div style={containerStyle}>Loading recommendations...</div>;

  if (error && recommendations.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={errorBoxStyle}>{error}</div>
        <button onClick={loadRecommendations} style={buttonStyle}>
          Retry
        </button>
      </div>
    );
  }

  if (!currentProfile) {
    return <div style={containerStyle}>No profile found</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={profileImageStyle}>
          <span style={{ fontSize: '4rem' }}>{currentProfile.profile_picture_url || '👤'}</span>
        </div>
        <div style={profileInfoStyle}>
          <h2>{currentProfile.first_name} {currentProfile.last_name}</h2>
          <p><strong>Location:</strong> {currentProfile.location || 'Not specified'}</p>
          <p><strong>Bio:</strong> {currentProfile.bio || 'No bio provided'}</p>
        </div>
        <div style={actionsStyle}>
          <button onClick={handlePass} style={{ ...actionButtonStyle, backgroundColor: '#dc3545' }}>
            ❌ Pass
          </button>
          <button onClick={handleLike} style={{ ...actionButtonStyle, backgroundColor: '#28a745' }}>
            ❤️ Like
          </button>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--muted)' }}>
          {currentIndex + 1} / {recommendations.length}
        </p>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow)',
  width: '100%',
  maxWidth: '400px',
  overflow: 'hidden',
  border: '1px solid var(--border)',
};

const profileImageStyle: React.CSSProperties = {
  height: '300px',
  backgroundColor: 'var(--surface-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderBottom: '1px solid var(--border)',
};

const profileInfoStyle: React.CSSProperties = {
  padding: '2rem 1.5rem',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  padding: '0 1.5rem 1.5rem',
  justifyContent: 'center',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '0.75rem 2rem',
  border: 'none',
  borderRadius: '12px',
  color: 'white',
  fontSize: '1rem',
  cursor: 'pointer',
  flex: 1,
};

const buttonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  backgroundColor: 'var(--primary)',
};

const errorBoxStyle: React.CSSProperties = {
  backgroundColor: '#451616',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '12px',
  marginBottom: '1rem',
};
