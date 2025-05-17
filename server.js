import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import http from 'http'; // ✅ required for raw server
import { Server as SocketIOServer } from 'socket.io'; // ✅ Socket.IO
import typeDefs from './db/schemas/typeDefs.js';
import resolvers from './db/resolvers/index.js';
import getUser from './middleware/auth.js';
import { testConnection } from './db/connection.js';
import dotenv from 'dotenv';
import Message from './db/models/message.js';

dotenv.config();

async function startServer() {
  // Test database connection
  await testConnection();

  // Initialize Express application
  const app = express();

  // Create raw HTTP server from Express
  const httpServer = http.createServer(app);

  // Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      const user = getUser(token);
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

  await server.start();
  server.applyMiddleware({ app });

  // ✅ Initialize Socket.IO server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:3001', // or wherever your frontend is hosted
      methods: ['GET', 'POST']
    }
  });

  // ✅ Setup Socket.IO connection and private messaging logic
  const users = {};
  const usernames = {};

  io.on('connection', (socket) => {
    console.log('New socket connected:', socket.id);

    socket.on('login', (username) => {
      users[socket.id] = username;
      usernames[username] = socket.id;
      console.log(`${username} registered`);
    });

    
    socket.on('messageTo', (message ) => {
      const targetSocketId = usernames[message.recever_ID];
      console.log(message.recever_ID)
      console.log(usernames)

      if (targetSocketId) {
              console.log(targetSocketId)

        io.to(targetSocketId).emit('newMsg', 
         message
        );

        Message.create(message);
      }
    });

    socket.on('disconnect', () => {
      const username = users[socket.id];
      delete usernames[username];
      delete users[socket.id];
      console.log(`${username} disconnected`);
    });
  });

  // Start HTTP server (Express + Apollo + Socket.IO)
  const PORT = process.env.PORT || 4001;
  httpServer.listen(PORT, () => {
    console.log(`🚀 GraphQL ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`💬 Socket.IO running on ws://localhost:${PORT}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
});
