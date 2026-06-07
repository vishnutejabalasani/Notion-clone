import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Calendar, 
  ExternalLink,
  PlusCircle,
  Move,
  Trash2,
  LayoutDashboard,
  FileText,
  Clock
} from 'lucide-react';
import api from '../api/axios';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useStore();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await api.get('/auth/activities');
        setActivities(data);
      } catch (error) {
        toast.error('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getMemberSinceDate = (dateString) => {
    if (!dateString) return 'May 2026';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return 'May 2026';
    }
  };

  // Helper to get relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  // Helper to return style/icon based on action text
  const getActivityMeta = (action) => {
    const act = action.toLowerCase();
    if (act.includes('created the board') || act.includes('created board')) {
      return {
        icon: <LayoutDashboard size={16} className="text-emerald-400" />,
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        textStyle: 'text-emerald-300'
      };
    }
    if (act.includes('added card') || act.includes('created card')) {
      return {
        icon: <PlusCircle size={16} className="text-blue-400" />,
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        textStyle: 'text-blue-300'
      };
    }
    if (act.includes('moved')) {
      return {
        icon: <Move size={16} className="text-amber-400" />,
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        textStyle: 'text-amber-300'
      };
    }
    if (act.includes('delete') || act.includes('removed')) {
      return {
        icon: <Trash2 size={16} className="text-rose-400" />,
        bgColor: 'bg-rose-500/10 border-rose-500/20',
        textStyle: 'text-rose-300'
      };
    }
    return {
      icon: <FileText size={16} className="text-slate-400" />,
      bgColor: 'bg-slate-500/10 border-slate-500/20',
      textStyle: 'text-slate-300'
    };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200 group text-sm font-medium"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Profile Information Card */}
        <div className="lg:col-span-1 bg-dark-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-600 via-indigo-500 to-purple-600 border-4 border-slate-800 flex items-center justify-center text-4xl font-extrabold text-white shadow-2xl">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute bottom-0 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow" title="Online">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping absolute" />
                <span className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            {/* Info details */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">{user?.username || 'Guest User'}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase tracking-wider">
                user
              </span>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Info Rows */}
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-dark-950 flex items-center justify-center border border-white/5 text-slate-400 shrink-0">
                <UserIcon size={16} />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Username</p>
                <p className="font-semibold text-white mt-1">{user?.username || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-dark-950 flex items-center justify-center border border-white/5 text-slate-400 shrink-0">
                <Mail size={16} />
              </div>
              <div className="truncate">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Email Address</p>
                <p className="font-semibold text-white mt-1 truncate">{user?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-dark-950 flex items-center justify-center border border-white/5 text-slate-400 shrink-0">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Account Role</p>
                <p className="font-semibold text-white mt-1 capitalize">Standard Member</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-8 h-8 rounded-lg bg-dark-950 flex items-center justify-center border border-white/5 text-slate-400 shrink-0">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Member Since</p>
                <p className="font-semibold text-white mt-1">
                  {getMemberSinceDate(user?.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Quick stats */}
          <div className="bg-dark-950/60 border border-white/5 rounded-xl p-4 flex items-center justify-between text-center">
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Logged Actions</p>
              <p className="text-xl font-extrabold text-white mt-1">{activities.length}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/5" />
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</p>
              <p className="text-xs font-semibold text-green-400 mt-1 flex items-center gap-1 justify-center">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Activity Log Feed */}
        <div className="lg:col-span-2 bg-dark-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={18} className="text-primary-400" />
              Activity Log
            </h3>
            <span className="text-xs text-slate-400">Showing last {activities.length} events</span>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col justify-center items-center py-12 space-y-4">
              <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-white/5">
                <History size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">No activity logged yet</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Once you start creating boards, tasks, or moving cards, your logs will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative border-l border-slate-800/80 ml-3 pl-6 space-y-6 flex-1">
              {activities.map((act) => {
                const meta = getActivityMeta(act.action);
                return (
                  <div key={act._id} className="relative group/item">
                    {/* Event node connector */}
                    <div className={`absolute left-[-31px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border ${meta.bgColor} z-10 transition-transform group-hover/item:scale-110 shadow`}>
                      {meta.icon}
                    </div>

                    {/* Log item details */}
                    <div className="bg-slate-950/40 hover:bg-slate-950/70 border border-white/5 hover:border-slate-800 rounded-xl p-4 transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-slate-200 text-sm font-medium leading-relaxed">
                            You <span className={meta.textStyle}>{act.action}</span>
                            {act.cardId?.title && (
                              <span className="text-white font-semibold"> "{act.cardId.title}"</span>
                            )}
                          </p>
                          
                          {/* Board context link */}
                          {act.boardId && (
                            <div className="mt-2 inline-flex">
                              <Link
                                to={`/board/${act.boardId._id}`}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary-400 hover:text-primary-300 transition-colors bg-primary-500/5 hover:bg-primary-500/10 border border-primary-500/15 px-2 py-0.5 rounded"
                              >
                                {act.boardId.title || 'View Board'}
                                <ExternalLink size={10} />
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="shrink-0 flex items-center gap-1.5 text-slate-500 text-xs mt-1 sm:mt-0" title={formatDate(act.createdAt)}>
                          <Clock size={12} />
                          <span>{getRelativeTime(act.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
