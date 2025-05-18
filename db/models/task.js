import { pool } from '../connection.js';

class Task {
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM tasks');
      return rows;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      throw new Error('Failed to fetch task');
    }
  }

  static async create({ name, dueDate, status, description, project_ID, user_ID }) {
    try {
      const [result] = await pool.query(
        'INSERT INTO tasks (name, dueDate, status, description, project_ID, user_ID) VALUES (?, ?, ?, ?, ?, ?)',
        [name, dueDate, status, description, project_ID, user_ID]
      );
      
      const id = result.insertId;
      return { id, name, dueDate, status, description, project_ID, user_ID };
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  static async update(id, { name, dueDate, status, description, project_ID, user_ID }) {
    try {
      let query = 'UPDATE tasks SET ';
      const params = [];
      const updates = [];

      if (name) {
        updates.push('name = ?');
        params.push(name);
      }

      if (dueDate) {
        updates.push('dueDate = ?');
        params.push(dueDate);
      }

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }

      if (description) {
        updates.push('description = ?');
        params.push(description);
      }

      if (project_ID) {
        updates.push('project_ID = ?');
        params.push(project_ID);
      }

      if (user_ID) {
        updates.push('user_ID = ?');
        params.push(user_ID);
      }

      query += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      const [result] = await pool.query(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return this.getById(id);
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      throw new Error('Failed to update task');
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      throw new Error('Failed to delete task');
    }
  }

  static async getUser(taskId) {
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.username, u.type, u.uid FROM users u
        JOIN tasks t ON u.id = t.user_ID
        WHERE t.id = ?
      `, [taskId]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching user for task with ID ${taskId}:`, error);
      throw new Error('Failed to fetch task user');
    }
  }

  static async getProject(taskId) {
    try {
      const [rows] = await pool.query(`
        SELECT p.* FROM projects p
        JOIN tasks t ON p.id = t.project_ID
        WHERE t.id = ?
      `, [taskId]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching project for task with ID ${taskId}:`, error);
      throw new Error('Failed to fetch task project');
    }
  }
}

export default Task;
