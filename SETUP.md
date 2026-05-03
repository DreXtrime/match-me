# Match-Me Setup Guide

## Quick Start

### 1. Backend Setup (Terminal 1)
```bash
cd server
npm install
npm run seed  # Creates 150 test users
npm run dev
```

### 2. Frontend Setup (Terminal 2)
```bash
cd client
npm install
npm run dev
```

### 3. Database Setup
```bash
createdb matchme
psql matchme < database/schema.sql
```

## Testing the Application

### Test Credentials
Any user created during seed has password: `TestPassword123!`

Example emails:
- `james.smith1@example.com`
- `mary.johnson1@example.com`
- `robert.williams1@example.com`

### Features to Try

1. **Sign up and complete profile**
   - Create account with email/password
   - Fill in profile with interests

2. **Browse recommendations**
   - Visit /recommendations
   - Like or pass on recommendations
   - Dismissed users won't appear again

3. **Connect with people**
   - Send connection requests from recommendations
   - View pending requests in /connections
   - Accept/reject requests

4. **Chat with connections**
   - Once connected, start a chat
   - Real-time messaging with typing indicators
   - See online/offline status

## Important Files

- `server/src/services/matching.ts` - Matching algorithm implementation
- `server/database/schema.sql` - Database schema
- `server/database/seed.ts` - Test data generator
- `client/src/pages/RecommendationsPage.tsx` - Recommendation UI

## Customization

### Change matching algorithm weights
Edit `server/src/services/matching.ts` - adjust scores in `calculateBioDataMatches` and `getRecommendations`

### Add more interests
Edit `database/seed.ts` - modify the `INTERESTS` array

### Change locations
Edit `database/seed.ts` - modify the `LOCATIONS` array

## API Testing

Use `curl` or Postman to test endpoints:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get recommendations (with token)
curl -X GET http://localhost:3000/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Port 3000 in use
Edit `.env` PORT variable

### Port 5173 in use
Vite will prompt for alternative

### Database already exists
Drop and recreate:
```bash
dropdb matchme
createdb matchme
psql matchme < database/schema.sql
npm run seed
```

### WebSocket not connecting
- Verify backend is running
- Check browser console for errors
- Ensure token is in localStorage

## Performance Notes

- Recommendations calculated in real-time
- For 1000+ users, consider adding caching or async job queue
- Distance calculations using Haversine formula
- Indexed queries on frequently filtered fields
