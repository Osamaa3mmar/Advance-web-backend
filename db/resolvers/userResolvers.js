import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const userResolvers = {
  Query: {
    users: async () => {
      return await User.getAll();
    },
    user: async (_, { id }) => {
      return await User.getById(id);
    },
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await User.getById(user.id);
    }
  },
  Mutation: {
    login: async (_, { username, password }) => {
      const user = await User.findByUsername(username);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      
      if (!isValid) {
        throw new Error('Invalid password');
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username, type: user.type },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      await User.updateToken(user.id, token);
      
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          type: user.type,
          uid: user.uid
        }
      };
    },
    createUser: async (_, { input }) => {
      return await User.create(input);
    },
    updateUser: async (_, { id, input }, { user }) => {
      if (!user || (user.id !== parseInt(id) && user.type !== 'admin')) {
        throw new Error('Not authorized');
      }
      return await User.update(id, input);
    },
    deleteUser: async (_, { id }, { user }) => {
      if (!user || (user.id !== parseInt(id) && user.type !== 'admin')) {
        throw new Error('Not authorized');
      }
      return await User.delete(id);
    }
  },
  User: {
    projects: async (parent) => {
      return await User.getProjects(parent.id);
    },
    tasks: async (parent) => {
      return await User.getTasks(parent.id);
    },
    sentMessages: async (parent) => {
      return await User.getSentMessages(parent.id);
    },
    receivedMessages: async (parent) => {
      return await User.getReceivedMessages(parent.id);
    }
  }
};

export default userResolvers;
