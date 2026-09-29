import fs from "fs";
import path from "path";

export type FlashcardItem = {
  id: string;
  concept: string;
  category: string;
  imageEmoji: string;
  front: {
    santhaliOlChiki: string;
    santhaliRoman: string;
  };
  back: {
    hindi: string;
    english: string;
  };
};

export type SubjectItem = {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  createdAt: string;
};

export type WorksheetItem = {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  originalLanguage: string;
  fileName: string;
  pdfUrl?: string;
  deadline: string;
  status: "active" | "translating" | "closed";
  items: Array<{
    id: string;
    original: string;
    translated: string;
    translatedOlChiki: string;
    concept: string;
    localExample: string;
  }>;
  materialId?: string;
  materialTitle?: string;
  createdAt: string;
};

export type GeneratedQuestion = {
  id: string;
  questionNumber: number;
  question: string;
  type?: "mcq" | "short_answer" | "descriptive";
  options?: string[]; // for quiz
  correctAnswer?: string;
  explanation?: string;
  writingSpaceLines?: number;
  suggestedAnswer?: string;
  marks: number;
};

export type GeneratedAssessment = {
  id: string;
  title: string;
  instructions: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: GeneratedQuestion[];
  totalMarks: number;
  estimatedTimeMinutes?: number;
};

export type LearningMaterialItem = {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  grade: string; // e.g. "Grade 4"
  chapterTopic: string;
  fileName: string;
  fileSize?: string;
  fileData?: string;
  uploadedAt: string;
  status: "uploaded" | "processing" | "ready" | "failed";
  aiProcessedAt?: string;
  aiSummary?: string;
  generatedContent?: {
    quiz: GeneratedAssessment;
    worksheet: GeneratedAssessment;
  };
  approvalStatus: "pending_review" | "approved" | "assigned";
  approvedAt?: string;
  assignedWorksheetId?: string;
};

export type SubmissionItem = {
  id: string;
  worksheetId: string;
  worksheetTitle: string;
  subjectId?: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileName: string;
  fileUrl?: string;
  status: "Submitted" | "Graded" | "Late";
  grade?: string;
  marks?: string; // e.g. "18/20"
  scorePercentage?: number;
  feedback?: string; // Teacher feedback comments
  checkedAt?: string;
  checkedFileName?: string;
  aiConvertedFileName?: string;
  aiConvertedText?: string;
  answers?: Array<{
    questionId: string;
    question: string;
    studentAnswerSantali: string;
    aiConvertedHindi: string;
    aiConvertedEnglish: string;
    marksAwarded?: string;
  }>;
};

export type StudentRecord = {
  id: string;
  name: string;
  rollNo: string;
  grade: string;
  school: string;
  pin: string; // 4-digit unique login PIN
  language: "en" | "hi" | "sat";
  accuracy: number;
  badges: number;
  weakConcepts: string[];
  cardsReviewed: number;
  masteryPercentage: number;
  createdAt: string;
  avatarEmoji?: string;
};

export type TeacherProfile = {
  id: string;
  name: string;
  email: string;
  role: "teacher";
  employeeId: string;
  assignedGrade: string;
  schoolName: string;
  subjectSpecialization: string;
  language: "en" | "hi" | "sat";
  autoAiTranslation: boolean;
  lateSubmissionsAllowed: boolean;
  notifyOnSubmission: boolean;
};

export type NotificationItem = {
  id: string;
  studentId: string;
  title: string;
  message: string;
  subjectName: string;
  worksheetId: string;
  deadline: string;
  read: boolean;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  name: string;
  role: "student" | "teacher";
  rollNo?: string;
  grade?: string;
  school?: string;
  pin?: string;
  language: "en" | "hi" | "sat";
  badges: number;
  accuracy: number;
  weakConcepts: string[];
  seenCardIds: string[]; // Track seen card IDs to prevent repeating cards
};

// Core base vocabulary
const BASE_VOCABULARY: FlashcardItem[] = [
  {
    id: "fc-1",
    concept: "Writing",
    category: "Vocabulary",
    imageEmoji: "✍️",
    front: { santhaliOlChiki: "ᱚᱞ", santhaliRoman: "Ol" },
    back: { hindi: "लिखना", english: "Write" },
  },
  {
    id: "fc-2",
    concept: "Water",
    category: "Science",
    imageEmoji: "💧",
    front: { santhaliOlChiki: "ᱫᱟᱜ", santhaliRoman: "Daᶜ" },
    back: { hindi: "पानी", english: "Water" },
  },
  {
    id: "fc-3",
    concept: "Sun",
    category: "Science",
    imageEmoji: "☀️",
    front: { santhaliOlChiki: "ᱥᱤᱝᱜᱮᱞ", santhaliRoman: "Singel" },
    back: { hindi: "सूरज", english: "Sun" },
  },
  {
    id: "fc-4",
    concept: "Tree",
    category: "Science",
    imageEmoji: "🌳",
    front: { santhaliOlChiki: "ᱫᱟᱨᱮ", santhaliRoman: "Dare" },
    back: { hindi: "पेड़", english: "Tree" },
  },
  {
    id: "fc-5",
    concept: "Photosynthesis",
    category: "Science",
    imageEmoji: "🌿",
    front: { santhaliOlChiki: "ᱫᱟᱨᱮ ᱨᱮᱭᱟᱜ ᱡᱚᱢ ᱵᱮᱱᱟᱣ", santhaliRoman: "Dare reyaɡ jom benao" },
    back: { hindi: "प्रकाश संश्लेषण", english: "Photosynthesis" },
  },
  {
    id: "fc-6",
    concept: "Seed",
    category: "Science",
    imageEmoji: "🌱",
    front: { santhaliOlChiki: "ᱡᱟᱶ", santhaliRoman: "Jaṅ" },
    back: { hindi: "बीज", english: "Seed" },
  },
  {
    id: "fc-7",
    concept: "Addition",
    category: "Math",
    imageEmoji: "➕",
    front: { santhaliOlChiki: "ᱥᱮᱨᱢᱟ", santhaliRoman: "Sermaa" },
    back: { hindi: "जोड़", english: "Addition" },
  },
  {
    id: "fc-8",
    concept: "Number",
    category: "Math",
    imageEmoji: "🔢",
    front: { santhaliOlChiki: "ᱞᱮᱠᱷᱟ", santhaliRoman: "Lekha" },
    back: { hindi: "संख्या", english: "Number" },
  },
  {
    id: "fc-9",
    concept: "River",
    category: "Geography",
    imageEmoji: "🏞️",
    front: { santhaliOlChiki: "ᱜᱟᱰᱟ", santhaliRoman: "Gaḍa" },
    back: { hindi: "नदी", english: "River" },
  },
  {
    id: "fc-10",
    concept: "Reading",
    category: "Vocabulary",
    imageEmoji: "📖",
    front: { santhaliOlChiki: "ᱯᱟᱲᱦᱟᱣ", santhaliRoman: "Paṛhao" },
    back: { hindi: "पढ़ना", english: "Read" },
  },
];

