import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ArrowRight, CheckCircle2, AlertCircle, Play, Sparkles, X, Edit3, Film, Info, ExternalLink, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppState, ScanResult, QuizQuestion, StoryCard } from '../types';
import { analyzeItem, generateImpactImage, generateQuiz, visualizeReuse, generateEcoVideo, generateStoryContent } from '../services/geminiService';
import { DEMO_RESULT, DEMO_STORY, DEMO_QUIZ, DEMO_VIDEO_URL, LOCAL_VIDEOS, REMOTE_VIDEOS } from '../constants';

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

  // Veo Feature
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Store the "intended" video key to manage fallback logic
  const [activeVideoKey, setActiveVideoKey] = useState<keyof typeof LOCAL_VIDEOS | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Robust Autoplay Handling
  useEffect(() => {
    if (videoUrl && videoRef.current) {
        // Reset state
        setVideoError(false);
        
        // Force reload to ensure new source is picked up
        videoRef.current.load();
        
        // Attempt play
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented. This is normal in some browsers.
                // The UI will show the Play button because isPlaying will be false.
                console.log("Auto-play paused. Interaction required.");
            });
        }
    }
  }, [videoUrl]);

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
    
    try {
      if (mockMode) {
        await new Promise(r => setTimeout(r, 1500));
        setResult(DEMO_RESULT);
        await new Promise(r => setTimeout(r, 1000));
        setStory(DEMO_STORY);
        setQuiz(DEMO_QUIZ);
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

  // --- UNIFIED CATEGORY LOGIC ---
  
  const getMaterialCategory = (item: string, materials: string[], category: string): keyof typeof LOCAL_VIDEOS => {
      const matString = materials.join(' ').toLowerCase();
      const itemLower = item.toLowerCase();
      
      // PRIORITY 1: Explicit Plastic check
      if (matString.includes('plastic') || itemLower.includes('plastic') || itemLower.includes('polyester') || matString.includes('pet') || matString.includes('hdpe')) {
          return 'PLASTIC';
      }

      // PRIORITY 2: Specific Materials
      if (matString.includes('paper') || matString.includes('cardboard') || matString.includes('wood') || itemLower.includes('box')) return 'WOOD';
      if (matString.includes('aluminum') || matString.includes('steel') || matString.includes('metal') || matString.includes('tin') || itemLower.includes('can') || itemLower.includes('foil')) return 'METAL';
      if (matString.includes('glass') || itemLower.includes('jar') || itemLower.includes('wine') || (itemLower.includes('bottle') && !matString.includes('plastic'))) return 'GLASS'; 
      
      // PRIORITY 3: Categories
      if (category === 'Compostable' || matString.includes('food') || matString.includes('organic')) return 'ORGANIC';
      if (category === 'Hazardous' || matString.includes('electronic') || itemLower.includes('battery')) return 'EWASTE';
      
      // Default
      return 'PLASTIC';
  }

  const handleVeoGeneration = async () => {
      setGeneratingVideo(true);
      setVideoError(false);
      setFallbackTriggered(false);
      setVideoUrl(null);

      try {
          if (!result) throw new Error("No result");

          // 1. Determine Category
          const vidKey = getMaterialCategory(result.itemName, result.materials, result.category);
          setActiveVideoKey(vidKey);

          console.log(`Loading video category: ${vidKey}`);
          
          // No delay for local videos - instant feedback
          setVideoUrl(LOCAL_VIDEOS[vidKey]);

      } catch (e) {
          console.error("Video setup error");
          setVideoError(true);
      } finally {
          setGeneratingVideo(false);
      }
  }

  const handleVideoError = () => {
      if (!fallbackTriggered && activeVideoKey) {
          console.log("Local video failed to load. Switching to Remote Fallback.");
          setFallbackTriggered(true);
          setVideoUrl(REMOTE_VIDEOS[activeVideoKey]);
      } else {
          console.log("Video playback failed completely.");
          setVideoError(true);
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
        setVideoUrl(null);
        setReusedImage(null);
        setVideoError(false);
        setFallbackTriggered(false);
        setIsPlaying(false);
    }
  };

  const manualPlay = () => {
      if(videoRef.current) {
          videoRef.current.play().catch(() => setIsPlaying(false));
      }
  }


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
        
        {/* Image & Header */}
        <div className="relative h-72 rounded-[2rem] overflow-hidden mb-6 group shadow-2xl shadow-slate-200 border border-white">
            <img src={image || ""} alt={result.itemName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between mb-2">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        result.category === 'Recyclable' ? 'bg-emerald-500 text-white border-emerald-400' :
                        result.category === 'Trash' ? 'bg-red-500 text-white border-red-400' :
                        'bg-amber-500 text-white border-amber-400'
                    }`}>
                        {result.category}
                    </div>
                </div>
                <h2 className="text-4xl font-display font-bold text-white leading-tight mb-1 drop-shadow-md">{result.itemName}</h2>
                <p className="text-slate-200 text-sm font-sans drop-shadow-md">{result.materials.join(', ')}</p>
            </div>
            
            {/* Edit Button */}
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

        {/* Steps */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 font-display">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Disposal Steps
            </h3>
            <ul className="space-y-6">
                {result.disposalSteps.map((step, i) => (
                    <li key={i} className="flex gap-4 relative">
                        {/* Connecting Line */}
                        {i !== result.disposalSteps.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-[-20px] w-0.5 bg-slate-100"></div>
                        )}
                        <div className="min-w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold ring-4 ring-white z-10 font-mono">
                            {i + 1}
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed pt-0.5 font-sans">{step}</p>
                    </li>
                ))}
            </ul>
        </div>
        
        {/* Sources / Citations */}
        {result.sources && result.sources.length > 0 && (
            <div className="mb-6">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-display px-1">
                    Verified Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, i) => (
                        <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg text-xs font-medium text-slate-600 transition-colors border border-slate-200">
                            {source.title.length > 25 ? source.title.substring(0,25) + "..." : source.title}
                            <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                    ))}
                </div>
            </div>
        )}

        {/* Reasoning */}
        <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-blue-900 text-sm leading-relaxed font-sans">{result.reasoning}</p>
            </div>
            {result.safetyTip && (
                 <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-900 text-sm leading-relaxed font-sans"><strong>Safety Tip:</strong> {result.safetyTip}</p>
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
            
            <div className="flex overflow-x-auto snap-x snap-mandatory pb-12 px-6 gap-4 no-scrollbar">
                {story.map((card, i) => (
                    <div key={i} className="snap-center shrink-0 w-80 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-slate-200/50 relative">
                        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 border border-white/20 font-display shadow-sm">
                            {i === 0 ? "Collection" : i === 1 ? "Processing" : "New Life"}
                        </div>
                        <div className="h-72 overflow-hidden relative">
                            <img src={card.imageUrl} alt="Story" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-end relative z-10 -mt-20">
                            <p className="text-white text-lg leading-snug font-medium drop-shadow-md font-sans">{card.caption}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-6 space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-xl -mr-10 -mt-10"></div>
                    <h4 className="text-indigo-600 text-xs font-bold uppercase mb-2 flex items-center gap-2 font-display">
                        <Sparkles className="w-3 h-3" />
                        Did you know?
                    </h4>
                    <p className="text-indigo-900 text-sm leading-relaxed font-sans">{result?.impactFact}</p>
                </div>

                {/* Veo Video Button */}
                <div className="flex flex-col gap-3">
                    {!videoUrl ? (
                         <button 
                         onClick={handleVeoGeneration}
                         disabled={generatingVideo}
                         className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-4 rounded-xl flex items-center justify-center gap-3 text-sm font-medium transition-colors group font-display shadow-sm"
                     >
                         {generatingVideo ? (
                             <>
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                Generative Video (Veo) Processing...
                             </>
                         ) : (
                             <>
                                <Film className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                                Watch Cinematic Impact (Veo)
                             </>
                         )}
                     </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                             <div className="rounded-2xl overflow-hidden border border-slate-200 relative shadow-xl bg-black aspect-video group cursor-pointer" onClick={!videoError ? manualPlay : undefined}>
                                <div className="absolute top-0 left-0 right-0 bg-indigo-600/90 text-white text-[10px] font-bold px-3 py-1 text-center backdrop-blur-md z-10 border-b border-white/10 uppercase tracking-widest font-display">
                                    Veo Impact Visualization
                                </div>
                                
                                {videoError ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                                         {/* Fallback Static Image if Video Fails */}
                                        <div className="absolute inset-0 opacity-50">
                                            <img src={story[2]?.imageUrl} className="w-full h-full object-cover" alt="Impact" />
                                        </div>
                                        <div className="relative z-10 flex flex-col items-center text-center p-4">
                                            <ImageIcon className="w-8 h-8 text-white/50 mb-2" />
                                            <p className="text-xs text-white/70 font-bold">Video Preview Unavailable</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <video 
                                            ref={videoRef}
                                            key={videoUrl}
                                            src={videoUrl} 
                                            autoPlay 
                                            loop 
                                            muted
                                            playsInline 
                                            onError={handleVideoError}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            className="w-full h-full object-cover"
                                        ></video>
                                        
                                        {/* Manual Play Overlay if Autoplay blocked */}
                                        {!isPlaying && !videoError && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity">
                                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/50 shadow-lg group-hover:scale-110 transition-transform">
                                                    <Play className="w-5 h-5 text-white ml-1" />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                             </div>
                             <p className="text-xs text-slate-400 text-center italic">
                                 {fallbackTriggered ? "Streaming from cloud fallback." : "AI visualization of the process."}
                             </p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => setState(AppState.QUIZ)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all"
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