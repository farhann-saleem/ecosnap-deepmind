import { GoogleGenAI, Type, Schema, Modality, LiveServerMessage } from "@google/genai";
import { ScanResult, QuizQuestion, StoryCard } from "../types";

// Helper to clean JSON if model returns Markdown
const cleanJSON = (text: string) => {
  const match = text.match(/```json([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
};

// --- Analysis & Advice (Vision + Search) ---

export const analyzeItem = async (base64Image: string): Promise<ScanResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey });

  try {
    const jsonStructure = `
    {
      "itemName": "string",
      "category": "Recyclable" | "Compostable" | "Trash" | "Hazardous" | "Donate" | "Unknown",
      "materials": ["string"],
      "disposalSteps": ["string"],
      "reasoning": "string",
      "safetyTip": "string (optional)",
      "impactFact": "string"
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this image for waste disposal. Identify the item, its materials, and the best disposal method.
            Use Google Search to verify local recycling rules if uncertain.
            
            Return the result ONLY as a valid JSON object matching this structure:
            ${jsonStructure}
            
            Provide 3 clear actionable steps in 'disposalSteps'.
            Provide a safety tip if applicable in 'safetyTip'.
            Provide one interesting "Did you know?" impact fact in 'impactFact'.`,
          },
        ],
      },
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const result = JSON.parse(cleanJSON(text)) as ScanResult;

    // Extract Grounding Sources
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        const chunks = response.candidates[0].groundingMetadata.groundingChunks;
        const sources = chunks
            .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
            .filter((s: any) => s !== null);
        
        // Deduplicate sources
        const uniqueSources = Array.from(new Map(sources.map((s:any) => [s.uri, s])).values());
        result.sources = uniqueSources.slice(0, 3) as {title: string, uri: string}[];
    }

    return result;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze item. Please try again.");
  }
};

// --- Story Generation ---

const storySchema: Schema = {
  type: Type.ARRAY,
  items: {
      type: Type.OBJECT,
      properties: {
          caption: { type: Type.STRING, description: "A concise 1-sentence caption for this stage of the story." },
          imagePrompt: { type: Type.STRING, description: "A detailed image generation prompt for this stage." }
      },
      required: ["caption", "imagePrompt"]
  }
}

export const generateStoryContent = async (itemName: string, category: string): Promise<{caption: string, imagePrompt: string}[]> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a 3-part eco-story for a ${itemName} which is ${category}.
            Part 1: The Current State (What it is).
            Part 2: The Action (Recycling/Composting process).
            Part 3: The Future (What it becomes or the environmental benefit).
            Return exactly 3 items.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema
            }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(cleanJSON(text));
    } catch (e) {
        console.error("Story gen failed", e);
        return [];
    }
}


// --- Quiz Generation ---

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctAnswerIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING },
  },
  required: ["question", "options", "correctAnswerIndex", "explanation"],
};

export const generateQuiz = async (itemContext: string): Promise<QuizQuestion> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a multiple-choice eco-trivia question related to: ${itemContext}. 
            Focus on environmental impact, recycling facts, or material science.
            Provide 3 options and the index (0-2) of the correct one.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");
        return JSON.parse(cleanJSON(text)) as QuizQuestion;
    } catch (error) {
        console.error("Quiz Error:", error);
        // Fallback quiz if generation fails
        return {
            question: "Recycling saves natural resources.",
            options: ["True", "False", "Only sometimes"],
            correctAnswerIndex: 0,
            explanation: "Recycling reduces the need for raw material extraction."
        };
    }
}


// --- Image Generation (Impact Story) ---

export const generateImpactImage = async (prompt: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    // Using gemini-2.5-flash-image for faster, more reliable generation in this context
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [{ text: prompt }]
            },
            // Note: nano-banana models do not support imageConfig yet
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data found in response");

    } catch (e) {
        console.error("Image gen failed", e);
        return "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop"; 
    }
}

// --- Image Editing (Nano Banana) ---
// Feature: "Visualize Reuse"
export const visualizeReuse = async (base64Image: string, prompt: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: base64Image
                        }
                    },
                    { text: prompt }
                ]
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No edited image returned");
    } catch (e) {
        console.error("Image edit failed", e);
        throw e;
    }
}


// --- Veo Video Generation ---

export const generateEcoVideo = async (prompt: string): Promise<string | null> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });

        // Polling
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (videoUri) {
            return `${videoUri}&key=${apiKey}`;
        }
        return null;

    } catch (e) {
        console.error("Veo generation failed", e);
        return null;
    }
}

// --- Live API Helpers ---
export const createLiveSession = async (
    onMessage: (msg: LiveServerMessage) => void,
    onOpen: () => void,
    onClose: () => void,
    onError: (e: ErrorEvent) => void
) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key missing");
    const ai = new GoogleGenAI({ apiKey });

    const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: onOpen,
            onmessage: onMessage,
            onclose: onClose,
            onerror: onError
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            },
            systemInstruction: "You are EcoSnap's friendly AI Eco-Coach. Help the user with sustainable living tips, recycling advice, and motivation. Keep answers concise and encouraging.",
        }
    });
    return session;
};