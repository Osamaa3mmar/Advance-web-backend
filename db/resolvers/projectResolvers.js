import Project from '../models/project.js';

const projectResolvers = {
  Query: {
    projects: async () => {
      return await Project.getAll();
    },
    project: async (_, { id }) => {
      return await Project.getById(id);
    },
    userProjects: async (_, { userId }) => {
      const user = { id: userId };
      return await Project.getProjects(user.id);
    }
  },
  Mutation: {
    createProject: async (_, { input }, { user }) => {
      if (!user || user.type !== 'admin') {
        throw new Error('Not authorized to create projects');
      }
      return await Project.create(input);
    },
    updateProject: async (_, { id, input }, { user }) => {
      if (!user || user.type !== 'admin') {
        throw new Error('Not authorized to update projects');
      }
      return await Project.update(id, input);
    },
    deleteProject: async (_, { id }, { user }) => {
      if (!user || user.type !== 'admin') {
        throw new Error('Not authorized to delete projects');
      }
      return await Project.delete(id);
    },
    assignUserToProject: async (_, { projectId, userId }, { user }) => {
      if (!user || user.type !== 'admin') {
        throw new Error('Not authorized to assign users to projects');
      }
      return await Project.assignUser(projectId, userId);
    },
    removeUserFromProject: async (_, { projectId, userId }, { user }) => {
      if (!user || user.type !== 'admin') {
        throw new Error('Not authorized to remove users from projects');
      }
      return await Project.removeUser(projectId, userId);
    }
  },
  Project: {
    users: async (parent) => {
      return await Project.getUsers(parent.id);
    },
    tasks: async (parent) => {
      return await Project.getTasks(parent.id);
    }
  }
};

export default projectResolvers;
