# Match-Me

A recommendation platform that connects users based on multiple datapoints.

## Tech Stack

**Backend**: Java 21, Spring Boot, PostgreSQL  
**Frontend**: React, TypeScript, Vite  
**Auth**: JWT + bcrypt

## Notable Decisions

- Gravatar is used for profile pictures. The backend hashes the user's email and returns a Gravatar URL in all user responses. No image uploads or storage needed.
- GPS location would be requested from the browser via the Geolocation API. Coordinates are stored on the profile and used to filter recommendations within the user's chosen max_distance_km radius.

## Matching Algorithm

Recommendations are scored across 5 data points: interests, users preferred friday night activity, music genres, relationship goal, and age. Location acts as a hard filter before scoring. Highest scoring matches are returned first, up to a maximum of 10.

## Prerequisites
- Java 21
- Maven
- Docker (recommended) or PostgreSQL

## Database Setup

<details>
<summary>Docker (recommended)</summary>

Start the database:
```bash
docker compose up
```

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

</details>

## Backend Setup

1. Copy the example env file and fill in your values:
```bash
   cd server/
   cp .env.example .env
```

2. Run the server:
```bash
   mvn spring-boot:run
```

Spring Boot will create all database tables automatically on first run.

## Mock User Seeding

Enable user seeding by the two .env variables:
```bash
SEED_DATABASE=true
SEED_USER_COUNT=200
```

Wipe the database on every launch using:
```bash
DDL_AUTO=create
```


## API

API.md for full endpoint documentation.