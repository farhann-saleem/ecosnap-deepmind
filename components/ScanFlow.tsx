import React, { useState, useRef } from 'react';
import { Camera, ArrowRight, CheckCircle2, AlertCircle, Sparkles, X, Edit3, Info, ExternalLink, Lightbulb, Map as MapIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppState, ScanResult, QuizQuestion, StoryCard } from '../types';
import { analyzeItem, generateImpactImage, generateQuiz, visualizeReuse, generateStoryContent } from '../services/geminiService';
import { DEMO_RESULT, DEMO_STORY, DEMO_QUIZ } from '../constants';

interface ScanFlowProps {
  onComplete: (result: ScanResult, xp: number) => void;
  mockMode?: boolean;
}

const ScanFlow: React.FC<ScanFlowProps> = ({ onComplete, mockMode = false }) => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [story, setStory] = useState<StoryCard[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  
  // Reuse Feature
  const [showReuseModal, setShowReuseModal] = useState(false);
  const [reusePrompt, setReusePrompt] = useState("");
  const [reusedImage, setReusedImage] = useState<string | null>(null);
  const [isReusing, setIsReusing] = useState(false);

  // Map Feature
  const [disposalMapUrl, setDisposalMapUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        startAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProcessingImage = (category: string) => {
    switch (category) {
        case 'Compostable': return "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?q=80&w=1000&auto=format&fit=crop"; 
        case 'Recyclable': return "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1000&auto=format&fit=crop"; 
        case 'Hazardous': return "https://images.unsplash.com/photo-1616035868848-038c353c8965?q=80&w=1000"; 
        case 'Trash': return "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1000"; 
        default: return "https://images.unsplash.com/photo-1503596476-1c12a8ab9a8e?q=80&w=1000"; 
    }
  }
  
  const getFutureImageFallback = (category: string) => {
     switch (category) {
        case 'Compostable': return "https://images.unsplash.com/photo-1581578017093-cd30fce4eeb7?q=80&w=1000"; 
        case 'Recyclable': return "https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=1000"; 
        case 'Hazardous': return "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1000"; 
        default: return "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000"; 
    }
  }

  const startAnalysis = async (base64Data: string) => {
    setState(AppState.ANALYZING);
    setLoadingMsg("Identifying materials...");
    setDisposalMapUrl(null); // Reset map
    
    try {
      if (mockMode) {
        await new Promise(r => setTimeout(r, 1500));
        setResult(DEMO_RESULT);
        await new Promise(r => setTimeout(r, 1000));
        setStory(DEMO_STORY);
        setQuiz(DEMO_QUIZ);
        setDisposalMapUrl("https://img.freepik.com/free-vector/isometric-waste-recycling-concept-composition-with-images-plants-processing-lines-garbage-trucks-vector-illustration_1284-80252.jpg");
        setState(AppState.RESULT);
        return;
      }

      // 1. Analyze Image
      const base64Clean = base64Data.split(',')[1];
      const analysisData = await analyzeItem(base64Clean);
      setResult(analysisData);

      // 2. Start Background Processes
      setLoadingMsg("Crafting your impact journey...");
      const [quizData, storyTexts] = await Promise.all([
          generateQuiz(analysisData.itemName),
          generateStoryContent(analysisData.itemName, analysisData.category)
      ]);
      setQuiz(quizData);

      // Generate Map Background
      const mapPrompt = `A whimsical top-down illustrated map journey of ${analysisData.itemName} being recycled, vector art style, light beige background, cute, detailed, winding path`;
      generateImpactImage(mapPrompt)
        .then(url => setDisposalMapUrl(url))
        .catch(() => console.log("Map gen failed"));

      // 3. Construct Story Cards
      const card1: StoryCard = {
          imageUrl: base64Data,
          caption: storyTexts[0]?.caption || `This ${analysisData.itemName} has potential.`
      };

      const processingImg = getProcessingImage(analysisData.category);
      const card2: StoryCard = {
          imageUrl: processingImg,
          caption: storyTexts[1]?.caption || "Proper disposal allows materials to be recovered."
      };

      setLoadingMsg("Visualizing the future...");
      let futureImageUrl = getFutureImageFallback(analysisData.category);
      
      if (storyTexts[2]?.imagePrompt) {
          try {
             const generated = await generateImpactImage(`Cinematic nature photography, ${storyTexts[2].imagePrompt}, sun rays, 8k resolution`);
             if (generated !== processingImg) futureImageUrl = generated;
          } catch (e) {
             console.warn("Future image generation failed, using distinct fallback");
          }
      }

      const card3: StoryCard = {
          imageUrl: futureImageUrl,
          caption: storyTexts[2]?.caption || "Together we build a greener world."
      };

      setStory([card1, card2, card3]);
      setState(AppState.RESULT);

    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please try again or use Demo Mode.");
      setState(AppState.IDLE);
    }
  };

  const handleReuseGeneration = async () => {
    if (!reusePrompt || !image) return;
    setIsReusing(true);
    
    if (mockMode) {
        setTimeout(() => {
            setReusedImage("https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1000&auto=format&fit=crop");
            setIsReusing(false);
        }, 2000);
        return;
    }

    try {
        const base64Clean = image.split(',')[1];
        const resultImg = await visualizeReuse(base64Clean, reusePrompt);
        setReusedImage(resultImg);
    } catch (e) {
        alert("Failed to edit image");
    } finally {
        setIsReusing(false);
    }
  }

  const handleQuizAnswer = (index: number) => {
    setQuizAnswered(index);
    if (quiz && index === quiz.correctAnswerIndex) {
      // Correct!
    }
  };

  const finishFlow = () => {
    if (result && quizAnswered !== null && quiz) {
        const isCorrect = quizAnswered === quiz.correctAnswerIndex;
        onComplete(result, isCorrect ? 15 : 5); 
        setState(AppState.IDLE);
        setImage(null);
        setResult(null);
        setQuizAnswered(null);
        setReusedImage(null);
        setDisposalMapUrl(null);
    }
  };


  // --- RENDERERS ---

  if (state === AppState.IDLE) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in zoom-in duration-500">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="absolute inset-0 bg-emerald-300/40 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="bg-white border border-emerald-100 p-10 rounded-full mb-8 relative z-10 hover:border-emerald-300 transition-colors duration-300 shadow-xl">
             <Camera className="w-16 h-16 text-emerald-500" />
          </div>
        </div>
        
        <h2 className="text-3xl font-display font-bold text-slate-900 mb-3 tracking-tight">Scan an Item</h2>
        <p className="text-slate-500 mb-10 max-w-xs leading-relaxed font-sans">Take a photo of waste or an object to get instant, AI-powered eco-advice.</p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-display font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg shadow-emerald-500/25"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
          />
        </div>
      </div>
    );
  }

  if (state === AppState.ANALYZING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
         <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-emerald-500/30 rounded-full animate-spin"></div>
            
            {image && (
                <div className="absolute inset-2 rounded-full overflow-hidden opacity-50">
                    <img src={image} className="w-full h-full object-cover animate-pulse" />
                </div>
            )}
            
            <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-emerald-500 animate-bounce" />
         </div>
         <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">Analyzing Item...</h3>
         <p className="text-slate-500 text-sm font-mono bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">{loadingMsg}</p>
      </div>
    );
  }

  if (state === AppState.RESULT && result) {
    return (
      <div className="pt-24 pb-32 px-6 max-w-md mx-auto animate-in slide-in-from-bottom duration-500">
        
        {/* Hero Image Card */}
        <div className="relative h-72 rounded-[2rem] overflow-hidden mb-8 group shadow-2xl shadow-slate-200 border border-white">
            <img src={image || ""} alt={result.itemName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between mb-2">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-md ${
                        result.category === 'Recyclable' ? 'bg-emerald-500/80 text-white border-emerald-400/50' :
                        result.category === 'Trash' ? 'bg-red-500/80 text-white border-red-400/50' :
                        'bg-amber-500/80 text-white border-amber-400/50'
                    }`}>
                        {result.category}
                    </div>
                </div>
                <h2 className="text-4xl font-display font-bold text-white leading-tight mb-1 drop-shadow-md">{result.itemName}</h2>
                <p className="text-slate-200 text-sm font-sans drop-shadow-md">{result.materials.join(', ')}</p>
            </div>
            
            <button 
                onClick={() => setShowReuseModal(true)}
                className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-emerald-500 transition-colors border border-white/30"
            >
                <Edit3 className="w-5 h-5" />
            </button>
        </div>

        {/* Reuse Modal */}
        <AnimatePresence>
            {showReuseModal && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                >
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
                        <button onClick={() => setShowReuseModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
                        <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Visualize Reuse</h3>
                        <p className="text-xs text-slate-500 mb-4 font-sans">Powered by Nano Banana Image Editing</p>
                        
                        {!reusedImage ? (
                            <>
                                <p className="text-sm text-slate-600 mb-4 font-sans">How would you like to upcycle this item?</p>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm mb-4 focus:border-emerald-500 outline-none resize-none placeholder:text-slate-400 font-sans"
                                    rows={3}
                                    placeholder="e.g. Turn this bottle into a futuristic planter with neon lights..."
                                    value={reusePrompt}
                                    onChange={(e) => setReusePrompt(e.target.value)}
                                />
                                <button 
                                    onClick={handleReuseGeneration}
                                    disabled={isReusing}
                                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 font-display shadow-lg shadow-purple-500/20"
                                >
                                    {isReusing ? <Sparkles className="animate-spin" /> : <Sparkles />}
                                    {isReusing ? "Dreaming..." : "Generate Ideas"}
                                </button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-xl overflow-hidden border border-slate-200 relative shadow-md">
                                    <img src={reusedImage} className="w-full" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                                        <p className="text-white text-sm font-medium">{reusePrompt}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setReusedImage(null)}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-medium transition-colors font-display"
                                >
                                    Try Another Idea
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Recycle Roadmap (Structured Map Layout) */}
        <div className="relative rounded-[2rem] overflow-hidden bg-[#fdfbf7] border border-slate-200 shadow-xl mb-8 min-h-[500px]">
            {/* AI Generated Map Background */}
            <div className="absolute inset-0 z-0">
                {disposalMapUrl ? (
                     <img src={disposalMapUrl} className="w-full h-full object-cover opacity-40 blur-[1px] transition-opacity duration-1000" />
                ) : (
                     <div className="w-full h-full bg-[url('https://img.freepik.com/free-vector/hand-drawn-map-pattern_23-2147616235.jpg')] bg-cover opacity-10"></div> 
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/60 to-white/95"></div>
            </div>

            <div className="relative z-10 p-8">
                <div className="flex justify-center mb-12">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2 font-display bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                        <MapIcon className="w-4 h-4 text-emerald-600" />
                        Disposal Protocol
                    </h3>
                </div>

                <div className="relative max-w-sm mx-auto pl-4">
                    {/* The Continuous Track */}
                    <div className="absolute left-6 top-2 bottom-2 w-1.5 bg-slate-200/50 rounded-full -translate-x-1/2"></div>
                    
                    {/* The Animated Beam - Glowing Green Line */}
                    <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="absolute left-6 top-2 w-1.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-500 rounded-full -translate-x-1/2 shadow-[0_0_20px_rgba(52,211,153,0.8)] z-10"
                    />

                    <div className="flex flex-col gap-12 relative z-20">
                        {result.disposalSteps.map((step, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.6 }}
                                className="flex items-start gap-6"
                            >
                                 {/* Step Node */}
                                 <div className="relative shrink-0">
                                     <motion.div 
                                        initial={{ scale: 0 }}
                                        whileInView={{ scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.6, type: "spring", stiffness: 200 }}
                                        className="w-12 h-12 rounded-full bg-white border-4 border-emerald-50 shadow-xl flex items-center justify-center relative z-20 group"
                                     >
                                        <span className="font-display font-bold text-emerald-600 text-lg">{i + 1}</span>
                                        {/* Active Pulse Ring */}
                                        <div className="absolute inset-0 rounded-full border-2 border-emerald-500/0 group-hover:border-emerald-500/50 transition-colors"></div>
                                        {i === 0 && <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20 duration-1000"></div>}
                                     </motion.div>
                                 </div>
                                 
                                 {/* Step Content Card */}
                                 <div className="flex-1 pt-1">
                                     <div className="bg-white/80 backdrop-blur-md border border-emerald-100/50 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:scale-[1.02] hover:bg-white transition-all duration-300 relative group-card">
                                         {/* Connector triangle */}
                                         <div className="absolute top-5 -left-2 w-4 h-4 bg-white/80 rotate-45 border-l border-b border-emerald-100/50"></div>
                                         <p className="text-slate-700 font-medium text-sm leading-relaxed relative z-10">{step}</p>
                                     </div>
                                 </div>
                            </motion.div>
                        ))}
                    </div>
                    
                     {/* Finish Flag */}
                     <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: result.disposalSteps.length * 0.6 + 0.5 }}
                        className="flex items-center gap-6 mt-6 opacity-60 pl-[1px]"
                     >
                          <div className="w-12 flex justify-center">
                               <div className="w-4 h-4 rounded-full bg-slate-200 border-4 border-white shadow-sm z-20"></div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Complete</span>
                     </motion.div>

                </div>
            </div>
        </div>
        
        {/* Flash Cards Grid (Sources & Reasoning) */}
        <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                 {/* Decorative background blur */}
                 <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-200 transition-colors"></div>
                 
                 <div className="relative z-10 flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Info className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-slate-900 mb-1">Why this matters</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{result.reasoning}</p>
                    </div>
                 </div>
            </div>

            {result.safetyTip && (
                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                     <div className="relative z-10 flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-amber-900 mb-1">Safety First</h4>
                            <p className="text-amber-800 text-xs leading-relaxed">{result.safetyTip}</p>
                        </div>
                     </div>
                </div>
            )}
        </div>

        {/* CTA */}
        <button 
            onClick={() => setState(AppState.STORY)}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-display font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group transition-all"
        >
            See Impact Story
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        {/* Sources Footer */}
        {result.sources && result.sources.length > 0 && (
             <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-60">
                {result.sources.map((source, i) => (
                    <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-emerald-600 transition-colors">
                        {source.title.substring(0,20)}... <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                ))}
            </div>
        )}

      </div>
    );
  }

  if (state === AppState.STORY) {
    return (
        <div className="pt-24 pb-32 px-0 max-w-md mx-auto animate-in fade-in duration-500">
            <header className="px-6 mb-8">
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest font-display">Your Impact</span>
                <h2 className="text-3xl font-display font-bold text-slate-900 mt-1">The Journey</h2>
            </header>
            
            {/* Story Cards Carousel */}
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-12 px-6 gap-4 no-scrollbar">
                {story.map((card, i) => (
                    <div key={i} className="snap-center shrink-0 w-80 bg-white border border-slate-100 rounded-[32px] overflow-hidden flex flex-col shadow-2xl shadow-slate-200/60 relative group">
                        {/* Premium Card Border Effect */}
                        <div className="absolute inset-0 border-2 border-white/50 rounded-[32px] pointer-events-none z-20"></div>
                        
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-xl px-4 py-1.5 rounded-full text-xs font-bold text-slate-900 border border-white/40 font-display shadow-sm">
                            {i === 0 ? "01. Origin" : i === 1 ? "02. Process" : "03. Future"}
                        </div>
                        
                        <div className="h-80 overflow-hidden relative">
                            <img src={card.imageUrl} alt="Story" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90"></div>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col justify-end relative z-10 -mt-32">
                            <div className="w-8 h-1 bg-emerald-500 mb-4 rounded-full"></div>
                            <p className="text-white text-lg leading-snug font-medium drop-shadow-md font-sans">{card.caption}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-6 space-y-6">
                
                {/* "Did You Know" Flash Card */}
                <div className="relative group perspective-1000">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white border border-slate-200 p-8 rounded-3xl shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full blur-3xl -ml-12 -mb-12"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest font-display">Knowledge Card</span>
                            </div>
                            <p className="text-slate-800 text-lg font-medium leading-relaxed font-sans">
                                "{result?.impactFact}"
                            </p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setState(AppState.QUIZ)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all mt-4"
                >
                    Take Quiz & Earn XP
                </button>
            </div>
        </div>
    );
  }

  if (state === AppState.QUIZ && quiz) {
    return (
        <div className="pt-24 pb-32 px-6 max-w-md mx-auto animate-in slide-in-from-right duration-500 flex flex-col min-h-[80vh]">
            <div className="flex-1 flex flex-col justify-center">
                <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-bold mb-8 self-start uppercase tracking-wider font-display">
                    EcoQuest Challenge
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-10 leading-snug">{quiz.question}</h2>

                <div className="space-y-4">
                    {quiz.options.map((option, idx) => {
                        const isSelected = quizAnswered === idx;
                        const isCorrect = idx === quiz.correctAnswerIndex;
                        let btnClass = "w-full text-left p-6 rounded-2xl border transition-all duration-300 font-medium text-lg font-sans shadow-sm ";
                        
                        if (quizAnswered === null) {
                            btnClass += "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300 hover:pl-7";
                        } else {
                            if (isSelected && isCorrect) btnClass += "bg-emerald-50 border-emerald-500 text-white shadow-emerald-200";
                            else if (isSelected && !isCorrect) btnClass += "bg-red-50 border-red-200 text-red-700";
                            else if (!isSelected && isCorrect) btnClass += "bg-emerald-50 border-emerald-200 text-emerald-700";
                            else btnClass += "bg-slate-50 border-slate-100 text-slate-300";
                        }

                        return (
                            <button
                                key={idx}
                                disabled={quizAnswered !== null}
                                onClick={() => handleQuizAnswer(idx)}
                                className={btnClass}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{option}</span>
                                    {quizAnswered !== null && isCorrect && <CheckCircle2 className="w-6 h-6 text-white" />}
                                    {quizAnswered === idx && !isCorrect && <X className="w-6 h-6 text-red-500" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {quizAnswered !== null && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-lg"
                    >
                        <p className="text-base text-slate-600 leading-relaxed font-sans">
                            <span className={`font-bold block mb-2 font-display ${quizAnswered === quiz.correctAnswerIndex ? 'text-emerald-500' : 'text-slate-900'}`}>
                                {quizAnswered === quiz.correctAnswerIndex ? "Correct!" : "Did you know?"}
                            </span>
                            {quiz.explanation}
                        </p>
                    </motion.div>
                )}
            </div>

            {quizAnswered !== null && (
                 <button 
                    onClick={finishFlow}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-display font-bold py-4 rounded-2xl mt-8 transition-colors shadow-xl"
                >
                    Collect {quizAnswered === quiz.correctAnswerIndex ? "15" : "5"} XP
                </button>
            )}
        </div>
    );
  }

  return null;
};

export default ScanFlow;