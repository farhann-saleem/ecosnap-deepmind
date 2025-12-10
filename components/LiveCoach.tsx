import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scan, Zap, BrainCircuit, Lock, Video } from 'lucide-react';

const LiveCoach: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
       </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full text-center space-y-8"
      >
        
        {/* Icon / Hero */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-full shadow-2xl ring-1 ring-white/20">
                <Video className="w-12 h-12 text-white/90" />
            </div>
            <div className="absolute -top-2 -right-2 bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full border border-amber-400 shadow-lg font-display uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Coming Soon
            </div>
        </div>

        {/* Text */}
        <div className="space-y-4">
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">
                Live Eco-Vision <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Context Aware</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-sans">
                We are building an advanced real-time engine to detect objects and educate you on environmental impact in real-life cases.
            </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-4 text-left">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors"
            >
                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400"><Scan className="w-5 h-5"/></div>
                <div>
                    <h3 className="text-white font-bold text-sm font-display">Live Object Detection</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Detecting real-time objects in your surroundings.</p>
                </div>
            </motion.div>
            
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors"
            >
                <div className="p-2.5 bg-cyan-500/20 rounded-xl text-cyan-400"><Zap className="w-5 h-5"/></div>
                <div>
                    <h3 className="text-white font-bold text-sm font-display">Interactive Education</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Get educated on real-life cases instantly.</p>
                </div>
            </motion.div>
        </div>

        {/* CTA */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
        >
            <button className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-slate-400 font-bold py-4 rounded-2xl border border-slate-700/50 flex items-center justify-center gap-2 cursor-default hover:text-slate-300 transition-colors">
                <Sparkles className="w-4 h-4" />
                Under Development
            </button>
            <p className="text-slate-600 text-xs mt-4 font-mono">
                Target Release: EcoSnap v3.0
            </p>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default LiveCoach;