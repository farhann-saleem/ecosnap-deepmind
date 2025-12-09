import React from 'react';
import { UserStats, HistoryItem } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Leaf, Zap, Flame, Trophy, BrainCircuit } from 'lucide-react';

interface DashboardProps {
    stats: UserStats;
    history: HistoryItem[];
    onStartQuiz: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, history, onStartQuiz }) => {
    
    // Mock chart data derived from history or static for demo
    const chartData = [
        { name: 'M', items: 2 },
        { name: 'T', items: 5 },
        { name: 'W', items: 3 },
        { name: 'T', items: 7 },
        { name: 'F', items: 4 },
        { name: 'S', items: stats.scans },
        { name: 'S', items: 0 },
    ];

    return (
        <div className="pt-24 pb-32 px-6 max-w-lg mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Header / Welcome */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 leading-none mb-1">Eco Dashboard</h1>
                    <p className="text-emerald-600 text-sm font-medium">Level 3 • Green Guardian</p>
                </div>
                <div className="text-center">
                     <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-orange-600 font-bold font-mono">{stats.streak} Day</span>
                     </div>
                </div>
            </div>

            {/* Daily Quiz Card */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-6 shadow-2xl shadow-indigo-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 opacity-90">
                        <BrainCircuit className="w-5 h-5 text-white" />
                        <span className="text-xs font-bold uppercase tracking-widest text-white">Daily Challenge</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">Master the Art of <br/>Composting</h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-[80%]">Earn 50 XP by completing today's eco-trivia.</p>
                    <button 
                        onClick={onStartQuiz}
                        className="bg-white text-indigo-900 font-bold py-3 px-6 rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        Start Quiz
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div>
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between h-32 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-emerald-50 rounded-full blur-xl group-hover:bg-emerald-100 transition-colors"></div>
                        <Leaf className="w-6 h-6 text-emerald-500" />
                        <div>
                            <span className="text-3xl font-display font-bold text-slate-900 block">{stats.scans}</span>
                            <span className="text-xs text-slate-500 font-medium">Items Scanned</span>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-5 rounded-3xl flex flex-col justify-between h-32 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-cyan-50 rounded-full blur-xl group-hover:bg-cyan-100 transition-colors"></div>
                        <Zap className="w-6 h-6 text-cyan-500" />
                        <div>
                            <span className="text-3xl font-display font-bold text-slate-900 block">{stats.co2Saved.toFixed(1)}</span>
                            <span className="text-xs text-slate-500 font-medium">kg CO2 Saved</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Weekly Impact</h3>
                    <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Bar dataKey="items" radius={[4, 4, 4, 4]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 5 ? '#10b981' : '#cbd5e1'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;