// Rich Santali roots covering subjects, science, math, nature, and grammar
const SANTALI_ROOTS = [
  { ol: "ᱚᱞ", rom: "Ol", hi: "लिखना", en: "Write", cat: "Vocabulary", emoji: "✍️" },
  { ol: "ᱫᱟᱜ", rom: "Daᶜ", hi: "पानी", en: "Water", cat: "Science", emoji: "💧" },
  { ol: "ᱥᱤᱝᱜᱮᱞ", rom: "Singel", hi: "सूरज", en: "Sun", cat: "Science", emoji: "☀️" },
  { ol: "ᱫᱟᱨᱮ", rom: "Dare", hi: "पेड़", en: "Tree", cat: "Science", emoji: "🌳" },
  { ol: "ᱡᱟᱶ", rom: "Jaṅ", hi: "बीज", en: "Seed", cat: "Science", emoji: "🌱" },
  { ol: "ᱥᱮᱨᱢᱟ", rom: "Sermaa", hi: "आकाश / वर्ष", en: "Sky / Year", cat: "Science", emoji: "🌌" },
  { ol: "ᱞᱮᱠᱷᱟ", rom: "Lekha", hi: "संख्या / गिनती", en: "Number / Count", cat: "Math", emoji: "🔢" },
  { ol: "ᱜᱟᱰᱟ", rom: "Gaḍa", hi: "नदी", en: "River", cat: "Geography", emoji: "🏞️" },
  { ol: "ᱯᱟᱲᱦᱟᱣ", rom: "Paṛhao", hi: "पढ़ना", en: "Read", cat: "Vocabulary", emoji: "📖" },
  { ol: "ᱚᱲᱟᱜ", rom: "Oṛaɡ", hi: "घर", en: "House", cat: "Vocabulary", emoji: "🏡" },
  { ol: "ᱤᱛᱩᱱ", rom: "Itun", hi: "सीखना", en: "Learn", cat: "Vocabulary", emoji: "🎓" },
  { ol: "ᱢᱟᱪᱮᱛ", rom: "Macet", hi: "शिक्षक", en: "Teacher", cat: "Vocabulary", emoji: "🧑‍🏫" },
  { ol: "ᱪᱮᱛᱮᱫ", rom: "Ceted", hi: "ज्ञान", en: "Knowledge", cat: "Vocabulary", emoji: "📚" },
  { ol: "ᱡᱚᱢ", rom: "Jom", hi: "खाना", en: "Eat", cat: "Vocabulary", emoji: "🍎" },
  { ol: "ᱧᱩ", rom: "Ñu", hi: "पीना", en: "Drink", cat: "Vocabulary", emoji: "🥛" },
  { ol: "ᱪᱟᱸᱫᱚ", rom: "Cando", hi: "चांद", en: "Moon", cat: "Science", emoji: "🌙" },
  { ol: "ᱵᱩᱨᱩ", rom: "Buru", hi: "पहाड़", en: "Mountain", cat: "Geography", emoji: "⛰️" },
  { ol: "ᱪᱮᱬᱮ", rom: "Ceṇe", hi: "पक्षी", en: "Bird", cat: "Science", emoji: "🐦" },
  { ol: "ᱵᱟᱦᱟ", rom: "Baha", hi: "फूल", en: "Flower", cat: "Science", emoji: "🌸" },
  { ol: "ᱥᱟᱠᱟᱢ", rom: "Sakam", hi: "पत्ती", en: "Leaf", cat: "Science", emoji: "🍃" },
  { ol: "ᱦᱟᱥᱟ", rom: "Hasa", hi: "मिट्टी", en: "Soil / Earth", cat: "Geography", emoji: "🌍" },
  { ol: "ᱦᱚᱭ", rom: "Hoy", hi: "हवा", en: "Air / Wind", cat: "Science", emoji: "💨" },
  { ol: "ᱟᱹᱛᱩ", rom: "Atu", hi: "गांव", en: "Village", cat: "Geography", emoji: "🏘️" },
  { ol: "ᱜᱟᱛᱮ", rom: "Gate", hi: "मित्र", en: "Friend", cat: "Vocabulary", emoji: "🤝" },
  { ol: "ᱵᱤᱨ", rom: "Bir", hi: "जंगल", en: "Forest", cat: "Geography", emoji: "🌲" },
  { ol: "ᱠᱟᱹᱢᱤ", rom: "Kami", hi: "काम / कार्य", en: "Work", cat: "Vocabulary", emoji: "🛠️" },
  { ol: "ᱫᱩᱞᱟᱹᱲ", rom: "Dulaṛ", hi: "प्रेम", en: "Love", cat: "Vocabulary", emoji: "❤️" },
  { ol: "ᱨᱟᱹᱥᱠᱟᱹ", rom: "Raska", hi: "आनंद / खुशी", en: "Joy", cat: "Vocabulary", emoji: "😊" },
  { ol: "ᱥᱮᱨᱮᱧ", rom: "Sereng", hi: "गीत", en: "Song", cat: "Vocabulary", emoji: "🎵" },
  { ol: "ᱮᱱᱮᱡ", rom: "Enej", hi: "नृत्य", en: "Dance", cat: "Vocabulary", emoji: "💃" },
  { ol: "ᱮᱞᱠᱷᱟ", rom: "Elkha", hi: "गणित", en: "Mathematics", cat: "Math", emoji: "📐" },
  { ol: "ᱦᱟᱹᱴᱤᱧ", rom: "Hating", hi: "भाग / विभाजन", en: "Division / Share", cat: "Math", emoji: "➗" },
  { ol: "ᱜᱩᱬᱟᱹ", rom: "Guna", hi: "गुणा", en: "Multiplication", cat: "Math", emoji: "✖️" },
  { ol: "ᱵᱷᱮᱫᱽ", rom: "Bhed", hi: "अंतर / घटाव", en: "Subtraction", cat: "Math", emoji: "➖" },
  { ol: "ᱥᱟᱬᱮᱥ", rom: "Sanes", hi: "विज्ञान", en: "Science", cat: "Science", emoji: "🔬" },
  { ol: "ᱜᱟᱪ", rom: "Gac", hi: "पौधा", en: "Plant", cat: "Science", emoji: "🌱" },
  { ol: "ᱡᱤᱣᱤ", rom: "Jiwi", hi: "जीवन", en: "Life", cat: "Science", emoji: "💖" },
  { ol: "ᱡᱟᱱᱣᱟᱨ", rom: "Janwar", hi: "पशु", en: "Animal", cat: "Science", emoji: "🐾" },
  { ol: "ᱦᱟᱹᱠᱩ", rom: "Haku", hi: "मछली", en: "Fish", cat: "Science", emoji: "🐟" },
  { ol: "ᱥᱤᱢ", rom: "Sim", hi: "मुर्गी", en: "Chicken", cat: "Science", emoji: "🐔" },
];

const MODIFIERS = [
  { ol: " ᱢᱟᱨᱟᱝ", rom: " Marang", hi: " (बड़ा)", en: " (Big)" },
  { ol: " ᱠᱟᱹᱴᱤᱡ", rom: " Kaṭij", hi: " (छोटा)", en: " (Small)" },
  { ol: " ᱱᱟᱣᱟ", rom: " Nawa", hi: " (नया)", en: " (New)" },
  { ol: " ᱥᱮᱫᱟᱭ", rom: " Seday", hi: " (पुराना)", en: " (Old)" },
  { ol: " ᱟᱨᱟᱜ", rom: " Araɡ", hi: " (लाल)", en: " (Red)" },
  { ol: " ᱦᱟᱹᱨᱤᱭᱟᱹᱲ", rom: " Hariyaṛ", hi: " (हरा)", en: " (Green)" },
  { ol: " ᱯᱳᱱᱰ", rom: " Ponḍ", hi: " (सफेद)", en: " (White)" },
  { ol: " ᱦᱮᱸᱫᱮ", rom: " Henḍe", hi: " (काला)", en: " (Black)" },
  { ol: " ᱯᱩᱭᱞᱩ", rom: " Puylu", hi: " (पहला)", en: " (First)" },
  { ol: " ᱫᱚᱥᱟᱨ", rom: " Dosar", hi: " (दूसरा)", en: " (Second)" },
  { ol: " ᱩᱥᱩᱞ", rom: " Usul", hi: " (ऊंचा)", en: " (High/Tall)" },
  { ol: " ᱞᱟᱛᱟᱨ", rom: " Latar", hi: " (निचला)", en: " (Lower)" },
  { ol: " ᱥᱟᱯᱷᱟ", rom: " Sapha", hi: " (साफ)", en: " (Clean)" },
  { ol: " ᱞᱚᱜᱚᱱ", rom: " Logon", hi: " (तेज)", en: " (Fast)" },
  { ol: " ᱫᱷᱤᱨᱤ", rom: " Dhiri", hi: " (धीमा)", en: " (Slow)" },
  { ol: " ᱥᱚᱱᱚᱛ", rom: " Sonot", hi: " (पवित्र)", en: " (Sacred)" },
  { ol: " ᱠᱮᱴᱮᱡ", rom: " Ketej", hi: " (मजबूत)", en: " (Strong)" },
  { ol: " ᱞᱚᱞᱚ", rom: " Lolo", hi: " (गर्म)", en: " (Hot)" },
  { ol: " ᱨᱮᱭᱟᱲ", rom: " Reyaṛ", hi: " (ठंडा)", en: " (Cold)" },
  { ol: " ᱪᱚᱨᱚᱠ", rom: " Corok", hi: " (सुंदर)", en: " (Beautiful)" },
];

