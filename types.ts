
export interface ScanResult {
  itemName: string;
  category: 'Recyclable' | 'Compostable' | 'Trash' | 'Hazardous' | 'Donate' | 'Unknown';
  materials: string[];
  disposalSteps: string[];
  reasoning: string;
  safetyTip?: string;
  impactFact: string; // "Did you know?"
  sources?: { title: string; uri: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StoryCard {
  imageUrl: string;
  caption: string;
}

export interface UserStats {
  scans: number;
  xp: number;
  streak: number;
  co2Saved: number; // kg
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  STORY = 'STORY',
  QUIZ = 'QUIZ',
  COMPLETED = 'COMPLETED',
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  result: ScanResult;
  xpEarned: number;
}

export type ActiveTab = 'home' | 'scan' | 'live' | 'gallery';