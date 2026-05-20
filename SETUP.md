# Match-Me Setup Guide

## Stack

- **Backend:** Java 21 + Spring Boot, Maven, H2 (dev) / PostgreSQL (prod)
- **Frontend:** React 18 + TypeScript + Vite
- **Real-time:** Socket.IO (netty-socketio) on port 3001
- **Auth:** JWT

---

## Quick Start (H2 in-memory — no database setup needed)

### 1. Backend (Terminal 1)

```bash
cd server
./mvnw spring-boot:run
```

On Windows:
```bash
cd server
mvnw.cmd spring-boot:run
```

The server starts on **http://localhost:3000**.  
H2 is used by default — no database installation required.

### 2. Frontend (Terminal 2)

```bash
cd client
npm install
npm run dev
```

The app opens on **http://localhost:5173**.

---

## Seeding Test Users

Set `SEED_DATABASE=true` in `server/.env` (or as an env var) before starting the backend:

```
SEED_DATABASE=true
SEED_USER_COUNT=100   # optional, defaults to 100
```

All seeded users have the password: `password`

Example emails: `alice.smith0@example.com`, `bob.johnson1@example.com`

---

## Environment Variables (Backend)

Copy `.env.example` to `.env` in the `server/` folder. For local development with H2 the defaults work out of the box — no changes needed.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `JWT_SECRET` | (dev default) | Secret for signing JWTs — change in production |
| `JWT_EXPIRATION` | `86400000` | Token lifetime in ms (24 h) |
| `DDL_AUTO` | `create-drop` | Hibernate schema mode |
| `SHOW_SQL` | `false` | Log SQL queries |
| `SEED_DATABASE` | `false` | Populate DB with mock users on startup |
| `SEED_USER_COUNT` | `100` | Number of users to seed |
| `SOCKETIO_PORT` | `3001` | Port for the Socket.IO server |

### PostgreSQL (production)

Fill in the PostgreSQL block in `server/.env` (already uncommented in `.env.example`):

```
DATABASE_URL=jdbc:postgresql://localhost:5432/matchme
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_DRIVER=org.postgresql.Driver
DDL_AUTO=update
```

---

## Environment Variables (Frontend)

Create `client/.env` if you need to override the defaults:

```
VITE_API_URL=http://localhost:3000
VITE_SOCKETIO_URL=http://localhost:3001
```

---

## Key Source Files

| File | Purpose |
|---|---|
| `server/src/main/java/.../service/RecommendationService.java` | Matching algorithm |
| `server/src/main/java/.../service/ConnectionService.java` | Connection requests / accept / reject |
| `server/src/main/java/.../config/WebSocketEventHandler.java` | Real-time events (online status, typing) |
| `server/src/main/resources/application.properties` | Spring configuration |
| `client/src/pages/RecommendationsPage.tsx` | Swipe / discover UI |
| `client/src/context/WebSocketContext.tsx` | Shared Socket.IO client |

---

## API Quick Reference

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get recommendations (replace TOKEN)
curl http://localhost:3000/recommendations \
  -H "Authorization: Bearer TOKEN"
```

---

## Troubleshooting

**Port 3000 in use** — set `PORT=3001` in `server/.env` (and update `VITE_API_URL` in `client/.env`).

**Port 5173 in use** — Vite will automatically suggest an alternative port.

**WebSocket not connecting** — make sure the backend is running and `VITE_SOCKETIO_URL` in `client/.env` points to port 3001.

**PostgreSQL driver error** — ensure `DATABASE_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DRIVER` are all set together. Missing any one of them will cause the driver mismatch on startup.
