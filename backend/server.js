require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const chatHandler = require('./socket/chatHandler');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

const path = require('path');
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(frontendDistPath, 'index.html'));
});

// Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
chatHandler(io);

const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student-management';

mongoose.connect(DB_URI)
  .then(() => {
    console.log('Connected to Local MongoDB database.');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Live Emails Configured for User: ${process.env.SMTP_USER || 'Not Configured'}`);
    });
  })
  .catch((err) => {
    console.error('CRITICAL ERROR: Failed to connect to MongoDB. Please make sure your MongoDB server is running locally!', err.message);
    process.exit(1);
  });
