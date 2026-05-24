const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  // Array of card IDs to maintain order
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }]
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
