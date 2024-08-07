const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT secret not defined. Make sure you have a .env file with JWT_SECRET");
}

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

// Signup route
app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: 'User already exists' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
    res.json({ token, refreshToken, user: { email: user.email, name: user.name } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/users', authenticateToken, async (req, res) => {
  const { query } = req.query;
  try {
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(400).json({ error: 'Error fetching users' });
  }
});


// Create a new message
app.post('/api/message', authenticateToken, async (req, res) => {
  const { content, receiverId, conversationId } = req.body;
  const senderId = req.user.userId;

  try {
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        conversationId,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(400).json({ error: 'Error creating message' });
  }
});

// Get messages for a conversation
app.get('/api/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: parseInt(conversationId),
      },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(400).json({ error: 'Error fetching messages' });
  }
});

// Create a new conversation
app.post('/api/conversation', authenticateToken, async (req, res) => {
  const { participants } = req.body;

  try {
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: participants.map(id => ({ id })),
        },
      },
    });
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(400).json({ error: 'Error creating conversation' });
  }
});

// Get conversations for a user
app.get('/api/users/:userId/conversations', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            id: parseInt(userId),
          },
        },
      },
      include: {
        participants: true,
        messages: true,
      },
    });
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(400).json({ error: 'Error fetching conversations' });
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.use(express.static(path.join(__dirname, '../../frontend/build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

module.exports.handler = serverless(app);
