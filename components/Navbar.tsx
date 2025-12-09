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
      {/* Mobile/Desktop Dock - White Theme */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-2 shadow-xl shadow-slate-200/50 flex items-center gap-2 relative">
          
          {tabs.map((tab) => {
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as ActiveTab)}
                 className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group ${
                   tab.primary 
                     ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-110 -translate-y-2 mx-2' 
                     : isActive 
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                 }`}
               >
                 <tab.icon className={`w-6 h-6 ${tab.primary ? 'w-7 h-7' : ''}`} />
                 
                 {/* Tooltip Label */}
                 <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
                    {tab.label}
                 </span>

                 {/* Active Indicator Dot */}
                 {!tab.primary && isActive && (
                   <motion.div 
                     layoutId="activeTabDot"
                     className="absolute bottom-2 w-1 h-1 bg-emerald-500 rounded-full"
                   />
                 )}
               </button>
             );
          })}

          {/* XP Badge attached to dock */}
          <div className="hidden md:flex absolute -right-32 top-1/2 -translate-y-1/2 items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm">
              <Award className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-mono font-bold text-slate-700">{xp} XP</span>
          </div>

        </div>
      </div>

      {/* Mobile Top XP */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-gradient-to-b from-white/90 to-transparent pointer-events-none">
         <div className="flex items-center gap-2 pointer-events-auto">
             <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center backdrop-blur-md border border-emerald-100">
               <Leaf className="w-4 h-4 text-emerald-500" />
             </div>
             <span className="font-display font-bold text-slate-900 tracking-tight">EcoSnap</span>
         </div>
         <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-slate-200 shadow-sm pointer-events-auto">
            <Award className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-mono font-bold text-slate-700">{xp} XP</span>
         </div>
      </div>
    </>
  );
};

export default Navbar;