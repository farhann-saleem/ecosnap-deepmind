import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion';
import { ArrowRight, Scan, Leaf, PlayCircle, Globe, Zap, Sparkles, Recycle, Github, Linkedin, Instagram } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const slides = [
  {
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1000&auto=format&fit=crop",
    title: "1. Collection",
    desc: "Identifying Raw Materials",
    icon: Scan
  },
  {
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1000&auto=format&fit=crop",
    title: "2. Processing",
    desc: "Sorting & Recovery",
    icon: Recycle
  },
  {
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
    title: "3. Rebirth",
    desc: "Sustainable New Life",
    icon: Sparkles
  }
];

// Custom Keyframes for the gradient background
const gradientKeyframes = `
  @keyframes gradient-xy {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient-xy {
    background-size: 200% 200%;
    animation: gradient-xy 15s ease infinite;
  }
`;

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const scrollRef = useRef(null);
  const featuresRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(timer);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, 
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        bounce: 0.4, 
        duration: 0.8
      }
    }
  };

  // Staggered Text Animations for Hero
  const heroContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const heroItemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }
    }
  };

  return (
    <div ref={scrollRef} className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 selection:bg-emerald-200">
      <style>{gradientKeyframes}</style>
      
      {/* --- Ambient Live Background --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dynamic Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-slate-50 to-cyan-50 animate-gradient-xy opacity-80"></div>

        {/* Top Center Glow - Indigo/Emerald */}
        <motion.div 
          variants={floatingBlob(0)}
          initial="initial"
          animate="animate"
          transition={floatingBlob(0).transition}
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-gradient-to-b from-indigo-100/40 via-emerald-100/40 to-transparent rounded-[100%] blur-[120px] opacity-60"
        />
        
        {/* Bottom Right Glow - Cyan */}
        <motion.div 
           variants={floatingBlob(2)}
           initial="initial"
           animate="animate"
           transition={floatingBlob(2).transition}
           className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-100/50 rounded-full blur-[100px]"
        />
      </div>

      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="bg-white/80 border border-slate-200 p-2.5 rounded-xl backdrop-blur-md relative z-10 shadow-sm transition-transform group-hover:scale-105">
                 <Leaf className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">EcoSnap</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={scrollToFeatures}
                className="hidden md:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
             >
                How it works
             </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Text Content */}
        <motion.div 
          style={{ y: yHero }}
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={heroItemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 backdrop-blur-sm shadow-sm hover:border-emerald-200 transition-colors">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-mono text-slate-600 tracking-wider">GEN AI POWERED • V2.5</span>
          </motion.div>

          <motion.h1 variants={heroItemVariants} className="font-display font-semibold text-slate-900 tracking-tighter leading-[0.95] text-[clamp(48px,6vw,96px)]">
            Nature needs <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-cyan-500 to-emerald-600 animate-gradient-x">better vision.</span>
          </motion.h1>

          <motion.p variants={heroItemVariants} className="font-sans text-slate-600 leading-relaxed max-w-lg text-[clamp(16px,1.2vw,20px)]">
            The world's most advanced AI recycling assistant. Identifying materials in milliseconds to help you close the loop on waste.
          </motion.p>

          <motion.div variants={heroItemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onGetStarted}
              className="group relative px-8 py-4 rounded-2xl bg-slate-900 text-white font-display font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-100 group-hover:opacity-90 transition-opacity"></div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              
              <span className="relative z-10 flex items-center gap-3">
                Start Scanning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            
            <button className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-display font-medium text-lg flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm">
              <PlayCircle className="w-5 h-5 text-emerald-600" />
              Watch Demo
            </button>
          </motion.div>

          <motion.div variants={heroItemVariants} className="pt-8 flex items-center gap-6 border-t border-slate-200 mt-8">
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold text-slate-900">98%</span>
              <span className="text-sm text-slate-500">Accuracy</span>
            </div>
            <div className="w-px h-10 bg-slate-200"></div>
            <div className="flex flex-col">
              <span className="font-display text-3xl font-bold text-slate-900">1.2M+</span>
              <span className="text-sm text-slate-500">Items Scanned</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Visual Content - 3D/Glass Card */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative perspective-1000 group"
        >
            {/* Background Abstract Glow behind image */}
            <motion.div 
                animate={{ rotate: [6, 12, 6], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-emerald-200/50 rounded-[40px] blur-3xl opacity-60"
            />
            
            <div className="relative z-10 bg-white rounded-[32px] border border-slate-200 p-2 shadow-2xl shadow-slate-200/50 overflow-hidden transform transition-transform duration-500 group-hover:scale-[1.01]">
               {/* Beam Effect Container */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 animate-beam"></div>
               </div>

               <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] md:aspect-[4/3] bg-slate-100">
                  {/* Dynamic Loop Slideshow */}
                  <AnimatePresence mode="wait">
                      <motion.img 
                        key={currentSlide}
                        src={slides[currentSlide].image} 
                        alt={slides[currentSlide].title}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                  </AnimatePresence>
                  
                  {/* UI Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent"></div>
                  
                  {/* Scan Frame */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-white/50 rounded-2xl flex flex-col justify-between p-4 shadow-2xl backdrop-blur-[1px]">
                     <div className="flex justify-between">
                        <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                     </div>
                     <div className="flex justify-between">
                        <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                        <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                         <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                     </div>
                  </div>

                  {/* Result Card Overlay - Dynamic Text */}
                  <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentSlide}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/40 p-4 rounded-2xl flex items-center gap-4 shadow-lg"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                            {React.createElement(slides[currentSlide].icon, { className: "w-6 h-6 text-white" })}
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-slate-900 text-lg leading-none mb-1">{slides[currentSlide].title}</h3>
                            <p className="text-emerald-600 text-xs font-mono uppercase tracking-wide">{slides[currentSlide].desc}</p>
                        </div>
                    </motion.div>
                  </AnimatePresence>
               </div>
            </div>
        </motion.div>
      </main>

      {/* --- Features Strip with Animated Flash Cards --- */}
      <section ref={featuresRef} className="relative z-10 py-24 border-t border-slate-200 bg-white/50 backdrop-blur-sm overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="font-display font-bold text-[clamp(32px,4vw,48px)] text-slate-900 mb-4">Intelligence meets Impact.</h2>
               <p className="text-slate-500 max-w-xl mx-auto text-lg">Powered by Gemini 3 Pro, EcoSnap doesn't just see—it understands context, materials, and local impact.</p>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid md:grid-cols-3 gap-8"
            >
                {/* Card 1: Deep Vision */}
                <motion.div variants={cardVariants} className="group relative h-96 rounded-[32px] overflow-hidden shadow-xl shadow-emerald-900/5 cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/30">
                    <img 
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" 
                        alt="Deep Vision" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Enhanced dim overlay for better text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/90 group-hover:via-slate-900/80 group-hover:to-slate-900/95 transition-colors duration-500"></div>
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300">
                           <Scan className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-display font-bold text-2xl text-white mb-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">Deep Vision</h3>
                        <p className="text-slate-200 leading-relaxed text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                            Instantly recognizes complex mixed materials with multi-modal AI analysis.
                        </p>
                    </div>
                </motion.div>

                {/* Card 2: Global Context */}
                <motion.div variants={cardVariants} className="group relative h-96 rounded-[32px] overflow-hidden shadow-xl shadow-blue-900/5 cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/30">
                    <img 
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop" 
                        alt="Global Context" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/90 group-hover:via-slate-900/80 group-hover:to-slate-900/95 transition-colors duration-500"></div>
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300">
                           <Globe className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-display font-bold text-2xl text-white mb-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">Global Context</h3>
                        <p className="text-slate-200 leading-relaxed text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                             Adapts disposal advice to your local municipality rules using real-time search grounding.
                        </p>
                    </div>
                </motion.div>

                {/* Card 3: Gamified Impact */}
                <motion.div variants={cardVariants} className="group relative h-96 rounded-[32px] overflow-hidden shadow-xl shadow-purple-900/5 cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/30">
                    <img 
                        src="https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=1000&auto=format&fit=crop" 
                        alt="Gamified Impact" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900/90 group-hover:via-slate-900/80 group-hover:to-slate-900/95 transition-colors duration-500"></div>
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 group-hover:bg-purple-500 group-hover:border-purple-500 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                           <Zap className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-display font-bold text-2xl text-white mb-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">Gamified Impact</h3>
                        <p className="text-slate-200 leading-relaxed text-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                             Earn XP and unlock badges for every sustainable choice you make.
                        </p>
                    </div>
                </motion.div>

            </motion.div>
         </div>
      </section>

      {/* --- Footer with Credits --- */}
      <footer className="py-20 border-t border-slate-200 bg-slate-50 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 relative z-10">
            {/* Brand Column */}
            <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Leaf className="w-5 h-5" />
                    </div>
                    <span className="font-display font-bold text-slate-900 text-xl tracking-tight">EcoSnap</span>
                </div>
                <p className="text-slate-500 max-w-sm mb-6">
                    Redefining waste management with Gemini 3 Pro. Built with ❤️ for the planet.
                </p>
                <div className="flex gap-4">
                    <a href="https://github.com/farhann-saleem" target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all">
                        <Github className="w-4 h-4" />
                    </a>
                    <a href="https://www.linkedin.com/in/chaudary-farhan" target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-blue-700 hover:border-blue-400 transition-all">
                        <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="https://www.instagram.com/farhann_saleem_?igsh=MTAxeDQ2OWpkY3ZtbA==" target="_blank" rel="noopener noreferrer" className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-pink-600 hover:border-pink-400 transition-all">
                        <Instagram className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Links Column */}
            <div>
                <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Features</a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Technology</a></li>
                    <li><a href="#" className="hover:text-emerald-600 transition-colors">Impact Report</a></li>
                </ul>
            </div>

            {/* Credits Column (Requested Feature) */}
            <div>
                <h4 className="font-bold text-slate-900 mb-4">Team</h4>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                             {/* Initials fallback since specific avatar URL is generic */}
                             <span className="font-bold text-slate-500">CF</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Chaudary Farhan</p>
                            <p className="text-xs text-emerald-600">Lead Developer</p>
                            <div className="flex gap-2 mt-1">
                                <a href="https://github.com/farhann-saleem" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                                    <Github className="w-3.5 h-3.5" />
                                </a>
                                <a href="https://www.linkedin.com/in/chaudary-farhan" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors">
                                    <Linkedin className="w-3.5 h-3.5" />
                                </a>
                                <a href="https://www.instagram.com/farhann_saleem_?igsh=MTAxeDQ2OWpkY3ZtbA==" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E1306C] transition-colors">
                                    <Instagram className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">
                        Created using Google Gemini 2.5 Flash, Gemini Live API, and Veo Video Generation.
                    </p>
                </div>
            </div>
         </div>
         
         <div className="mt-16 pt-8 border-t border-slate-200 text-center">
             <p className="text-slate-400 text-sm">© 2025 EcoSnap Inc. All rights reserved.</p>
         </div>
      </footer>

    </div>
  );
};

export default LandingPage;