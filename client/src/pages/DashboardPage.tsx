import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/api.js';
import type { Profile } from '../types/index.js';
import { Btn } from '../components/Btn.tsx';

export const DashboardPage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await profileService.getOwnProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      navigate('/complete-profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={containerStyle}>Loading...</div>;

  if (!profile) {
    return (
      <div style={containerStyle}>
        <div className="mobile-compact-pad" style={messageBoxStyle}>
          <h2>Welcome to Match-Me! 👋</h2>
          <p>First, let's complete your profile to get started.</p>
          <button onClick={() => navigate('/complete-profile')} style={buttonStyle}>
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-60px)] py-10 px-4">
      <div className="max-w-4x1 mx-auto flex flex-col gap-6">
        <div className="border-2 border-border bg-panel px-6 py-5">
          <h2>Welcome, {profile.first_name || 'there'}! 👋</h2>
          <p>You're all set up and ready to meet amazing people.</p>
        </div>

        <div className="max-w-4x1 mx-auto flex flex-col gap-6">
          <div className="border-2 border-border bg-surface px-6 py-6">
            <h3>Discover Matches</h3>
            <p>Browse and connect with people who share your interests.</p>
            <Btn variant="primary" onClick={() => navigate('/recommendations')}>
              Start Discovering
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 60px)',
  backgroundColor: 'var(--background)',
  padding: '2rem 1rem',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.75rem 1.5rem',
  backgroundColor: 'var(--primary)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
  marginTop: 'auto',
};

const messageBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  padding: '3rem',
  borderRadius: '16px',
  boxShadow: 'var(--shadow)',
  textAlign: 'center',
  maxWidth: '500px',
  margin: '0 auto',
};
