import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2, PlayCircle, BarChart2 } from 'lucide-react';
import { createLiveSession } from '../services/geminiService';

type LiveSession = Awaited<ReturnType<typeof createLiveSession>>;

function base64ToFloat32Array(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768.0;
  }
  return float32;
}

function float32ToPCM16(float32: Float32Array): Int16Array {
    const int16 = new Int16Array(float32.length);
    for(let i=0; i<float32.length; i++){
        let s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// NOTE: No Props needed now as it's a page, but keeping optional for compatibility if needed elsewhere
interface LiveCoachProps {
    className?: string;
}

const LiveCoach: React.FC<LiveCoachProps> = ({ className }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [status, setStatus] = useState("Tap to start session");

    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Clean up on unmount
    useEffect(() => {
        return () => stopSession();
    }, []);

    const startSession = async () => {
        if (isConnected) return; // Prevent double connect
        
        try {
            setStatus("Connecting to EcoCoach...");
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            sessionRef.current = await createLiveSession(
                async (msg) => {
                    const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData && audioContextRef.current) {
                        setIsSpeaking(true);
                        const float32 = base64ToFloat32Array(audioData);
                        const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
                        buffer.getChannelData(0).set(float32);
                        
                        const source = audioContextRef.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioContextRef.current.destination);
                        
                        const currentTime = audioContextRef.current.currentTime;
                        const startTime = Math.max(currentTime, nextStartTimeRef.current);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + buffer.duration;
                        
                        source.onended = () => {
                             if (audioContextRef.current && audioContextRef.current.currentTime >= nextStartTimeRef.current) {
                                 setIsSpeaking(false);
                             }
                        };
                    }
                },
                () => {
                    setIsConnected(true);
                    setStatus("Listening...");
                    startMicrophone();
                },
                () => {
                    setIsConnected(false);
                    setStatus("Disconnected");
                },
                (err) => {
                    console.error(err);
                    setStatus("Connection Error");
                }
            );

        } catch (e) {
            console.error("Failed to start live session", e);
            setStatus("Failed to connect");
        }
    };

    const startMicrophone = async () => {
        try {
             const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
             streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
             const source = inputCtx.createMediaStreamSource(streamRef.current);
             const processor = inputCtx.createScriptProcessor(4096, 1, 1);
             inputProcessorRef.current = processor;
             
             processor.onaudioprocess = (e) => {
                 if (!sessionRef.current) return;
                 const inputData = e.inputBuffer.getChannelData(0);
                 const pcm16 = float32ToPCM16(inputData);
                 const base64 = arrayBufferToBase64(pcm16.buffer);
                 sessionRef.current.sendRealtimeInput({
                     media: { mimeType: 'audio/pcm;rate=16000', data: base64 }
                 });
             };
             source.connect(processor);
             processor.connect(inputCtx.destination);
        } catch (e) {
            setStatus("Microphone Access Denied");
        }
    }

    const stopSession = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (inputProcessorRef.current) inputProcessorRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        
        // Reset refs
        streamRef.current = null;
        inputProcessorRef.current = null;
        sessionRef.current = null;
        audioContextRef.current = null;
        
        setIsConnected(false);
        setIsSpeaking(false);
        setStatus("Session Ended");
    };

    const toggleSession = () => {
        if (isConnected) stopSession();
        else startSession();
    }

    return (
        <div className={`h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 ${className}`}>
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center px-6">
                <div className="mb-12">
                     <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Live Eco Coach</h2>
                     <p className="text-slate-500 font-sans">Real-time voice assistant for your recycling questions.</p>
                </div>

                {/* Main Visualizer */}
                <button 
                    onClick={toggleSession}
                    className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 group ${isConnected ? 'scale-110' : 'hover:scale-105'}`}
                >
                    {/* Outer Glows */}
                    <div className={`absolute inset-0 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-full opacity-30 blur-xl transition-opacity duration-500 ${isConnected ? 'opacity-60 animate-pulse' : ''}`}></div>
                    <div className={`absolute inset-0 border-2 border-emerald-500/30 rounded-full transition-all duration-500 ${isConnected ? 'scale-125 border-emerald-500/50' : 'group-hover:scale-110'}`}></div>
                    
                    {/* Inner Circle */}
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-xl z-20">
                         {isConnected ? (
                             <div className="flex gap-1 items-center">
                                 {/* Simple audio wave simulation */}
                                 <div className={`w-1 bg-emerald-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] ${isSpeaking ? 'h-8' : 'h-2'}`}></div>
                                 <div className={`w-1 bg-emerald-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] ${isSpeaking ? 'h-12' : 'h-3'}`}></div>
                                 <div className={`w-1 bg-emerald-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] ${isSpeaking ? 'h-6' : 'h-2'}`}></div>
                             </div>
                         ) : (
                             <Mic className="w-12 h-12 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                         )}
                    </div>
                </button>

                <div className="mt-12 h-8">
                    <span className={`text-sm font-mono tracking-widest uppercase ${isConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`}>
                        {status}
                    </span>
                </div>

                {/* Topics */}
                {!isConnected && (
                    <div className="mt-8 flex flex-wrap justify-center gap-3 max-w-xs">
                        {["How to recycle glass?", "Is pizza box compostable?", "Reduce plastic tips"].map(topic => (
                            <span key={topic} className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-500 shadow-sm">
                                {topic}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveCoach;