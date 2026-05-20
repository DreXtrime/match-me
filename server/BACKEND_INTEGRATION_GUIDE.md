# Backend Integration Summary

## Overview
The Match-Me backend has been fully enhanced with a complete real-time messaging layer that works seamlessly with the frontend. All messaging, WebSocket, and API integrations are production-ready.

## Core Components Implemented

### 1. Data Layer 📊

#### MessageRepository.java
```java
// Location: src/main/java/com/matchme/server/repository/MessageRepository.java
```
- Handles all message persistence queries
- Key Methods:
  - `findChatMessages()` - Get paginated message history between two users
  - `findUnreadMessages()` - Get all unread messages for a user
  - `countUnreadMessages()` - Count unread messages
  - `findChatPartners()` - Get list of users conversation with
  - `findLastMessage()` - Get most recent message in a chat

### 2. Business Logic Layer 💼

#### MessageService.java
```java
// Location: src/main/java/com/matchme/server/service/MessageService.java
```
- Orchestrates message operations with business rules
- Key Methods:
  - `sendMessage()` - Validates connection, saves message, emits WebSocket event
  - `getChatMessages()` - Fetches paginated history, marks messages as read
  - `getChats()` - Returns list of active chats with last message time
  - `getUnreadCount()` - Returns count of unread messages
  - `markAsRead()` - Updates message read status and emits event

- **Validation Rules**:
  - Messages only allowed between connected users
  - Automatic marking of received messages as read
  - Real-time event emission via Socket.IO

### 3. API Layer 🌐

#### MessageController.java
```java
// Location: src/main/java/com/matchme/server/controller/MessageController.java
```
REST Endpoints:
```
POST   /messages?receiverId={uuid}           - Send message
GET    /chats                                 - List all chats
GET    /chats/{userId}/messages?page=0&size=50 - Paginated history
GET    /messages/unread/count                 - Unread count
PUT    /messages/{id}/read                   - Mark as read
```

- **Request/Response DTOs**:
  - `SendMessageRequest`: Validates `@NotBlank String content`
  - `MessageResponse`: Full message with all metadata
  - `ChatItemResponse`: Chat list items with timestamps

### 4. WebSocket Layer 🔌

#### WebSocketConfig.java
```java
// Location: src/main/java/com/matchme/server/config/WebSocketConfig.java
```
- Creates Socket.IO server bean
- Configuration:
  - Host: `0.0.0.0` (all interfaces)
  - Port: `${SOCKETIO_PORT}` (default 3001)
  - Context: `/socket.io`
  - Auto-starts on application ready

#### WebSocketEventHandler.java
```java
// Location: src/main/java/com/matchme/server/socket/WebSocketEventHandler.java
```
Event Handlers:
- `@OnConnect` - Authenticate user, set online status, emit user-online event
- `@OnDisconnect` - Clear session, set offline status, emit user-offline event
- `@OnEvent("user-typing")` - Relay typing indicator to recipient
- `@OnEvent("user-stopped-typing")` - Relay stop-typing to recipient

#### SocketIOServerInitializer.java
```java
// Location: src/main/java/com/matchme/server/socket/SocketIOServerInitializer.java
```
- Lifecycle hook to start Socket.IO server on app startup
- Triggered by `ApplicationReadyEvent`

### 5. Existing Components (Unchanged)

#### User.java
- Added field: `boolean isOnline` (updated by WebSocket handler)
- Used for online status tracking

#### Message.java (Model)
- Fields: `id`, `sender`, `receiver`, `content`, `isRead`, `readAt`, `createdAt`
- No modifications needed (already complete)

#### JwtUtil.java
- Method: `isTokenValid(String token)` - Used for WebSocket authentication
- Method: `extractUserId(String token)` - Extract user UUID from token

## Configuration

### Environment Variables
```properties
# WebSocket Configuration
SOCKETIO_PORT=3001
SOCKETIO_HOST=0.0.0.0

# Database (existing)
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/matchme
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password

# JWT (existing)
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000
```

### Dependencies Added
```xml
<dependency>
  <groupId>com.corundumstudio.socketio</groupId>
  <artifactId>netty-socketio</artifactId>
  <version>2.0.11</version>
</dependency>
```

## API Response Examples

### Send Message
```
POST /messages?receiverId=12345678-1234-1234-1234-123456789012
Body: { "content": "Hello!" }

Response:
{
  "id": "87654321-4321-4321-4321-210987654321",
  "senderId": "user-uuid",
  "receiverId": "12345678-1234-1234-1234-123456789012",
  "content": "Hello!",
  "isRead": false,
  "createdAt": "2024-05-17T10:30:00Z"
}
```

### Get Chats
```
GET /chats

Response:
[
  {
    "id": "12345678-1234-1234-1234-123456789012",
    "lastMessageTime": "2024-05-17T10:30:00Z"
  },
  {
    "id": "87654321-4321-4321-4321-210987654321",
    "lastMessageTime": "2024-05-17T10:25:00Z"
  }
]
```