const QUALIFIERS = [
  { ol: " ᱢᱩᱬᱩᱛ", rom: " Muṇut", hi: " - मुख्य", en: " - Main" },
  { ol: " ᱠᱩᱫᱽᱨᱟᱹᱛᱤ", rom: " Kudrati", hi: " - प्राकृतिक", en: " - Natural" },
  { ol: " ᱟᱹᱛᱩ ᱨᱮᱭᱟᱜ", rom: " Atu reyaɡ", hi: " - ग्रामीण", en: " - Rural" },
  { ol: " ᱤᱛᱩᱱ ᱨᱮᱭᱟᱜ", rom: " Itun reyaɡ", hi: " - शैक्षणिक", en: " - Educational" },
  { ol: " ᱥᱟᱱᱛᱟᱲᱤ", rom: " Santali", hi: " - संताली", en: " - Santali" },
  { ol: " ᱥᱮᱫᱟᱭ ᱨᱮᱭᱟᱜ", rom: " Seday reyaɡ", hi: " - प्राचीन", en: " - Ancient" },
  { ol: " ᱱᱟᱦᱟᱜ ᱨᱮᱭᱟᱜ", rom: " Nahag reyaɡ", hi: " - आधुनिक", en: " - Modern" },
  { ol: " ᱜᱚᱴᱟ", rom: " Gota", hi: " - संपूर्ण", en: " - Total" },
  { ol: " ᱥᱟᱹᱨᱤ", rom: " Sari", hi: " - सत्य", en: " - True" },
  { ol: " ᱵᱤᱥᱮᱥ", rom: " Bises", hi: " - विशेष", en: " - Special" },
  { ol: " ᱵᱟᱹᱲᱛᱤ", rom: " Baṛti", hi: " - अतिरिक्त", en: " - Extra" },
  { ol: " ᱞᱟᱹᱠᱛᱤᱭᱟᱱ", rom: " Laktiyan", hi: " - आवश्यक", en: " - Essential" },
  { ol: " ᱱᱟᱯᱟᱭ", rom: " Napay", hi: " - उत्तम", en: " - Excellent" },
  { ol: " ᱥᱟᱶᱛᱟ", rom: " Sawta", hi: " - सामाजिक", en: " - Social" },
  { ol: " ᱫᱤᱥᱚᱢ", rom: " Disom", hi: " - राष्ट्रीय", en: " - Country" },
];

const CONTEXTS = [
  { ol: " (ᱟᱹᱛᱩ ᱨᱮ)", rom: " (Atu re)", hi: " [गांव में]", en: " [In Village]" },
  { ol: " (ᱵᱤᱨ ᱨᱮ)", rom: " (Bir re)", hi: " [जंगल में]", en: " [In Forest]" },
  { ol: " (ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱨᱮ)", rom: " (Itun asṛa re)", hi: " [स्कूल में]", en: " [In School]" },
  { ol: " (ᱜᱟᱰᱟ ᱨᱮ)", rom: " (Gaḍa re)", hi: " [नदी में]", en: " [In River]" },
  { ol: " (ᱥᱮᱨᱢᱟ ᱨᱮ)", rom: " (Sermaa re)", hi: " [आकाश में]", en: " [In Sky]" },
  { ol: " (ᱮᱞᱠᱷᱟ ᱨᱮ)", rom: " (Elkha re)", hi: " [गणित में]", en: " [In Math]" },
  { ol: " (ᱥᱟᱬᱮᱥ ᱨᱮ)", rom: " (Sanes re)", hi: " [विज्ञान में]", en: " [In Science]" },
  { ol: " (ᱡᱤᱣᱤ ᱨᱮ)", rom: " (Jiwi re)", hi: " [जीवन में]", en: " [In Life]" },
  { ol: " (ᱵᱩᱨᱩ ᱨᱮ)", rom: " (Buru re)", hi: " [पहाड़ में]", en: " [In Mountain]" },
  { ol: " (ᱚᱲᱟᱜ ᱨᱮ)", rom: " (Oṛaɡ re)", hi: " [घर में]", en: " [In Home]" },
];

// Scalable deterministic dynamic flashcard generator for 10 Million+ unique cards
export function getGeneratedFlashcard(index: number): FlashcardItem {
  if (index < BASE_VOCABULARY.length) {
    return BASE_VOCABULARY[index];
  }

  const adjustedIndex = index - BASE_VOCABULARY.length;

  const rootIdx = adjustedIndex % SANTALI_ROOTS.length;
  const modIdx = Math.floor(adjustedIndex / SANTALI_ROOTS.length) % MODIFIERS.length;
  const qualIdx = Math.floor(adjustedIndex / (SANTALI_ROOTS.length * MODIFIERS.length)) % QUALIFIERS.length;
  const ctxIdx = Math.floor(adjustedIndex / (SANTALI_ROOTS.length * MODIFIERS.length * QUALIFIERS.length)) % CONTEXTS.length;
  const multiplier = Math.floor(adjustedIndex / (SANTALI_ROOTS.length * MODIFIERS.length * QUALIFIERS.length * CONTEXTS.length)) + 1;

  const root = SANTALI_ROOTS[rootIdx];
  const mod = MODIFIERS[modIdx];
  const qual = QUALIFIERS[qualIdx];
  const ctx = CONTEXTS[ctxIdx];

  const numTag = multiplier > 1 ? ` v${multiplier}` : "";

  return {
    id: `fc-vocab-${index + 1}`,
    concept: `${root.en}${mod.en}${qual.en}${numTag}`,
    category: root.cat,
    imageEmoji: root.emoji,
    front: {
      santhaliOlChiki: `${root.ol}${mod.ol}${qual.ol}${ctx.ol}`,
      santhaliRoman: `${root.rom}${mod.rom}${qual.rom}${ctx.rom}`,
    },
    back: {
      hindi: `${root.hi}${mod.hi}${qual.hi}${ctx.hi}`,
      english: `${root.en}${mod.en}${qual.en}${ctx.en}`,
    },
  };
}

// Data Store File Path
const DB_FILE = path.join(process.cwd(), "data_store.json");

interface DBData {
  subjects: SubjectItem[];
  worksheets: WorksheetItem[];
  materials: LearningMaterialItem[];
  submissions: SubmissionItem[];
  notifications: NotificationItem[];
  userProfile: UserProfile;
  students: StudentRecord[];
  teacherProfile: TeacherProfile;
}

export function generateUniquePIN(existingPINs: Set<string>): string {
  let attempts = 0;
  while (attempts < 10000) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    if (!existingPINs.has(pin)) {
      return pin;
    }
    attempts++;
  }
  return (1000 + (Date.now() % 9000)).toString();
}

