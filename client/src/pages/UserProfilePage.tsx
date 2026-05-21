import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { Profile, BioData, User } from '../types/index.js';

function formatEnum(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bio, setBio] = useState<BioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { on, off } = useWebSocket();

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      profileService.getUser(userId).then(setUser),
      profileService.getProfile(userId).then(setProfile),
      profileService.getUserBio(userId).then(setBio),
    ]).catch(err => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const handleOnline = (id: string) => {
      if (id === userId) setUser(prev => prev ? { ...prev, isOnline: true } : prev);
    };
    const handleOffline = (id: string) => {
      if (id === userId) setUser(prev => prev ? { ...prev, isOnline: false } : prev);
    };
    on('user-online', handleOnline);
    on('user-offline', handleOffline);
    return () => { off('user-online', handleOnline); off('user-offline', handleOffline); };
  }, [userId, on, off]);

  if (loading) return <div style={containerStyle}><div style={loadingStyle}>Loading profile...</div></div>;
  if (error) return <div style={containerStyle}><div style={errorStyle}>{error}</div></div>;

  const picture = profile?.profilePicture;

  return (
    <div className="mobile-compact-pad" style={containerStyle}>
      <div className="mobile-compact-pad" style={cardStyle}>
        <button onClick={() => navigate(-1)} style={backButtonStyle}>← Back</button>

        <div className="mobile-stack" style={headerStyle}>
          <div style={avatarWrapStyle}>
            {picture ? (
              <img src={picture} alt={user?.name} style={avatarStyle} />
            ) : (
              <div style={avatarPlaceholderStyle}>
                {user?.name?.charAt(0) ?? '?'}
              </div>
            )}
            <span style={onlineDotStyle(user?.isOnline ?? false)} title={user?.isOnline ? 'Online' : 'Offline'} />
          </div>
          <div>
            <h1 style={nameStyle}>{user?.name ?? `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim()}</h1>
            <p style={onlineLabelStyle}>{user?.isOnline ? '🟢 Online' : '🔘 Offline'}</p>
            {bio?.age && <p style={ageStyle}>{bio.age} years old</p>}
          </div>
        </div>

        <div style={actionsStyle}>
          <button onClick={() => navigate(`/chat/${userId}`)} style={chatButtonStyle}>
            💬 Send Message
          </button>
        </div>

        {profile?.aboutMe && (
          <section style={sectionStyle}>
            <h3 style={sectionTitleStyle}>About</h3>
            <p style={aboutTextStyle}>{profile.aboutMe}</p>
          </section>
        )}

        {bio?.relationshipGoal && (
          <section style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Looking for</h3>
            <span style={chipStyle}>{formatEnum(bio.relationshipGoal)}</span>
          </section>
        )}

        {bio?.interests && bio.interests.length > 0 && (
          <section style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Interests</h3>
            <div style={chipsStyle}>
              {bio.interests.map(i => <span key={i} style={chipStyle}>{formatEnum(i)}</span>)}
            </div>
          </section>
        )}

        {bio?.fridayNightActivities && bio.fridayNightActivities.length > 0 && (
          <section style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Friday night</h3>
            <div style={chipsStyle}>
              {bio.fridayNightActivities.map(a => <span key={a} style={chipStyle}>{formatEnum(a)}</span>)}
            </div>
          </section>
        )}

        {bio?.musicGenres && bio.musicGenres.length > 0 && (
          <section style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Music</h3>
            <div style={chipsStyle}>
              {bio.musicGenres.map(g => <span key={g} style={chipStyle}>{formatEnum(g)}</span>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem 1rem',
  display: 'flex',
  justifyContent: 'center',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  borderRadius: '24px',
  border: '1px solid var(--border)',
  padding: '2rem',
  width: '100%',
  maxWidth: '600px',
  height: 'fit-content',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
};

const backButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--primary)',
  fontSize: '0.95rem',
  cursor: 'pointer',
  padding: 0,
  marginBottom: '1.5rem',
  display: 'block',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  marginBottom: '1.5rem',
};

const avatarWrapStyle: React.CSSProperties = {
  position: 'relative',
  flexShrink: 0,
};

const avatarStyle: React.CSSProperties = {
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid var(--primary)',
};

const avatarPlaceholderStyle: React.CSSProperties = {
  width: '90px',
  height: '90px',
  borderRadius: '50%',
  backgroundColor: 'var(--primary-soft)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2.5rem',
  fontWeight: 700,
  border: '3px solid var(--primary)',
};

const onlineDotStyle = (isOnline: boolean): React.CSSProperties => ({
  position: 'absolute',
  bottom: 4,
  right: 4,
  width: '16px',
  height: '16px',
  borderRadius: '50%',
  backgroundColor: isOnline ? '#44d190' : '#9bb2d6',
  border: '3px solid var(--surface)',
});

const nameStyle: React.CSSProperties = {
  margin: '0 0 0.25rem 0',
  fontSize: '1.6rem',
  fontWeight: 700,
};

const onlineLabelStyle: React.CSSProperties = {
  margin: '0 0 0.25rem 0',
  fontSize: '0.85rem',
  color: 'var(--muted)',
};

const ageStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  color: 'var(--muted)',
};

const actionsStyle: React.CSSProperties = {
  marginBottom: '2rem',
};

const chatButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, var(--primary), #536dff)',
  border: 'none',
  color: 'white',
  padding: '0.75rem 1.5rem',
  borderRadius: '12px',
  fontSize: '0.95rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '1.5rem',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--muted)',
};

const aboutTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  lineHeight: 1.6,
  color: 'var(--text)',
};

const chipsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

const chipStyle: React.CSSProperties = {
  backgroundColor: 'var(--primary-soft)',
  color: 'var(--primary)',
  border: '1px solid rgba(124, 152, 255, 0.3)',
  borderRadius: '20px',
  padding: '0.35rem 0.85rem',
  fontSize: '0.85rem',
  fontWeight: 500,
};

const loadingStyle: React.CSSProperties = {
  color: 'var(--muted)',
  fontSize: '1.1rem',
  paddingTop: '4rem',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: 'rgba(247, 105, 105, 0.1)',
  color: '#f8d7da',
  padding: '1rem',
  borderRadius: '12px',
  border: '1px solid rgba(247, 105, 105, 0.3)',
};
