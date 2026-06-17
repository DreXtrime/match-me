# Match-Me

A recommendation platform that connects users based on multiple datapoints. Implements a realtime chat, status updates, distance filtering and more. Features a responsive design for desktop and mobile devices.

![Screenshot](./assets/screenshots/screenshot_1.png)

---

## Tech Stack

**Backend**: Java 21, Spring Boot, H2 (dev) / PostgreSQL (prod)  
**Frontend**: React, TypeScript, Vite  
**Auth**: JWT + bcrypt  
**Real-time**: Socket.IO

## Notable Decisions

- Profile pictures: users can set a custom URL via `PUT /me/profile`. If none is set, the backend falls back to a Gravatar URL derived from the user's email. No image uploads or storage needed.
- GPS location is requested from the browser via the Geolocation API. Coordinates are stored on the profile and used as a hard filter before scoring — only users within the chosen `maxDistanceKm` radius are recommended.
- Real-time features (new messages, typing indicators, unread count updates) use Socket.IO. The client connects on login and disconnects on logout. No polling.
- Dates are only shown under chat messages sent yesterday or earlier

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
chmod +x ./mvnw
./mvnw spring-boot:run
```

Windows:
```bash
cd server
mvnw.cmd spring-boot:run
```

Runs on **http://localhost:3000**. Tables are created automatically on startup.

---
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

Make sure Docker is installed

```bash
docker compose up -d
```

This starts a PostgreSQL instance on port **5433** with the credentials already set in `server/.env.example`.

</details>

<details>
<summary>Manual</summary>

Make sure PostgreSQL is installed and running, then create the database:
```bash
createdb matchme
```

If you don't have a PostgreSQL user yet:
```bash
sudo -u postgres createuser --superuser your_username
```

Then fill in `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DRIVER` in `server/.env` before starting the backend.

</details>

## Environment Variables (Backend)

Copy `.env.example` to `.env` in the `server/` folder.

| Variable           | Default                                   | Description                                                                           |
|--------------------|-------------------------------------------|---------------------------------------------------------------------------------------|
| `PORT`             | `3000`                                    | HTTP server port                                                                      |
| `SOCKETIO_PORT`    | `3001`                                    | Port for the Socket.IO server                                                         |
| `JWT_SECRET`       | (dev default)                             | Secret for signing JWTs — change in production                                        |
| `JWT_EXPIRATION`   | `86400000`                                | Token lifetime in ms (24 h)                                                           |
| `DDL_AUTO`         | `create-drop`                             | wipes and recreates database on launch, set to `update` to keep data between restarts |
| `SHOW_SQL_QUERIES` | `false`                                   | Log SQL queries in console                                                            |
| `SEED_DATABASE`    | `false`                                   | Populate DB with mock users on startup                                                |
| `SEED_USER_COUNT`  | `100`                                     | Number of users to seed                                                               |
| `DATABASE_URL`     | `jdbc:postgreql://localhost:5433/matchme` | Database connection url                                                               |
| `DB_USERNAME`      | `postgres`                                | Database username                                                                     |
| `DB_PASSWORD`      | `postgres`                                | Database password                                                                     |

## Environment Variables (Frontend)

Copy `.env.example` to `.env` in the `client/` folder.

| Variable            | Default                 | Description                 |
|---------------------|-------------------------|-----------------------------|
| `VITE_API_URL`      | `http://localhost:3000` | URL to the backend API      |
| `VITE_SOCKETIO_URL` | `http://localhost:3001` | URL to the backend SocketIO |

## API

See `API.md` for full endpoint documentation.

## Credits

Andreas Taavi Talu
Tauri Metsis
Tanel Erik Neitov
