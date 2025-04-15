const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const chatRoutes = require('./routes/chatRoutes');
require('dotenv').config();
const admin = require('firebase-admin');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);

// Define allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://zero-waste-swap.onrender.com'
].filter(Boolean);

// Configure CORS for Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Cache-Control', 'Pragma'],
    credentials: true
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  agent: false,
  rejectUnauthorized: false,
  perMessageDeflate: {
    threshold: 2048
  }
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400
}));

// Content Security Policy middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self';" +
    "img-src 'self' data: https: http:;" +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';" +
    "style-src 'self' 'unsafe-inline';" +
    "font-src 'self' data: https:;" +
    "connect-src 'self' https: wss: ws:;" +
    "frame-src 'self' https:;" +
    "media-src 'self' https:;"
  );
  next();
});

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  next();
});

// Routes
app.use('/api/chats', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Socket authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('No token provided for socket connection');
      return next(new Error('Authentication error'));
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    console.log('Socket authenticated for user:', socket.user.email);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('New socket connection:', {
    id: socket.id,
    user: socket.user?.email,
    transport: socket.conn.transport.name
  });

  // Join user's room
  if (socket.user) {
    socket.join(socket.user.uid);
    console.log(`User ${socket.user.email} joined room ${socket.user.uid}`);
  }

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', {
      id: socket.id,
      user: socket.user?.email,
      reason
    });
  });

  // Handle typing events
  socket.on('typing:start', (data) => {
    socket.to(data.chatId).emit('typing:start', {
      userId: socket.user.uid,
      chatId: data.chatId
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(data.chatId).emit('typing:stop', {
      userId: socket.user.uid,
      chatId: data.chatId
    });
  });

  // Handle new messages
  socket.on('message:send', async (message) => {
    try {
      // Emit to all participants except sender
      const chat = await Chat.findById(message.chat)
        .populate('participants', 'username email');
      
      if (chat) {
        chat.participants.forEach(participant => {
          if (participant._id !== socket.user.uid) {
            io.to(participant._id).emit('message:new', message);
          }
        });
      }
    } catch (error) {
      console.error('Error handling message:send:', error);
    }
  });
});

// Log all socket events in development
if (process.env.NODE_ENV === 'development') {
  const originalEmit = io.emit.bind(io);
  io.emit = function(event, ...args) {
    console.log('Socket.IO emit:', { event, args });
    originalEmit(event, ...args);
  };
}

console.log('Socket.IO path:', io.path());

// MongoDB connection
const connectToMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const startServer = (port) => {
      server.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
        console.log('Socket.IO path:', io.path());
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          server.close();
          startServer(port + 1);
        } else {
          console.error('Server error:', err);
        }
      });
    };

    const PORT = parseInt(process.env.PORT || '3001');
    startServer(PORT);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

connectToMongoDB(); 