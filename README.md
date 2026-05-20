# Match-Me

A recommendation platform that connects users based on multiple datapoints.

## Tech Stack

**Backend**: Java 21, Spring Boot, H2 (dev) / PostgreSQL (prod)  
**Frontend**: React, TypeScript, Vite  
**Auth**: JWT + bcrypt  
**Real-time**: Socket.IO

## Notable Decisions

- Profile pictures: users can set a custom URL via `PUT /me/profile`. If none is set, the backend falls back to a Gravatar URL derived from the user's email. No image uploads or storage needed.
- GPS location is requested from the browser via the Geolocation API. Coordinates are stored on the profile and used as a hard filter before scoring — only users within the chosen `maxDistanceKm` radius are recommended.
- Real-time features (new messages, typing indicators, unread count updates) use Socket.IO. The client connects on login and disconnects on logout. No polling.

## Matching Algorithm

Recommendations are scored across 5 data points: interests, preferred friday night activity, music genres, relationship goal, and age. Location acts as a hard filter before scoring. Highest scoring matches are returned first, up to a maximum of 10.

## Prerequisites

- Java 21
- Node.js (v18+) + npm

> Maven is not required — the project includes a Maven wrapper (`mvnw`) that downloads it automatically.

## Running Locally

The backend uses an **in-memory H2 database by default** — no database installation needed.

### 1. Start the backend

```bash
cd server
./mvnw spring-boot:run
```

Windows:
```bash
cd server
mvnw.cmd spring-boot:run
```

Runs on **http://localhost:3000**. Tables are created automatically on startup.

> If port 3000 is already in use:
> ```bash
> # Mac/Linux
> PORT=9090 ./mvnw spring-boot:run
> # Windows PowerShell
> $env:PORT=9090; mvnw.cmd spring-boot:run
> ```
> Then update `VITE_API_URL` in `client/.env` to match.

### 2. Start the frontend

```bash
cd client
npm install
npm run dev
```

Mac/Linux — copy the example env file if you don't have one yet:
```bash
cp .env.example .env
```
Windows:
```bash
copy .env.example .env
```

Runs on **http://localhost:5173**.

The `.env` file should contain:
```
VITE_API_URL=http://localhost:3000
VITE_SOCKETIO_URL=http://localhost:3001
```

## Mock User Seeding

Add these to `server/.env` before starting the backend:

```
SEED_DATABASE=true
SEED_USER_COUNT=200
```

All seeded users have the password: `password`

## Production Database (PostgreSQL)

<details>
<summary>Docker (recommended)</summary>

```bash
docker compose up -d
```

This starts a PostgreSQL instance on port **5433** with the credentials already set in `server/.env.example`.

</details>

<details>
<summary>Manual</summary>

Make sure PostgreSQL is running, then create the database:
```bash
createdb matchme
```

If you don't have a PostgreSQL user yet:
```bash
sudo -u postgres createuser --superuser your_username
```

Then fill in `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DRIVER` in `server/.env` before starting the backend.

</details>

## API

See `API.md` for full endpoint documentation.
