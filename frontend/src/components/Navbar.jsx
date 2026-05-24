import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { LayoutDashboard, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-dark-950/80 backdrop-blur border-b border-white/10 p-4 sticky top-0 z-50">
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
              <div className="flex items-center gap-3 mr-4">
                <div className="w-8 h-8 bg-dark-800 rounded-full flex items-center justify-center text-sm font-medium text-primary-400 border border-slate-700">
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-slate-300 font-medium hidden sm:block">{user?.username || 'User'}</span>
              </div>
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
    </header>
  );
};

export default Navbar;
