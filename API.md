# Match-Me API Documentation

Documentation for the Match-Me backend API endpoints.

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```
Tokens are obtained from the login/register endpoint.

## Match Data Points

The following enums are used across bio endpoints:

```
"interests": "gaming" | "fitness" | "music" | "programming" | "art" | "reading" | "travel" | "food" | "movies" | "sports"

"fridayNightActivities": "bar_hopping" | "house_party" | "gaming" | "movies_at_home" | "restaurant" | "clubbing" | "board_games" | "concert" | "takeaway_and_chill" | "outdoor_bonfire"

"musicGenres": "rock" | "pop" | "hiphop" | "electronic" | "jazz" | "classical" | "metal" | "indie"

"relationshipGoal": "friendship" | "dating" | "networking" | "activity"

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
  { "userId": "uuid", "token": "string" }
  ```
- **Error Response**:
  ```json
  { "message": "Email already in use" }
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
  { "userId": "uuid", "token": "string" }
  ```
- **Error Response**:
  ```json
  { "message": "Invalid credentials" }
  ```
- **Status Codes**: 200 OK, 401 Unauthorized

---

### Current User (Me)

#### Get Current User
- **Endpoint**: `GET /me`
- **Description**: Shortcut to `/users/:id` for the authenticated user. Returns name, profile picture, and online status.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "profilePicture": "string",
    "isOnline": true
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
    "firstName": "string",
    "lastName": "string",
    "aboutMe": "string",
    "profilePicture": "string",
    "maxDistanceKm": "number",
    "latitude": "number",
    "longitude": "number"
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
    "age": 25,
    "interests": ["string"],
    "fridayNightActivities": ["string"],
    "musicGenres": ["string"],
    "relationshipGoal": "friendship"
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
    "firstName": "string",
    "lastName": "string",
    "aboutMe": "string",
    "profilePictureUrl": "string | null",
    "maxDistanceKm": 50,
    "latitude": null,
    "longitude": null
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
    "age": 25,
    "interests": ["gaming", "fitness"],
    "fridayNightActivities": ["bar_hopping", "gaming"],
    "musicGenres": ["rock", "pop"],
    "relationshipGoal": "friendship"
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
- **Description**: Get a user's name, profile picture, and online status. Only accessible if the user is recommended, pending, or connected.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "profilePicture": "string",
    "isOnline": true
  }
  ```
- **Error Response**:
  ```json
  { "message": "Not found" }
  ```
- **Status Codes**: 200 OK, 404 Not Found

---

#### Get User Profile by ID
- **Endpoint**: `GET /users/:id/profile`
- **Description**: Get a users about me information. No email is returned. Returns 404 if not permitted to view.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "aboutMe": "string",
    "profilePicture": "string"
  }
  ```
- **Error Response**:
  ```json
  { "message": "Not found" }
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
    "fridayNightActivities": ["string"],
    "musicGenres": ["string"],
    "relationshipGoal": "friendship"
  }
  ```
- **Error Response**:
  ```json
  { "message": "Not found" }
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
  { "message": "Complete your profile before viewing recommendations" }
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
  { "message": "Already requested or connected" }
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
- **Description**: Disconnect from an accepted connection. The user will not be recommended again.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "message": "Disconnected" }
  ```
- **Status Codes**: 200 OK

---

### Messages

#### Send Message
- **Endpoint**: `POST /messages?receiverId=:id`
- **Description**: Send a message to a connected user. Returns 400 if sender and receiver are not connected.
- **Auth Required**: Yes
- **Request Body**:
  ```json
  { "content": "string" }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "senderId": "uuid",
    "receiverId": "uuid",
    "content": "string",
    "isRead": false,
    "createdAt": "ISO 8601"
  }
  ```
- **Status Codes**: 201 Created, 400 Bad Request

---

#### Get Chat History
- **Endpoint**: `GET /chats/:id/messages?page=0&size=50`
- **Description**: Get paginated message history between the authenticated user and another user. Messages are returned newest-first. Automatically marks received messages as read.
- **Auth Required**: Yes
- **Response**: Spring `Page<MessageResponse>`
  ```json
  {
    "content": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "receiverId": "uuid",
        "content": "string",
        "isRead": true,
        "createdAt": "ISO 8601"
      }
    ],
    "totalElements": 42,
    "totalPages": 1
  }
  ```
- **Status Codes**: 200 OK, 400 Bad Request

---

#### Get Chats List
- **Endpoint**: `GET /chats`
- **Description**: Get all conversations the authenticated user has participated in, sorted by most recent message.
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "chats": [
      { "id": "uuid", "lastMessageTime": "ISO 8601" }
    ]
  }
  ```
- **Status Codes**: 200 OK

---

#### Get Unread Message Count
- **Endpoint**: `GET /messages/unread/count`
- **Description**: Get the total number of unread messages received by the authenticated user.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "unreadCount": 3 }
  ```
- **Status Codes**: 200 OK

---

#### Mark Message as Read
- **Endpoint**: `PUT /messages/:id/read`
- **Description**: Mark a specific received message as read.
- **Auth Required**: Yes
- **Response**:
  ```json
  { "message": "Message marked as read" }
  ```
- **Status Codes**: 200 OK, 400 Bad Request (if not the receiver), 404 Not Found

---

### Real-time (Socket.IO)

The server runs a Socket.IO server on port **3001**. Connect with:
```json
{ "query": { "token": "<jwt>", "userId": "<uuid>" } }
```

| Event (client → server) | Payload | Description |
|---|---|---|
| `user-typing` | `{ "receiverId": "uuid" }` | Notify the other user you are typing |
| `user-stopped-typing` | `{ "receiverId": "uuid" }` | Notify typing has stopped |

| Event (server → client) | Payload | Description |
|---|---|---|
| `new-message` | Full message object | Delivered only to the recipient when a message is sent |
| `unread-update` | `{ "userId": "uuid" }` | Tells the client to refresh its unread count |
| `user-typing` | `{ "userId": "uuid" }` | Forwarded to the recipient |
| `user-stopped-typing` | `{ "userId": "uuid" }` | Forwarded to the recipient |
| `user-online` | `"uuid"` | Broadcast to all clients when a user connects |
| `user-offline` | `"uuid"` | Broadcast to all clients after a 5-minute grace period following disconnect |
| `connection-request` | `{ "fromUserId": "uuid" }` | Delivered to the recipient when someone sends them a connection request |

---

## Error Handling

The API returns standard HTTP status codes. Common error responses include:

- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found or user does not have permission to view it
- `500 Internal Server Error`: Server error

> `/users/:id` endpoints return 404 for both "not found" and "not permitted to view" intentionally. This avoids confirming that a user exists to someone who should not see them.

## Notes

- Logout is handled client-side by discarding the JWT
- Dates are returned in ISO 8601 format
- Profile visibility is restricted: profiles are only viewable if the user is recommended, has a pending connection request, or is connected