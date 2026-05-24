import React, { useState, useEffect, useRef } from 'react';
import { X, Search, UserPlus, Shield, Trash2, Check } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import useStore from '../store/useStore';

const ShareBoardModal = ({ isOpen, onClose, board, onUpdateBoard }) => {
  const { user: currentUser } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Editor');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchLoading(true);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const { data } = await api.get(`/notifications/search-users?q=${searchQuery}`);
          // Filter out users who are already members
          const filtered = data.filter(u => 
            !board.members.some(m => (m.userId?._id || m.userId) === u._id)
          );
          setSearchResults(filtered);
        } catch (error) {
          console.error(error);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, board]);

  if (!isOpen) return null;

  const handleInvite = async () => {
    if (!selectedUser) return;
    setInviteLoading(true);
    try {
      const { data } = await api.post('/notifications/invite', {
        boardId: board._id,
        userId: selectedUser._id,
        role: selectedRole
      });
      onUpdateBoard(data);
      toast.success(`Successfully invited ${selectedUser.username}`);
      setSelectedUser(null);
      setSearchQuery('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to invite user');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (userId, username) => {
    try {
      const { data } = await api.post('/notifications/remove-member', {
        boardId: board._id,
        userId
      });
      onUpdateBoard(data);
      toast.success(`Removed ${username} from the board`);
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-slate-700/60 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus className="text-primary-500" size={20} />
            Share Board
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1 hover:bg-white/5 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Invite Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invite new member</label>
            
            {!selectedUser ? (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-950 border border-slate-800 focus:border-primary-500 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none transition-colors"
                />
                
                {/* Search suggestions */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-dark-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                    {searchResults.map(u => (
                      <div
                        key={u._id}
                        onClick={() => setSelectedUser(u)}
                        className="flex items-center gap-3 p-3 hover:bg-primary-600/10 cursor-pointer border-b border-slate-900/50 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold text-xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{u.username}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchLoading && (
                  <div className="absolute right-3 top-3 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-dark-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-bold text-xs">
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{selectedUser.username}</p>
                    <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5"
                >
                  Change
                </button>
              </div>
            )}

            {selectedUser && (
              <div className="flex gap-3 items-center mt-3">
                <div className="flex-1">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-dark-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value="Viewer" className="bg-dark-900 text-slate-200">Viewer (Read Only)</option>
                    <option value="Editor" className="bg-dark-900 text-slate-200">Editor (Edit board & cards)</option>
                    <option value="Admin" className="bg-dark-900 text-slate-200">Admin (Full Control)</option>
                  </select>
                </div>
                <button
                  onClick={handleInvite}
                  disabled={inviteLoading}
                  className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-semibold text-sm px-5 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-primary-500/20 shrink-0"
                >
                  {inviteLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Invite
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Current Members Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Members</label>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {board.members.map(m => {
                const memberUser = m.userId;
                if (!memberUser) return null;
                const isSelf = memberUser._id === currentUser?._id;
                const isOwner = board.owner === memberUser._id;
                
                return (
                  <div key={memberUser._id} className="flex items-center justify-between p-3 bg-dark-950/40 border border-slate-800/60 rounded-xl hover:border-slate-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600 border border-dark-800 flex items-center justify-center text-xs font-semibold text-white">
                        {memberUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-200">{memberUser.username}</p>
                          {isSelf && <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.5 rounded font-medium">You</span>}
                          {isOwner && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium">Owner</span>}
                        </div>
                        <p className="text-xs text-slate-500">{memberUser.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2 py-1 bg-dark-900 border border-slate-800 rounded-lg text-slate-300 flex items-center gap-1.5">
                        <Shield size={12} className="text-primary-500" />
                        {m.role || (isOwner ? 'Owner' : 'Editor')}
                      </span>
                      
                      {!isOwner && !isSelf && (
                        <button
                          onClick={() => handleRemoveMember(memberUser._id, memberUser.username)}
                          className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareBoardModal;
