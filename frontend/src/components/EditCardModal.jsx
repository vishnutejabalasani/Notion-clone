import React, { useState } from 'react';
import { X, Trash, Plus, Check, MessageSquare, Sparkles } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import useStore from '../store/useStore';
import { format } from 'date-fns';

const EditCardModal = ({ card, onClose, boardId }) => {
  const { user } = useStore();
  const [title, setTitle] = useState(card.title || '');
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'Medium');
  const [labels, setLabels] = useState(card.labels || []);
  const [checklists, setChecklists] = useState(card.checklists || []);
  const [comments, setComments] = useState(card.comments || []);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // New item states
  const [newComment, setNewComment] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('bg-blue-500');

  const labelColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 
    'bg-amber-500', 'bg-purple-500', 'bg-slate-500'
  ];

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    // Clean up comments for backend
    const formattedComments = comments.map(c => ({
      ...c,
      userId: typeof c.userId === 'object' ? c.userId?._id : c.userId
    }));

    try {
      await api.put(`/boards/cards/${card._id}`, {
        updates: { title, description, priority, labels, checklists, comments: formattedComments },
        boardId
      });
      toast.success('Card updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update card');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    setLoading(true);
    try {
      await api.delete(`/boards/cards/${card._id}`);
      toast.success('Card deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete card');
      setLoading(false);
    }
  };

  // Label Actions
  const addLabel = () => {
    if (!newLabelText.trim()) return;
    setLabels([...labels, { text: newLabelText, color: newLabelColor }]);
    setNewLabelText('');
  };
  const removeLabel = (idx) => setLabels(labels.filter((_, i) => i !== idx));

  // Checklist Actions
  const addChecklist = () => {
    if (!newChecklistTitle.trim()) return;
    setChecklists([...checklists, { title: newChecklistTitle, items: [] }]);
    setNewChecklistTitle('');
  };
  const addChecklistItem = (listIdx, text) => {
    if (!text.trim()) return;
    const newChecklists = [...checklists];
    newChecklists[listIdx].items.push({ text, isCompleted: false });
    setChecklists(newChecklists);
  };
  const toggleChecklistItem = (listIdx, itemIdx) => {
    const newChecklists = [...checklists];
    newChecklists[listIdx].items[itemIdx].isCompleted = !newChecklists[listIdx].items[itemIdx].isCompleted;
    setChecklists(newChecklists);
  };
  const removeChecklist = (idx) => setChecklists(checklists.filter((_, i) => i !== idx));

  // Comment Actions
  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([{ text: newComment, userId: user, createdAt: new Date() }, ...comments]);
    setNewComment('');
  };

  const handleAIBreakdown = async () => {
    if (!title) {
      toast.error('Card must have a title for AI to work.');
      return;
    }
    setAiGenerating(true);
    try {
      const { data } = await api.post('/ai/breakdown', { title, description });
      if (data.checklistItems && data.checklistItems.length > 0) {
        const aiChecklist = {
          title: 'AI Breakdown',
          items: data.checklistItems.map(text => ({ text, isCompleted: false }))
        };
        setChecklists([...checklists, aiChecklist]);
        toast.success('AI checklist generated!');
      } else {
        toast.error('AI returned an empty checklist.');
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('GEMINI_API_KEY')) {
        toast.error('Please add GEMINI_API_KEY to your .env file on the backend.');
      } else {
        toast.error('Failed to generate AI breakdown.');
      }
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-dark-900 border border-slate-700 w-full max-w-4xl rounded-xl shadow-2xl relative my-auto">
        <div className="sticky top-0 bg-dark-900 border-b border-slate-700 p-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-xl font-bold text-white flex-1 mr-4">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-transparent hover:border-slate-700 focus:border-primary-500 px-1 py-1 text-white focus:outline-none"
            />
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition bg-dark-800 p-1.5 rounded-full hover:bg-slate-800 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Description */}
            <section>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                Description
              </h3>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="w-full bg-dark-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 min-h-[120px]"
              />
            </section>

            {/* Checklists */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-slate-300">Checklists</h3>
                  <button 
                    type="button"
                    onClick={handleAIBreakdown}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-2 py-1 rounded shadow-lg shadow-violet-500/20 transition disabled:opacity-50"
                  >
                    <Sparkles size={12} />
                    {aiGenerating ? 'Thinking...' : 'AI Generate'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="New checklist title..."
                    className="bg-dark-800 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && addChecklist()}
                  />
                  <button onClick={addChecklist} className="bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-white text-sm">Add</button>
                </div>
              </div>

              <div className="space-y-4">
                {checklists.map((cl, clIdx) => {
                  const completedCount = cl.items.filter(i => i.isCompleted).length;
                  const progress = cl.items.length ? Math.round((completedCount / cl.items.length) * 100) : 0;
                  
                  return (
                    <div key={clIdx} className="bg-dark-800 rounded-lg p-4 border border-slate-700/50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-white">{cl.title}</h4>
                        <button onClick={() => removeChecklist(clIdx)} className="text-slate-400 hover:text-red-400"><Trash size={14} /></button>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs text-slate-400 w-8">{progress}%</span>
                        <div className="flex-1 bg-dark-900 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        {cl.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex items-start gap-3 group">
                            <button 
                              onClick={() => toggleChecklistItem(clIdx, itemIdx)}
                              className={`mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center border ${item.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}
                            >
                              {item.isCompleted && <Check size={12} className="text-white" />}
                            </button>
                            <span className={`text-sm ${item.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="text" 
                          placeholder="Add an item..."
                          className="flex-1 bg-dark-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addChecklistItem(clIdx, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Comments */}
            <section>
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <MessageSquare size={16} />
                Activity & Comments
              </h3>
              
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-dark-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 min-h-[80px]"
                  />
                  <button 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="mt-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-1.5 rounded text-sm font-medium transition disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {comments.map((comment, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-dark-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-sm text-white">{comment.userId?.username || 'User'}</span>
                        <span className="text-xs text-slate-400">
                          {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, h:mm a') : 'Just now'}
                        </span>
                      </div>
                      <div className="bg-dark-800 p-3 rounded-lg text-sm text-slate-200 border border-slate-700/50">
                        {comment.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Priority */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Priority</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('Low')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all duration-200 shadow-sm cursor-pointer ${
                    priority === 'Low'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 ring-1 ring-emerald-500/20'
                      : 'bg-dark-800 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-dark-700/80'
                  }`}
                >
                  Low
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('Medium')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all duration-200 shadow-sm cursor-pointer ${
                    priority === 'Medium'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500 ring-1 ring-orange-500/20'
                      : 'bg-dark-800 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-dark-700/80'
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('High')}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all duration-200 shadow-sm cursor-pointer ${
                    priority === 'High'
                      ? 'bg-red-500/20 text-red-400 border-red-500 ring-1 ring-red-500/20'
                      : 'bg-dark-800 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-dark-700/80'
                  }`}
                >
                  High
                </button>
              </div>
            </div>

            {/* Labels */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Labels</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {labels.map((label, idx) => (
                  <div key={idx} className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium text-white ${label.color}`}>
                    <span>{label.text}</span>
                    <button onClick={() => removeLabel(idx)} className="hover:bg-white/20 rounded-full p-0.5">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="bg-dark-800 p-3 rounded-lg border border-slate-700">
                <input
                  type="text"
                  placeholder="Label name..."
                  value={newLabelText}
                  onChange={(e) => setNewLabelText(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-white mb-2 focus:outline-none"
                />
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {labelColors.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setNewLabelColor(c)}
                      className={`w-6 h-6 rounded-full ${c} ${newLabelColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-800' : ''}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={addLabel}
                  disabled={!newLabelText.trim()}
                  className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white py-1.5 rounded text-sm transition"
                >
                  Create Label
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700 space-y-3">
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {loading ? 'Saving...' : 'Save All Changes'}
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-dark-800 border border-red-500/30 text-red-400 hover:bg-red-500/10 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Trash size={16} />
                Delete Card
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCardModal;
