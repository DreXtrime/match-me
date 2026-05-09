# Match-Me API Documentation

documentation for the Match-Me backend API endpoints

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```
Tokens are obtained from the login endpoint.

## Match Data Points

The following enums are used across bio endpoints:

```
"interests": "gaming" | "fitness" | "music" | "programming" | "art" | "reading" | "travel" | "food" | "movies" | "sports"

"friday_night_activities": "bar_hopping" | "house_party" | "gaming" | "movies_at_home" | "restaurant" | "clubbing" | "board_games" | "concert" | "takeaway_and_chill" | "outdoor_bonfire"

"music_genres": "rock" | "pop" | "hiphop" | "electronic" | "jazz" | "classical" | "metal" | "indie"

"relationship_goal": "friendship" | "dating" | "networking" | "activity"

"age": number

```

---

## API Endpoints

### Authentication

#### Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user account
- **Auth Required**: No
- **Request Body**:
  ```json
  { "email": "string", "password": "string" }
  ```
- **Response**:
  ```json
  { "token": "string" }
  ```
- **Error Response**:
  ```json
  { "error": "Email already in use" }
  ```
- **Status Codes**: 201 Created, 400 Bad Request

---

#### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and receive a JWT
- **Auth Required**: No
- **Request Body**:
  ```json
  { "email": "string", "password": "string" }
  ```
- **Response**:
  ```json
  { "token": "string" }
  ```
- **Error Response**:
  ```json
  { "error": "Invalid credentials" }
  ```
- **Status Codes**: 200 OK, 401 Unauthorized

---

### Current User (Me)

#### Get Current User
- **Endpoint**: `GET /me`
- **Description**: Shortcut to `/users/:id` for the authenticated user. Returns name and profile picture.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "profile_picture": "string"
  }
  ```

---

#### Get Current User Profile
- **Endpoint**: `GET /me/profile`
- **Description**: Get the authenticated user's full profile including email.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "about_me": "string",
    "profile_picture": "string",
    "max_distance_km": "number",
    "longitude": "number",
    "latitude": "number"
  }
  ```

---

#### Get Current User Bio
- **Endpoint**: `GET /me/bio`
- **Description**: Get the authenticated user's biographical matching data.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "age": number,
    "interests": ["string"],
    "friday_night_activities": ["string"],
    "music_genres": ["string"],
    "relationship_goal": "friendship"
  }
  ```

---

#### Update Current User Profile
- **Endpoint**: `PUT /me/profile`
- **Description**: Create or update the authenticated user's profile.
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "about_me": "string",
    "max_distance_km": "number",
    "longitude": "number",
    "latitude": "number"
  }
  ```
- **Response**:
  ```json
  { "message": "Updated" }
  ```
- **Status Codes**: 200 OK

---

#### Update Current User Bio
- **Endpoint**: `PUT /me/bio`
- **Description**: Create or update the authenticated user's bio data.
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "age": number,
    "interests": ["string"],
    "friday_night_activities": ["string"],
    "music_genres": ["string"],
    "relationship_goal": "friendship"
  }
  ```
- **Response**:
  ```json
  { "message": "Updated" }
  ```
- **Status Codes**: 200 OK

---

### Users

#### Get User by ID
- **Endpoint**: `GET /users/:id`
- **Description**: Get a user's name and profile picture. Only accessible if the user is recommended, pending, or connected.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "profile_picture": "string"
  }
  ```
- **Error Response**:
  ```json
  { "error": "Not found" }
  ```
- **Status Codes**: 200 OK, 404 Not Found

---

#### Get User Profile by ID
- **Endpoint**: `GET /users/:id/profile`
- **Description**: Get a user's about me information. No email is returned. Returns 404 if not permitted to view.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "first_name": "string",
    "last_name": "string",
    "about_me": "string",
    "profile_picture": "string"
  }
  ```
- **Error Response**:
  ```json
  { "error": "Not found" }
  ```
- **Status Codes**: 200 OK, 404 Not Found

---

#### Get User Bio by ID
- **Endpoint**: `GET /users/:id/bio`
- **Description**: Get a user's biographical data. Returns 404 if not permitted to view.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "age": 25,
    "interests": ["string"],
    "music_genres": ["string"],
    "friday_night_activities": ["string"],
    "relationship_goal": "friendship"
  }
  ```
- **Error Response**:
  ```json
  { "error": "Not found" }
  ```
- **Status Codes**: 200 OK, 404 Not Found

---

### Recommendations

#### Get Recommendations
- **Endpoint**: `GET /recommendations`
- **Description**: Get up to 10 recommended user IDs, sorted strongest match first. User must have a complete profile and bio.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "recommendations": ["uuid"] }
  ```
