import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Play, Grid, Clock, Leaf, Sparkles, Loader2, X } from 'lucide-react';
import { generateEcoVideo } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryProps {
    history: HistoryItem[];
    onMockVideo: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ history, onMockVideo }) => {
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [videos, setVideos] = useState<Record<string, string>>({}); // Store generated video URLs

    const handleGenerateVideo = async (item: HistoryItem) => {
        if (videos[item.id]) {
            setPlayingVideo(videos[item.id]);
            return;
        }

        setGeneratingId(item.id);
        const prompt = `Cinematic documentary nature shot. A time-lapse of ${item.result.itemName} (${item.result.category}) decomposing in a landfill versus being recycled into something new. Educational, hyper-realistic, 4k.`;
        
        try {
            const videoUrl = await generateEcoVideo(prompt);
            if (videoUrl) {
                setVideos(prev => ({ ...prev, [item.id]: videoUrl }));
                setPlayingVideo(videoUrl);
            } else {
                alert("Video generation failed. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Error generating video");
        } finally {
            setGeneratingId(null);
        }
    };

    return (
        <div className="pt-24 pb-32 px-6 max-w-4xl mx-auto min-h-screen animate-in fade-in duration-500 relative">
            
            {/* Video Overlay */}
            <AnimatePresence>
                {playingVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
                    >
                        <button onClick={() => setPlayingVideo(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-8 h-8"/></button>
                        <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                            <video src={playingVideo} controls autoPlay className="w-full h-full object-contain" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">My Eco Gallery</h1>
                    <p className="text-slate-500 font-sans">Your sustainable collection & impact media.</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <Grid className="w-6 h-6 text-emerald-500" />
                </div>
            </header>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <Leaf className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No scans yet</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Start scanning items to build your gallery and generate impact videos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add a "Create" Card */}
                    <button 
                        onClick={() => window.scrollTo(0,0)} 
                        className="group relative h-64 rounded-3xl bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 flex flex-col items-center justify-center text-center p-6 hover:shadow-lg transition-all"
                    >
                         <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white ml-1" />
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 mb-1">Create New</h3>
                         <p className="text-xs text-emerald-600 font-medium">Scan to generate video</p>
                    </button>

                    {history.slice().reverse().map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm group hover:shadow-xl transition-all">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                {/* Placeholder Gradient based on category */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${
                                    item.result.category === 'Recyclable' ? 'from-emerald-100 to-slate-100' : 
                                    item.result.category === 'Trash' ? 'from-red-100 to-slate-100' : 'from-amber-100 to-slate-100'
                                }`}></div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                    <span className="text-4xl">♻️</span> 
                                </div>
                                <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 backdrop-blur-md rounded-lg text-[10px] font-mono text-slate-600 border border-slate-200 shadow-sm">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-900 text-lg">{item.result.itemName}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                         item.result.category === 'Recyclable' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                        {item.result.category}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{item.result.reasoning}</p>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleGenerateVideo(item)}
                                        disabled={generatingId === item.id}
                                        className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {generatingId === item.id ? (
                                            <>
                                                <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3 h-3 text-purple-500" />
                                                {videos[item.id] ? "Watch Veo" : "Veo Video"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Gallery;