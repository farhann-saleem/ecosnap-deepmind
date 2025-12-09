import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScanFlow from './components/ScanFlow';
import Dashboard from './components/Dashboard';
import LiveCoach from './components/LiveCoach';
import Gallery from './components/Gallery';
import LandingPage from './components/LandingPage';
import { UserStats, ScanResult, HistoryItem, ActiveTab } from './types';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  // State for Navigation
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('scan');
  const [mockMode, setMockMode] = useState(false); 
  
  // App Data State
  const [stats, setStats] = useState<UserStats>({
    scans: 0,
    xp: 0,
    streak: 1,
    co2Saved: 0
  });
  
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('ecosnap_stats');
    const savedHistory = localStorage.getItem('ecosnap_history');
    if (savedStats) try { setStats(JSON.parse(savedStats)); } catch (e) {}
    if (savedHistory) try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
  }, []);

  // Save to LocalStorage
  useEffect(() => { localStorage.setItem('ecosnap_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('ecosnap_history', JSON.stringify(history)); }, [history]);

  const handleEnterApp = async () => {
    // API Key logic: Check for Veo/Gemini key availability
    const win = window as any;
    if (win.aistudio) {
      try {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) await win.aistudio.openSelectKey();
      } catch (e) {
        console.log("API Key selection cancelled or failed. Enabling Mock Mode.");
        setMockMode(true);
      }
    } else {
        if (!process.env.API_KEY) setMockMode(true);
    }
    
    setHasEnteredApp(true);
  };

  const handleScanComplete = (result: ScanResult, xp: number) => {
    setStats(prev => ({
      ...prev,
      scans: prev.scans + 1,
      xp: prev.xp + xp,
      co2Saved: prev.co2Saved + 0.05
    }));
    setHistory(prev => [...prev, { id: Date.now().toString(), timestamp: Date.now(), result, xpEarned: xp }]);
  };

  // --- RENDER FLOW ---

  if (!hasEnteredApp) {
    return (
      <div className="font-sans text-slate-900">
        <LandingPage onGetStarted={handleEnterApp} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 overflow-hidden relative">
      
      {/* Background Aurora - Light Mode: Stronger, but pastel blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vh] bg-gradient-to-br from-emerald-200/40 to-cyan-200/40 rounded-full blur-[120px] animate-blob"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
         {/* Noise overlay moved to HTML/CSS global */}
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 min-h-screen pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
             <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
               <Dashboard stats={stats} history={history} onStartQuiz={() => setActiveTab('scan')} />
             </motion.div>
          )}
          {activeTab === 'scan' && (
             <motion.div key="scan" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
               <ScanFlow onComplete={handleScanComplete} mockMode={mockMode} />
             </motion.div>
          )}
          {activeTab === 'live' && (
             <motion.div key="live" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
               <LiveCoach />
             </motion.div>
          )}
          {activeTab === 'gallery' && (
             <motion.div key="gallery" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
               <Gallery history={history} onMockVideo={() => alert("Generate Video from Gallery Feature coming soon!")} />
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Dock */}
      <Navbar xp={stats.xp} activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dev Mock Toggle */}
      <div className="fixed top-4 right-4 z-[60] md:hidden">
          <button 
            onClick={() => setMockMode(!mockMode)}
            className={`text-[10px] px-2 py-1 rounded-full border backdrop-blur-md ${mockMode ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-white/50 border-slate-200 text-slate-500'}`}
          >
            {mockMode ? 'DEMO ON' : 'DEMO OFF'}
          </button>
      </div>

    </div>
  );
};

export default App;