const DEFAULT_DATA: DBData = {
  subjects: [
    { id: "sub-1", name: "Mathematics", icon: "calculator", description: "Fractions, Algebra & Numbers", createdAt: "2026-09-01T10:00:00Z" },
    { id: "sub-2", name: "Science", icon: "flask", description: "Plants, Animals & Natural Phenomena", createdAt: "2026-09-01T10:00:00Z" },
    { id: "sub-3", name: "Social Science", icon: "globe", description: "History, Village & Community", createdAt: "2026-09-01T10:00:00Z" },
    { id: "sub-4", name: "Language & Literature", icon: "book", description: "Santali & Hindi Grammar & Reading", createdAt: "2026-09-01T10:00:00Z" },
  ],
  worksheets: [
    {
      id: "ws-101",
      title: "Fractions & Basic Division",
      subjectId: "sub-1",
      subjectName: "Mathematics",
      originalLanguage: "Hindi",
      fileName: "Fractions_Worksheet.pdf",
      deadline: "2026-10-15T18:00:00Z",
      status: "active",
      createdAt: "2026-09-20T09:00:00Z",
      items: [
        {
          id: "w1",
          original: "यदि आपके पास 8 आम हैं और आप उन्हें 4 दोस्तों में बराबर बांटते हैं, तो प्रत्येक को कितने मिलेंगे?",
          translated: "ᱡᱩᱫᱤ ᱟᱢ ᱴᱷᱮᱱ ᱘ ᱴᱤ ᱩᱞ ᱢᱮᱱᱟᱜ-ᱟ ᱟᱨ ᱟᱢ ᱔ ᱡᱚᱱ ᱜᱟᱛᱮ ᱨᱮ ᱥᱚᱢᱟᱱ ᱮᱢ ᱦᱟᱹᱴᱤᱧᱟ, ᱛᱚᱵᱮ ᱡᱚᱛᱚ ᱦᱚᱲ ᱛᱤᱱᱟᱹᱜ ᱠᱚ ᱧᱟᱢᱟ?",
          translatedOlChiki: "ᱡᱩᱫᱤ ᱟᱢ ᱴᱷᱮᱱ ᱘ ᱴᱤ ᱩᱞ ᱢᱮᱱᱟᱜ-ᱟ ᱟᱨ ᱟᱢ ᱔ ᱡᱚᱱ ᱜᱟᱛᱮ ᱨᱮ ᱥᱚᱢᱟᱱ ᱮᱢ ᱦᱟᱹᱴᱤᱧᱟ?",
          concept: "Equal Sharing",
          localExample: "Local example: Distributing mangoes in your village orchard equally.",
        },
        {
          id: "w2",
          original: "1/2 और 1/4 में से कौन सा भिन्न बड़ा है?",
          translated: "᱑/᱒ ᱟᱨ ᱑/᱔ ᱢᱩᱫᱽ ᱨᱮ ᱚᱠᱟ ᱦᱟᱹᱴᱤᱧ ᱞᱮᱠᱷᱟ ᱢᱟᱨᱟᱝᱟ?",
          translatedOlChiki: "᱑/᱒ ᱟᱨ ᱑/᱔ ᱢᱩᱫᱽ ᱨᱮ ᱚᱠᱟ ᱦᱟᱹᱴᱤᱧ ᱞᱮᱠᱷᱟ ᱢᱟᱨᱟᱝᱟ?",
          concept: "Fractions Comparison",
          localExample: "Local example: Half a roti vs one-quarter of a roti.",
        },
      ],
    },
    {
      id: "ws-102",
      title: "Plants Around Us (Chapter 4)",
      subjectId: "sub-2",
      subjectName: "Science",
      originalLanguage: "Hindi",
      fileName: "Plants_Around_Us.pdf",
      deadline: "2026-10-05T17:00:00Z",
      status: "active",
      createdAt: "2026-09-22T14:30:00Z",
      items: [
        {
          id: "w101",
          original: "पौधे अपना भोजन कैसे बनाते हैं? कारण सहित उत्तर दीजिए।",
          translated: "গাছ রেয়াগ যোম ওকা লেকান বেনাও কাটু? कारण सह उत्तर मे।",
          translatedOlChiki: "ᱜᱟᱪ ᱨᱮᱭᱟᱜ ᱡᱚᱢ ᱚᱠᱟ ᱞᱮᱠᱟᱱ ᱵᱮᱱᱟᱣ ᱠᱟᱱᱟ?",
          concept: "Photosynthesis",
          localExample: "Local example: Sal trees turning lush green after monsoon rains.",
        },
        {
          id: "w102",
          original: "एक बीज को पौधा बनने के लिए किन-किन चीज़ों की आवश्यकता होती है?",
          translated: "মিত্ জাङ् দেᱟ গাছ বাᱲᱟᱭ আᱲᱤ লাগিত্ চেᱴ্ চᱮᱴ্ বা'ᱱᱩᱠ লাগিত্ چاہিয়'?",
          translatedOlChiki: "ᱢᱤᱫ ᱡᱟᱶ ᱫᱚ ᱫᱟᱨᱮ ᱵᱟᱲᱟᱭ ᱞᱟᱹᱜᱤᱫ ᱪᱮᱫ ᱪᱮᱫ ᱵᱟᱹᱱᱩᱠ ᱪᱟᱦᱤ",
          concept: "Seed Germination",
          localExample: "Local example: Paddy seeds sown before rain.",
        },
      ],
    },
  ],
  materials: [
    {
      id: "mat-101",
      title: "SCERT Jharkhand Science: Chapter 4 - Plants Around Us",
      subjectId: "sub-2",
      subjectName: "Science",
      grade: "Grade 4",
      chapterTopic: "Chapter 4: Plant Roots, Leaves & Forest Trees",
      fileName: "Ch4_Science_Plants_Around_Us.pdf",
      fileSize: "2.4 MB",
      uploadedAt: "2026-09-24T10:00:00Z",
      status: "ready",
      aiProcessedAt: "2026-09-24T10:02:15Z",
      aiSummary: "AI successfully analyzed Ch4_Science_Plants_Around_Us.pdf. Extracted 5 quiz questions and 5 descriptive worksheet problems on root systems, photosynthesis, and Jharkhand trees.",
      approvalStatus: "approved",
      approvedAt: "2026-09-24T10:15:00Z",
      assignedWorksheetId: "ws-102",
      generatedContent: {
        quiz: {
          id: "quiz-mat-101",
          title: "Plants Around Us — Concept Quiz",
          instructions: "Read each question carefully and select the correct option. Total marks: 10.",
          difficulty: "Medium",
          totalMarks: 10,
          estimatedTimeMinutes: 15,
          questions: [
            {
              id: "q-1",
              questionNumber: 1,
              question: "Which part of a tree anchors it into the soil and absorbs groundwater?",
              type: "mcq",
              options: ["Roots (ᱨᱮᱦᱮᱫ)", "Leaves (ᱥᱟᱠᱟᱢ)", "Flower (ᱵᱟᱦᱟ)", "Bark (ᱪᱷᱟᱞ)"],
              correctAnswer: "Roots (ᱨᱮᱦᱮᱫ)",
              explanation: "Roots anchor the plant firmly and absorb vital groundwater and minerals from the soil.",
              marks: 2,
            },
            {
              id: "q-2",
              questionNumber: 2,
              question: "What green substance inside leaves captures solar energy to prepare plant food?",
              type: "mcq",
              options: ["Chlorophyll (ᱦᱟᱹᱨᱤᱭᱟᱹᱲ ᱨᱚᱝ)", "Carotene", "Pure water", "Nitrogen dust"],
              correctAnswer: "Chlorophyll (ᱦᱟᱹᱨᱤᱭᱟᱹᱲ ᱨᱚᱝ)",
              explanation: "Chlorophyll absorbs sunlight to synthesize glucose from carbon dioxide and water.",
              marks: 2,
            },
            {
              id: "q-3",
              questionNumber: 3,
              question: "Which vital gas do green forest trees release during daylight that humans breathe?",
              type: "mcq",
              options: ["Oxygen (ᱡᱤᱣᱤ ᱦᱚᱭ)", "Carbon Dioxide", "Argon", "Smoke"],
              correctAnswer: "Oxygen (ᱡᱤᱣᱤ ᱦᱚᱭ)",
              explanation: "Plants produce oxygen as a byproduct of daylight photosynthesis.",
              marks: 2,
            },
            {
              id: "q-4",
              questionNumber: 4,
              question: "What protective coat wraps around a seed before it germinates in moist soil?",
              type: "mcq",
              options: ["Seed Coat (ᱡᱟᱶ ᱪᱷᱟᱞ)", "Leaf vein", "Stem bark", "Flower petal"],
              correctAnswer: "Seed Coat (ᱡᱟᱶ ᱪᱷᱟᱞ)",
              explanation: "The seed coat shields the dormant embryo until moisture and warmth induce sprouting.",
              marks: 2,
            },
            {
              id: "q-5",
              questionNumber: 5,
              question: "Why do Sal trees in Jharkhand shed leaves during late winter and dry spring?",
              type: "mcq",
              options: [
                "To reduce water loss through transpiration",
                "Because of heavy rainfall",
                "To attract butterflies",
                "Due to excessive shade",
              ],
              correctAnswer: "To reduce water loss through transpiration",
              explanation: "Deciduous shedding conserves vital moisture in dry weather prior to summer rains.",
              marks: 2,
            },
          ],
        },
        worksheet: {
          id: "ws-mat-101",
          title: "Plants Around Us — Classroom Practice Worksheet",
          instructions: "Answer each question neatly in the lines provided below. Total marks: 20.",
          difficulty: "Medium",
          totalMarks: 20,
          estimatedTimeMinutes: 30,
          questions: [
            {
              id: "wsq-1",
              questionNumber: 1,
              question: "Explain why indigenous trees like Sal and Mahua need deep taproots in our district.",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "Deep taproots penetrate deep underground to reach water tables during dry hot months.",
              marks: 4,
            },
            {
              id: "wsq-2",
              questionNumber: 2,
              question: "List the three essential raw materials that green leaves use to produce food through photosynthesis.",
              type: "descriptive",
              writingSpaceLines: 3,
              suggestedAnswer: "1. Sunlight (ᱵᱮᱲᱟ ᱢᱟᱨᱥᱟᱞ), 2. Water from soil (ᱫᱟᱜ), 3. Carbon Dioxide from air (ᱦᱚᱭ).",
              marks: 4,
            },
            {
              id: "wsq-3",
              questionNumber: 3,
              question: "How do village forests help keep the ambient air cool and reduce seasonal soil erosion?",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "Tree root networks bind loose topsoil against runoff, and leafy canopy provides transpiration cooling.",
              marks: 4,
            },
            {
              id: "wsq-4",
              questionNumber: 4,
              question: "Describe the changes observed when a farmer sows paddy seeds into freshly plowed soil.",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "The seed absorbs soil moisture, swells, splits its testa, and sprouts a downward radicle root and upward green shoot.",
              marks: 4,
            },
            {
              id: "wsq-5",
              questionNumber: 5,
              question: "Give two reasons why planting and protecting fruit and shade trees near our school is beneficial.",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "Trees offer shade during recess, improve air quality, and provide seasonal nutritious fruits like Jamun and Mango.",
              marks: 4,
            },
          ],
        },
      },
    },
    {
      id: "mat-102",
      title: "Fractions & Fair Sharing - Chapter 2 Notes",
      subjectId: "sub-1",
      subjectName: "Mathematics",
      grade: "Grade 4",
      chapterTopic: "Chapter 2: Fractions & Sharing Produce",
      fileName: "Math_Ch2_Fractions_Notes.pdf",
      fileSize: "1.8 MB",
      uploadedAt: "2026-09-26T11:30:00Z",
      status: "ready",
      aiProcessedAt: "2026-09-26T11:31:40Z",
      aiSummary: "AI successfully analyzed Math_Ch2_Fractions_Notes.pdf. Extracted 5 multiple-choice fraction comparison items and 4 word problems on equal division.",
      approvalStatus: "pending_review",
      generatedContent: {
        quiz: {
          id: "quiz-mat-102",
          title: "Fractions & Equal Sharing — Quick Quiz",
          instructions: "Select the correct option for each problem. Total marks: 10.",
          difficulty: "Medium",
          totalMarks: 10,
          estimatedTimeMinutes: 15,
          questions: [
            {
              id: "qm-1",
              questionNumber: 1,
              question: "If 12 guavas are shared equally among 3 friends, how many guavas does each friend get?",
              type: "mcq",
              options: ["4 guavas (᱔ ᱴᱤ)", "3 guavas", "6 guavas", "2 guavas"],
              correctAnswer: "4 guavas (᱔ ᱴᱤ)",
              explanation: "12 divided by 3 equals 4 (12 ÷ 3 = 4).",
              marks: 2,
            },
            {
              id: "qm-2",
              questionNumber: 2,
              question: "Which fraction represents one half of a whole unit?",
              type: "mcq",
              options: ["1/2", "1/4", "3/4", "2/1"],
              correctAnswer: "1/2",
              explanation: "1/2 indicates 1 equal part out of 2.",
              marks: 2,
            },
            {
              id: "qm-3",
              questionNumber: 3,
              question: "Which fraction is bigger: 1/2 or 1/4?",
              type: "mcq",
              options: ["1/2 is bigger", "1/4 is bigger", "Both are equal", "Cannot be determined"],
              correctAnswer: "1/2 is bigger",
              explanation: "Dividing into 2 parts creates larger pieces than dividing into 4 parts.",
              marks: 2,
            },
            {
              id: "qm-4",
              questionNumber: 4,
              question: "If a string of length 20 cm is cut into 4 equal segments, what is the length of each segment?",
              type: "mcq",
              options: ["5 cm", "4 cm", "10 cm", "2 cm"],
              correctAnswer: "5 cm",
              explanation: "20 cm ÷ 4 = 5 cm.",
              marks: 2,
            },
            {
              id: "qm-5",
              questionNumber: 5,
              question: "What is 3/4 + 1/4 equal to?",
              type: "mcq",
              options: ["1 (One whole)", "4/8", "2/4", "3/8"],
              correctAnswer: "1 (One whole)",
              explanation: "(3 + 1) / 4 = 4/4 = 1.",
              marks: 2,
            },
          ],
        },
        worksheet: {
          id: "ws-mat-102",
          title: "Fractions & Equal Sharing — Practice Sheet",
          instructions: "Solve the word problems clearly showing calculations. Total marks: 16.",
          difficulty: "Medium",
          totalMarks: 16,
          estimatedTimeMinutes: 25,
          questions: [
            {
              id: "wsm-1",
              questionNumber: 1,
              question: "Solve: 24 kilograms of rice are shared equally among 4 families. How much does each family receive?",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "24 kg ÷ 4 = 6 kg per family.",
              marks: 4,
            },
            {
              id: "wsm-2",
              questionNumber: 2,
              question: "Draw two identical circular rotis. Shade 1/2 of the first and 1/4 of the second to demonstrate which is larger.",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "Shading half of a circle covers twice the area of one quarter.",
              marks: 4,
            },
            {
              id: "wsm-3",
              questionNumber: 3,
              question: "A piece of cloth measures 15 meters. If Guruji cuts 3/5 of it for school banner craft, how many meters are cut?",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "(15 ÷ 5) × 3 = 3 × 3 = 9 meters cut.",
              marks: 4,
            },
            {
              id: "wsm-4",
              questionNumber: 4,
              question: "Sona had ₹60. She spent 1/3 of it on colored pencils. How much did she spend, and how much money is left?",
              type: "descriptive",
              writingSpaceLines: 4,
              suggestedAnswer: "Spent = 60 ÷ 3 = ₹20. Remaining = 60 - 20 = ₹40.",
              marks: 4,
            },
          ],
        },
      },
    },
  ],
  submissions: [
    {
      id: "subm-1",
      worksheetId: "ws-101",
      worksheetTitle: "Fractions & Basic Division",
      subjectId: "sub-1",
      subjectName: "Mathematics",
      studentId: "s1",
      studentName: "Sona Murmu",
      submittedAt: "2026-09-24T11:20:00Z",
      fileName: "Sona_Math_Fractions_Completed.pdf",
      status: "Graded",
      grade: "A",
      marks: "18/20",
      scorePercentage: 90,
      feedback: "Very neat work on fractions! Ol Chiki handwriting is clear. Keep practicing unit comparisons.",
      checkedAt: "2026-09-25T14:15:00Z",
      checkedFileName: "Sona_Math_Fractions_Checked.pdf",
      aiConvertedFileName: "Sona_Math_Fractions_Converted_En_Hi.pdf",
      aiConvertedText: "Student Answer 1: 2 mangoes each (ᱡᱚᱛᱚ ᱦᱚᱲ ᱵᱟᱨᱭᱟ ᱠᱟᱛᱮ ᱩᱞ ᱠᱚ ᱧᱟᱢᱟ - प्रत्येक को 2 आम मिलेंगे)\nStudent Answer 2: 1/2 is greater than 1/4 (᱑/᱒ ᱫᱚ ᱑/᱔ ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝᱟ - 1/2, 1/4 से बड़ा है)",
      answers: [
        {
          questionId: "w1",
          question: "यदि आपके पास 8 आम हैं और आप उन्हें 4 दोस्तों में बराबर बांटते हैं, तो प्रत्येक को कितने मिलेंगे?",
          studentAnswerSantali: "ᱡᱚᱛᱚ ᱦᱚᱲ ᱵᱟᱨᱭᱟ (2) ᱠᱟᱛᱮ ᱩᱞ ᱠᱚ ᱧᱟᱢᱟ",
          aiConvertedHindi: "प्रत्येक दोस्त को 2 आम मिलेंगे (8 ÷ 4 = 2)",
          aiConvertedEnglish: "Each friend gets 2 mangoes (8 divided by 4 = 2)",
          marksAwarded: "10/10",
        },
        {
          questionId: "w2",
          question: "1/2 और 1/4 में से कौन सा भिन्न बड़ा है?",
          studentAnswerSantali: "᱑/᱒ ᱫᱚ ᱑/᱔ ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱦᱟᱹᱴᱤᱧ ᱠᱟᱱᱟ",
          aiConvertedHindi: "1/2, 1/4 से बड़ा भिन्न है",
          aiConvertedEnglish: "1/2 is a larger fraction than 1/4",
          marksAwarded: "8/10",
        },
      ],
    },
    {
      id: "subm-2",
      worksheetId: "ws-102",
      worksheetTitle: "Plants Around Us (Chapter 4)",
      subjectId: "sub-2",
      subjectName: "Science",
      studentId: "s1",
      studentName: "Sona Murmu",
      submittedAt: "2026-09-28T09:40:00Z",
      fileName: "Sona_Science_Plants_Submitted.pdf",
      status: "Submitted",
      marks: "Pending",
      feedback: "",
      answers: [
        {
          questionId: "w101",
          question: "पौधे अपना भोजन कैसे बनाते हैं? कारण सहित उत्तर दीजिए।",
          studentAnswerSantali: "ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱥᱤᱛᱩᱝ ᱵᱮᱲᱟ ᱟᱨ ᱫᱟᱜ ᱦᱟᱥᱟ ᱠᱷᱚᱱ ᱡᱚᱢᱟᱜ ᱠᱚ ᱛᱮᱭᱟᱨᱟ (ᱯᱷᱚᱴᱚᱥᱤᱱᱛᱷᱮᱥᱤᱥ)",
          aiConvertedHindi: "पौधे धूप, पानी और मिट्टी से भोजन बनाते हैं (प्रकाश संश्लेषण द्वारा)",
          aiConvertedEnglish: "Plants prepare food using sunlight, water, and soil nutrients (photosynthesis)",
        },
        {
          questionId: "w102",
          question: "एक बीज को पौधा बनने के लिए किन-किन चीज़ों की आवश्यकता होती है?",
          studentAnswerSantali: "ᱢᱤᱫᱴᱟᱹᱝ ᱡᱟᱝ ᱫᱟᱨᱮ ᱵᱮᱱᱟᱣ ᱞᱟᱹᱜᱤᱫ ᱦᱟᱥᱟ, ᱫᱟᱜ ᱟᱨ ᱥᱤᱛᱩᱝ ᱞᱟᱹᱠᱛᱤᱜ-ᱟ",
          aiConvertedHindi: "बीज को अंकुरित होने के लिए मिट्टी, पानी और धूप की आवश्यकता होती है",
          aiConvertedEnglish: "A seed needs soil, moisture/water, and sunlight to germinate into a plant",
        },
      ],
    },
    {
      id: "subm-3",
      worksheetId: "ws-101",
      worksheetTitle: "Fractions & Basic Division",
      subjectId: "sub-1",
      subjectName: "Mathematics",
      studentId: "s2",
      studentName: "Bijay Hembrom",
      submittedAt: "2026-09-24T16:00:00Z",
      fileName: "Bijay_Fractions_Worksheet.pdf",
      status: "Graded",
      grade: "A+",
      marks: "20/20",
      scorePercentage: 100,
      feedback: "Exceptional mastery of fractional reasoning and clear step-by-step Ol Chiki solution.",
      checkedAt: "2026-09-25T15:00:00Z",
      checkedFileName: "Bijay_Fractions_Checked.pdf",
      aiConvertedFileName: "Bijay_Fractions_Converted.pdf",
      aiConvertedText: "Student answered both questions with complete accuracy and reasoning.",
    },
  ],
  notifications: [
    {
      id: "notif-1",
      studentId: "s1",
      title: "New worksheet published",
      message: "Science — Plants Around Us (Chapter 4)",
      subjectName: "Science",
      worksheetId: "ws-102",
      deadline: "2026-10-05T17:00:00Z",
      read: false,
      createdAt: "2026-09-22T14:30:00Z",
    },
  ],
  userProfile: {
    id: "s1",
    name: "Sona Murmu",
    role: "student",
    rollNo: "24",
    grade: "Grade 4",
    school: "Rajkiya Prathmik Vidyalaya, Dumka",
    pin: "1234",
    language: "en",
    badges: 6,
    accuracy: 82,
    weakConcepts: ["Photosynthesis", "Addition carry-over"],
    seenCardIds: [],
  },
  students: [
    {
      id: "s1",
      name: "Sona Murmu",
      rollNo: "24",
      grade: "Grade 4",
      school: "Rajkiya Prathmik Vidyalaya, Dumka",
      pin: "1234",
      language: "en",
      accuracy: 82,
      badges: 6,
      weakConcepts: ["Photosynthesis", "Addition carry-over"],
      cardsReviewed: 142,
      masteryPercentage: 78,
      createdAt: "2026-09-01T08:00:00Z",
    },
    {
      id: "s2",
      name: "Bijay Hembrom",
      rollNo: "12",
      grade: "Grade 4",
      school: "Rajkiya Prathmik Vidyalaya, Dumka",
      pin: "4821",
      language: "sat",
      accuracy: 91,
      badges: 9,
      weakConcepts: ["Fractions Comparison"],
      cardsReviewed: 198,
      masteryPercentage: 88,
      createdAt: "2026-09-01T08:00:00Z",
    },
    {
      id: "s3",
      name: "Rupa Tudu",
      rollNo: "08",
      grade: "Grade 4",
      school: "Rajkiya Prathmik Vidyalaya, Dumka",
      pin: "7319",
      language: "hi",
      accuracy: 74,
      badges: 4,
      weakConcepts: ["Plant Parts", "Seed Germination"],
      cardsReviewed: 110,
      masteryPercentage: 69,
      createdAt: "2026-09-01T08:00:00Z",
    },
    {
      id: "s4",
      name: "Chandan Hansda",
      rollNo: "17",
      grade: "Grade 4",
      school: "Rajkiya Prathmik Vidyalaya, Dumka",
      pin: "5602",
      language: "en",
      accuracy: 86,
      badges: 7,
      weakConcepts: ["Division remainder"],
      cardsReviewed: 165,
      masteryPercentage: 82,
      createdAt: "2026-09-01T08:00:00Z",
    },
  ],
  teacherProfile: {
    id: "t1",
    name: "Guruji Hemant Soren",
    email: "hemant.soren@aaroh-edu.in",
    role: "teacher",
    employeeId: "EDU-JH-2024-089",
    assignedGrade: "Grade 4 (Sections A & B)",
    schoolName: "Rajkiya Prathmik Vidyalaya, Dumka",
    subjectSpecialization: "Science & Santali Language",
    language: "en",
    autoAiTranslation: true,
    lateSubmissionsAllowed: true,
    notifyOnSubmission: true,
  },
};

