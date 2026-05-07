# Match-Me API Contracts

## Match data points
```
  "interests": [
    "gaming",
    "fitness",
    "music",
    "programming",
    "art",
    "reading",
    "travel",
    "food",
    "movies",
    "sports"
  ],
  ```

  ```
  "friday_night_activities": [
    "bar_hopping",
    "house_party",
    "gaming",
    "movies_at_home",
    "restaurant",
    "clubbing",
    "board_games",
    "concert",
    "takeaway_and_chill",
    "outdoor_bonfire"
  ]
  ```

  ```
  "music_genres": [
    "rock",
    "pop",
    "hiphop",
    "electronic",
    "jazz",
    "classical",
    "metal",
    "indie"
  ],
  ```

  ```
  "relationship_goal": "friendship" | "dating" | "networking" | "activity",
  ```
  ```
  "age": "number"
  ```

## Auth

### POST /auth/register
Register a new user account

**Request body**
```json
{ "email": "string", "password": "string" }
```
**Response**
```json
{ "token": "string" }
```

```json
{ "error": "Email already in use" }
```

---

### POST /auth/login
Log in and receive a JWT

**Request body**
```json
{ "email": "string", "password": "string" }
```

**Response**
```json
{ "token": "string" }
```

```json
{ "error": "Invalid credentials" }
```

---

## Current User (me)

### GET /me (auth)
shortcut to `/users/{id}` for the authenticated user

**Response**
```json
{
  "id": "uuid",
  "name": "string",
  "profile_picture": "string | null"
}
```

---

### GET /me/profile (auth)

**Response**
```json
{
  "id": "uuid",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "about_me": "string",
  "profile_picture": "string | null",
  "city": "string"
}
```

---

### GET /me/bio (auth)

**Response**
```json
{
  "id": "uuid",
  "age": 25,
  "interests": ["string"],
  "friday_night_activities": ["string"],
  "music_genres": ["string"],
  "relationship_goal": "friendship",
}
```

### PUT /me/profile (auth)

**Request body**
```json
{
  "first_name": "string",
  "last_name": "string",
  "about_me": "string",
  "profile_picture": "string | null",
  "city": "string"
}
```
**Response**
```json
{ "message": "Updated" }
```

### PUT /me/bio (auth)

**Request body**
```json
{
  "age": 25,
  "interests": ["string"],
  "music_genres": ["string"],
  "friday_night_activities": ["string"],
  "relationship_goal": "friendship",
}
```
**Response**
```json
{ "message": "Updated" }
```

---

## Users

### GET /users/:id (auth)

**Response**
```json
{
  "id": "uuid",
  "name": "string",
  "profile_picture": "string | null"
}
```

**Response**
```json
{ "error": "Not found" }
```

---

### GET /users/:id/profile (auth)

**Response**
```json
{
  "id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "about_me": "string",
  "profile_picture": "string | null",
  "city": "string"
}
```

```json
{ "error": "Not found" }
```

---

### GET /users/:id/bio (auth)

**Response**
```json
{
  "id": "uuid",
  "age": 25,
  "interests": ["string"],
  "music_genres": ["string"],
  "friday_night_activities": ["string"],
  "relationship_goal": "friendship",
}

```

```json
{ "error": "Not found" }
```

---

## Recommendations

### GET /recommendations (auth)

**Response**
```json
{ "recommendations": ["uuid"] }
```

```json
{ "error": "Complete your profile before viewing recommendations" }
```

---

### POST /recommendations/:id/dismiss (auth)

**Response**
```json
{ "message": "Dismissed" }
```

---

## Connections

### GET /connections (auth)

**Response**
```json
{ "connections": ["uuid"] }
```

---

### GET /connections/requests (auth)

**Response**
```json
{ "requests": ["uuid"] }
```

---

### POST /connections/:id/request (auth)

**Response**
```json
{ "message": "Request sent" }
```

```json
{ "error": "Already requested or connected" }
```

---

### POST /connections/:id/accept (auth)

**Response**
```json
{ "message": "Connected" }
```

---

### POST /connections/:id/decline (auth)

**Response**
```json
{ "message": "Declined" }
```

---

### DELETE /connections/:id (auth)

**Response**
```json
{ "message": "Disconnected" }
```

---

## Chat

### GET /chats (auth)

**Response**
```json
{
  "chats": [
    {
      "user_id": "uuid",
      "unread_count": "number"
    }
  ]
}
```

---

### GET /chats/:userId?page=1&limit=20 (auth)

**Response**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "content": "string",
      "is_read": "boolean",
      "created_at": "timestamp"
    }
  ],
  "page": "number",
  "total_pages": "number"
}
```

```json
{ "error": "Not found" }
```

---

## WebSocket Events

### message:send → message:receive

**Client emits**
```json
{ "receiver_id": "uuid", "content": "string" }
```

**Server emits**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "content": "string",
  "created_at": "timestamp"
}
```

---

### typing:start / typing:stop → typing:indicator

**Client emits**
```json
{ "receiver_id": "uuid" }
```

**Server emits**
```json
{ "sender_id": "uuid", "typing": "boolean" }
```

---

### event: "online:init"
```json
{ "online_users": ["uuid", "uuid"] }
```

### user:online

**Server emits**
```json
{ "user_id": "uuid", "online": "boolean" }
```
