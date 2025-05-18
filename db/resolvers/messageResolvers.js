import Message from '../models/message.js';

const messageResolvers = {
  Query: {
    messages: async (_, __, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await Message.getAll();
    },
    message: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await Message.getById(id);
    },
    conversation: async (_, { user1Id, user2Id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      if (user.id !== parseInt(user1Id) && user.id !== parseInt(user2Id) && user.type !== 'admin') {
        throw new Error('Not authorized to view this conversation');
      }
      
      return await Message.getConversation(user1Id, user2Id);
    }
  },
  Mutation: {
    sendMessage: async (_, { input }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      if (user.id !== parseInt(input.sender_ID) && user.type !== 'admin') {
        throw new Error('Not authorized to send messages as another user');
      }
      
      return await Message.create(input);
    },
    deleteMessage: async (_, { id }, { user }) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const message = await Message.getById(id);
      
      if (!message) {
        throw new Error('Message not found');
      }
      
      if (user.id !== message.sender_ID && user.type !== 'admin') {
        throw new Error('Not authorized to delete this message');
      }
      
      return await Message.delete(id);
    }
  },
  Message: {
    sender: async (parent) => {
      return await Message.getSender(parent.id);
    },
    receiver: async (parent) => {
      return await Message.getReceiver(parent.id);
    }
  }
};

export default messageResolvers;
