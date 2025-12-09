import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Scan, TrendingUp, CheckCircle, Leaf, PlayCircle, Globe } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Animation variants for the organic blobs
  const floatingBlob = (delay: number) => ({
    initial: { transform: "translate(0px, 0px) scale(1)" },
    animate: {
      transform: [
        "translate(0px, 0px) scale(1)",
        "translate(30px, -50px) scale(1.1)",
        "translate(-20px, 20px) scale(0.9)",
        "translate(0px, 0px) scale(1)"
      ],
      opacity: [0.6, 0.8, 0.6],
    },
    transition: {
      duration: 10 + Math.random() * 5, // Random duration between 10-15s
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: delay
    }
  });

  return (
    <div ref={scrollRef} className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 selection:bg-emerald-200">
      
      {/* --- Ambient Live Background --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top Center Glow - Indigo/Emerald */}
        <motion.div 
          variants={floatingBlob(0)}
          initial="initial"
          animate="animate"
          transition={floatingBlob(0).transition}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-gradient-to-b from-indigo-200/40 via-emerald-100/40 to-transparent rounded-[100%] blur-[120px] opacity-60"
        />
        
        {/* Bottom Right Glow - Cyan */}
        <motion.div 
           variants={floatingBlob(2)}
           initial="initial"
           animate="animate"
           transition={floatingBlob(2).transition}
           className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-100/50 rounded-full blur-[100px]"
        />
        
        {/* Bottom Left Glow - Purple */}
        <motion.div 
           variants={floatingBlob(4)}
           initial="initial"
           animate="animate"
           transition={floatingBlob(4).transition}
           className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px]"
        />
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="bg-white/80 border border-slate-200 p-2.5 rounded-xl backdrop-blur-md relative z-10 shadow-sm">
                 <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">EcoSnap</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="hidden md:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">How it works</button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Text Content */}
        <motion.div 
          style={{ y: yHero, opacity: opacityHero }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 backdrop-blur-sm shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono text-slate-600 tracking-wider">GEN AI POWERED • V2.5</span>
          </div>

          <h1 className="font-display font-semibold text-slate-900 tracking-tighter leading-[0.95] text-[clamp(48px,6vw,96px)]">
            Nature needs <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-cyan-500 to-emerald-600 animate-gradient-x">better vision.</span>
          </h1>

          <p className="font-sans text-slate-600 leading-relaxed max-w-lg text-[clamp(16px,1.2vw,20px)]">
            The world's most advanced AI recycling assistant. identifying materials in milliseconds to help you close the loop on waste.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onGetStarted}
              className="group relative px-8 py-4 rounded-2xl bg-slate-900 text-white font-display font-semibold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform overflow-hidden shadow-xl shadow-slate-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              Start Scanning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-display font-medium text-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm">
              <PlayCircle className="w-5 h-5 text-emerald-600" />
              Watch Demo
            </button>
          </div>

          <div className="pt-8 flex items-center gap-6 border-t border-slate-200 mt-8">
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold text-slate-900">98%</span>
              <span className="text-sm text-slate-500">Accuracy</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold text-slate-900">1.2M+</span>
              <span className="text-sm text-slate-500">Items Scanned</span>
            </div>
          </div>
        </motion.div>

        {/* Visual Content - 3D/Glass Card */}
        <div className="relative perspective-1000 group">
            {/* Background Abstract Glow behind image */}
            <motion.div 
                animate={{ rotate: [6, 12, 6], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-200/50 rounded-[40px] blur-3xl opacity-60"
            />
            
            <motion.div 
               initial={{ opacity: 0, rotateX: 10, rotateY: 10, scale: 0.9 }}
               animate={{ opacity: 1, rotateX: 0, rotateY: 0, scale: 1 }}
               transition={{ duration: 1, delay: 0.2 }}
               className="relative z-10 bg-white rounded-[32px] border border-slate-200 p-2 shadow-2xl shadow-slate-200/50 overflow-hidden"
            >
               {/* Beam Effect Container */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 animate-beam"></div>
               </div>

               <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] md:aspect-[4/3] bg-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1611288870280-4a331d941501?q=80&w=2574&auto=format&fit=crop" 
                    alt="Scanning Plastic"
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 mix-blend-multiply"
                  />
                  
                  {/* UI Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  
                  {/* Scan Frame */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-white/50 rounded-2xl flex flex-col justify-between p-4 shadow-2xl">
                     <div className="flex justify-between">
                        <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg"></div>
                        <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg"></div>
                     </div>
                     <div className="flex justify-between">
                        <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg"></div>
                        <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg"></div>
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                     </div>
                  </div>

                  {/* Result Card Overlay */}
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/40 p-4 rounded-2xl flex items-center gap-4 shadow-lg"
                  >
                     <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                        <CheckCircle className="w-6 h-6 text-white" />
                     </div>
                     <div>
                        <h3 className="font-display font-bold text-slate-900 text-lg leading-none mb-1">PET Plastic</h3>
                        <p className="text-emerald-600 text-xs font-mono uppercase tracking-wide">100% Recyclable</p>
                     </div>
                  </motion.div>
               </div>
            </motion.div>
        </div>
      </main>

      {/* --- Features Strip --- */}
      <section className="relative z-10 py-24 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="font-display font-bold text-[clamp(32px,4vw,48px)] text-slate-900 mb-4">Intelligence meets Impact.</h2>
               <p className="text-slate-500 max-w-xl mx-auto text-lg">Powered by Gemini 3 Pro, EcoSnap doesn't just see—it understands context, materials, and local impact.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { icon: Scan, title: "Deep Vision Analysis", desc: "Recognizes complex mixed materials instantly." },
                 { icon: Globe, title: "Global Context", desc: "Adapts disposal advice to your local municipality rules." },
                 { icon: TrendingUp, title: "Gamified Impact", desc: "Earn XP and unlock badges for every sustainable choice." }
               ].map((item, i) => (
                 <div key={i} className="group p-8 rounded-3xl bg-white border border-slate-200 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <item.icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="font-display font-bold text-xl text-slate-900 mb-3">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-slate-200 bg-slate-50 text-center">
         <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <span className="font-display font-bold text-slate-900 text-lg">EcoSnap</span>
         </div>
         <p className="text-slate-400 text-sm">© 2025 EcoSnap Inc. Built for a better planet.</p>
      </footer>

    </div>
  );
};

export default LandingPage;