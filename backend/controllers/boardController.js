const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new board
const createBoard = async (req, res) => {
  try {
    const { title, description, background } = req.body;
    const board = await Board.create({
      title,
      description,
      background,
      owner: req.user.id,
      members: [{ userId: req.user.id, role: 'Admin' }]
    });
    
    await Activity.create({ boardId: board._id, userId: req.user.id, action: "created the board" });
    
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all boards for a user
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ 'members.userId': req.user.id }).populate('owner', 'username email');
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get single board details (with lists and cards)
const getBoardDetails = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate({
        path: 'lists',
        populate: {
          path: 'cards',
          model: 'Card',
          populate: {
            path: 'comments.userId',
            select: 'username profilePic'
          }
        }
      })
      .populate('members.userId', 'username profilePic email');

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    
    // Also fetch recent activity
    const activity = await Activity.find({ boardId: board._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'username profilePic');

    res.status(200).json({ board, activity });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create a new list
const createList = async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const list = await List.create({ title, boardId });
    
    // Add list to board
    await Board.findByIdAndUpdate(boardId, { $push: { lists: list._id } });
    
    const io = req.app.get('io');
    io.to(boardId).emit('listCreated', list);
    
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update list
const updateList = async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const list = await List.findByIdAndUpdate(req.params.id, { title }, { new: true });
    
    const io = req.app.get('io');
    if (boardId) io.to(boardId).emit('listUpdated', list);
    
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create a new card
const createCard = async (req, res) => {
  try {
    const { title, description, listId, boardId, priority, dueDate } = req.body;
    const card = await Card.create({ title, description, listId, boardId, priority, dueDate });
    
    // Add card to list
    await List.findByIdAndUpdate(listId, { $push: { cards: card._id } });
    
    await Activity.create({ 
      boardId, 
      userId: req.user.id, 
      action: `added card "${title}" to list`,
      cardId: card._id
    });
    
    const io = req.app.get('io');
    io.to(boardId).emit('cardCreated', card);
    
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update card (status, lists drag drop)
const updateCard = async (req, res) => {
  try {
    const { sourceListId, destinationListId, sourceIndex, destinationIndex, boardId, updates } = req.body;
    
    // If it's a drag and drop move
    if (sourceListId && destinationListId) {
      const cardId = req.params.id;
      
      if (sourceListId === destinationListId) {
        // Reorder within same list
        const list = await List.findById(sourceListId);
        const [movedCardId] = list.cards.splice(sourceIndex, 1);
        list.cards.splice(destinationIndex, 0, movedCardId);
        await list.save();
      } else {
        // Move across lists
        const sourceList = await List.findById(sourceListId);
        const destList = await List.findById(destinationListId);
        
        const [movedCardId] = sourceList.cards.splice(sourceIndex, 1);
        destList.cards.splice(destinationIndex, 0, movedCardId);
        
        await sourceList.save();
        await destList.save();
        
        // Update card's listId reference
        await Card.findByIdAndUpdate(cardId, { listId: destinationListId });
        
        await Activity.create({ 
          boardId, 
          userId: req.user.id, 
          action: `moved a card to a different list`,
          cardId
        });
      }
      
      const io = req.app.get('io');
      io.to(boardId).emit('cardMoved', { 
        cardId, sourceListId, destinationListId, sourceIndex, destinationIndex 
      });
      
      return res.status(200).json({ message: "Card moved successfully" });
    }
    
    // Regular update — use findById + save to properly handle nested arrays
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Apply all updates from the request and trigger notifications
    const updater = await User.findById(req.user.id).select('username');
    const io = req.app.get('io');

    if (updates.assignees !== undefined) {
      const oldAssignees = card.assignees.map(id => id.toString());
      const newAssignees = updates.assignees.map(id => id.toString());
      const addedAssignees = newAssignees.filter(id => !oldAssignees.includes(id));
      
      for (const assigneeId of addedAssignees) {
        if (assigneeId !== req.user.id) {
          await Notification.create({
            userId: assigneeId,
            type: 'card_assigned',
            message: `${updater.username} assigned you to card "${updates.title || card.title}"`,
            boardId: card.boardId,
            cardId: card._id,
            fromUserId: req.user.id
          });
          
          io.to(`user_${assigneeId}`).emit('newNotification', {
            message: `You've been assigned to card "${updates.title || card.title}"`
          });
        }
      }
      card.assignees = updates.assignees;
    }

    if (updates.comments !== undefined) {
      const oldCommentsCount = card.comments.length;
      const newComments = updates.comments;
      
      if (newComments.length > oldCommentsCount) {
        const newComment = newComments[newComments.length - 1];
        const commentText = newComment.text || '';
        
        // Scan for @username mentions
        const mentionRegex = /@(\w+)/g;
        let match;
        const mentionedUsernames = [];
        while ((match = mentionRegex.exec(commentText)) !== null) {
          mentionedUsernames.push(match[1]);
        }
        
        for (const username of mentionedUsernames) {
          const user = await User.findOne({ username });
          if (user && user._id.toString() !== req.user.id) {
            await Notification.create({
              userId: user._id,
              type: 'mention',
              message: `${updater.username} mentioned you in card "${card.title}": "${commentText.substring(0, 50)}..."`,
              boardId: card.boardId,
              cardId: card._id,
              fromUserId: req.user.id
            });
            
            io.to(`user_${user._id}`).emit('newNotification', {
              message: `You were mentioned in card "${card.title}"`
            });
          }
        }
        
        // Notify assignees (who weren't mentioned and are not commenters)
        const assigneesToNotify = card.assignees.filter(
          id => id.toString() !== req.user.id && 
          !mentionedUsernames.includes(id.toString())
        );
        
        for (const assigneeId of assigneesToNotify) {
          await Notification.create({
            userId: assigneeId,
            type: 'comment',
            message: `${updater.username} commented on card "${card.title}"`,
            boardId: card.boardId,
            cardId: card._id,
            fromUserId: req.user.id
          });
          
          io.to(`user_${assigneeId}`).emit('newNotification', {
            message: `New comment on card "${card.title}"`
          });
        }
      }
      card.comments = updates.comments;
    }

    if (updates.title !== undefined) card.title = updates.title;
    if (updates.description !== undefined) card.description = updates.description;
    if (updates.priority !== undefined) card.priority = updates.priority;
    if (updates.labels !== undefined) card.labels = updates.labels;
    if (updates.checklists !== undefined) card.checklists = updates.checklists;
    if (updates.status !== undefined) card.status = updates.status;
    if (updates.dueDate !== undefined) card.dueDate = updates.dueDate;

    await card.save();

    // Re-fetch with populated comments
    const populatedCard = await Card.findById(card._id)
      .populate('comments.userId', 'username profilePic');
    
    io.to(card.boardId.toString()).emit('cardUpdated', populatedCard);
    
    res.status(200).json(populatedCard);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Update Board
const updateBoard = async (req, res) => {
  try {
    const { title, description } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Board
const deleteBoard = async (req, res) => {
  try {
    const boardId = req.params.id;
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Delete all cards associated with the board
    await Card.deleteMany({ boardId });
    
    // Delete all lists associated with the board
    await List.deleteMany({ boardId });
    
    // Delete all activities associated with the board
    await Activity.deleteMany({ boardId });
    
    // Delete the board
    await Board.findByIdAndDelete(boardId);

    res.status(200).json({ message: "Board deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete List
const deleteList = async (req, res) => {
  try {
    const listId = req.params.id;
    const list = await List.findById(listId);
    
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const boardId = list.boardId;

    // Remove list from board
    await Board.findByIdAndUpdate(boardId, { $pull: { lists: listId } });
    
    // Delete all cards in the list
    await Card.deleteMany({ listId });
    
    // Delete the list
    await List.findByIdAndDelete(listId);
    
    const io = req.app.get('io');
    io.to(boardId.toString()).emit('listDeleted', listId);
    
    res.status(200).json({ message: "List deleted successfully", id: listId });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Delete Card
const deleteCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const card = await Card.findById(cardId);
    
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const listId = card.listId;
    const boardId = card.boardId;

    // Remove card from list
    await List.findByIdAndUpdate(listId, { $pull: { cards: cardId } });
    
    // Delete the card
    await Card.findByIdAndDelete(cardId);
    
    await Activity.create({ 
      boardId, 
      userId: req.user.id, 
      action: `deleted a card`
    });
    
    const io = req.app.get('io');
    io.to(boardId.toString()).emit('cardDeleted', { cardId, listId });
    
    res.status(200).json({ message: "Card deleted successfully", id: cardId });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { 
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
};
