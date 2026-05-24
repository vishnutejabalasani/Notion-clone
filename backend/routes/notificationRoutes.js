const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');
const Board = require('../models/Board');
const User = require('../models/User');

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    // Generate approaching due date notifications automatically
    const Card = require('../models/Card');
    const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const upcomingCards = await Card.find({
      assignees: req.user.id,
      dueDate: { $gt: new Date(), $lt: twentyFourHoursFromNow }
    });
    
    for (const card of upcomingCards) {
      const alreadyNotified = await Notification.findOne({
        userId: req.user.id,
        type: 'due_date',
        cardId: card._id
      });
      
      if (!alreadyNotified) {
        await Notification.create({
          userId: req.user.id,
          type: 'due_date',
          message: `Urgent: Card "${card.title}" is due soon! (Due on ${new Date(card.dueDate).toLocaleDateString()})`,
          boardId: card.boardId,
          cardId: card._id
        });
      }
    }

    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('fromUserId', 'username profilePic')
      .populate('boardId', 'title');
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Search users for inviting (by username or email)
router.get('/search-users', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(200).json([]);
    
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Exclude self
    }).select('username email profilePic').limit(10);
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Invite a user to a board
router.post('/invite', protect, async (req, res) => {
  try {
    const { boardId, userId, role } = req.body;
    
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });
    
    // Check if already a member
    const alreadyMember = board.members.some(m => m.userId.toString() === userId);
    if (alreadyMember) return res.status(400).json({ message: "User is already a board member" });
    
    // Add member
    board.members.push({ userId, role: role || 'Editor' });
    await board.save();
    
    // Create notification for the invited user
    const inviter = await User.findById(req.user.id).select('username');
    await Notification.create({
      userId,
      type: 'board_invite',
      message: `${inviter.username} invited you to board "${board.title}" as ${role || 'Editor'}`,
      boardId: board._id,
      fromUserId: req.user.id,
    });

    // Emit socket notification
    const io = req.app.get('io');
    io.to(`user_${userId}`).emit('newNotification', {
      message: `You've been invited to "${board.title}"`
    });

    // Re-fetch with populated members
    const updatedBoard = await Board.findById(boardId)
      .populate('members.userId', 'username profilePic email');
    
    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Remove a member from board
router.post('/remove-member', protect, async (req, res) => {
  try {
    const { boardId, userId } = req.body;
    
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ message: "Board not found" });
    
    board.members = board.members.filter(m => m.userId.toString() !== userId);
    await board.save();
    
    const updatedBoard = await Board.findById(boardId)
      .populate('members.userId', 'username profilePic email');
    
    res.status(200).json(updatedBoard);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