### Get Chat History (Paginated)
```
GET /chats/12345678-1234-1234-1234-123456789012/messages?page=0&size=50

Response (Page object):
{
  "content": [
    {
      "id": "msg-uuid",
      "senderId": "user-uuid",
      "receiverId": "12345678-1234-1234-1234-123456789012",
      "content": "Previous message",
      "isRead": true,
      "createdAt": "2024-05-17T09:00:00Z"
    }
  ],
  "totalElements": 150,
  "totalPages": 3,
  "currentPage": 0,
  "hasNext": true,
  "hasPrevious": false
}
```

### Unread Count
```
GET /messages/unread/count

Response:
{
  "unreadCount": 5
}
```

## WebSocket Event Flow

### User A sends message to User B:

1. **Frontend (User A)**:
   - REST: `POST /messages?receiverId=B`
   - Response: Message object
   - WebSocket: Waits for server emission

2. **Backend**:
   - Validates A and B are connected
   - Saves message to database
   - Emits `new-message` to User B's Socket.IO session
   - Emits `unread-update` broadcast to all clients

3. **Frontend (User B)**:
   - Receives `new-message` event
   - Adds message to chat UI
   - Auto-marks as read via REST
   - Receives `unread-update` event
   - Updates unread badge

### Typing Indicator:

1. **Frontend (User A)**: WebSocket emit `user-typing` with `receiverId`
2. **Backend**: Relay to User B's session
3. **Frontend (User B)**: Display "User A is typing..."
4. **Frontend (User A)**: After 2 seconds emit `user-stopped-typing`
5. **Backend**: Relay to User B
6. **Frontend (User B)**: Hide typing indicator

## Database Migrations

### New Tables
- `messages` table (if not exists):
  ```sql
  CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_users CHECK (sender_id != receiver_id)
  );
  ```

### Index Recommendations
```sql
CREATE INDEX idx_messages_receiver_created ON messages(receiver_id, created_at DESC);
CREATE INDEX idx_messages_sender_receiver_created ON messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(receiver_id, is_read);
```

## Security Considerations

- **JWT Token Validation**: All WebSocket connections must provide valid JWT token
- **User Isolation**: Users can only message connected users
- **Connection Validation**: Messages only between accepted connections
- **Rate Limiting**: Recommended to add rate limiting for message sends
- **CORS**: Configure CORS for frontend domain in production

## Performance Notes

- Messages paginated (50 per page)
- Database queries use pagination
- WebSocket events use broadcasting for efficiency
- Connection state cached in memory (Map<UUID, String>)
- Recommend adding caching for frequently accessed data

## Testing Scenarios

### Scenario 1: Basic Messaging
1. User A and B connect
2. A sends message to B
3. B receives message in real-time
4. B's unread count increases
5. B opens chat, messages marked as read

### Scenario 2: Typing Indicators
1. User A starts typing
2. User B sees "typing..." indicator
3. User A stops typing (2 sec timeout)
4. Indicator disappears

### Scenario 3: Multiple Chats
1. User A has chats with B, C, D
2. Each chat shows last message time
3. Chats sorted by most recent first
4. Switching between chats works smoothly

### Scenario 4: Offline Messages
1. User A sends message to User B
2. User B is offline
3. Message saved to database
4. When B comes online, message appears
5. Unread count accurate

## Build & Deploy

### Build
```bash
cd web/server
./mvnw clean package
```

### Run
```bash
java -jar target/server-0.0.1-SNAPSHOT.jar \
  --SOCKETIO_PORT=3001 \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/matchme \
  --spring.datasource.username=postgres \
  --spring.datasource.password=password
```

### Docker (Optional)
```dockerfile
FROM openjdk:21-slim
EXPOSE 8080 3001
COPY target/server.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Monitoring

### Key Metrics
- Message throughput (msgs/sec)
- WebSocket connections (active count)
- Unread count per user
- Average message latency
- Database query performance

### Logs to Monitor
- Socket.IO connection/disconnection
- Message send failures
- JWT validation errors
- Database connection issues

## Troubleshooting

### WebSocket not connecting
- Verify port 3001 is open
- Check JWT token validity
- Ensure userId stored in localStorage

### Messages not appearing
- Verify REST API responds with message
- Check WebSocket event emissions in logs
- Confirm database insert successful

### Unread count not updating
- Check `unread-update` event emission
- Verify markAsRead endpoint called
- Check database update

## File Structure

```
server/src/main/java/com/matchme/server/
├── controller/
│   └── MessageController.java
├── service/
│   └── MessageService.java
├── repository/
│   └── MessageRepository.java
├── model/
│   ├── Message.java
│   └── User.java
├── config/
│   └── WebSocketConfig.java
├── socket/
│   ├── WebSocketEventHandler.java
│   └── SocketIOServerInitializer.java
└── ...
```

## Maintenance

- Monitor WebSocket memory usage (connection tracking)
- Archive old messages (> 1 year)
- Regular database backups
- Monitor for SQL injection attempts
- Keep dependencies updated

---

**Last Updated**: May 17, 2026
**Status**: ✅ Production Ready
**Build Status**: ✅ Compiling Successfully
