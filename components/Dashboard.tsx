import React from 'react';
import { UserStats, HistoryItem } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Leaf, Zap, Flame, Trophy, BrainCircuit, ArrowUpRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
    stats: UserStats;
    history: HistoryItem[];
    onStartQuiz: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, history, onStartQuiz }) => {
    
    // Time-based greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    // Mock chart data for smooth curve
    const chartData = [
        { name: 'Mon', xp: 120 },
        { name: 'Tue', xp: 180 },
        { name: 'Wed', xp: 150 },
        { name: 'Thu', xp: 240 },
        { name: 'Fri', xp: 200 },
        { name: 'Sat', xp: stats.xp > 240 ? stats.xp : 280 }, // Dynamic based on current
        { name: 'Sun', xp: stats.xp },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="pt-24 pb-32 px-6 max-w-lg mx-auto space-y-8"
        >
            
            {/* Header / Welcome */}
            <motion.div variants={item} className="flex justify-between items-end">
                <div>
                    <span className="text-slate-400 font-medium text-sm mb-1 block">{greeting}, Green Guardian</span>
                    <h1 className="text-3xl font-display font-bold text-slate-900 leading-none">Your Impact Hub</h1>
                </div>
                <div className="flex flex-col items-end">
                     <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 px-3 py-1.5 rounded-full shadow-sm">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-orange-700 font-bold font-mono text-sm">{stats.streak} Day Streak</span>
                     </div>
                </div>
            </motion.div>

            {/* Holographic Daily Challenge Card */}
            <motion.div variants={item} className="relative group perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2rem] opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-1 shadow-2xl">
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-[1.8rem] p-6 h-full relative overflow-hidden">
                        {/* Abstract shapes */}
                        <div className="absolute top-[-50%] left-[-20%] w-[300px] h-[300px] bg-indigo-500/30 rounded-full blur-[80px]"></div>
                        <div className="absolute bottom-[-50%] right-[-20%] w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-[80px]"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                                    <BrainCircuit className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Daily Quest</span>
                                </div>
                                <span className="text-white/60 text-xs font-mono">Resets in 4h</span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight font-display">Master the Art of <br/>Composting</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
                                </div>
                                <span className="text-emerald-400 text-xs font-bold">+50 XP</span>
                            </div>

                            <button 
                                onClick={onStartQuiz}
                                className="w-full bg-white text-slate-900 font-bold py-3.5 px-6 rounded-xl text-sm hover:bg-emerald-50 transition-colors shadow-lg flex items-center justify-center gap-2 group/btn"
                            >
                                Start Challenge
                                <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item}>
                <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest px-1">Vital Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] flex flex-col justify-between h-40 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-emerald-100 rounded-full blur-2xl group-hover:bg-emerald-200 transition-colors opacity-60"></div>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 mb-2 z-10">
                            <Leaf className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="z-10">
                            <span className="text-4xl font-display font-bold text-slate-900 block tracking-tight">{stats.scans}</span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Items Scanned</span>
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 p-6 rounded-[2rem] flex flex-col justify-between h-40 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-cyan-100 rounded-full blur-2xl group-hover:bg-cyan-200 transition-colors opacity-60"></div>
                        <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center border border-cyan-100 mb-2 z-10">
                            <Zap className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="z-10">
                            <span className="text-4xl font-display font-bold text-slate-900 block tracking-tight">{stats.co2Saved.toFixed(1)}</span>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">kg CO₂ Saved</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Activity Chart */}
            <motion.div variants={item} className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-slate-900 font-bold text-lg font-display">XP Growth</h3>
                        <p className="text-xs text-slate-400">Past 7 Days</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                </div>
                <div className="h-48 w-full -ml-2 min-h-[12rem]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tickMargin={10}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="xp" 
                                stroke="#10b981" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorXp)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;