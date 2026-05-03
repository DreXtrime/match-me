import { query } from '../config/database.ts';
import type { Connection, DismissedRecommendation, Message } from './types.ts';

// Connection operations
export const createConnectionRequest = async (requesterId: string, receiverId: string): Promise<Connection> => {
  const result = await query(
    `INSERT INTO connections (requester_id, receiver_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
    [requesterId, receiverId]
  );
  return result.rows[0];
};

export const getConnectionRequest = async (user1Id: string, user2Id: string): Promise<Connection | null> => {
  const result = await query(
    `SELECT * FROM connections WHERE
     (requester_id = $1 AND receiver_id = $2) OR (requester_id = $2 AND receiver_id = $1)`,
    [user1Id, user2Id]
  );
  return result.rows[0] || null;
};

export const getConnectionById = async (connectionId: string): Promise<Connection | null> => {
  const result = await query('SELECT * FROM connections WHERE id = $1', [connectionId]);
  return result.rows[0] || null;
};

export const areUsersConnected = async (user1Id: string, user2Id: string): Promise<boolean> => {
  const connection = await getConnectionRequest(user1Id, user2Id);
  return !!connection && connection.status === 'accepted';
};

export const areUsersConnectedOrPending = async (user1Id: string, user2Id: string): Promise<boolean> => {
  const connection = await getConnectionRequest(user1Id, user2Id);
  return !!connection && (connection.status === 'accepted' || connection.status === 'pending');
};

export const acceptConnection = async (connectionId: string): Promise<Connection> => {
  const result = await query(
    `UPDATE connections SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [connectionId]
  );
  return result.rows[0];
};

export const rejectConnection = async (connectionId: string): Promise<Connection> => {
  const result = await query(
    `UPDATE connections SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [connectionId]
  );
  return result.rows[0];
};

export const deleteConnection = async (connectionId: string): Promise<void> => {
  await query('DELETE FROM connections WHERE id = $1', [connectionId]);
};

export const getConnectedUsers = async (userId: string): Promise<{ id: string }[]> => {
  const result = await query(
    `SELECT CASE 
       WHEN requester_id = $1 THEN receiver_id 
       ELSE requester_id 
     END as id
     FROM connections WHERE status = 'accepted' AND (requester_id = $1 OR receiver_id = $1)`,
    [userId]
  );
  return result.rows;
};

export const getPendingConnectionRequests = async (userId: string): Promise<Connection[]> => {
  const result = await query(
    `SELECT * FROM connections WHERE receiver_id = $1 AND status = 'pending' ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Dismissed recommendations
export const addDismissedRecommendation = async (userId: string, dismissedUserId: string): Promise<DismissedRecommendation> => {
  const result = await query(
    `INSERT INTO dismissed_recommendations (user_id, dismissed_user_id) VALUES ($1, $2) RETURNING *`,
    [userId, dismissedUserId]
  );
  return result.rows[0];
};

export const getDismissedRecommendations = async (userId: string): Promise<string[]> => {
  const result = await query(
    `SELECT dismissed_user_id FROM dismissed_recommendations WHERE user_id = $1`,
    [userId]
  );
  return result.rows.map((row: { dismissed_user_id: string }) => row.dismissed_user_id);
};

// Message operations
export const sendMessage = async (senderId: string, receiverId: string, content: string): Promise<Message> => {
  const result = await query(
    `INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [senderId, receiverId, content]
  );
  return result.rows[0];
};

export const getConversationMessages = async (
  user1Id: string,
  user2Id: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> => {
  const result = await query(
    `SELECT * FROM messages WHERE
     (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
     ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
    [user1Id, user2Id, limit, offset]
  );
  return result.rows.reverse(); // Return in ascending order
};

export const markMessagesAsRead = async (senderId: string, receiverId: string): Promise<void> => {
  await query(
    `UPDATE messages SET is_read = true, read_at = CURRENT_TIMESTAMP
     WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
    [senderId, receiverId]
  );
};

export const getRecentChats = async (userId: string, limit: number = 50): Promise<{ id: string; lastMessageTime: string }[]> => {
  const result = await query(
    `SELECT DISTINCT ON(conversation_user_id) $1 as user_id, conversation_user_id as id, created_at as lastMessageTime
     FROM (
       SELECT CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as conversation_user_id, created_at
       FROM messages WHERE sender_id = $1 OR receiver_id = $1
     ) sub
     ORDER BY conversation_user_id, created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  const result = await query(
    `SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
};
