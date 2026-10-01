import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../services/api.js';
import { useWebSocket } from '../hooks/useWebSocket.js';
import type { Profile, BioData, User } from '../types';
import { Btn } from '../components/Btn.tsx';
import { LoadingScreen } from '../components/Loadingscreen.tsx';

function formatEnum(value: string): string {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
    ])
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const handleOnline = (id: string) => {
      if (id === userId) setUser((prev) => (prev ? { ...prev, isOnline: true } : prev));
    };
    const handleOffline = (id: string) => {
      if (id === userId) setUser((prev) => (prev ? { ...prev, isOnline: false } : prev));
    };
    on('user-online', handleOnline);
    on('user-offline', handleOffline);
    return () => {
      off('user-online', handleOnline);
      off('user-offline', handleOffline);
    };
  }, [userId, on, off]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4">
        <div className="border-2 border-red bg-red/10 text-red px-5 py-3 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
          ✕ {error}
        </div>
      </div>
    );
  }

  const picture = profile?.profilePicture;
  const name = user?.name ?? `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();

  return (
    <div className="mobile-compact-pad w-full min-h-[calc(100vh-60px)] py-10 px-4">
      <div className="max-w-[600px] mx-auto flex flex-col gap-0">
        {/* Card sheet */}
        <div className="border-2 border-border">
          {/* Header bar with back button */}
          <div className="bg-surface border-b-2 border-border px-5 py-2 flex items-center justify-between">
            <span className="text-yellow font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
              Profile
            </span>
            <Btn variant="chat" onClick={() => navigate(-1)}>
              ← Back
            </Btn>
          </div>

          {/* Avatar + name hero */}
          <div className="mobile-stack bg-panel px-5 py-6 border-b-2 border-border flex items-center gap-5">
            <div className="relative shrink-0">
              {picture ? (
                <img src={picture} alt={name} className="w-20 h-20 object-cover border-2 border-border" />
              ) : (
                <div
                  className="w-20 h-20 bg-surface border-2 border-border flex items-center justify-center text-yellow font-black text-3xl"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  {name?.charAt(0) ?? '?'}
                </div>
              )}
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-panel ${user?.isOnline ? 'bg-green' : 'bg-muted'}`}
                title={user?.isOnline ? 'Online' : 'Offline'}
              />
            </div>

            <div className="flex flex-col gap-0.5">
              <h1 className="text-text font-bold text-2xl m-0" style={{ fontFamily: 'var(--font-ui)' }}>
                {name}
              </h1>
              <p className={`text-sm m-0 ${user?.isOnline ? 'text-green' : 'text-muted'}`} style={{ fontFamily: 'var(--font-ui)' }}>
                {user?.isOnline ? '● Online' : '○ Offline'}
              </p>
              {bio?.age && (
                <p className="text-muted text-sm m-0" style={{ fontFamily: 'var(--font-ui)' }}>
                  {bio.age} years old
                </p>
              )}
            </div>
          </div>

          {/* Message action */}
          <div className="bg-surface border-b-2 border-border px-5 py-3">
            <Btn variant="chat" onClick={() => navigate(`/chat/${userId}`)}>
              Send Message
            </Btn>
          </div>

          {/* About */}
          {profile?.aboutMe && (
            <>
              <SectionHeader label="About" />
              <div className="bg-panel px-5 py-4 border-b-2 border-border">
                <p className="text-text text-sm leading-relaxed m-0" style={{ fontFamily: 'var(--font-ui)' }}>
                  {profile.aboutMe}
                </p>
              </div>
            </>
          )}

          {/* Looking for */}
          {bio?.relationshipGoal && (
            <>
              <SectionHeader label="Looking For" />
              <div className="bg-panel px-5 py-4 border-b-2 border-border">
                <ChipLookingFor label={formatEnum(bio.relationshipGoal)} />
              </div>
            </>
          )}

          {/* Interests */}
          {bio?.interests && bio.interests.length > 0 && (
            <>
              <SectionHeader label="Interests" />
              <div className="bg-panel px-5 py-4 border-b-2 border-border flex flex-wrap gap-2">
                {bio.interests.map((i) => (
                  <ChipInterests key={i} label={formatEnum(i)} />
                ))}
              </div>
            </>
          )}

          {/* Friday night */}
          {bio?.fridayNightActivities && bio.fridayNightActivities.length > 0 && (
            <>
              <SectionHeader label="Friday Night" />
              <div className="bg-panel px-5 py-4 border-b-2 border-border flex flex-wrap gap-2">
                {bio.fridayNightActivities.map((a) => (
                  <ChipFridayNight key={a} label={formatEnum(a)} />
                ))}
              </div>
            </>
          )}

          {/* Music */}
          {bio?.musicGenres && bio.musicGenres.length > 0 && (
            <>
              <SectionHeader label="Music" />
              <div className="bg-panel px-5 py-4 flex flex-wrap gap-2">
                {bio.musicGenres.map((g) => (
                  <ChipMusic key={g} label={formatEnum(g)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helpers ───────────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="bg-surface border-b-2 border-border px-5 py-2">
    <span className="text-yellow font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
      {label}
    </span>
  </div>
);

const ChipLookingFor: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 text-xs font-bold border border-border text-red bg-red/30" style={{ fontFamily: 'var(--font-ui)' }}>
    {label}
  </span>
);

const ChipInterests: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 text-xs font-bold border border-border text-text bg-surface" style={{ fontFamily: 'var(--font-ui)' }}>
    {label}
  </span>
);

const ChipFridayNight: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 text-xs font-bold border border-border text-[#102910] bg-green/50" style={{ fontFamily: 'var(--font-ui)' }}>
    {label}
  </span>
);

const ChipMusic: React.FC<{ label: string }> = ({ label }) => (
  <span className="px-3 py-1 text-xs font-bold border border-border text-[#712693] bg-[#9c5eaa]/30" style={{ fontFamily: 'var(--font-ui)' }}>
    {label}
  </span>
);
