import React, { useState, useEffect } from 'react';
import { profileService } from '../services/api.js';
import { Btn } from '../components/Btn.tsx';
import { LoadingScreen } from '../components/Loadingscreen.tsx';

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

export const ProfilePage: React.FC = () => {
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
      const [profile, bio] = await Promise.all([profileService.getOwnProfile(), profileService.getMyBio().catch(() => null)]);

      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      setAboutMe(profile.aboutMe || '');
      setProfilePictureUrl(profile.profile_picture_url || '');
      setMaxDistanceKm(profile.maxDistanceKm ?? 50);
      if (profile.latitude) setLatitude(Number(profile.latitude));
      if (profile.longitude) setLongitude(Number(profile.longitude));

      if (bio) {
        setAge(bio.age ?? 18);
        setRelationshipGoal(bio.relationshipGoal ?? RELATIONSHIP_GOALS[0]);
        setSelectedInterests(bio.interests ?? []);
        setSelectedActivities(bio.fridayNightActivities ?? []);
        setSelectedMusic(bio.musicGenres ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setList((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation not supported.');
      return;
    }
    setLocationMessage('Getting your location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationMessage('Location updated.');
      },
      () => setLocationMessage('Unable to retrieve location.'),
      { enableHighAccuracy: true }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

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

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full min-h-[calc(100vh-60px)] py-10 px-4">
      <div className="max-w-[600px] mx-auto flex flex-col gap-6">
        {/* Page title */}
        <div className="border-2 border-border bg-panel px-6 py-5">
          <h1 className="text-2xl font-bold text-text mb-1" style={{ fontFamily: 'var(--font-ui)' }}>
            Edit Profile
          </h1>
          <p className="text-muted text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            Keep your profile up to date
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="border-2 border-red bg-red/10 px-5 py-3 text-red text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            ✕ {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="border-2 border-green bg-green-800/80 px-5 py-3 text-green-400 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
            ✓ {success}
          </div>
        )}

        {/* Form sheet */}
        <form onSubmit={handleSave} className="border-2 border-border">
          {/* Basic Info ─────────────────────────────────────────── */}
          <SectionHeader label="Basic Info" />
          <div className="bg-panel px-5 py-5 flex flex-col gap-5 border-b-2 border-border">
            <div className="flex gap-4">
              <Field label="First Name *" className="flex-1">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className={inputClass}
                  style={{ fontFamily: 'var(--font-ui)' }}
                />
              </Field>
              <Field label="Last Name" className="flex-1">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  style={{ fontFamily: 'var(--font-ui)' }}
                />
              </Field>
            </div>

            <Field label="Age *" className="max-w-[120px]">
              <input
                type="number"
                min={18}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                className={inputClass}
                style={{ fontFamily: 'var(--font-ui)' }}
              />
            </Field>

            <Field label="About Me">
              <textarea
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                className={`${inputClass} resize-vertical`}
                style={{ fontFamily: 'var(--font-ui)' }}
              />
            </Field>

            <Field label="Profile Picture URL">
              <input
                type="url"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={inputClass}
                style={{ fontFamily: 'var(--font-ui)' }}
              />
              {profilePictureUrl && (
                <div className="flex items-center gap-3 mt-2">
                  <img
                    src={profilePictureUrl}
                    alt="Preview"
                    className="w-14 h-14 object-cover border border-border"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                  <button
                    type="button"
                    onClick={() => setProfilePictureUrl('')}
                    className="px-3 py-1.5 text-xs font-bold border border-red/60 text-red bg-red/10 hover:bg-red/20 transition-colors"
                    style={{ fontFamily: 'var(--font-ui)' }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </Field>
          </div>

          {/* Looking For ────────────────────────────────────────── */}
          <SectionHeader label="Looking For" />
          <div className="bg-panel px-5 py-5 border-b-2 border-border">
            <Field label="What are you looking for? *">
              <div className="flex flex-wrap gap-2 mt-1">
                {RELATIONSHIP_GOALS.map((goal) => (
                  <ChipLookingFor key={goal} label={goal} selected={relationshipGoal === goal} onClick={() => setRelationshipGoal(goal)} />
                ))}
              </div>
            </Field>
          </div>

          {/* Interests ──────────────────────────────────────────── */}
          <SectionHeader label="Interests" />
          <div className="bg-panel px-5 py-5 border-b-2 border-border">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => (
                <ChipInterests
                  key={item}
                  label={item}
                  selected={selectedInterests.includes(item)}
                  onClick={() => toggle(setSelectedInterests, item)}
                />
              ))}
            </div>
          </div>

          {/* Friday Night ───────────────────────────────────────── */}
          <SectionHeader label="Friday Night Activities" />
          <div className="bg-panel px-5 py-5 border-b-2 border-border">
            <div className="flex flex-wrap gap-2">
              {FRIDAY_NIGHT_ACTIVITIES.map((item) => (
                <ChipFridayNight
                  key={item}
                  label={item.replace(/_/g, ' ')}
                  selected={selectedActivities.includes(item)}
                  onClick={() => toggle(setSelectedActivities, item)}
                />
              ))}
            </div>
          </div>

          {/* Music ──────────────────────────────────────────────── */}
          <SectionHeader label="Favourite Music" />
          <div className="bg-panel px-5 py-5 border-b-2 border-border">
            <div className="flex flex-wrap gap-2">
              {MUSIC_GENRES.map((item) => (
                <ChipMusic key={item} label={item} selected={selectedMusic.includes(item)} onClick={() => toggle(setSelectedMusic, item)} />
              ))}
            </div>
          </div>

          {/* Discovery ──────────────────────────────────────────── */}
          <SectionHeader label="Discovery" />
          <div className="bg-panel px-5 py-5 flex flex-col gap-5 border-b-2 border-border">
            <Field label="Maximum match distance (km)" className="max-w-[180px]">
              <input
                type="number"
                min={5}
                max={500}
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className={inputClass}
                style={{ fontFamily: 'var(--font-ui)' }}
              />
            </Field>

            <Field label="Location">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="px-4 py-2 text-sm font-bold border border-border text-text bg-surface hover:bg-bg transition-colors w-fit"
                style={{ fontFamily: 'var(--font-ui)' }}
              >
                Use My Current Location
              </button>
              {locationMessage && (
                <small className="text-muted text-xs mt-1 block" style={{ fontFamily: 'var(--font-ui)' }}>
                  {locationMessage}
                </small>
              )}
              {latitude && (
                <small className="text-green text-xs block" style={{ fontFamily: 'var(--font-ui)' }}>
                  GPS: {latitude.toFixed(4)}, {longitude?.toFixed(4)}
                </small>
              )}
            </Field>
          </div>

          {/* Submit ─────────────────────────────────────────────── */}
          <div className="bg-surface px-5 py-4">
            <Btn variant="accept" onClick={() => {}}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Btn>
          </div>

          {/* Success */}
          {success && (
            <div className="border-2 border-green bg-green-800/80 px-5 py-3 text-green-400 text-sm" style={{ fontFamily: 'var(--font-ui)' }}>
              ✓ {success}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

// Helpers ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full px-4 py-2.5 bg-bg border border-border text-text text-sm placeholder:text-muted focus:outline-none focus:border-yellow transition-colors';

const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <div className="bg-surface border-b-2 border-border px-5 py-2">
    <span className="text-yellow font-bold text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
      {label}
    </span>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
  <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
    <label className="text-muted text-xs font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-ui)' }}>
      {label}
    </label>
    {children}
  </div>
);

const ChipLookingFor: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
      selected
        ? 'px-3 py-1 text-xs font-bold border border-border text-red bg-red/30'
        : 'px-3 py-1 text-xs font-bold border border-border text-red bg-red/3'
    }`}
    style={{ fontFamily: 'var(--font-ui)' }}
  >
    {label}
  </button>
);

const ChipInterests: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
      selected
        ? 'px-3 py-1 text-xs font-bold border border-border text-text bg-surface'
        : 'px-3 py-1 text-xs font-bold border border-border text-text bg-surface/5'
    }`}
    style={{ fontFamily: 'var(--font-ui)' }}
  >
    {label}
  </button>
);

const ChipFridayNight: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
      selected
        ? 'px-3 py-1 text-xs font-bold border border-border text-[#102910] bg-green/50'
        : 'px-3 py-1 text-xs font-bold border border-border text-[#102910] bg-green/5'
    }`}
    style={{ fontFamily: 'var(--font-ui)' }}
  >
    {label}
  </button>
);

const ChipMusic: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-bold border transition-colors ${
      selected
        ? 'px-3 py-1 text-xs font-bold border border-border text-[#712693] bg-[#9c5eaa]/30'
        : 'px-3 py-1 text-xs font-bold border border-border text-[#712693] bg-[#9c5eaa]/3'
    }`}
    style={{ fontFamily: 'var(--font-ui)' }}
  >
    {label}
  </button>
);
