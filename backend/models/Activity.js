const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true, // e.g., "moved task to Completed", "added attachment"
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
