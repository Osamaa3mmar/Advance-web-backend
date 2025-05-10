import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './db/schemas/typeDefs.js';
import resolvers from './db/resolvers/index.js';
import getUser from './middleware/auth.js';
import { testConnection } from './db/connection.js';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  // Test database connection
  await testConnection();

  // Initialize Express application
  const app = express();

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Get the user token from the headers
      const token = req.headers.authorization || '';
      
      // Try to retrieve a user with the token
      const user = getUser(token);
      
      // Add the user to the context
      return { user };
    },
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        path: error.path
      };
    }
  });

  // Start Apollo Server
  await server.start();

  // Apply middleware
  server.applyMiddleware({ app });

  // Set port
  const PORT = process.env.PORT || 4001;

  // Start Express server
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
});
