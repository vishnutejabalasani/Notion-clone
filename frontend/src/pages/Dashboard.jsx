import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Layout, Edit2, Trash, X, Search, Sparkles, Users, Calendar } from 'lucide-react';
import api from '../api/axios';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, boards, setBoards } = useStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardBg, setNewBoardBg] = useState('bg-dark-950');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Board State
  const [editingBoard, setEditingBoard] = useState(null);
  const [editBoardTitle, setEditBoardTitle] = useState('');
  const [editBoardDesc, setEditBoardDesc] = useState('');
  const [editBoardBg, setEditBoardBg] = useState('');

  const bgOptions = [
    { id: 'bg-dark-950', class: 'bg-dark-950', name: 'Charcoal Dark' },
    { id: 'bg-gradient-to-br from-blue-900 to-indigo-900', class: 'bg-gradient-to-br from-blue-900 to-indigo-900', name: 'Ocean Breeze' },
    { id: 'bg-gradient-to-br from-emerald-900 to-teal-900', class: 'bg-gradient-to-br from-emerald-900 to-teal-900', name: 'Forest Mint' },
    { id: 'bg-gradient-to-br from-rose-900 to-pink-900', class: 'bg-gradient-to-br from-rose-900 to-pink-900', name: 'Sunset Rose' },
    { id: 'bg-gradient-to-br from-amber-900 to-orange-900', class: 'bg-gradient-to-br from-amber-900 to-orange-900', name: 'Autumn Gold' },
    { id: 'bg-gradient-to-br from-purple-900 to-violet-900', class: 'bg-gradient-to-br from-purple-900 to-violet-900', name: 'Cosmic Purple' },
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const filteredBoards = boards.filter(board => 
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (board.description && board.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-950/80 via-slate-900/90 to-violet-950/80 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <Sparkles size={12} className="animate-pulse" />
              Workspace Overview
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {getGreeting()}, {user?.username}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Track tasks, manage workflows, and collaborate with your team in real-time. Keep coding, shipping, and building!
            </p>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
            <div className="bg-slate-900/60 border border-white/5 rounded-xl px-5 py-3.5 backdrop-blur-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Boards</div>
              <div className="text-2xl font-extrabold text-white mt-1">{boards.length}</div>
            </div>
            <div className="bg-slate-900/60 border border-white/5 rounded-xl px-5 py-3.5 backdrop-blur-sm">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shared Boards</div>
              <div className="text-2xl font-extrabold text-primary-400 mt-1">
                {boards.filter(b => b.owner?._id !== user?.id && b.owner !== user?.id && b.owner?._id !== user?._id && b.owner !== user?._id).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions Row (Search + Create Button) */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-dark-900/40 p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filter boards by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-950 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-semibold transition duration-300 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          New Workspace
        </button>
      </div>

      {/* Boards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layout size={20} className="text-primary-400" />
            Your Collaborations
          </h2>
          <span className="text-xs text-slate-400">{filteredBoards.length} board{filteredBoards.length !== 1 ? 's' : ''} found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-dark-800/40 animate-pulse rounded-xl border border-white/5"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredBoards.map(board => {
              const isOwner = board.owner?._id === user?._id || board.owner?._id === user?.id || board.owner === user?._id || board.owner === user?.id;
              
              return (
                <div 
                  key={board._id} 
                  className={`group relative overflow-hidden rounded-xl border border-white/10 hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:scale-[1.02] ${board.background || 'bg-slate-900'}`}
                >
                  {/* Subtle dark backdrop overlay to read text clearly over color gradients */}
                  <div className="absolute inset-0 bg-slate-950/75 group-hover:bg-slate-950/65 transition-colors duration-300 pointer-events-none" />
                  
                  {/* Card Content Link */}
                  <Link 
                    to={`/board/${board._id}`}
                    className="relative z-10 block p-5 h-full"
                  >
                    <div className="flex flex-col justify-between h-full min-h-[120px]">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            isOwner 
                              ? 'bg-primary-500/10 text-primary-400 border-primary-500/25' 
                              : 'bg-violet-500/10 text-violet-400 border-violet-500/25'
                          }`}>
                            {isOwner ? 'Owner' : 'Guest'}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors duration-200 line-clamp-1">
                          {board.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed min-h-[2rem]">
                          {board.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Users size={12} className="text-slate-400" />
                          <span>{board.members?.length || 1} member{(board.members?.length || 1) !== 1 ? 's' : ''}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Calendar size={10} />
                          {board.createdAt ? new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Active'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Settings / Edit and Delete Buttons (Z-20 absolute popup overlay) */}
                  {isOwner && (
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingBoard(board);
                          setEditBoardTitle(board.title);
                          setEditBoardDesc(board.description || '');
                          setEditBoardBg(board.background || 'bg-dark-950');
                        }}
                        className="p-1.5 bg-dark-900/90 hover:bg-dark-900 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                        title="Edit Workspace"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteBoard(e, board._id)}
                        className="p-1.5 bg-dark-900/90 hover:bg-dark-900 border border-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete Workspace"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredBoards.length === 0 && (
              <div className="col-span-full py-12 text-center glass rounded-2xl border-dashed border border-white/10 p-8">
                <p className="text-slate-400 text-sm">No workspaces match your query. Try another search or create a new board!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Create New Workspace</h2>
            <form onSubmit={createBoard}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace Name</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Q3 Roadmap Planning"
                    className="w-full bg-dark-950 border border-slate-700/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Background Theme</label>
                  <div className="grid grid-cols-6 gap-2.5">
                    {bgOptions.map(bg => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setNewBoardBg(bg.id)}
                        className={`w-10 h-10 rounded-xl ${bg.class} border-2 ${newBoardBg === bg.id ? 'border-primary-500 scale-105 shadow-lg shadow-primary-500/20' : 'border-slate-800'} hover:border-primary-400 hover:scale-105 transition-all cursor-pointer`}
                        title={bg.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-white transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-lg font-semibold transition cursor-pointer text-sm shadow-md"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Board Modal */}
      {editingBoard && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-white/10 w-full max-w-md p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setEditingBoard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-full hover:bg-slate-800"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Edit Workspace settings</h2>
            <form onSubmit={handleUpdateBoard}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Title</label>
                  <input
                    type="text"
                    autoFocus
                    className="w-full bg-dark-950 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                    value={editBoardTitle}
                    onChange={(e) => setEditBoardTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                  <textarea
                    className="w-full bg-dark-950 border border-slate-700/60 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm min-h-[80px]"
                    value={editBoardDesc}
                    onChange={(e) => setEditBoardDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Background Theme</label>
                  <div className="grid grid-cols-6 gap-2.5">
                    {bgOptions.map(bg => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setEditBoardBg(bg.id)}
                        className={`w-10 h-10 rounded-xl ${bg.class} border-2 ${editBoardBg === bg.id ? 'border-primary-500 scale-105 shadow-lg shadow-primary-500/20' : 'border-slate-800'} hover:border-primary-400 hover:scale-105 transition-all cursor-pointer`}
                        title={bg.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setEditingBoard(null)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-400 hover:text-white transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-lg font-semibold transition cursor-pointer text-sm shadow-md"
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
