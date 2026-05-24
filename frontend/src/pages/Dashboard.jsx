import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Layout, Edit2, Trash, X } from 'lucide-react';
import api from '../api/axios';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, boards, setBoards } = useStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardBg, setNewBoardBg] = useState('bg-dark-950');
  
  // Edit Board State
  const [editingBoard, setEditingBoard] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDesc, setEditBoardDesc] = useState('');
  const [editBoardBg, setEditBoardBg] = useState('');

  const bgOptions = [
    { id: 'bg-dark-950', class: 'bg-dark-950' },
    { id: 'bg-gradient-to-br from-blue-900 to-indigo-900', class: 'bg-gradient-to-br from-blue-900 to-indigo-900' },
    { id: 'bg-gradient-to-br from-emerald-900 to-teal-900', class: 'bg-gradient-to-br from-emerald-900 to-teal-900' },
    { id: 'bg-gradient-to-br from-rose-900 to-pink-900', class: 'bg-gradient-to-br from-rose-900 to-pink-900' },
    { id: 'bg-gradient-to-br from-amber-900 to-orange-900', class: 'bg-gradient-to-br from-amber-900 to-orange-900' },
    { id: 'bg-gradient-to-br from-purple-900 to-violet-900', class: 'bg-gradient-to-br from-purple-900 to-violet-900' },
  ];

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const { data } = await api.get('/boards');
      setBoards(data);
    } catch (error) {
      toast.error('Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    try {
      const { data } = await api.post('/boards', { 
        title: newBoardTitle, 
        description: 'A new workspace',
        background: newBoardBg
      });
      setBoards([...boards, data]);
      setShowModal(false);
      setNewBoardTitle('');
      setNewBoardBg('bg-dark-950');
      toast.success('Board created!');
    } catch (error) {
      toast.error('Error creating board');
    }
  };

  const handleUpdateBoard = async (e) => {
    e.preventDefault();
    if (!editBoardTitle.trim()) return;
    try {
      const { data } = await api.put(`/boards/${editingBoard._id}`, { 
        title: editBoardTitle, 
        description: editBoardDesc,
        background: editBoardBg
      });
      setBoards(boards.map(b => b._id === editingBoard._id ? data : b));
      setEditingBoard(null);
      toast.success('Board updated successfully');
    } catch (error) {
      toast.error('Failed to update board');
    }
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.preventDefault();
    e.stopPropagation(); // prevent link navigation
    if (!window.confirm('Are you sure you want to delete this board? All lists and cards will be lost.')) return;
    try {
      await api.delete(`/boards/${boardId}`);
      setBoards(boards.filter(b => b._id !== boardId));
      toast.success('Board deleted successfully');
    } catch (error) {
      toast.error('Failed to delete board');
    }
  };



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {user?.username}</h1>
          <p className="text-slate-400 mt-1">Manage and collaborate on your project boards.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-primary-500/20 flex items-center gap-2"
        >
          <Plus size={18} />
          New Board
        </button>
      </div>

      {/* Boards List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Layout size={20} className="text-primary-400" />
          Your Boards
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-dark-800/50 animate-pulse rounded-xl border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {boards.map(board => (
              <Link 
                key={board._id} 
                to={`/board/${board._id}`}
                className="glass p-5 rounded-xl hover:bg-white/10 transition border border-white/5 hover:border-primary-500/50 group block relative"
              >
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditingBoard(board);
                      setEditBoardTitle(board.title);
                      setEditBoardDesc(board.description || '');
                      setEditBoardBg(board.background || 'bg-dark-950');
                    }}
                    className="p-1.5 bg-dark-900 rounded-lg text-slate-400 hover:text-white transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteBoard(e, board._id)}
                    className="p-1.5 bg-dark-900 rounded-lg text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash size={14} />
                  </button>
                </div>
                <h3 className="text-lg font-medium text-white group-hover:text-primary-400 transition pr-16">{board.title}</h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">{board.description}</p>
              </Link>
            ))}
            {boards.length === 0 && (
              <div className="col-span-full py-8 text-center glass rounded-xl border-dashed">
                <p className="text-slate-400">No boards yet. Create one to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Create New Board</h2>
            <form onSubmit={createBoard}>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Marketing Campaign"
                className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
              />
              
              <label className="block text-sm font-medium text-slate-300 mb-2">Background</label>
              <div className="flex gap-2 mb-6">
                {bgOptions.map(bg => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setNewBoardBg(bg.id)}
                    className={`w-8 h-8 rounded-full ${bg.class} border-2 ${newBoardBg === bg.id ? 'border-primary-500' : 'border-transparent'} hover:border-primary-400 transition`}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Board Modal */}
      {editingBoard && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setEditingBoard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Edit Board</h2>
            <form onSubmit={handleUpdateBoard}>
              <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
              <input
                type="text"
                autoFocus
                className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={editBoardTitle}
                onChange={(e) => setEditBoardTitle(e.target.value)}
              />
              <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
              <textarea
                className="w-full bg-dark-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white mb-6 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                value={editBoardDesc}
                onChange={(e) => setEditBoardDesc(e.target.value)}
              />

              <label className="block text-sm font-medium text-slate-300 mb-2">Background</label>
              <div className="flex gap-2 mb-6">
                {bgOptions.map(bg => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setEditBoardBg(bg.id)}
                    className={`w-8 h-8 rounded-full ${bg.class} border-2 ${editBoardBg === bg.id ? 'border-primary-500' : 'border-transparent'} hover:border-primary-400 transition`}
                  />
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setEditingBoard(null)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
