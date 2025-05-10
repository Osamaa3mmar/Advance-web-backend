import userResolvers from './userResolvers.js';
import projectResolvers from './projectResolvers.js';
import taskResolvers from './taskResolvers.js';
import messageResolvers from './messageResolvers.js';

// Merge all resolvers
const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...projectResolvers.Query,
    ...taskResolvers.Query,
    ...messageResolvers.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...taskResolvers.Mutation,
    ...messageResolvers.Mutation
  },
  User: userResolvers.User,
  Project: projectResolvers.Project,
  Task: taskResolvers.Task,
  Message: messageResolvers.Message
};

export default resolvers;
