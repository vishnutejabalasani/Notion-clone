import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layout, CheckCircle2 } from 'lucide-react';
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

      {/* A Beautiful, Sweet Visual Preview Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        className="w-full max-w-3xl glass rounded-2xl border border-white/10 p-5 bg-dark-950/40 backdrop-blur-md shadow-2xl z-10"
      >
        {/* Mock Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-500/20 rounded flex items-center justify-center">
              <Layout size={13} className="text-primary-400" />
            </div>
            <span className="text-xs font-semibold text-slate-300">My Workspace</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Mock Columns */}
        <div className="grid grid-cols-3 gap-4 text-left">
          {/* Column 1 */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Todo</div>
            <div className="bg-dark-900/80 border border-white/5 p-3 rounded-lg shadow-sm">
              <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-semibold uppercase">High</span>
              <p className="text-xs font-medium text-white mt-1.5">Draft project scope</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>In Progress</span>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            </div>
            <div className="bg-dark-900/80 border border-white/5 p-3 rounded-lg shadow-sm">
              <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-semibold uppercase">Medium</span>
              <p className="text-xs font-medium text-white mt-1.5">Design brand asset package</p>
            </div>
          </div>

          {/* Column 3 */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Done</div>
            <div className="bg-dark-900/40 border border-emerald-500/10 p-3 rounded-lg shadow-sm line-through text-slate-500 flex items-start gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
              <span className="text-xs font-medium truncate">Set up auth routes</span>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default Home;
