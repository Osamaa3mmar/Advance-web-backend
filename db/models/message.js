import { pool } from '../connection.js';

class Message {
  // Get all messages
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM messages');
      return rows;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  // Get message by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching message with ID ${id}:`, error);
      throw new Error('Failed to fetch message');
    }
  }

  // Create a new message
  static async create({ sender_ID, recever_ID, payload }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO messages (sender_ID, recever_ID, payload) VALUES (?, ?, ?)',
        [sender_ID, recever_ID, payload]
      );
      
      const id = result.insertId;
      const timestamp = new Date();
      return { id, sender_ID, recever_ID, payload, timestamp };
    } catch (error) {
      console.error('Error creating message:', error);
      throw new Error('Failed to create message');
    }
  }

  // Delete a message
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting message with ID ${id}:`, error);
      throw new Error('Failed to delete message');
    }
  }

  // Get sender of a message
  static async getSender(messageId) {
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.username, u.type, u.uid FROM users u
        JOIN messages m ON u.id = m.sender_ID
        WHERE m.id = ?
      `, [messageId]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching sender for message with ID ${messageId}:`, error);
      throw new Error('Failed to fetch message sender');
    }
  }

  // Get receiver of a message
  static async getReceiver(messageId) {
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.username, u.type, u.uid FROM users u
        JOIN messages m ON u.id = m.recever_ID
        WHERE m.id = ?
      `, [messageId]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching receiver for message with ID ${messageId}:`, error);
      throw new Error('Failed to fetch message receiver');
    }
  }

  // Get conversation between two users
  static async getConversation(user1Id, user2Id) {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM messages 
        WHERE (sender_ID = ? AND recever_ID = ?) OR (sender_ID = ? AND recever_ID = ?)
        ORDER BY timestamp ASC
      `, [user1Id, user2Id, user2Id, user1Id]);
      return rows;
    } catch (error) {
      console.error(`Error fetching conversation between users ${user1Id} and ${user2Id}:`, error);
      throw new Error('Failed to fetch conversation');
    }
  }
}

export default Message;
