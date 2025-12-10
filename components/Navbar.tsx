import React from 'react';
import { Leaf, Award, Home, Camera, Mic, Grid, Layers } from 'lucide-react';
import { ActiveTab } from '../types';
import { motion } from 'framer-motion';

interface NavbarProps {
  xp: number;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const Navbar: React.FC<NavbarProps> = ({ xp, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'scan', icon: Camera, label: 'Scan', primary: true },
    { id: 'live', icon: Mic, label: 'Live' },
    { id: 'gallery', icon: Grid, label: 'Gallery' },
  ];

  return (
    <>
      {/* Floating Dock - Premium Glassmorphism */}
      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-2.5 shadow-2xl shadow-slate-300/40 flex items-center gap-3 relative">
          
          {tabs.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as ActiveTab)}
                 className={`relative flex items-center justify-center w-14 h-14 rounded-[1.5rem] transition-all duration-300 group ${
                   tab.primary 
                     ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/30 scale-110 -translate-y-3 mx-2 hover:scale-115 active:scale-105' 
                     : isActive 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                 }`}
               >
                 <tab.icon className={`transition-transform duration-300 ${tab.primary ? 'w-6 h-6' : 'w-6 h-6 group-hover:scale-110'}`} />
                 
                 {/* Active Indicator Dot for non-primary */}
                 {!tab.primary && isActive && (
                   <motion.div 
                     layoutId="activeTabDot"
                     className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full"
                   />
                 )}
               </button>
             );
          })}

        </div>
      </div>

      {/* Top Bar (XP) - Desktop: Top Right, Mobile: Top Full */}
      <div className="fixed top-0 left-0 right-0 z-40 p-6 pointer-events-none flex justify-between items-start">
         
         {/* Mobile Brand */}
         <div className="md:hidden flex items-center gap-2 pointer-events-auto opacity-0 animate-in fade-in duration-700">
             {/* Hidden on mobile usually, but good for context if Dashboard isn't showing brand */}
         </div>

         {/* XP Pill */}
         <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-white/40 shadow-lg shadow-slate-200/50 hover:scale-105 transition-transform cursor-default ml-auto">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                <Award className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level 3</span>
                <span className="text-sm font-display font-bold text-slate-900">{xp} XP</span>
            </div>
         </div>
      </div>
    </>
  );
};

export default Navbar;