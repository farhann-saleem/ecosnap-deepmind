import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, Github } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-100 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-50"></div>

            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8 pt-2">
              <h2 className="font-display font-bold text-3xl text-slate-900 mb-2 tracking-tight">
                {isLogin ? 'Welcome back' : 'Join EcoSnap'}
              </h2>
              <p className="text-slate-500 font-sans">
                {isLogin 
                  ? 'Enter your details to access your eco-journey.' 
                  : 'Start your journey to zero waste today.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider font-display">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-400 font-sans"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-display font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-xs text-slate-400 font-medium font-sans">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <button className="w-full mt-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl flex items-center justify-center gap-3 transition-colors font-display shadow-sm">
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>

            <p className="mt-8 text-center text-sm text-slate-500 font-sans">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-emerald-600 font-bold hover:underline decoration-emerald-500/30 underline-offset-4"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;