function readDB(): DBData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (!parsed.userProfile) {
        parsed.userProfile = DEFAULT_DATA.userProfile;
      }
      if (!parsed.userProfile.seenCardIds) {
        parsed.userProfile.seenCardIds = [];
      }
      if (!parsed.userProfile.school) {
        parsed.userProfile.school = "Rajkiya Prathmik Vidyalaya, Dumka";
      }
      if (!parsed.userProfile.pin) {
        parsed.userProfile.pin = "1234";
      }
      if (!parsed.students || parsed.students.length === 0) {
        parsed.students = DEFAULT_DATA.students;
      } else {
        // Ensure each student has school, pin, language, createdAt
        const existingPINs = new Set<string>();
        parsed.students.forEach((s: any, idx: number) => {
          if (!s.school) s.school = "Rajkiya Prathmik Vidyalaya, Dumka";
          if (!s.pin) {
            const defaultPins = ["1234", "4821", "7319", "5602"];
            s.pin = defaultPins[idx % defaultPins.length] || generateUniquePIN(existingPINs);
          }
          existingPINs.add(s.pin);
          if (!s.language) s.language = "en";
          if (!s.createdAt) s.createdAt = "2026-09-01T08:00:00Z";
        });
      }
      if (!parsed.teacherProfile) {
        parsed.teacherProfile = DEFAULT_DATA.teacherProfile;
      }
      if (!parsed.submissions || parsed.submissions.length === 0) {
        parsed.submissions = DEFAULT_DATA.submissions;
      }
      if (!parsed.subjects || parsed.subjects.length === 0) {
        parsed.subjects = DEFAULT_DATA.subjects;
      }
      if (!parsed.worksheets || parsed.worksheets.length === 0) {
        parsed.worksheets = DEFAULT_DATA.worksheets;
      }
      if (!parsed.materials || parsed.materials.length === 0) {
        parsed.materials = DEFAULT_DATA.materials;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error reading DB_FILE:", e);
  }
  return DEFAULT_DATA;
}

