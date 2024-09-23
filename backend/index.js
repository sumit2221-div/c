import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ConnectDB } from './src/db/database.js';
import authRoutes from './src/router/user.route.js';
import jwt from 'jsonwebtoken';
import { Message } from './src/models/message.model.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 4000;
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.ORIGIN, credentials: true }));
app.use(helmet());

// Global error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).send('Something went wrong!');
});

// Connect to database
ConnectDB()
  .then(() => {
    console.log('Database connected');

    const server = http.createServer(app);

    // Socket.IO setup
    const io = new Server(server, {
      cors: {
        origin: process.env.ORIGIN,
        credentials: true,
      },
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (token) {
        try {
          const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          socket.user = user;
          console.log(`User authenticated: ${user._id}`);
          next();
        } catch (err) {
          console.error('Authentication error:', err);
          next(new Error('Authentication error'));
        }
      } else {
        console.error('No token provided');
        next(new Error('No token provided'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`A user connected: ${socket.user._id}`);

      // Emit user status as online
      io.emit('user status', { userId: socket.user._id, status: 'online' });

      // Handle chat messages and store them in the database
      socket.on('chat message', async (data) => {
        const { sender, receiver, content } = data;
        console.log(`Message from ${sender} to ${receiver}: ${content}`);

        try {
          // Save the message to the database
          const newMessage = new Message({ sender,  receiver, content });
          await newMessage.save();

          // Broadcast the message to the specific receiver
          io.to(receiver).emit('chat message', { sender, content });
        } catch (error) {
          console.error('Error saving message:', error);
        }
      });

      // User typing event
      socket.on('typing', ({ userId, isTyping }) => {
        console.log(`User ${userId} is typing: ${isTyping}`);
        io.emit('typing', { userId, isTyping });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user._id}`);
        io.emit('user status', { userId: socket.user._id, status: 'offline' });
      });
    });

    // Routes
    app.use('/api/auth', authRoutes);

    // Start the server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
  });
