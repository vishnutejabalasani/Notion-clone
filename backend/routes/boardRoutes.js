const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  createBoard, 
  getBoards, 
  getBoardDetails, 
  updateBoard, 
  deleteBoard, 
  createList, 
  updateList, 
  deleteList, 
  createCard, 
  updateCard, 
  deleteCard 
} = require('../controllers/boardController');

const router = express.Router();

// Board Routes
router.route('/').get(protect, getBoards).post(protect, createBoard);
router.route('/:id')
  .get(protect, getBoardDetails)
  .put(protect, updateBoard)
  .delete(protect, deleteBoard);

// List Routes
router.route('/lists').post(protect, createList);
router.route('/lists/:id')
  .put(protect, updateList)
  .delete(protect, deleteList);

// Card Routes
router.route('/cards').post(protect, createCard);
router.route('/cards/:id')
  .put(protect, updateCard)
  .delete(protect, deleteCard);

module.exports = router;
