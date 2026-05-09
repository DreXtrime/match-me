# Match-Me

A recommendation platform that connects users based on multiple datapoints.

## Tech Stack

**Backend**: Java 21, Spring Boot, PostgreSQL  
**Frontend**: React, TypeScript, Vite  
**Real-time**: Socket.IO  
**Auth**: JWT + bcrypt  

## Notable Decisions

- Gravatar is used for profile pictures. The backend hashes the user's email and returns a Gravatar URL in all user responses. No image uploads or storage needed.
- GPS location is requested from the browser via the Geolocation API. Coordinates are stored on the profile and used to filter recommendations within the user's chosen max_distance_km radius.

## Matching Algorithm

Recommendations are scored across 5 data points: interests, users preferred friday night activity, music genres, relationship goal, and age. Location acts as a hard filter before scoring. Highest scoring matches are returned first, up to a maximum of 10.

## API

API.md for full endpoint documentation.