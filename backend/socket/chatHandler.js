const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a room for a specific complaint
    socket.on('join_complaint', async (complaintId) => {
      socket.join(complaintId);
      console.log(`Socket ${socket.id} joined room ${complaintId}`);
      
      try {
        const messages = await Message.find({ complaintId }).populate('senderId', 'name role type').sort('createdAt');
        socket.emit('chat_history', messages);
      } catch (err) {
        console.error('Error fetching chat block:', err);
      }
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
      try {
        const { complaintId, senderId, message } = data;
        
        const newMessage = new Message({
          complaintId,
          senderId,
          message,
          senderModel: 'User'
        });
        
        await newMessage.save();
        const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'name role type');
        
        io.to(complaintId).emit('receive_message', populatedMessage);
      } catch (err) {
         console.error('Error saving message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
