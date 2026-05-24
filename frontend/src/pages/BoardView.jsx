import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../api/axios';
import useStore from '../store/useStore';
import ListComponent from '../components/List';
import CardComponent from '../components/Card';
import EditCardModal from '../components/EditCardModal';
import ShareBoardModal from '../components/ShareBoardModal';
import { Plus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const BoardView = () => {
  const { id } = useParams();
  const { activeBoard, setActiveBoard } = useStore();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  
  // Dnd state
  const [activeCard, setActiveCard] = useState(null);
  
  // Edit state
  const [editingCard, setEditingCard] = useState(null);
  const isDraggingRef = useRef(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchBoardDetails();
    
    // Socket connection
    const socket = io('http://localhost:5000');
    socket.emit('joinBoard', id);
    
    socket.on('listCreated', (newList) => {
      setLists(prev => [...prev, { ...newList, cards: [] }]);
    });
    
    socket.on('cardCreated', (newCard) => {
      setLists(prev => prev.map(list => {
        if (list._id === newCard.listId) {
          return { ...list, cards: [...list.cards, newCard] };
        }
        return list;
      }));
    });
    
    socket.on('listUpdated', (updatedList) => {
      setLists(prev => prev.map(list => list._id === updatedList._id ? { ...list, title: updatedList.title } : list));
    });
    
    socket.on('cardUpdated', (updatedCard) => {
      setLists(prev => prev.map(list => {
        if (list._id === updatedCard.listId) {
          return {
            ...list,
            cards: list.cards.map(card => card._id === updatedCard._id ? updatedCard : card)
          };
        }
        return list;
      }));
    });
    
    socket.on('listDeleted', (listId) => {
      setLists(prev => prev.filter(list => list._id !== listId));
    });

    socket.on('cardDeleted', ({ cardId, listId }) => {
      setLists(prev => prev.map(list => {
        if (list._id === listId) {
          return {
            ...list,
            cards: list.cards.filter(card => card._id !== cardId)
          };
        }
        return list;
      }));
    });
    
    socket.on('cardMoved', ({ cardId, sourceListId, destinationListId, sourceIndex, destinationIndex }) => {
      setLists(prevLists => {
        // Check if already applied (optimistic UI)
        const dListCheck = prevLists.find(l => l._id === destinationListId);
        if (dListCheck && dListCheck.cards[destinationIndex] && dListCheck.cards[destinationIndex]._id === cardId) {
          return prevLists;
        }

        const newLists = prevLists.map(l => ({ ...l, cards: [...l.cards] }));
        const sourceListIdx = newLists.findIndex(l => l._id === sourceListId);
        const destListIdx = newLists.findIndex(l => l._id === destinationListId);
        
        if (sourceListIdx === -1 || destListIdx === -1) return prevLists;
        
        if (sourceListId === destinationListId) {
          // Reorder within same list
          const list = newLists[sourceListIdx];
          const [movedCard] = list.cards.splice(sourceIndex, 1);
          list.cards.splice(destinationIndex, 0, movedCard);
        } else {
          // Move across lists
          const sourceList = newLists[sourceListIdx];
          const destList = newLists[destListIdx];
          const [movedCard] = sourceList.cards.splice(sourceIndex, 1);
          movedCard.listId = destinationListId;
          destList.cards.splice(destinationIndex, 0, movedCard);
        }
        return newLists;
      });
    });

    return () => socket.disconnect();
  }, [id]);

  const fetchBoardDetails = async () => {
    try {
      const { data } = await api.get(`/boards/${id}`);
      setActiveBoard(data.board);
      setLists(data.board.lists);
    } catch (error) {
      toast.error('Failed to load board details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    try {
      const { data } = await api.post('/boards/lists', { title: newListTitle, boardId: id });
      setLists([...lists, { ...data, cards: [] }]);
      setNewListTitle('');
      setShowAddList(false);
    } catch (error) {
      toast.error('Failed to create list');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    isDraggingRef.current = true;
    const { active } = event;
    const cardId = active.id;
    // Find the card being dragged
    for (const list of lists) {
      const card = list.cards.find(c => c._id === cardId);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragEnd = async (event) => {
    setActiveCard(null);
    // Delay clearing the drag flag so onClick doesn't fire
    setTimeout(() => { isDraggingRef.current = false; }, 100);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find source and destination lists/indices
    let sourceList, sourceIndex, destList, destIndex;
    
    // Find source
    for (const list of lists) {
      const idx = list.cards.findIndex(c => c._id === activeId);
      if (idx !== -1) {
        sourceList = list;
        sourceIndex = idx;
        break;
      }
    }

    // Find destination
    // over.id could be a List ID or a Card ID
    const isOverList = lists.some(l => l._id === overId);
    
    if (isOverList) {
      destList = lists.find(l => l._id === overId);
      destIndex = destList.cards.length; // Drop at bottom of list
    } else {
      for (const list of lists) {
        const idx = list.cards.findIndex(c => c._id === overId);
        if (idx !== -1) {
          destList = list;
          destIndex = idx;
          break;
        }
      }
    }

    if (!sourceList || !destList) return;
    if (sourceList._id === destList._id && sourceIndex === destIndex) return;

    // Optimistic UI Update
    setLists(prevLists => {
      const newLists = prevLists.map(l => ({ ...l, cards: [...l.cards] }));
      const sIdx = newLists.findIndex(l => l._id === sourceList._id);
      const dIdx = newLists.findIndex(l => l._id === destList._id);
      
      const sList = newLists[sIdx];
      const dList = newLists[dIdx];
      
      const [movedCard] = sList.cards.splice(sourceIndex, 1);
      
      if (sourceList._id === destList._id) {
        sList.cards.splice(destIndex, 0, movedCard);
      } else {
        movedCard.listId = destList._id;
        dList.cards.splice(destIndex, 0, movedCard);
      }
      return newLists;
    });

    try {
      await api.put(`/boards/cards/${activeId}`, {
        sourceListId: sourceList._id,
        destinationListId: destList._id,
        sourceIndex,
        destinationIndex: destIndex,
        boardId: id
      });
    } catch (error) {
      toast.error('Failed to move card');
      fetchBoardDetails(); // Revert
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading board...</div>;

  return (
    <div className={`h-[calc(100vh-100px)] flex flex-col -mx-4 -mt-4 p-4 lg:-mx-8 lg:-mt-8 lg:p-8 ${activeBoard?.background || 'bg-dark-950'} transition-colors duration-500`}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{activeBoard?.title}</h1>
          <p className="text-slate-400 text-sm mt-1">{activeBoard?.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {activeBoard?.members && activeBoard.members.map(m => {
              const memberUser = m.userId;
              if (!memberUser) return null;
              return (
                <div 
                  key={memberUser._id} 
                  className="w-8 h-8 rounded-full bg-primary-600/20 border border-slate-700 flex items-center justify-center text-xs font-semibold text-primary-400" 
                  title={`${memberUser.username} (${m.role || 'Member'})`}
                >
                  {memberUser.username.charAt(0).toUpperCase()}
                </div>
              );
            })}
          </div>
          
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-lg shadow-primary-500/20"
          >
            <UserPlus size={14} />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 items-start h-full">
            <SortableContext items={lists.map(l => l._id)} strategy={horizontalListSortingStrategy}>
              {lists.map(list => (
                <ListComponent key={list._id} list={list} boardId={id} onCardClick={(card) => {
                  if (!isDraggingRef.current) setEditingCard(card);
                }} />
              ))}
            </SortableContext>

            {/* Add List Button */}
            <div className="w-72 shrink-0">
              {showAddList ? (
                <div className="glass p-3 rounded-xl border border-white/10">
                  <form onSubmit={handleCreateList}>
                    <input
                      autoFocus
                      type="text"
                      className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-primary-500"
                      placeholder="Enter list title..."
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded text-sm font-medium transition">
                        Add List
                      </button>
                      <button type="button" onClick={() => setShowAddList(false)} className="text-slate-400 hover:text-white transition p-1">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAddList(true)}
                  className="w-full glass p-3 rounded-xl border border-white/5 border-dashed hover:border-primary-500/50 hover:bg-white/5 transition flex items-center gap-2 text-slate-300 hover:text-white"
                >
                  <Plus size={18} />
                  <span>Add another list</span>
                </button>
              )}
            </div>
          </div>
          
          <DragOverlay>
            {activeCard ? <CardComponent card={activeCard} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {editingCard && (
        <EditCardModal 
          card={editingCard} 
          boardId={id} 
          onClose={() => setEditingCard(null)} 
        />
      )}

      {showShareModal && activeBoard && (
        <ShareBoardModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          board={activeBoard}
          onUpdateBoard={(updatedBoard) => {
            setActiveBoard(updatedBoard);
          }}
        />
      )}
    </div>
  );
};

export default BoardView;
