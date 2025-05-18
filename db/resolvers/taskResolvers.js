import Task from '../models/task.js';

const taskResolvers = {
  Query: {
    tasks: async () => {
      return await Task.getAll();
    },
    task: async (_, { id }) => {
      return await Task.getById(id);
    },
    projectTasks: async (_, { projectId }) => {
      return await Task.getAll().then(tasks => 
        tasks.filter(task => task.project_ID === parseInt(projectId))
      );
    },
    userTasks: async (_, { userId }) => {
      return await Task.getAll().then(tasks => 
        tasks.filter(task => task.user_ID === parseInt(userId))
      );
    }
  },
  Mutation: {
    createTask: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await Task.create(input);
    },
    updateTask: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const task = await Task.getById(id);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      if (user.type !== 'admin' && user.id !== task.user_ID) {
        throw new Error('Not authorized to update this task');
      }
      
      return await Task.update(id, input);
    },
    deleteTask: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const task = await Task.getById(id);
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      if (user.type !== 'admin') {
        throw new Error('Not authorized to delete tasks');
      }
      
      return await Task.delete(id);
    }
  },
  Task: {
    project: async (parent) => {
      return await Task.getProject(parent.id);
    },
    user: async (parent) => {
      return await Task.getUser(parent.id);
    }
  }
};

export default taskResolvers;
