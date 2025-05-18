import { pool } from '../connection.js';
import bcrypt from 'bcrypt';

class User {
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT id, username, type, uid FROM users');
      return rows;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT id, username, type, uid FROM users WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw new Error('Failed to fetch user');
    }
  }

  static async create({ username, password, type, uid }) {
    try {
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        'INSERT INTO users (username, password, type, uid, currentToken) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, type, uid || null, '']
      );

      const id = result.insertId;
      return { id, username, type, uid };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  static async update(id, { username, password, type, uid }) {
    try {
      if (username) {
        const existingUser = await this.findByUsername(username);
        if (existingUser && existingUser.id !== parseInt(id)) {
          throw new Error('Username already exists');
        }
      }

      let query = 'UPDATE users SET ';
      const params = [];
      const updates = [];

      if (username) {
        updates.push('username = ?');
        params.push(username);
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }

      if (type) {
        updates.push('type = ?');
        params.push(type);
      }

      if (uid !== undefined) {
        updates.push('uid = ?');
        params.push(uid);
      }

      if (updates.length === 0) {
        return this.getById(id); 
      }

      query += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      const [result] = await pool.query(query, params);

      if (result.affectedRows === 0) {
        return null;
      }

      return this.getById(id);
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      if (error.message === 'Username already exists') {
        throw error; 
      }
      throw new Error('Failed to update user');
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw new Error('Failed to delete user');
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error finding user by username ${username}:`, error);
      throw new Error('Failed to find user');
    }
  }

  static async updateToken(id, token) {
    try {
      await pool.query('UPDATE users SET currentToken = ? WHERE id = ?', [token, id]);
      return true;
    } catch (error) {
      console.error(`Error updating token for user with ID ${id}:`, error);
      throw new Error('Failed to update token');
    }
  }

  static async getProjects(userId) {
    try {
      const [rows] = await pool.query(`
        SELECT p.* FROM projects p
        JOIN user_project up ON p.id = up.project_ID
        WHERE up.user_ID = ?
      `, [userId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching projects for user with ID ${userId}:`, error);
      throw new Error('Failed to fetch user projects');
    }
  }

  static async getTasks(userId) {
    try {
      const [rows] = await pool.query('SELECT * FROM tasks WHERE user_ID = ?', [userId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching tasks for user with ID ${userId}:`, error);
      throw new Error('Failed to fetch user tasks');
    }
  }

  static async getSentMessages(userId) {
    try {
      const [rows] = await pool.query('SELECT * FROM messages WHERE sender_ID = ?', [userId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching sent messages for user with ID ${userId}:`, error);
      throw new Error('Failed to fetch sent messages');
    }
  }

  static async getReceivedMessages(userId) {
    try {
      const [rows] = await pool.query('SELECT * FROM messages WHERE recever_ID = ?', [userId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching received messages for user with ID ${userId}:`, error);
      throw new Error('Failed to fetch received messages');
    }
  }
}

export default User;
