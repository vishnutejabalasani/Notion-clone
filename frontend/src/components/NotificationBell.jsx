import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Users, MessageSquare, Calendar, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useStore from '../store/useStore';
import { format } from 'date-fns';

const NotificationBell = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Join user-specific socket room
    const socket = io('http://localhost:5000');
    socket.emit('joinUser', user._id || user.id);

    socket.on('newNotification', () => {
      fetchNotifications();
    });

    return () => socket.disconnect();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    if (notif.boardId) {
      navigate(`/board/${notif.boardId._id || notif.boardId}`);
      setShowDropdown(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'board_invite': return <Users size={16} className="text-primary-400" />;
      case 'mention': return <MessageSquare size={16} className="text-amber-400" />;
      case 'card_assigned': return <Check size={16} className="text-emerald-400" />;
      case 'due_date': return <Calendar size={16} className="text-red-400" />;
      case 'comment': return <MessageSquare size={16} className="text-blue-400" />;
      default: return <Bell size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/5"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-12 w-96 bg-dark-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setShowDropdown(false)} className="text-slate-400 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 p-4 border-b border-slate-800 cursor-pointer hover:bg-white/5 transition ${
                    !notif.isRead ? 'bg-primary-500/5' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!notif.isRead ? 'text-white' : 'text-slate-400'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {notif.createdAt ? format(new Date(notif.createdAt), 'MMM d, h:mm a') : ''}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
