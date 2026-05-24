import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { LayoutDashboard, LogOut, X, Briefcase } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'May 24, 2026';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return 'May 24, 2026';
    }
  };

  return (
    <header className="bg-dark-950/80 backdrop-blur border-b border-white/10 p-4 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            CollabTask
          </h1>
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-3 mr-4 cursor-pointer hover:opacity-80 transition text-left group"
              >
                <div className="w-8 h-8 bg-dark-800 rounded-full flex items-center justify-center text-sm font-medium text-primary-400 border border-slate-700 group-hover:border-primary-500 transition-colors">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-slate-300 group-hover:text-white font-medium hidden sm:block transition-colors">{user?.username || 'User'}</span>
              </button>
              <Link 
                to="/dashboard"
                className="flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium mr-2"
              >
                <LayoutDashboard size={16} className="text-primary-400" />
                <span>Dashboard</span>
              </Link>
              <NotificationBell />
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition font-medium">Sign In</Link>
              <Link to="/register" className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-primary-500/20">
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Profile Card Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xs overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col text-left">
            
            {/* Header Banner - Gradient from blue to violet/purple */}
            <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative flex justify-end p-3">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="w-7 h-7 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="px-5 pb-5 relative flex flex-col">
              
              {/* Profile avatar overlapping banner */}
              <div className="absolute top-[-36px] left-5 flex items-end">
                <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-primary-600 via-violet-500 to-primary-400 border-4 border-slate-900 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                
                {/* Little blue edit/briefcase circle badge next to avatar */}
                <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-slate-900 flex items-center justify-center shadow absolute bottom-0.5 right-0.5 text-white">
                  <Briefcase size={10} />
                </div>
              </div>

              {/* Offset space for overlapping avatar */}
              <div className="h-14" />

              {/* Data fields */}
              <div className="space-y-3.5">
                
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{user?.username || 'Guest User'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</div>
                  <div className="text-sm font-semibold text-white mt-0.5">{user?.email || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</div>
                  <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                    user
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Since</div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {formatDate(user?.createdAt)}
                  </div>
                </div>

              </div>

              {/* Close Button at bottom */}
              <div className="mt-5 pt-3 border-t border-white/5">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-xl transition focus:outline-none text-xs"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </header>

  );
};

export default Navbar;
