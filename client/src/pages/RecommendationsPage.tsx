import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService, profileService, connectionService } from '../services/api.js';
import type { Profile, BioData } from '../types/index.js';

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [currentBio, setCurrentBio] = useState<BioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionPending, setActionPending] = useState(false);
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
      setError('');
      const recs = await recommendationService.getRecommendations();
      setRecommendations(recs);
      if (recs.length === 0) {
        setError('No more recommendations available');
      } else {
        setCurrentIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId: string) => {
    try {
      const [profile, bio] = await Promise.all([
        profileService.getProfile(userId),
        profileService.getUserBio(userId).catch(() => null),
      ]);
      setCurrentProfile(profile);
      setCurrentBio(bio);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    }
  };

  const handleLike = async () => {
    if (!currentProfile) return;
    try {
      setActionPending(true);
      const targetUserId = recommendations[currentIndex];
      await connectionService.requestConnection(targetUserId);
      handleNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send connection request');
    } finally {
      setActionPending(false);
    }
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    try {
      setActionPending(true);
      const targetUserId = recommendations[currentIndex];
      await recommendationService.dismissRecommendation(targetUserId);
      handleNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss recommendation');
    } finally {
      setActionPending(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < recommendations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      loadRecommendations();
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={skeletonImageStyle} />
          <div style={skeletonInfoStyle} />
        </div>
      </div>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={errorContainerStyle}>
          <div style={errorIconStyle}>💔</div>
          <p style={errorTitleStyle}>{error}</p>
          <p style={errorSubtextStyle}>Come back later for more matches!</p>
          <div style={errorActionsStyle}>
            <button onClick={loadRecommendations} style={primaryButtonStyle}>
              Refresh
            </button>
            <button onClick={() => navigate('/connections')} style={secondaryButtonStyle}>
              View Connections
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div style={containerStyle}>
        <div style={errorContainerStyle}>
          <p style={errorTitleStyle}>Profile not found</p>
          <button onClick={loadRecommendations} style={primaryButtonStyle}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / recommendations.length) * 100;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Discover</h1>
        <div style={progressBarStyle}>
          <div style={{ ...progressFillStyle, width: `${progress}%` }} />
        </div>
        <p style={progressTextStyle}>
          {currentIndex + 1} of {recommendations.length}
        </p>
      </div>

      {error && <div style={smallErrorStyle}>{error}</div>}

      <div style={cardWrapperStyle}>
        <div style={cardStyle} key={currentProfile.id}>
          {/* Profile Image */}
          <div style={profileImageContainerStyle}>
            {currentProfile.profile_picture_url ? (
              <img
                src={currentProfile.profile_picture_url}
                alt={currentProfile.first_name}
                style={profileImageStyle}
              />
            ) : (
              <div style={imagePlaceholderStyle}>{currentProfile.first_name?.charAt(0) || '?'}</div>
            )}
            <div style={imageOverlayStyle}>
              <div style={nameTagStyle}>
                <h2 style={nameStyle}>{currentProfile.first_name}</h2>
                {currentProfile.location && (
                  <p style={locationStyle}>📍 {currentProfile.location}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div style={profileInfoStyle}>
            {currentProfile.bio && (
              <div style={bioContainerStyle}>
                <p style={bioStyle}>{currentProfile.bio}</p>
              </div>
            )}

            {/* Quick Stats */}
            {currentBio && (
              <div style={statsContainerStyle}>
                {currentBio.age && (
                  <div style={statBadgeStyle}>
                    <span style={statLabelStyle}>Age</span>
                    <span style={statValueStyle}>{currentBio.age}</span>
                  </div>
                )}
                {currentBio.relationshipGoal && (
                  <div style={statBadgeStyle}>
                    <span style={statLabelStyle}>Looking for</span>
                    <span style={statValueStyle}>{currentBio.relationshipGoal}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bio Tags */}
            {currentBio && (
              <div style={tagsContainerStyle}>
                {currentBio.interests?.map((item) => (
                  <span key={item} style={tagStyle}>{item}</span>
                ))}
                {currentBio.musicGenres?.map((item) => (
                  <span key={item} style={{ ...tagStyle, backgroundColor: 'rgba(164,89,255,0.15)', color: '#c880ff' }}>{item}</span>
                ))}
                {currentBio.fridayNightActivities?.map((item) => (
                  <span key={item} style={{ ...tagStyle, backgroundColor: 'rgba(68,209,144,0.15)', color: '#44d190' }}>{item.replace(/_/g, ' ')}</span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={actionsContainerStyle}>
            <button
              onClick={handlePass}
              disabled={actionPending}
              style={passButtonStyle}
              title="Not interested"
            >
              ✕
            </button>
            <button
              onClick={handleLike}
              disabled={actionPending}
              style={likeButtonStyle}
              title="Connect"
            >
              ❤️
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

// ============================================================================
// Styles
// ============================================================================

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem 1rem',
};

const headerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '500px',
  marginBottom: '2rem',
  textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
  margin: '0 0 1rem 0',
  fontSize: '2rem',
  fontWeight: 700,
  color: 'var(--text)',
};

const progressBarStyle: React.CSSProperties = {
  width: '100%',
  height: '4px',
  backgroundColor: 'var(--surface-light)',
  borderRadius: '2px',
  overflow: 'hidden',
  marginBottom: '0.75rem',
};

const progressFillStyle: React.CSSProperties = {
  height: '100%',
  background: 'linear-gradient(90deg, var(--primary), #a459ff)',
  transition: 'width 0.5s ease',
};

const progressTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  color: 'var(--muted)',
};

const cardWrapperStyle: React.CSSProperties = {
  perspective: '1000px',
  width: '100%',
  maxWidth: '500px',
  marginBottom: '2rem',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  overflow: 'hidden',
  border: '1px solid var(--border)',
  animation: 'slideInRight 0.5s ease-out',
};

const profileImageContainerStyle: React.CSSProperties = {
  position: 'relative',
  height: '450px',
  overflow: 'hidden',
  backgroundColor: 'var(--surface-light)',
};

const profileImageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const imagePlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundColor: 'linear-gradient(135deg, rgba(124, 152, 255, 0.2), rgba(164, 89, 255, 0.15))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '5rem',
  fontWeight: 700,
  color: 'var(--primary-soft)',
};

const imageOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.7) 100%)',
  padding: '2rem 1.5rem 1.5rem',
};

const nameTagStyle: React.CSSProperties = {
  color: 'white',
};

const nameStyle: React.CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '1.8rem',
  fontWeight: 700,
};

const locationStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  opacity: 0.9,
};

const profileInfoStyle: React.CSSProperties = {
  padding: '1.5rem',
};

const bioContainerStyle: React.CSSProperties = {
  marginBottom: '1rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--border)',
};

const bioStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  lineHeight: '1.6',
  color: 'var(--text)',
};

const statsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  marginBottom: '1rem',
};

const statBadgeStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
  padding: '0.75rem 1rem',
  backgroundColor: 'var(--surface-light)',
  borderRadius: '12px',
  flex: 1,
  minWidth: '150px',
};

const statLabelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--muted)',
  fontWeight: 600,
  textTransform: 'uppercase',
};

const statValueStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--text)',
  fontWeight: 600,
};

const tagsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const tagStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.5rem 0.875rem',
  backgroundColor: 'var(--primary-soft)',
  color: 'var(--primary)',
  borderRadius: '16px',
  fontSize: '0.8rem',
  fontWeight: 600,
};

const actionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  padding: '1.5rem',
  backgroundColor: 'var(--surface-light)',
  borderTop: '1px solid var(--border)',
};

const passButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem',
  background: 'linear-gradient(135deg, rgba(247, 105, 105, 0.25), rgba(200, 60, 60, 0.15))',
  border: '2px solid rgba(247, 105, 105, 0.6)',
  color: '#f76969',
  borderRadius: '16px',
  fontSize: '1.5rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const likeButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '1rem',
  background: 'linear-gradient(135deg, rgba(68, 209, 144, 0.3), rgba(44, 180, 120, 0.15))',
  border: '2px solid rgba(68, 209, 144, 0.6)',
  color: 'white',
  borderRadius: '16px',
  fontSize: '1.5rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};


const errorContainerStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem 2rem',
  backgroundColor: 'var(--surface)',
  borderRadius: '24px',
  border: '1px solid var(--border)',
  maxWidth: '500px',
};

const errorIconStyle: React.CSSProperties = {
  fontSize: '4rem',
  marginBottom: '1rem',
};

const errorTitleStyle: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: 700,
  margin: '0 0 0.5rem 0',
};

const errorSubtextStyle: React.CSSProperties = {
  color: 'var(--muted)',
  margin: '0 0 2rem 0',
};

const errorActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
};

const primaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.75rem 1.5rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '16px',
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '0.75rem 1.5rem',
  backgroundColor: 'transparent',
  color: 'var(--primary)',
  border: '2px solid var(--primary)',
  borderRadius: '16px',
  fontWeight: 600,
  cursor: 'pointer',
};

const smallErrorStyle: React.CSSProperties = {
  backgroundColor: 'rgba(247, 105, 105, 0.1)',
  color: '#f8d7da',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  border: '1px solid rgba(247, 105, 105, 0.3)',
  marginBottom: '1rem',
  maxWidth: '500px',
  fontSize: '0.9rem',
};

const skeletonImageStyle: React.CSSProperties = {
  height: '450px',
  backgroundColor: 'var(--surface-light)',
  animation: 'shimmer 2s infinite',
};

const skeletonInfoStyle: React.CSSProperties = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};
