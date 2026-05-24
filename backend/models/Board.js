const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  background: {
    type: String,
    default: "bg-dark-950",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Admin', 'Editor', 'Viewer'], default: 'Editor' }
  }],
  // Array of list IDs to maintain order
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
