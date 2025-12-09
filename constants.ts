import { ScanResult, QuizQuestion, StoryCard } from './types';

export const DEMO_RESULT: ScanResult = {
  itemName: "Plastic Water Bottle",
  category: "Recyclable",
  materials: ["PET Plastic (#1)", "Plastic Cap (#5)"],
  disposalSteps: [
    "Empty any remaining liquid.",
    "Crush the bottle to save space.",
    "Replace the cap (check local rules, but often accepted).",
  ],
  reasoning: "PET plastic is highly recyclable. It is sorted, cleaned, shredded into flakes, and remade into new products, reducing the need for virgin petroleum.",
  safetyTip: "Ensure the bottle didn't contain hazardous chemicals before recycling.",
  impactFact: "Recycling just one plastic bottle saves enough energy to power a 60W light bulb for 6 hours!",
  sources: [{ title: "EPA Recycling Basics", uri: "https://www.epa.gov/recycle" }]
};

export const DEMO_STORY: StoryCard[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1000&auto=format&fit=crop",
    caption: "Step 1: Sorting & Shredding. Your bottle is optically sorted by type, then chopped into small plastic flakes."
  },
  {
    imageUrl: "https://plus.unsplash.com/premium_photo-1673548917423-073963e7afc9?q=80&w=1000&auto=format&fit=crop",
    caption: "Step 2: Melting. The flakes are washed and melted down into 'nurdles' (small raw plastic pellets)."
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop",
    caption: "Step 3: Manufacturing. These pellets are molded into new bottles, polyester clothing, or carpeting."
  }
];

export const DEMO_QUIZ: QuizQuestion = {
  question: "What is the name of the small raw plastic pellets created during recycling?",
  options: ["Flakes", "Nurdles", "Ingots"],
  correctAnswerIndex: 1,
  explanation: "After plastic is melted down, it is formed into 'nurdles', which are shipped to factories to make new products."
};

// --- VIDEO ASSETS ---

// 1. Local Videos (Preferred)
// Assumes files are in the public/videos/ directory
export const LOCAL_VIDEOS = {
  PLASTIC: "/videos/plastic.mp4",
  WOOD: "/videos/wood.mp4",     
  METAL: "/videos/metal.mp4",
  GLASS: "/videos/glass.mp4",
  ORGANIC: "/videos/organic.mp4",
  EWASTE: "/videos/ewaste.mp4",
};

// 2. Remote Videos (Fallback)
// High-quality Pexels direct links
export const REMOTE_VIDEOS = {
  PLASTIC: "https://videos.pexels.com/video-files/5527878/5527878-hd_1920_1080_25fps.mp4",
  WOOD: "https://videos.pexels.com/video-files/8539634/8539634-hd_1920_1080_25fps.mp4",     
  METAL: "https://videos.pexels.com/video-files/5849626/5849626-sd_640_360_24fps.mp4",
  GLASS: "https://videos.pexels.com/video-files/4440866/4440866-sd_640_360_25fps.mp4",
  ORGANIC: "https://videos.pexels.com/video-files/7659223/7659223-hd_1920_1080_25fps.mp4",
  EWASTE: "https://videos.pexels.com/video-files/3196068/3196068-hd_1920_1080_25fps.mp4",
};

// Default fallback
export const DEMO_VIDEO_URL = REMOTE_VIDEOS.PLASTIC;