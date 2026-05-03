import pool from '../server/src/config/database.js';
import { hashPassword } from '../server/src/utils/auth.js';

interface SeedUser {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  latitude: number;
  longitude: number;
  bioData: { key: string; value: string; weight?: number }[];
  preferences?: { looking_for_key: string; looking_for_value: string; max_distance_km: number };
}

const INTERESTS = [
  'hiking', 'rock climbing', 'painting', 'photography', 'cooking', 'baking', 'reading', 'writing',
  'dancing', 'yoga', 'fitness', 'jogging', 'swimming', 'cycling', 'gaming', 'board games',
  'movies', 'concerts', 'theater', 'museums', 'travel', 'volunteering', 'gardening', 'astronomy'
];

const MUSIC_GENRES = [
  'rock', 'pop', 'jazz', 'classical', 'hip-hop', 'electronic', 'indie', 'country',
  'r&b', 'folk', 'metal', 'blues', 'reggae', 'alternative', 'k-pop'
];

const FOOD_PREFERENCES = [
  'vegan', 'vegetarian', 'omnivore', 'pescatarian', 'kosher', 'halal', 'gluten-free', 'organic'
];

const LOCATIONS = [
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Austin', lat: 30.2672, lon: -97.7431 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Portland', lat: 45.5152, lon: -122.6784 },
  { name: 'Boston', lat: 42.3601, lon: -71.0589 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
];

const OCCUPATIONS = [
  'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'Lawyer',
  'Doctor', 'Teacher', 'Writer', 'Photographer', 'Chef', 'Musician', 'Artist',
  'Consultant', 'Entrepreneur', 'Marketer', 'Sales', 'HR Manager', 'Nurse'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateEmail(firstName: string, lastName: string, id: number): string {
  const variations = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@example.com`,
    `${firstName.toLowerCase()}${id}@example.com`,
    `${lastName.toLowerCase()}${firstName.charAt(0).toLowerCase()}${id}@example.com`,
  ];
  return variations[Math.floor(Math.random() * variations.length)];
}

async function generateUsers(count: number): Promise<SeedUser[]> {
  const users: SeedUser[] = [];
  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Jennifer', 'William', 'Linda',
    'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
    'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
    'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'];

  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor',
    'Moore', 'Jackson', 'Martin', 'Lee', 'Pierce', 'White', 'Harris', 'Clark', 'Lewis'];

  for (let i = 1; i <= count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const location = getRandomElement(LOCATIONS);
    const interests = getRandomElements(INTERESTS, 3);
    const musicGenres = getRandomElements(MUSIC_GENRES, 2);
    const foodPref = getRandomElement(FOOD_PREFERENCES);
    const occupation = getRandomElement(OCCUPATIONS);

    const user: SeedUser = {
      email: generateEmail(firstName, lastName, i),
      password: 'TestPassword123!',
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`,
      firstName,
      lastName,
      bio: `Hi! I'm ${firstName}, a ${occupation} passionate about ${interests.join(', ')}. Love exploring new places and meeting interesting people.`,
      location: location.name,
      latitude: location.lat + (Math.random() - 0.5) * 0.5, // Slight variation
      longitude: location.lon + (Math.random() - 0.5) * 0.5,
      bioData: [
        { key: 'interests', value: interests[0], weight: 1.0 },
        { key: 'interests', value: interests[1], weight: 1.0 },
        { key: 'interests', value: interests[2], weight: 1.0 },
        { key: 'music', value: musicGenres[0], weight: 0.8 },
        { key: 'music', value: musicGenres[1], weight: 0.8 },
        { key: 'dietary_preference', value: foodPref, weight: 0.9 },
        { key: 'occupation', value: occupation, weight: 0.7 },
      ],
      preferences: {
        looking_for_key: 'interests',
        looking_for_value: getRandomElement(INTERESTS),
        max_distance_km: Math.floor(Math.random() * 50) + 10, // 10-60 km
      },
    };

    users.push(user);
  }

  return users;
}

async function seedDatabase(userCount: number = 150) {
  try {
    console.log('Starting database seed...');

    // Make sure pool is connected
    const client = await pool.connect();
    console.log('Connected to database');

    try {
      // Check if users already exist
      const result = await client.query('SELECT COUNT(*) FROM users');
      const existingCount = parseInt(result.rows[0].count, 10);

      if (existingCount > 0) {
        console.log(`Database already has ${existingCount} users. Skipping seed.`);
        console.log('To reseed, drop the database and recreate it.');
        return;
      }

      // Generate users
      console.log(`Generating ${userCount} users...`);
      const users = await generateUsers(userCount);

      // Insert users and their data
      let createdCount = 0;
      for (const user of users) {
        try {
          // Create user
          const userResult = await client.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
            [user.email, await hashPassword(user.password)]
          );
          const userId = userResult.rows[0].id;

          // Create profile
          await client.query(
            `INSERT INTO profiles (user_id, username, first_name, last_name, bio, location, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, user.username, user.firstName, user.lastName, user.bio, user.location, user.latitude, user.longitude]
          );

          // Insert bio data
          for (const bioItem of user.bioData) {
            await client.query(
              'INSERT INTO bio_data (user_id, key, value, weight) VALUES ($1, $2, $3, $4)',
              [userId, bioItem.key, bioItem.value, bioItem.weight || 1.0]
            );
          }

          // Insert preferences
          if (user.preferences) {
            await client.query(
              `INSERT INTO preferences (user_id, looking_for_key, looking_for_value, max_distance_km)
               VALUES ($1, $2, $3, $4)`,
              [userId, user.preferences.looking_for_key, user.preferences.looking_for_value, user.preferences.max_distance_km]
            );
          }

          createdCount++;
          if (createdCount % 20 === 0) {
            console.log(`Created ${createdCount}/${userCount} users...`);
          }
        } catch (error) {
          console.error(`Error creating user ${user.email}:`, error);
        }
      }

      console.log(`Successfully seeded database with ${createdCount} users!`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const userCount = parseInt(process.argv[2], 10) || 150;
  seedDatabase(userCount)
    .then(() => {
      console.log('Seed complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { seedDatabase };
