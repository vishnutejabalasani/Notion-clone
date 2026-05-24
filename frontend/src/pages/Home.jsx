import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layout, ListTodo, Users, Sparkles, Bell, UserCheck } from 'lucide-react';
import useStore from '../store/useStore';

const Home = () => {
  const { user } = useStore();

  return (
    <div className="relative min-h-[85vh] bg-dark-950 text-slate-100 flex flex-col justify-center items-center overflow-hidden px-6 py-12">
      
      {/* Soft background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

      {/* Main Title and Description */}
      <div className="text-center max-w-2xl mx-auto mb-10 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight"
        >
          Simplify your team's{' '}
          <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-indigo-500 bg-clip-text text-transparent">
            workflow.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-slate-400 max-w-lg mx-auto leading-relaxed"
        >
          A beautiful, collaborative workspace designed to keep your tasks organized and your team connected. No friction, just focus.
        </motion.p>
      </div>

      {/* Dynamic CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-4 justify-center mb-16 z-10"
      >
        {user ? (
          <Link
            to="/dashboard"
            className="group px-7 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition duration-300 shadow-lg shadow-primary-500/20 flex items-center gap-2"
          >
            Go to Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : (
          <Link
            to="/register"
            className="group px-7 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition duration-300 shadow-lg shadow-primary-500/20 flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </motion.div>


      {/* Features Grid - Real App Functionalities */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full max-w-3xl mt-20 z-10 text-center"
      >
        <h2 className="text-xl font-bold text-white mb-2">Everything you need to ship faster</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-10">A fully integrated productivity suite crafted with care.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
          
          {/* Card 1: Kanban Workspaces */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:border-primary-500/20 hover:bg-slate-900/60 transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
              <Layout size={16} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Visual Kanban</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Customize boards, columns, and drag tasks effortlessly through your workflow.</p>
          </div>

          {/* Card 2: Rich Task Details */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:border-primary-500/20 hover:bg-slate-900/60 transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
              <ListTodo size={16} className="text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Rich Task Details</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Add task priorities, subtask checklists, due date calendars, and upload attachments.</p>
          </div>

          {/* Card 3: Real-Time Sync */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:border-primary-500/20 hover:bg-slate-900/60 transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
              <Users size={16} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Live Collaboration</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Instantly sync changes across your team with real-time Socket.io active board shares.</p>
          </div>

          {/* Card 4: Gemini AI */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:border-primary-500/20 hover:bg-slate-900/60 transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
              <Sparkles size={16} className="text-purple-400 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-white">Gemini AI Assistant</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Leverage Google Gemini power to generate subtasks and summarize comments dynamically.</p>
          </div>

          {/* Card 5: Smart Notifications */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:border-primary-500/20 hover:bg-slate-900/60 transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center mb-3">
              <Bell size={16} className="text-rose-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Smart Alerts</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Stay updated in real-time when team members mention, assign, or share boards with you.</p>
          </div>

          {/* Card 6: Task Ownership */}
          <div className="bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:border-primary-500/20 hover:bg-slate-900/60 transition duration-300">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center mb-3">
              <UserCheck size={16} className="text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Team Assignment</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">Assign cards to team members to establish clear ownership and drive execution.</p>
          </div>

        </div>
      </motion.div>

    </div>
  );
};

export default Home;
