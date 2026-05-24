import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import CardComponent from './Card';
import { Plus, Trash } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const List = ({ list, boardId, onCardClick }) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);

  const { setNodeRef } = useDroppable({
    id: list._id,
  });

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      await api.post('/boards/cards', { title: newCardTitle, listId: list._id, boardId });
      setNewCardTitle('');
      setShowAddCard(false);
    } catch (error) {
      toast.error('Failed to create card');
    }
  };

  const handleUpdateListTitle = async () => {
    if (!listTitle.trim() || listTitle === list.title) {
      setIsEditingTitle(false);
      setListTitle(list.title);
      return;
    }
    try {
      await api.put(`/boards/lists/${list._id}`, { title: listTitle, boardId });
      setIsEditingTitle(false);
    } catch (error) {
      toast.error('Failed to update list title');
      setListTitle(list.title);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateListTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setListTitle(list.title);
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;
    try {
      await api.delete(`/boards/lists/${list._id}`);
      toast.success('List deleted successfully');
    } catch (error) {
      toast.error('Failed to delete list');
    }
  };

  return (
    <div className="w-72 shrink-0 flex flex-col max-h-full glass rounded-xl border border-white/10">
      <div className="p-3 flex items-center justify-between border-b border-white/5">
        {isEditingTitle ? (
          <input
            autoFocus
            className="bg-dark-900 border border-primary-500 rounded px-2 py-1 text-sm text-white focus:outline-none w-full mr-2"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            onBlur={handleUpdateListTitle}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <h3
            className="font-semibold text-slate-200 cursor-pointer hover:text-white"
            onClick={() => setIsEditingTitle(true)}
            title="Click to edit"
          >
            {list.title}
          </h3>
        )}
        <button
          onClick={handleDeleteList}
          className="text-slate-400 hover:text-red-400 p-1 rounded hover:bg-white/5 transition"
          title="Delete List"
        >
          <Trash size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px]"
      >
        <SortableContext items={list.cards.map(c => c._id)} strategy={verticalListSortingStrategy}>
          {list.cards.map(card => (
            <CardComponent key={card._id} card={card} onCardClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      <div className="p-2 border-t border-white/5">
        {showAddCard ? (
          <form onSubmit={handleCreateCard}>
            <textarea
              autoFocus
              className="w-full bg-dark-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-primary-500 resize-none"
              placeholder="Enter a title for this card..."
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              rows={2}
            />
            <div className="flex items-center gap-2">
              <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded text-sm font-medium transition">
                Add Card
              </button>
              <button type="button" onClick={() => setShowAddCard(false)} className="text-slate-400 hover:text-white transition p-1">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full text-left px-2 py-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded flex items-center gap-2 transition text-sm font-medium"
          >
            <Plus size={16} />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default List;