function writeDB(data: DBData) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing DB_FILE:", e);
  }
}

export const db = {
  getSubjects: (): SubjectItem[] => {
    return readDB().subjects;
  },
  addSubject: (name: string, description?: string, icon?: string): SubjectItem => {
    const data = readDB();
    const newSubject: SubjectItem = {
      id: `sub-${Date.now()}`,
      name,
      description: description || `${name} worksheets and lessons`,
      icon: icon || "book",
      createdAt: new Date().toISOString(),
    };
    data.subjects.push(newSubject);
    writeDB(data);
    return newSubject;
  },
  getWorksheets: (subjectId?: string): WorksheetItem[] => {
    const worksheets = readDB().worksheets;
    if (subjectId && subjectId !== "all") {
      return worksheets.filter((w) => w.subjectId === subjectId);
    }
    return worksheets;
  },
  getWorksheetById: (id: string): WorksheetItem | undefined => {
    return readDB().worksheets.find((w) => w.id === id);
  },
  addWorksheet: (worksheet: Omit<WorksheetItem, "id" | "createdAt">): WorksheetItem => {
    const data = readDB();
    const newWorksheet: WorksheetItem = {
      ...worksheet,
      id: `ws-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    data.worksheets.unshift(newWorksheet);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      studentId: "s1",
      title: "New worksheet published",
      message: `${worksheet.subjectName} — ${worksheet.title}`,
      subjectName: worksheet.subjectName,
      worksheetId: newWorksheet.id,
      deadline: worksheet.deadline,
      read: false,
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(newNotif);

    writeDB(data);
    return newWorksheet;
  },
  getSubmissions: (worksheetId?: string): SubmissionItem[] => {
    const submissions = readDB().submissions;
    if (worksheetId) {
      return submissions.filter((s) => s.worksheetId === worksheetId);
    }
    return submissions;
  },
  addSubmission: (
    worksheetId: string,
    fileName: string,
    studentId = "s1",
    studentName = "Sona Murmu"
  ): SubmissionItem => {
    const data = readDB();
    const worksheet = data.worksheets.find((w) => w.id === worksheetId);
    const newSub: SubmissionItem = {
      id: `subm-${Date.now()}`,
      worksheetId,
      worksheetTitle: worksheet ? worksheet.title : "Worksheet",
      subjectName: worksheet ? worksheet.subjectName : "General",
      studentId,
      studentName,
      submittedAt: new Date().toISOString(),
      fileName,
      status: "Submitted",
    };
    data.submissions.unshift(newSub);
    writeDB(data);
    return newSub;
  },
  getNotifications: (studentId = "s1"): NotificationItem[] => {
    return readDB().notifications;
  },
  markNotificationRead: (id: string) => {
    const data = readDB();
    const n = data.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      writeDB(data);
    }
  },
  markAllNotificationsRead: () => {
    const data = readDB();
    data.notifications.forEach((n) => (n.read = true));
    writeDB(data);
  },
  getUserProfile: (): UserProfile => {
    return readDB().userProfile;
  },
  updateUserProfile: (profile: Partial<UserProfile>): UserProfile => {
    const data = readDB();
    data.userProfile = { ...data.userProfile, ...profile };
    writeDB(data);
    return data.userProfile;
  },

  // Deduplication & Seen Cards Tracking
  markCardSeen: (cardId: string): string[] => {
    const data = readDB();
    if (!data.userProfile.seenCardIds.includes(cardId)) {
      data.userProfile.seenCardIds.push(cardId);
      writeDB(data);
    }
    return data.userProfile.seenCardIds;
  },
  markCardsSeen: (cardIds: string[]): string[] => {
    const data = readDB();
    let updated = false;
    cardIds.forEach((id) => {
      if (!data.userProfile.seenCardIds.includes(id)) {
        data.userProfile.seenCardIds.push(id);
        updated = true;
      }
    });
    if (updated) writeDB(data);
    return data.userProfile.seenCardIds;
  },
  resetSeenCards: (): void => {
    const data = readDB();
    data.userProfile.seenCardIds = [];
    writeDB(data);
  },

  getStudents: (): StudentRecord[] => {
    return readDB().students;
  },
  getStudentById: (id: string): StudentRecord | undefined => {
    return readDB().students.find((s) => s.id === id);
  },
  updateStudent: (id: string, update: Partial<StudentRecord>): StudentRecord | undefined => {
    const data = readDB();
    const s = data.students.find((st) => st.id === id);
    if (s) {
      Object.assign(s, update);
      if (data.userProfile.id === id) {
        Object.assign(data.userProfile, update);
      }
      writeDB(data);
    }
    return s;
  },
  addStudent: (data: {
    name: string;
    school: string;
    grade: string;
    rollNo: string;
  }): { student: StudentRecord; generatedPin: string } => {
    const dbData = readDB();
    const existingPINs = new Set<string>(dbData.students.map((s) => s.pin).filter(Boolean));
    const generatedPin = generateUniquePIN(existingPINs);

    const newStudent: StudentRecord = {
      id: `s-${Date.now()}`,
      name: data.name.trim(),
      school: data.school.trim() || "Rajkiya Prathmik Vidyalaya, Dumka",
      grade: data.grade.trim() || "Grade 4",
      rollNo: data.rollNo.trim(),
      pin: generatedPin,
      language: "en",
      accuracy: 0,
      badges: 0,
      weakConcepts: [],
      cardsReviewed: 0,
      masteryPercentage: 0,
      createdAt: new Date().toISOString(),
    };

    dbData.students.push(newStudent);
    writeDB(dbData);
    return { student: newStudent, generatedPin };
  },
  deleteStudent: (id: string): boolean => {
    const dbData = readDB();
    const initLen = dbData.students.length;
    dbData.students = dbData.students.filter((s) => s.id !== id);
    if (dbData.students.length !== initLen) {
      writeDB(dbData);
      return true;
    }
    return false;
  },
  resetStudentPIN: (id: string): string | null => {
    const dbData = readDB();
    const student = dbData.students.find((s) => s.id === id);
    if (!student) return null;
    const existingPINs = new Set<string>(dbData.students.map((s) => s.pin).filter(Boolean));
    const newPin = generateUniquePIN(existingPINs);
    student.pin = newPin;
    if (dbData.userProfile.id === id) {
      dbData.userProfile.pin = newPin;
    }
    writeDB(dbData);
    return newPin;
  },
  authenticateStudent: (rollNo: string, pin: string, grade?: string): StudentRecord | null => {
    const data = readDB();
    const cleanRoll = rollNo.trim().toLowerCase();
    const cleanPin = pin.trim();

    const student = data.students.find((s) => {
      const matchRoll = s.rollNo.trim().toLowerCase() === cleanRoll;
      const matchPin = s.pin.trim() === cleanPin;
      if (grade && grade.trim()) {
        return matchRoll && matchPin && s.grade.toLowerCase() === grade.trim().toLowerCase();
      }
      return matchRoll && matchPin;
    });

    if (!student) return null;

    data.userProfile = {
      id: student.id,
      name: student.name,
      role: "student",
      rollNo: student.rollNo,
      grade: student.grade,
      school: student.school,
      pin: student.pin,
      language: student.language || "en",
      badges: student.badges,
      accuracy: student.accuracy,
      weakConcepts: student.weakConcepts,
      seenCardIds: data.userProfile?.seenCardIds || [],
    };
    writeDB(data);
    return student;
  },
  setActiveStudent: (id: string): StudentRecord | null => {
    const data = readDB();
    const student = data.students.find((s) => s.id === id);
    if (!student) return null;

    data.userProfile = {
      id: student.id,
      name: student.name,
      role: "student",
      rollNo: student.rollNo,
      grade: student.grade,
      school: student.school,
      pin: student.pin,
      language: student.language || "en",
      badges: student.badges,
      accuracy: student.accuracy,
      weakConcepts: student.weakConcepts,
      seenCardIds: data.userProfile?.seenCardIds || [],
    };
    writeDB(data);
    return student;
  },
  getTeacherProfile: (): TeacherProfile => {
    return readDB().teacherProfile;
  },
  updateTeacherProfile: (profile: Partial<TeacherProfile>): TeacherProfile => {
    const data = readDB();
    data.teacherProfile = { ...data.teacherProfile, ...profile };
    writeDB(data);
    return data.teacherProfile;
  },
  evaluateSubmission: (
    id: string,
    evalData: {
      marks: string;
      grade?: string;
      feedback?: string;
      scorePercentage?: number;
      aiConvertedFileName?: string;
      aiConvertedText?: string;
      checkedFileName?: string;
      answers?: SubmissionItem["answers"];
    }
  ): SubmissionItem | undefined => {
    const data = readDB();
    const sub = data.submissions.find((s) => s.id === id);
    if (!sub) return undefined;

    sub.status = "Graded";
    sub.marks = evalData.marks;
    sub.grade = evalData.grade || "A";
    sub.feedback = evalData.feedback || "";
    sub.scorePercentage = evalData.scorePercentage ?? 85;
    sub.checkedAt = new Date().toISOString();
    if (evalData.checkedFileName) sub.checkedFileName = evalData.checkedFileName;
    if (evalData.aiConvertedFileName) sub.aiConvertedFileName = evalData.aiConvertedFileName;
    if (evalData.aiConvertedText) sub.aiConvertedText = evalData.aiConvertedText;
    if (evalData.answers) sub.answers = evalData.answers;

    // Create a student notification that their worksheet was evaluated
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      studentId: sub.studentId,
      title: "Worksheet Evaluated",
      message: `${sub.worksheetTitle} has been evaluated: ${sub.marks}`,
      subjectName: sub.subjectName,
      worksheetId: sub.worksheetId,
      deadline: "",
      read: false,
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(newNotif);

    writeDB(data);
    return sub;
  },
  getStudentEvaluations: (studentId = "s1"): SubmissionItem[] => {
    return readDB().submissions.filter(
      (s) => s.studentId === studentId && s.status === "Graded"
    );
  },
  deleteSubject: (id: string): boolean => {
    const data = readDB();
    const initLen = data.subjects.length;
    data.subjects = data.subjects.filter((s) => s.id !== id);
    if (data.subjects.length !== initLen) {
      writeDB(data);
      return true;
    }
    return false;
  },
  deleteWorksheet: (id: string): boolean => {
    const data = readDB();
    const initLen = data.worksheets.length;
    data.worksheets = data.worksheets.filter((w) => w.id !== id);
    if (data.worksheets.length !== initLen) {
      writeDB(data);
      return true;
    }
    return false;
  },
  getMaterials: (subjectId?: string): LearningMaterialItem[] => {
    const materials = readDB().materials || [];
    if (subjectId && subjectId !== "all") {
      return materials.filter((m) => m.subjectId === subjectId);
    }
    return materials;
  },
  getMaterialById: (id: string): LearningMaterialItem | undefined => {
    return (readDB().materials || []).find((m) => m.id === id);
  },
  addMaterial: (
    material: Omit<LearningMaterialItem, "id" | "uploadedAt" | "status" | "approvalStatus"> & {
      status?: LearningMaterialItem["status"];
      approvalStatus?: LearningMaterialItem["approvalStatus"];
    }
  ): LearningMaterialItem => {
    const data = readDB();
    if (!data.materials) data.materials = [];
    const newMaterial: LearningMaterialItem = {
      ...material,
      id: `mat-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      status: material.status || "uploaded",
      approvalStatus: material.approvalStatus || "pending_review",
    };
    data.materials.unshift(newMaterial);
    writeDB(data);
    return newMaterial;
  },
  updateMaterial: (
    id: string,
    updates: Partial<LearningMaterialItem>
  ): LearningMaterialItem | undefined => {
    const data = readDB();
    const mat = (data.materials || []).find((m) => m.id === id);
    if (!mat) return undefined;
    Object.assign(mat, updates);
    writeDB(data);
    return mat;
  },
  deleteMaterial: (id: string): boolean => {
    const data = readDB();
    const initLen = (data.materials || []).length;
    data.materials = (data.materials || []).filter((m) => m.id !== id);
    if (data.materials.length !== initLen) {
      writeDB(data);
      return true;
    }
    return false;
  },
  approveAndAssignMaterial: (
    materialId: string,
    deadline: string
  ): { material: LearningMaterialItem; worksheet: WorksheetItem } | undefined => {
    const data = readDB();
    const material = (data.materials || []).find((m) => m.id === materialId);
    if (!material || !material.generatedContent) return undefined;

    material.approvalStatus = "assigned";
    material.approvedAt = new Date().toISOString();

    const wsQuestions = material.generatedContent.worksheet.questions || [];
    const items = wsQuestions.map((q, idx) => ({
      id: `w-mat-${idx + 1}`,
      original: q.question,
      translated: q.suggestedAnswer || q.question,
      translatedOlChiki: q.question,
      concept: material.chapterTopic || "Core Concept",
      localExample: `Extracted from ${material.title} (${material.grade})`,
    }));

    const newWorksheet: WorksheetItem = {
      id: `ws-${Date.now()}`,
      title: `${material.title} (Worksheet)`,
      subjectId: material.subjectId,
      subjectName: material.subjectName,
      originalLanguage: "English / Hindi",
      fileName: material.fileName,
      pdfUrl: "",
      deadline: deadline || "2026-10-30T17:00:00Z",
      status: "active",
      materialId: material.id,
      materialTitle: material.title,
      items,
      createdAt: new Date().toISOString(),
    };

    data.worksheets.unshift(newWorksheet);
    material.assignedWorksheetId = newWorksheet.id;

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      studentId: "s1",
      title: "New study worksheet assigned!",
      message: `${material.subjectName} (${material.grade}) — ${material.title}`,
      subjectName: material.subjectName,
      worksheetId: newWorksheet.id,
      deadline: newWorksheet.deadline,
      read: false,
      createdAt: new Date().toISOString(),
    };
    data.notifications.unshift(newNotif);

    writeDB(data);
    return { material, worksheet: newWorksheet };
  },
};
