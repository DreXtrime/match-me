import type { User, Profile, BioData, Message } from '../types';

export const DEMO_USER_ID = 'demo-user-001';
export const DEMO_TOKEN = 'demo-token-xyz';

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  firstName: 'Alex',
  lastName: 'Demo',
  aboutMe: 'Just a demo user exploring the app!',
  profilePicture: `https://www.gravatar.com/avatar/demo?d=identicon`,
  maxDistanceKm: 50,
  latitude: 59.437,
  longitude: 24.7536,
  first_name: 'Alex',
  last_name: 'Demo',
  bio: 'Just a demo user exploring the app!',
  profile_picture_url: `https://www.gravatar.com/avatar/demo?d=identicon`,
};

export const DEMO_BIO: BioData = {
  id: DEMO_USER_ID,
  age: 25,
  interests: ['hiking', 'photography', 'coffee'],
  fridayNightActivities: ['bar'],
  musicGenres: ['indie', 'jazz'],
  relationshipGoal: 'long-term',
};

export interface MockUserFull {
  user: User;
  profile: Profile;
  bio: BioData;
  chatScript: string[];
}

export const MOCK_USERS: MockUserFull[] = [
  {
    user: { id: 'user-002', name: 'Sofia Mäkinen', profilePicture: 'https://i.pravatar.cc/128?img=47', isOnline: true },
    profile: {
      id: 'user-002',
      firstName: 'Sofia',
      lastName: 'Mäkinen',
      aboutMe: 'Coffee addict, amateur photographer, and weekend hiker.',
      profilePicture: 'https://i.pravatar.cc/512?img=47',
      first_name: 'Sofia',
      last_name: 'Mäkinen',
      bio: 'Coffee addict, amateur photographer, and weekend hiker.',
    },
    bio: {
      id: 'user-002',
      age: 24,
      interests: ['photography', 'hiking', 'coffee'],
      fridayNightActivities: ['bar'],
      musicGenres: ['indie', 'jazz'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      "Hey! I can't believe we matched 😄",
      'So what kind of photography are you into?',
      "That's really cool. I've been trying to get into street photography lately.",
      'We should grab coffee sometime and compare shots!',
    ],
  },
  {
    user: { id: 'user-003', name: 'Markus Lepp', profilePicture: 'https://i.pravatar.cc/128?img=12', isOnline: false },
    profile: {
      id: 'user-003',
      firstName: 'Markus',
      lastName: 'Lepp',
      aboutMe: 'Software dev by day, jazz musician by night. Big fan of long runs and longer books.',
      profilePicture: 'https://i.pravatar.cc/512?img=12',
      first_name: 'Markus',
      last_name: 'Lepp',
      bio: 'Software dev by day, jazz musician by night.',
    },
    bio: {
      id: 'user-003',
      age: 27,
      interests: ['music', 'running', 'reading'],
      fridayNightActivities: ['home'],
      musicGenres: ['jazz', 'blues'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      "Oh nice, another match! What's up?",
      "I saw you're into jazz too, do you play or just listen?",
      'Nice! I play piano. Been at it for about 8 years now.',
      "We'd probably have a lot to talk about over a beer sometime.",
    ],
  },
  {
    user: { id: 'user-004', name: 'Liis Tamm', profilePicture: 'https://i.pravatar.cc/128?img=32', isOnline: true },
    profile: {
      id: 'user-004',
      firstName: 'Liis',
      lastName: 'Tamm',
      aboutMe: 'Yoga instructor, dog mom, and obsessive podcast listener.',
      profilePicture: 'https://i.pravatar.cc/512?img=32',
      first_name: 'Liis',
      last_name: 'Tamm',
      bio: 'Yoga instructor, dog mom, and obsessive podcast listener.',
    },
    bio: {
      id: 'user-004',
      age: 26,
      interests: ['yoga', 'dogs', 'podcasts'],
      fridayNightActivities: ['home'],
      musicGenres: ['pop', 'indie'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      'Hey there! 👋',
      'Your profile caught my eye, what podcasts are you into lately?',
      "Ooh I haven't heard that one. Adding it to my list!",
      'So what do you usually get up to on weekends?',
    ],
  },
  {
    user: { id: 'user-005', name: 'Tõnis Kask', profilePicture: 'https://i.pravatar.cc/128?img=15', isOnline: false },
    profile: {
      id: 'user-005',
      firstName: 'Tõnis',
      lastName: 'Kask',
      aboutMe: 'Climber, cook, and chronic overthinker. Looking for someone to debate with over homemade pasta.',
      profilePicture: 'https://i.pravatar.cc/512?img=15',
      first_name: 'Tõnis',
      last_name: 'Kask',
      bio: 'Climber, cook, and chronic overthinker.',
    },
    bio: {
      id: 'user-005',
      age: 29,
      interests: ['climbing', 'cooking', 'philosophy'],
      fridayNightActivities: ['bar'],
      musicGenres: ['rock', 'classical'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      'Well hello! What brings you to this corner of the internet?',
      'Nice, always good to see interesting people on here.',
      "Do you cook at all? I'm always looking for taste testers 😄",
      "Excellent. I'll put you on the shortlist.",
    ],
  },
  {
    user: { id: 'user-006', name: 'Kadri Org', profilePicture: 'https://i.pravatar.cc/128?img=45', isOnline: true },
    profile: {
      id: 'user-006',
      firstName: 'Kadri',
      lastName: 'Org',
      aboutMe: 'Architect who spends too much time on cycling routes and not enough on deadlines.',
      profilePicture: 'https://i.pravatar.cc/512?img=45',
      first_name: 'Kadri',
      last_name: 'Org',
      bio: 'Architect who spends too much time on cycling routes.',
    },
    bio: {
      id: 'user-006',
      age: 28,
      interests: ['cycling', 'architecture', 'travel'],
      fridayNightActivities: ['bar'],
      musicGenres: ['electronic', 'indie'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      'Hey! Glad we matched.',
      "I noticed you're into hiking, do you do much cycling too?",
      "There are some amazing routes outside Tallinn if you're ever interested.",
      'Could be fun to do a ride sometime!',
    ],
  },
  {
    user: { id: 'user-007', name: 'Andres Vool', profilePicture: 'https://i.pravatar.cc/128?img=8', isOnline: false },
    profile: {
      id: 'user-007',
      firstName: 'Andres',
      lastName: 'Vool',
      aboutMe: 'Marine biologist with a soft spot for horror films and strong espresso.',
      profilePicture: 'https://i.pravatar.cc/512?img=8',
      first_name: 'Andres',
      last_name: 'Vool',
      bio: 'Marine biologist with a soft spot for horror films.',
    },
    bio: {
      id: 'user-007',
      age: 31,
      interests: ['marine biology', 'film', 'coffee'],
      fridayNightActivities: ['home'],
      musicGenres: ['jazz', 'ambient'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      'Hi! This is exciting.',
      "So what do you do when you're not matching with strangers online? 😄",
      "That's genuinely interesting. I spend most of my time with fish, so you're already more interesting than my coworkers.",
      "Ha, they don't talk back much. Terrible conversationalists.",
    ],
  },
  {
    user: { id: 'user-008', name: 'Merle Pärn', profilePicture: 'https://i.pravatar.cc/128?img=44', isOnline: true },
    profile: {
      id: 'user-008',
      firstName: 'Merle',
      lastName: 'Pärn',
      aboutMe: 'Graphic designer, plant parent, and amateur sourdough baker.',
      profilePicture: 'https://i.pravatar.cc/512?img=44',
      first_name: 'Merle',
      last_name: 'Pärn',
      bio: 'Graphic designer, plant parent, and amateur sourdough baker.',
    },
    bio: {
      id: 'user-008',
      age: 25,
      interests: ['design', 'plants', 'baking'],
      fridayNightActivities: ['home'],
      musicGenres: ['pop', 'r&b'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      'Hey! I liked your profile a lot.',
      "I'm a big coffee person too, have you been to any good spots in Tallinn lately?",
      "Oh I haven't tried that one! Is it the one near the old town?",
      'Adding it to my list. Maybe we can check it out together sometime ☕',
    ],
  },
  {
    user: { id: 'user-009', name: 'Rasmus Ilves', profilePicture: 'https://i.pravatar.cc/128?img=7', isOnline: false },
    profile: {
      id: 'user-009',
      firstName: 'Rasmus',
      lastName: 'Ilves',
      aboutMe: 'History teacher by day, trivia night champion by weekend.',
      profilePicture: 'https://i.pravatar.cc/512?img=7',
      first_name: 'Rasmus',
      last_name: 'Ilves',
      bio: 'History teacher by day, trivia night champion by weekend.',
    },
    bio: {
      id: 'user-009',
      age: 30,
      interests: ['history', 'trivia', 'travel'],
      fridayNightActivities: ['bar'],
      musicGenres: ['rock', 'folk'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      'Hey, nice to match!',
      "Quick icebreaker, what's a random piece of trivia you know off the top of your head?",
      "Haha nice one! Here's mine: the shortest war in history lasted 38 minutes.",
      'Anglo-Zanzibar War, 1896. I win every bar quiz with that one.',
    ],
  },
  {
    user: { id: 'user-010', name: 'Eliise Rand', profilePicture: 'https://i.pravatar.cc/128?img=38', isOnline: true },
    profile: {
      id: 'user-010',
      firstName: 'Eliise',
      lastName: 'Rand',
      aboutMe: 'Vet student, marathon runner, terrible at replying to texts.',
      profilePicture: 'https://i.pravatar.cc/512?img=38',
      first_name: 'Eliise',
      last_name: 'Rand',
      bio: 'Vet student, marathon runner, terrible at replying to texts.',
    },
    bio: {
      id: 'user-010',
      age: 23,
      interests: ['running', 'animals', 'travel'],
      fridayNightActivities: ['home'],
      musicGenres: ['pop', 'indie'],
      relationshipGoal: 'long-term',
    },
    chatScript: [
      "Oh hey! Wasn't expecting to match today 😊",
      'Are you a runner too or more of a hiking person?',
      'Nice! I just finished my first marathon last month.',
      "It was brutal but honestly I'm already looking at the next one",
    ],
  },
];

// Users who will send YOU a connection request shortly after demo loads
export const INCOMING_REQUEST_USER_IDS = ['user-008', 'user-009'];

// Users you're already connected with (have chats)
export const CONNECTED_USER_IDS = ['user-002', 'user-003'];

// Recommendation pool (not yet connected)
export const RECOMMENDATION_USER_IDS = ['user-004', 'user-005', 'user-006', 'user-007', 'user-010'];

export function getMockUser(id: string): MockUserFull | undefined {
  return MOCK_USERS.find((u) => u.user.id === id);
}

// In-memory state
export const mockState = {
  connections: new Set<string>(CONNECTED_USER_IDS),
  pendingIncoming: new Set<string>(INCOMING_REQUEST_USER_IDS),
  pendingOutgoing: new Set<string>(),
  dismissed: new Set<string>(),
  // Map of userId -> Message[]
  conversations: new Map<string, Message[]>([
    [
      'user-002',
      [
        {
          id: 'msg-001',
          sender_id: 'user-002',
          receiver_id: DEMO_USER_ID,
          content: 'Hey! This matching app is pretty cool right?',
          is_read: true,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'msg-002',
          sender_id: DEMO_USER_ID,
          receiver_id: 'user-002',
          content: 'Hey Sofia! The discover tab is so useful!',
          is_read: true,
          created_at: new Date(Date.now() - 86400000 * 2 + 60000).toISOString(),
        },
        {
          id: 'msg-003',
          sender_id: 'user-002',
          receiver_id: DEMO_USER_ID,
          content: 'Right?!',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg-004',
          sender_id: 'user-002',
          receiver_id: DEMO_USER_ID,
          content: 'We should grab coffee sometime!',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    ],
    [
      'user-003',
      [
        {
          id: 'msg-004',
          sender_id: 'user-003',
          receiver_id: DEMO_USER_ID,
          content: 'Do you play any instruments?',
          is_read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
    ],
  ]),
  nextMsgId: 100,
};
