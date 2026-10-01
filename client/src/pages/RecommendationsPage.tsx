import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recommendationService, profileService, connectionService } from '../services/api.js';
import type { Profile, BioData } from '../types';
import { Btn } from '../components/Btn.tsx';

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
      const [profile, bio] = await Promise.all([profileService.getProfile(userId), profileService.getUserBio(userId).catch(() => null)]);
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
      await connectionService.requestConnection(recommendations[currentIndex]);
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
      await recommendationService.dismissRecommendation(recommendations[currentIndex]);
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

  const progress = recommendations.length > 0 ? ((currentIndex + 1) / recommendations.length) * 100 : 0;

  // Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-[500px] border-2 border-border overflow-hidden">
          <div className="h-[450px] bg-surface animate-pulse" />
          <div className="p-6 flex flex-col gap-3 bg-panel">
            <div className="h-4 bg-surface rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-surface rounded w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Empty / error full-screen ─────────────────────────────────────────────

  if (error && recommendations.length === 0) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-[500px] border-2 border-border bg-panel px-8 py-12 text-center">
          <div className="text-5xl mb-4">💔</div>
          <p className="text-text font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
            {error}
          </p>
          <p className="text-muted text-sm mb-8" style={{ fontFamily: 'var(--font-ui)' }}>
            Come back later for more matches!
          </p>
          <div className="flex-1">
            <Btn variant="primary" onClick={loadRecommendations}>
              Refresh
            </Btn>
            <Btn variant="primary" onClick={() => navigate('/connections')}>
              View Connections
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-[500px] border-2 border-border bg-panel px-8 py-12 text-center">
          <p className="text-text font-bold text-lg mb-6" style={{ fontFamily: 'var(--font-ui)' }}>
            Profile not found
          </p>
          <button
            onClick={loadRecommendations}
            className="px-6 py-3 bg-yellow text-bg font-bold text-sm border-2 border-yellow hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--font-ui)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main view ─────────────────────────────────────────────────────────────

  return (
    <div className="mobile-compact-pad min-h-[calc(100vh-60px)] flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="w-full max-w-[500px] mb-6 text-center border-2 border-border">
        <div className="items-center justify-between bg-surface border-b-2 border-border px-5 py-2">
          <h1 className="text-2xl font-bold text-text mb-3" style={{ fontFamily: 'var(--font-ui)' }}>
            Discover
          </h1>
          {/* Progress bar */}
          <div className="w-full h-[4px] bg-surface overflow-hidden mb-2">
            <div className="h-full bg-yellow transition-[width] duration-500 ease-in-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-muted text-xs" style={{ fontFamily: 'var(--font-ui)' }}>
            {currentIndex + 1} of {recommendations.length}
          </p>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <div className="w-full max-w-[500px] mb-4 px-4 py-3 border border-red/30 bg-red/10 text-red text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
          ✕ {error}
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-[500px] mb-8">
        <div key={currentProfile.id} className="border-2 border-border overflow-hidden bg-panel">
          {/* Profile image */}
          <div className="mobile-shorter-image relative h-[450px] overflow-hidden bg-surface">
            {currentProfile.profile_picture_url ? (
              <img src={currentProfile.profile_picture_url} alt={currentProfile.first_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[5rem] font-black text-yellow bg-surface">
                {currentProfile.first_name?.charAt(0) || '?'}
              </div>
            )}
            {/* Name overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10"
              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.75) 100%)' }}
            >
              <h2 className="text-white font-bold text-3xl mb-1 m-0" style={{ fontFamily: 'var(--font-ui)' }}>
                {currentProfile.first_name}
              </h2>
              {currentProfile.location && (
                <p className="text-white/90 text-sm m-0" style={{ fontFamily: 'var(--font-ui)' }}>
                  📍 {currentProfile.location}
                </p>
              )}
            </div>
          </div>

          {/* Profile info */}
          <div className="p-5 flex flex-col gap-4">
            {/* Bio */}
            {currentProfile.bio && (
              <div className="pb-4 border-b border-border">
                <p className="text-text text-sm leading-relaxed m-0" style={{ fontFamily: 'var(--font-ui)' }}>
                  {currentProfile.bio}
                </p>
              </div>
            )}

            {/* Stats */}
            {currentBio && (currentBio.age || currentBio.relationshipGoal) && (
              <div className="flex flex-wrap gap-3">
                {currentBio.age && (
                  <div className="flex flex-col gap-1 px-4 py-3 bg-surface border border-border flex-1 min-w-[140px]">
                    <span className="text-muted text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                      Age
                    </span>
                    <span className="text-text text-sm font-bold" style={{ fontFamily: 'var(--font-ui)' }}>
                      {currentBio.age}
                    </span>
                  </div>
                )}
                {currentBio.relationshipGoal && (
                  <div className="flex flex-col gap-1 px-4 py-3 bg-surface border border-border flex-1 min-w-[140px]">
                    <span className="text-muted text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
                      Looking for
                    </span>
                    <span className="text-text text-sm font-bold" style={{ fontFamily: 'var(--font-ui)' }}>
                      {currentBio.relationshipGoal}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {currentBio && (
              <div className="flex flex-wrap gap-2">
                {currentBio.interests?.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 text-xs font-bold border border-border text-text bg-surface"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {item}
                  </span>
                ))}
                {currentBio.musicGenres?.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 text-xs font-bold border border-border text-[#712693] bg-[#9c5eaa]/30"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {item}
                  </span>
                ))}
                {currentBio.fridayNightActivities?.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 text-xs font-bold border border-border text-[#102910] bg-green/50"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    {item.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 px-5 py-4 bg-surface border-t-2 border-border">
            <div className="w-full [&>button]:w-full">
              <Btn variant="accept" onClick={handlePass}>
                Accept
              </Btn>
            </div>
            <div className="w-full [&>button]:w-full">
              <Btn variant="reject" onClick={handleLike}>
                Reject️
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