- **Error Response**:
  ```json
  { "error": "Complete your profile before viewing recommendations" }
  ```
- **Status Codes**: 200 OK, 400 Bad Request

---

#### Dismiss Recommendation
- **Endpoint**: `POST /recommendations/:id/dismiss`
- **Description**: Dismiss a recommended user so they never appear again.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "message": "Dismissed" }
  ```
- **Status Codes**: 200 OK

---

### Connections

#### Get Connections
- **Endpoint**: `GET /connections`
- **Description**: Get all accepted connections as a list of IDs.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "connections": ["uuid"] }
  ```

---

#### Get Connection Requests
- **Endpoint**: `GET /connections/requests`
- **Description**: Get pending incoming connection requests as a list of IDs.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "requests": ["uuid"] }
  ```

---

#### Send Connection Request
- **Endpoint**: `POST /connections/:id/request`
- **Description**: Send a connection request to a user.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "message": "Request sent" }
  ```
- **Error Response**:
  ```json
  { "error": "Already requested or connected" }
  ```
- **Status Codes**: 201 Created, 400 Bad Request

---

#### Accept Connection Request
- **Endpoint**: `POST /connections/:id/accept`
- **Description**: Accept an incoming connection request.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "message": "Connected" }
  ```
- **Status Codes**: 200 OK

---

#### Decline Connection Request
- **Endpoint**: `POST /connections/:id/decline`
- **Description**: Decline an incoming connection request.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "message": "Declined" }
  ```
- **Status Codes**: 200 OK

---

#### Delete Connection
- **Endpoint**: `DELETE /connections/:id`
- **Description**: Disconnect from an accepted connection.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "message": "Disconnected" }
  ```
- **Status Codes**: 200 OK

---

### Chat

#### Get Chats
- **Endpoint**: `GET /chats`
- **Description**: Get all chat conversations ordered by most recent. Includes unread count per chat.
- **Auth Required**: Yes
- **Response**:
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

#### Get Chat Messages
- **Endpoint**: `GET /chats/:userId`
- **Description**: Get paginated message history between the current user and another user. Must be connected.
- **Auth Required**: Yes
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 20)
- **Response**:
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
- **Error Response**:
  ```json
  { "error": "Not found" }
  ```
- **Status Codes**: 200 OK, 404 Not Found

---

## WebSocket Events

### Connection
WebSocket connections require a JWT token passed in the handshake auth:
```
socket.handshake.auth.token
```

---

#### Send Message
- **Client emits**: `message:send`
- **Payload**:
  ```json
  { "receiver_id": "uuid", "content": "string" }
  ```
- **Server emits to recipient**: `message:receive`
- **Payload**:
  ```json
  {
    "id": "uuid",
    "sender_id": "uuid",
    "content": "string",
    "created_at": "timestamp"
  }
  ```

---

#### Typing Indicator
- **Client emits**: `typing:start` or `typing:stop`
- **Payload**:
  ```json
  { "receiver_id": "uuid" }
  ```
- **Server emits to recipient**: `typing:indicator`
- **Payload**:
  ```json
  { "sender_id": "uuid", "typing": "boolean" }
  ```

---

#### Online Status Init
- **Server emits on connect**: `online:init`
- **Description**: Immediately sent to the client on socket connection with the online status of all their connections.
- **Payload**:
  ```json
  { "online_users": ["uuid"] }
  ```

---

#### Online Status Change
- **Server emits**: `user:online`
- **Description**: Sent when any connection's online status changes.
- **Payload**:
  ```json
  { "user_id": "uuid", "online": "boolean" }
  ```

---

## Error Handling

The API returns standard HTTP status codes. Common error responses include:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found or user does not have permission to view it
- `500 Internal Server Error`: Server error

> `/users/:id` endpoints return 404 for both "not found" and "not permitted to view" intentionally. This avoids confirming that a user exists to someone who should not see them.
- Logout is handled client-side by discarding the JWT, no server endpoint needed
- Pagination uses `page` and `limit` query parameters
- WebSocket connections require JWT token in `socket.handshake.auth.token`
- Dates are returned in ISO 8601 format
- Profile visibility is restricted: profiles are only viewable if the user is recommended, has a pending connection request, or is connected
