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
