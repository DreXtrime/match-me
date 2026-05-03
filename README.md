# Match-Me - Recommendation Platform

A full-stack application that connects users based on their profile information and recommends matches based on a sophisticated matching algorithm.

## Features

- **User Registration & Authentication**: Secure signup/login with JWT tokens and bcrypt password hashing
- **Profile Management**: Users can complete their profiles with bio, interests, and location
- **Smart Matching Algorithm**: Recommends users based on:
  - Biographical data similarity (interests, hobbies, music preferences, etc.)
  - Location proximity using Haversine distance formula
  - Preference matching
  - Weighted scoring system
- **Connections**: Request, accept, and manage connections with other users
- **Real-Time Chat**: WebSocket-based messaging with typing indicators
- **Online Status**: See who's online in real-time
- **Responsive Design**: Works on mobile and desktop

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **Security**: CORS, input validation

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Router**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client

## Project Structure

```
match-me/
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── middleware/    # Express middleware (auth, etc.)
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Express server & WebSocket setup
│   ├── package.json
│   └── tsconfig.json
│
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   ├── schema.sql         # PostgreSQL schema
│   └── seed.ts            # Seed data generator
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+
- Git

### Backend Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Create PostgreSQL database**
   ```bash
   createdb matchme
   ```

3. **Initialize database schema**
   ```bash
   psql matchme < ../database/schema.sql
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values:
   # DATABASE_URL=postgresql://user:password@localhost:5432/matchme
   # JWT_SECRET=your_secret_key
   # PORT=3000
   ```

5. **Seed the database with test data**
   ```bash
   npm run seed
   # or with custom user count:
   # npm run seed -- 200
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:3000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Accessing the Application

1. Open `http://localhost:5173` in your browser
2. Sign up with an email and password
3. Complete your profile with interests and bio
4. Start discovering matches!

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### User & Profile
- `GET /me` - Get authenticated user's public info
- `GET /me/profile` - Get authenticated user's full profile
- `GET /me/bio` - Get authenticated user's biographical data
- `GET /users/{id}` - Get public user info
- `GET /users/{id}/profile` - Get user's profile
- `GET /users/{id}/bio` - Get user's biographical data
- `POST /profile` - Update profile
- `POST /bio-data` - Add biographical data points
- `POST /preferences` - Set user preferences

### Recommendations
- `GET /recommendations` - Get recommendation list (max 10)
- `POST /recommendations/{userId}/dismiss` - Dismiss a recommendation

### Connections
- `GET /connections` - Get list of connected users
- `POST /connections/{userId}` - Request connection
- `GET /connections/requests/pending` - Get pending requests
- `POST /connections/{connectionId}/accept` - Accept request
- `POST /connections/{connectionId}/reject` - Reject request
- `DELETE /connections/{connectionId}` - Delete connection

### Messages
- `POST /messages` - Send a message
- `GET /messages/{userId}` - Get conversation with a user
- `GET /chats` - Get recent chats
- `GET /unread-count` - Get unread message count

## Matching Algorithm

The recommendation algorithm considers:

1. **Location Proximity** (20 points max)
   - Uses Haversine formula to calculate distance
   - Respects max_distance_km preference
   - Closer matches score higher

2. **Bio Data Matching** (multiplied by weight)
   - Compares interests, hobbies, music preferences, etc.
   - Categorized by key (interests, music, dietary_preference, occupation)
   - Each match multiplied by the weight assigned to that data point
   - 10 points per matching item × weight

3. **Preference Matching** (weighted)
   - If user has a specific preference (e.g., "looking for musicians")
   - 15 points per matching preference × weight

**Minimum Score**: Recommendations only shown if score > 5 to avoid weak matches

**Ranking**: Highest scoring matches are shown first

## WebSocket Events

Real-time features using Socket.IO:

- `typing` - User started typing
- `stop-typing` - User stopped typing
- `message` - Send message
- `new-message` - Receive message
- `unread-update` - Notification of new unread message
- `user-typing` - Receive typing indicator
- `user-stopped-typing` - Typing ended

## Database Schema

### Users
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email
- `password_hash` (VARCHAR) - bcrypt hashed password
- `is_online` (BOOLEAN) - Online status
- `last_seen_at` (TIMESTAMP) - Last activity
- Timestamps

### Profiles
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `username`, `first_name`, `last_name` - User identifiers
- `bio` (TEXT) - User biography
- `profile_picture_url` (VARCHAR)
- `location` (VARCHAR)
- `latitude`, `longitude` (DECIMAL) - Coordinates for distance calculations

### Bio Data
- `id` (UUID)
- `user_id` (UUID) - Foreign key
- `key` (VARCHAR) - Category (interests, music, dietary_preference, etc.)
- `value` (VARCHAR) - Value (hiking, rock, vegan, etc.)
- `weight` (DECIMAL) - Importance weight for matching

### Preferences
- `id` (UUID)
- `user_id` (UUID) - Foreign key UNIQUE
- `looking_for_key`, `looking_for_value` - What user is looking for
- `max_distance_km` (INTEGER) - Maximum distance for recommendations

### Connections
- `id` (UUID)
- `requester_id`, `receiver_id` (UUID) - Users involved
- `status` (VARCHAR) - pending/accepted/rejected
- Timestamps

### Messages
- `id` (UUID)
- `sender_id`, `receiver_id` (UUID)
- `content` (TEXT)
- `is_read` (BOOLEAN)
- Created at timestamp

### Typing Indicators
- `id` (UUID)
- `user_id`, `receiver_id` (UUID)
- Temporary collection of who is typing to whom

## Building for Production

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
npm run preview
```

## Seed Data

The application includes a seed script that generates realistic test data:

```bash
npm run seed          # Create 150 test users
npm run seed -- 200   # Create 200 test users
```

Test users have:
- Varied locations across 10 major US cities
- Different interests and hobbies
- Various music preferences and dietary restrictions
- Occupations and bios
- Location-based preferences and max distances

Email format for test users: `firstname.lastname1@example.com`, `firstname1@example.com`, etc.
Password: `TestPassword123!`

## Future Enhancements

- [ ] Video chat integration
- [ ] Advanced filters
- [ ] User blocking/reporting
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] User activity feed
- [ ] Match statistics
- [ ] Proximity-based notifications
- [ ] Advanced geospatial queries
- [ ] Caching layer (Redis)
- [ ] Rate limiting

## Security Considerations

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens for session management
- CORS enabled for frontend origin
- Database queries use parameterized statements
- Private email addresses never exposed
- Connection and messaging only between connected users
- Profiles hidden unless recommended, connected, or pending request

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL environment variable
- Ensure database user has proper permissions

### Port Already in Use
- Backend: Change PORT in .env
- Frontend: Vite will prompt for alternative port

### WebSocket Connection Failed
- Ensure backend is running on correct port
- Check CORS_ORIGIN in environment
- Verify Socket.IO client configuration

### Recommendations Not Showing
- Ensure user has complete profile (bio and bio data)
- Check if other users have complete profiles
- Verify their location and distance preferences
- Try dismissing some recommendations to reset the list

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please check the application logs and ensure all prerequisites are properly installed and configured.
