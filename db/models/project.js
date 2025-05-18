import { pool } from '../connection.js';

class Project {
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM projects');
      return rows;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching project with ID ${id}:`, error);
      throw new Error('Failed to fetch project');
    }
  }

  static async create({ name, startDate, endDate, description, status, category }) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        throw new Error('Start date cannot be after end date');
      }
      
      const [result] = await pool.query(
        'INSERT INTO projects (name, startDate, endDate, description, status, category) VALUES (?, ?, ?, ?, ?, ?)',
        [name, startDate, endDate, description, status, category]
      );
      
      const id = result.insertId;
      return { id, name, startDate, endDate, description, status, category };
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  }

  static async update(id, { name, startDate, endDate, description, status, category }) {
    try {
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start > end) {
          throw new Error('Start date cannot be after end date');
        }
      } 
      else if (startDate || endDate) {
        const project = await this.getById(id);
        if (!project) {
          throw new Error('Project not found');
        }
        
        const start = startDate ? new Date(startDate) : new Date(project.startDate);
        const end = endDate ? new Date(endDate) : new Date(project.endDate);
        
        if (start > end) {
          throw new Error('Start date cannot be after end date');
        }
      }
      
      let query = 'UPDATE projects SET ';
      const params = [];
      const updates = [];

      if (name) {
        updates.push('name = ?');
        params.push(name);
      }

      if (startDate) {
        updates.push('startDate = ?');
        params.push(startDate);
      }

      if (endDate) {
        updates.push('endDate = ?');
        params.push(endDate);
      }

      if (description) {
        updates.push('description = ?');
        params.push(description);
      }

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }

      if (category) {
        updates.push('category = ?');
        params.push(category);
      }

      query += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      const [result] = await pool.query(query, params);
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return this.getById(id);
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      throw new Error(error.message || 'Failed to update project');
    }
  }

  static async delete(id) {
    try {
      await pool.query('START TRANSACTION');
      
      await pool.query('DELETE FROM tasks WHERE project_ID = ?', [id]);
      
      await pool.query('DELETE FROM user_project WHERE project_ID = ?', [id]);
      
      const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
      
      await pool.query('COMMIT');
      
      return result.affectedRows > 0;
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error(`Error deleting project with ID ${id}:`, error);
      throw new Error('Failed to delete project');
    }
  }

  static async getUsers(projectId) {
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.username, u.type, u.uid FROM users u
        JOIN user_project up ON u.id = up.user_ID
        WHERE up.project_ID = ?
      `, [projectId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching users for project with ID ${projectId}:`, error);
      throw new Error('Failed to fetch project users');
    }
  }

  static async getTasks(projectId) {
    try {
      const [rows] = await pool.query('SELECT * FROM tasks WHERE project_ID = ?', [projectId]);
      return rows;
    } catch (error) {
      console.error(`Error fetching tasks for project with ID ${projectId}:`, error);
      throw new Error('Failed to fetch project tasks');
    }
  }

  static async assignUser(projectId, userId) {
    try {
      console.log(projectId, userId, "projectId, userId");
      await pool.query(
        'INSERT INTO user_project (user_ID, project_ID) VALUES (?, ?)',
        [userId, projectId]
      );
      return true;
    } catch (error) {
      console.error(`Error assigning user ${userId} to project ${projectId}:`, error);
      throw new Error('Failed to assign user to project');
    }
  }

  static async removeUser(projectId, userId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM user_project WHERE user_ID = ? AND project_ID = ?',
        [userId, projectId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error removing user ${userId} from project ${projectId}:`, error);
      throw new Error('Failed to remove user from project');
    }
  }
}

export default Project;
