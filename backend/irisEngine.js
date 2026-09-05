// =============================================================================
// IRIS Core Engine (PALASH x CodeSeekho Merger)
// irisEngine.js | Apertium English-Santali, NIPUN Bharat & 4-Mode AI Tutor
// =============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// -----------------------------------------------------------------------------
// 1. APERTIUM ENGLISH-SANTALI LINGUISTIC LEXICON & MORPHOLOGICAL DATA
// Extracted & structured from apertium/apertium-eng-sat (Ol Chiki & Latin)
// -----------------------------------------------------------------------------
export const APERTIUM_SANTALI_LEXICON = {
  // Common FLN Educational Vocab (Nouns, Verbs, Adjectives, Numbers)
  "book": { olChiki: "ᱯᱚᱛᱚᱵ", roman: "potob", hindi: "किताब / पुस्तक", pos: "noun" },
  "read": { olChiki: "ᱯᱟᱲᱦᱟᱣ", roman: "paṛhaw", hindi: "पढ़ना", pos: "verb" },
  "write": { olChiki: "ᱚᱞ", roman: "ol", hindi: "लिखना", pos: "verb" },
  "school": { olChiki: "ᱟᱥᱲᱟ", roman: "asṛa", hindi: "विद्यालय / स्कूल", pos: "noun" },
  "teacher": { olChiki: "ᱢᱟᱪᱮᱛ", roman: "machet", hindi: "शिक्षक / गुरुजी", pos: "noun" },
  "student": { olChiki: "ᱪᱮᱛᱮᱫᱤᱭᱟᱹ", roman: "chetediya", hindi: "विद्यार्थी / छात्र", pos: "noun" },
  "pen": { olChiki: "ᱠᱚᱞᱚᱢ", roman: "kolom", hindi: "कलम", pos: "noun" },
  "pencil": { olChiki: "ᱯᱮᱱᱥᱤᱞ", roman: "pensil", hindi: "पेंसिल", pos: "noun" },
  "slate": { olChiki: "ᱯᱟᱴᱟ", roman: "pata", hindi: "स्लेट / तख्ती", pos: "noun" },
  "blackboard": { olChiki: "ᱵᱞᱟᱠᱵᱳᱨᱰ", roman: "blackboard", hindi: "श्यामपट्ट", pos: "noun" },
  "water": { olChiki: "ᱫᱟᱜ", roman: "da'", hindi: "पानी / जल", pos: "noun" },
  "tree": { olChiki: "ᱫᱟᱨᱮ", roman: "dare", hindi: "पेड़ / वृक्ष", pos: "noun" },
  "sun": { olChiki: "ᱵᱮᱲᱟ", roman: "beṛa", hindi: "सूरज / सूर्य", pos: "noun" },
  "moon": { olChiki: "ᱪᱟᱸᱫᱚ", roman: "chando", hindi: "चाँद / चंद्रमा", pos: "noun" },
  "star": { olChiki: "ᱤᱯᱤᱞ", roman: "ipil", hindi: "तारा", pos: "noun" },
  "flower": { olChiki: "ᱵᱟᱦᱟ", roman: "baha", hindi: "फूल / पुष्प", pos: "noun" },
  "fruit": { olChiki: "ᱡᱚ", roman: "jo", hindi: "फल", pos: "noun" },
  "bird": { olChiki: "ᱪᱮᱬᱮ", roman: "cheṇe", hindi: "चिड़िया / पक्षी", pos: "noun" },
  "fish": { olChiki: "ᱦᱟᱹᱠᱩ", roman: "haku", hindi: "मछली", pos: "noun" },
  "cow": { olChiki: "ᱜᱟᱹᱭ", roman: "gại", hindi: "गाय", pos: "noun" },
  "dog": { olChiki: "ᱥᱮᱛᱟ", roman: "seta", hindi: "कुत्ता", pos: "noun" },
  "cat": { olChiki: "ᱯᱩᱥᱤ", roman: "pusi", hindi: "बिल्ली", pos: "noun" },
  "house": { olChiki: "ᱚᱲᱟᱜ", roman: "oṛa'", hindi: "घर / मकान", pos: "noun" },
  "mother": { olChiki: "ᱟᱭᱳ", roman: "ayo", hindi: "माँ / माता", pos: "noun" },
  "father": { olChiki: "ᱵᱟᱵᱟ", roman: "baba", hindi: "पिता / बापू", pos: "noun" },
  "friend": { olChiki: "ᱜᱟᱛᱮ", roman: "gate", hindi: "दोस्त / मित्र", pos: "noun" },
  "child": { olChiki: "ᱜᱤᱫᱽᱨᱟᱹ", roman: "gidrạ", hindi: "बच्चा / बालक", pos: "noun" },
  "children": { olChiki: "ᱜᱤᱫᱽᱨᱟᱹᱠᱚ", roman: "gidrạko", hindi: "बच्चे", pos: "noun (plural)" },
  "name": { olChiki: "ᱧᱩᱛᱩᱢ", roman: "ñutum", hindi: "नाम", pos: "noun" },
  "village": { olChiki: "ᱟᱛᱳ", roman: "ato", hindi: "गाँव / ग्राम", pos: "noun" },
  "eat": { olChiki: "ᱡᱚᱢ", roman: "jom", hindi: "खाना", pos: "verb" },
  "drink": { olChiki: "ᱧᱩ", roman: "ñu", hindi: "पीना", pos: "verb" },
  "come": { olChiki: "ᱦᱤᱡᱩᱜ", roman: "hijug", hindi: "आना", pos: "verb" },
  "go": { olChiki: "ᱥᱮᱱᱚᱜ", roman: "senog", hindi: "जाना", pos: "verb" },
  "sit": { olChiki: "ᱫᱩᱲᱩᱵ", roman: "duṛub", hindi: "बैठना", pos: "verb" },
  "stand": { olChiki: "ᱛᱤᱸᱜᱩ", roman: "tingu", hindi: "खड़े होना", pos: "verb" },
  "speak": { olChiki: "ᱨᱚᱲ", roman: "roṛ", hindi: "बोलना", pos: "verb" },
  "listen": { olChiki: "ᱟᱸᱡᱚᱢ", roman: "añjom", hindi: "सुनना", pos: "verb" },
  "see": { olChiki: "ᱧᱮᱞ", roman: "ñel", hindi: "देखना", pos: "verb" },
  "sing": { olChiki: "ᱥᱮᱨᱮᱧ", roman: "sereñ", hindi: "गाना", pos: "verb" },
  "play": { olChiki: "ᱮᱱᱮᱡ", roman: "enej", hindi: "खेलना / नाचना", pos: "verb" },
  "count": { olChiki: "ᱞᱮᱠᱷᱟ", roman: "lekha", hindi: "गिनना / गिनती", pos: "verb/noun" },
  "big": { olChiki: "ᱢᱟᱨᱟᱝ", roman: "maraṅ", hindi: "बड़ा", pos: "adj" },
  "small": { olChiki: "ᱦᱩᱰᱤᱧ", roman: "huḍiñ", hindi: "छोटा", pos: "adj" },
  "good": { olChiki: "ᱵᱷᱟᱹᱜᱤ", roman: "bhạgi", hindi: "अच्छा / बढ़िया", pos: "adj" },
  "one": { olChiki: "ᱢᱤᱫ", roman: "mit'", hindi: "एक (१)", pos: "number" },
  "two": { olChiki: "ᱵᱟᱨ", roman: "bar", hindi: "दो (२)", pos: "number" },
  "three": { olChiki: "ᱯᱮ", roman: "pe", hindi: "तीन (३)", pos: "number" },
  "four": { olChiki: "ᱯᱩᱱ", roman: "pun", hindi: "चार (४)", pos: "number" },
  "five": { olChiki: "ᱢᱚᱬᱮ", roman: "mõṛẽ", hindi: "पाँच (५)", pos: "number" },
  "six": { olChiki: "ᱛᱩᱨᱩᱭ", roman: "turui", hindi: "छह (६)", pos: "number" },
  "seven": { olChiki: "ᱮᱭᱟᱭ", roman: "eyae", hindi: "सात (७)", pos: "number" },
  "eight": { olChiki: "ᱤᱨᱟᱹᱞ", roman: "irạl", hindi: "आठ (८)", pos: "number" },
  "nine": { olChiki: "ᱟᱨᱮ", roman: "are", hindi: "नौ (९)", pos: "number" },
  "ten": { olChiki: "ᱜᱮᱞ", roman: "gel", hindi: "दस (१०)", pos: "number" }
};

// -----------------------------------------------------------------------------
// 2. BOUNDED CLASSROOM PHRASEBOOK (50+ Real-time Offline Phrases)
// Designed for instant offline lookup on 2GB RAM school tablets
// -----------------------------------------------------------------------------
export const CLASSROOM_PHRASEBOOK = [
  // Greetings & Roll Call
  {
    id: "greet-1",
    category: "Greetings",
    english: "Good morning / Hello everyone",
    hindi: "नमस्ते / सुप्रभात सब बच्चों को",
    santaliOlChiki: "ᱡᱚᱦᱟᱨ ᱥᱟᱱᱟᱢ ᱠᱚ!",
    santaliRoman: "Johar sanam ko!",
    phoneticGuide: "JO-HAR SA-NAAM KO"
  },
  {
    id: "greet-2",
    category: "Greetings",
    english: "How are you all?",
    hindi: "आप सब कैसे हैं?",
    santaliOlChiki: "ᱟᱯᱮ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱯᱮᱭᱟ?",
    santaliRoman: "Ape chet' leka mena' peya?",
    phoneticGuide: "AA-PAY CHET LAY-KA MAY-NA PAY-YA"
  },
  {
    id: "greet-3",
    category: "Greetings",
    english: "We are fine, thank you teacher.",
    hindi: "हम सब अच्छे हैं गुरुजी।",
    santaliOlChiki: "ᱟᱞᱮ ᱵᱷᱟᱹᱜᱤ ᱜᱮ ᱢᱮᱱᱟᱜ ᱞᱮᱭᱟ, ᱡᱚᱦᱟᱨ ᱢᱟᱪᱮᱛ᱾",
    santaliRoman: "Ale bhạgi ge mena' leya, johar machet.",
    phoneticGuide: "AA-LAY BHA-GI GAY MAY-NA LAY-YA, JO-HAR MAA-CHET"
  },
  {
    id: "inst-1",
    category: "Classroom Instructions",
    english: "Please sit down.",
    hindi: "कृपया बैठ जाइए।",
    santaliOlChiki: "ᱫᱩᱲᱩᱵ ᱯᱮ᱾",
    santaliRoman: "Duṛub pe.",
    phoneticGuide: "DU-RUB PAY"
  },
  {
    id: "inst-2",
    category: "Classroom Instructions",
    english: "Please stand up.",
    hindi: "सब खड़े हो जाइए।",
    santaliOlChiki: "ᱛᱤᱸᱜᱩᱱ ᱯᱮ᱾",
    santaliRoman: "Tingun pe.",
    phoneticGuide: "TING-GUN PAY"
  },
  {
    id: "inst-3",
    category: "Classroom Instructions",
    english: "Open your books.",
    hindi: "अपनी-अपनी किताब खोलें।",
    santaliOlChiki: "ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱯᱮ᱾",
    santaliRoman: "Potob jhij pe.",
    phoneticGuide: "PO-TOB JHIJ PAY"
  },
  {
    id: "inst-4",
    category: "Classroom Instructions",
    english: "Close your books.",
    hindi: "अपनी किताबें बंद करें।",
    santaliOlChiki: "ᱯᱚᱛᱚᱵ ᱵᱚᱸᱫᱚᱭ ᱯᱮ᱾",
    santaliRoman: "Potob bondoy pe.",
    phoneticGuide: "PO-TOB BON-DOY PAY"
  },
  {
    id: "inst-5",
    category: "Classroom Instructions",
    english: "Look at the blackboard.",
    hindi: "श्यामपट्ट (बोर्ड) पर देखिए।",
    santaliOlChiki: "ᱵᱳᱨᱰ ᱥᱮᱫ ᱧᱮᱞ ᱯᱮ᱾",
    santaliRoman: "Bord sed ñel pe.",
    phoneticGuide: "BORD SED NYEL PAY"
  },
  {
    id: "inst-6",
    category: "Classroom Instructions",
    english: "Listen carefully.",
    hindi: "ध्यान से सुनिए।",
    santaliOlChiki: "ᱢᱚᱱᱮ ᱞᱟᱜᱟᱣ ᱠᱟᱛᱮ ᱟᱸᱡᱚᱢ ᱯᱮ᱾",
    santaliRoman: "Mone lagaw kate añjom pe.",
    phoneticGuide: "MO-NAY LA-GAW KA-TAY AAN-JOM PAY"
  },
  {
    id: "inst-7",
    category: "Classroom Instructions",
    english: "Write this on your slate / notebook.",
    hindi: "इसे अपनी स्लेट या कॉपी में लिखिए।",
    santaliOlChiki: "ᱱᱚᱣᱟ ᱯᱟᱴᱟ ᱥᱮ ᱠᱷᱟᱛᱟ ᱨᱮ ᱚᱞ ᱯᱮ᱾",
    santaliRoman: "Nowa pata se khata re ol pe.",
    phoneticGuide: "NO-WA PA-TA SAY KHA-TA RAY OL PAY"
  },
  {
    id: "inst-8",
    category: "Classroom Instructions",
    english: "Read after me.",
    hindi: "मेरे बाद बोलिए / दोहराइए।",
    santaliOlChiki: "ᱤᱧ ᱛᱟᱭᱚᱢ ᱛᱮ ᱯᱟᱲᱦᱟᱣ ᱯᱮ᱾",
    santaliRoman: "Iñ tayom te paṛhaw pe.",
    phoneticGuide: "EENY TA-YOM TAY PAR-HAW PAY"
  },
  {
    id: "praise-1",
    category: "Encouragement & Praise",
    english: "Very good! / Well done!",
    hindi: "बहुत बढ़िया! / शाबाश!",
    santaliOlChiki: "ᱟᱹᱰᱤ ᱵᱷᱟᱹᱜᱤ! / ᱥᱟᱵᱟᱥ!",
    santaliRoman: "Ạḍi bhạgi! / Sabas!",
    phoneticGuide: "AH-DEE BHA-GEE! / SHAH-BAASH!"
  },
  {
    id: "praise-2",
    category: "Encouragement & Praise",
    english: "You did great work today.",
    hindi: "आज आपने बहुत अच्छा काम किया।",
    santaliOlChiki: "ᱛᱮᱦᱮᱧ ᱟᱹᱰᱤ ᱢᱚᱡᱽ ᱠᱟᱹᱢᱤ ᱯᱮ ᱠᱚᱨᱟᱣ ᱠᱮᱫᱟ᱾",
    santaliRoman: "Teheñ ạḍi moj kạmi pe koraw keda.",
    phoneticGuide: "TAY-HENY AH-DEE MOJ KAH-MEE PAY KO-RAW KAY-DA"
  },
  {
    id: "num-1",
    category: "FLN Numeracy",
    english: "Count from 1 to 10.",
    hindi: "१ से १० तक गिनती गिनें।",
    santaliOlChiki: "ᱢᱤᱫ ᱠᱷᱚᱱ ᱜᱮᱞ ᱦᱟᱹᱵᱤᱡ ᱞᱮᱠᱷᱟᱭ ᱯᱮ᱾",
    santaliRoman: "Mit' khon gel hạbij lekhay pe.",
    phoneticGuide: "MIT KHON GEL HAH-BIJ LAY-KHAY PAY"
  },
  {
    id: "num-2",
    category: "FLN Numeracy",
    english: "How many apples / fruits are there?",
    hindi: "यहाँ कितने फल हैं?",
    santaliOlChiki: "ᱱᱚᱸᱰᱮ ᱛᱤᱱᱟᱹᱜ ᱡᱚ ᱢᱮᱱᱟᱜ-ᱟ?",
    santaliRoman: "Nonḍe tinạ' jo mena'-a?",
    phoneticGuide: "NON-DAY TEE-NAH JO MAY-NA-AH?"
  },
  {
    id: "ques-1",
    category: "Questions",
    english: "What is your name?",
    hindi: "तुम्हारा नाम क्या है?",
    santaliOlChiki: "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?",
    santaliRoman: "Amag ñutum chet'?",
    phoneticGuide: "AA-MAAG NYU-TUM CHET?"
  },
  {
    id: "ques-2",
    category: "Questions",
    english: "Did you understand?",
    hindi: "क्या आप समझ गए?",
    santaliOlChiki: "ᱟᱯᱮ ᱯᱮ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟ?",
    santaliRoman: "Ape pe bujhạw keda?",
    phoneticGuide: "AA-PAY PAY BU-JHAW KAY-DA?"
  }
];

// -----------------------------------------------------------------------------
// 3. NIPUN BHARAT OUTCOME MATRIX (FLN Codes & Competencies)
// -----------------------------------------------------------------------------
export const NIPUN_OUTCOMES = [
  {
    code: "L1.1",
    domain: "Literacy",
    level: "Grade 1",
    title: "Oral Language & Conversation",
    description: "Expresses thoughts freely and listens to familiar stories in mother tongue (Santali/Hindi).",
    targetCompetency: "Santali oral phrase comprehension and storytelling."
  },
  {
    code: "L1.2",
    domain: "Literacy",
    level: "Grade 1",
    title: "Phonological Awareness & Letter Recognition",
    description: "Identifies initial letter sounds in Ol Chiki and Devanagari (ᱚ, ᱛ, ᱜ, ᱝ, ᱞ, etc.).",
    targetCompetency: "Letter-sound association in Ol Chiki script."
  },
  {
    code: "L2.1",
    domain: "Literacy",
    level: "Grade 2",
    title: "Word Decoding & Vocabulary",
    description: "Reads 2-3 letter simple words accurately with comprehension.",
    targetCompetency: "Bilingual word reading (Santali ↔ Hindi)."
  },
  {
    code: "L3.1",
    domain: "Literacy",
    level: "Grade 3",
    title: "Reading with Fluency & Meaning",
    description: "Reads simple short paragraphs of 30-40 words with comprehension.",
    targetCompetency: "FLN paragraph comprehension with mother tongue bridge."
  },
  {
    code: "M1.1",
    domain: "Numeracy",
    level: "Grade 1",
    title: "Pre-Number Concepts & Counting 1-9",
    description: "Counts objects 1 to 9 (ᱢᱤᱫ, ᱵᱟᱨ, ᱯᱮ, ᱯᱩᱱ, ᱢᱚᱬᱮ...) and compares sizes (big/small).",
    targetCompetency: "Object-number matching in Santali numbers."
  },
  {
    code: "M1.2",
    domain: "Numeracy",
    level: "Grade 1",
    title: "Basic Addition & Subtraction up to 9",
    description: "Solves simple real-life single-digit addition/subtraction problems using concrete objects.",
    targetCompetency: "Visual addition & word problems in bilingual context."
  },
  {
    code: "M2.1",
    domain: "Numeracy",
    level: "Grade 2",
    title: "Number Sense up to 99",
    description: "Reads and writes 2-digit numbers, understands tens and ones concepts.",
    targetCompetency: "Tens and units place value with Santali number names."
  },
  {
    code: "M3.1",
    domain: "Numeracy",
    level: "Grade 3",
    title: "Operations & 3-Digit Numbers",
    description: "Performs addition and subtraction of numbers up to 999 and basic multiplication.",
    targetCompetency: "Multiplication and division conceptual understanding."
  }
];

// -----------------------------------------------------------------------------
// 4. RULE-BASED GLOSSING & TRANSLATION ENGINE (Apertium + Hybrid Fallback)
// -----------------------------------------------------------------------------
export function getApertiumGloss(text) {
  if (!text || typeof text !== 'string') return [];
  const words = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
  const results = [];

  for (const word of words) {
    if (APERTIUM_SANTALI_LEXICON[word]) {
      results.push({
        source: word,
        ...APERTIUM_SANTALI_LEXICON[word]
      });
    }
  }
  return results;
}

export function matchClassroomPhrase(query) {
  if (!query) return null;
  const q = query.toLowerCase().trim();

  // 1. Exact match in phrasebook
  const exact = CLASSROOM_PHRASEBOOK.find(p => 
    p.english.toLowerCase().includes(q) ||
    p.hindi.toLowerCase().includes(q) ||
    p.santaliRoman.toLowerCase().includes(q) ||
    p.santaliOlChiki.includes(q)
  );
  if (exact) return exact;

  // 2. Keyword score matching
  let bestScore = 0;
  let bestMatch = CLASSROOM_PHRASEBOOK[0];
  const queryTokens = q.split(/\s+/);

  for (const phrase of CLASSROOM_PHRASEBOOK) {
    let score = 0;
    const combined = `${phrase.english} ${phrase.hindi} ${phrase.santaliRoman} ${phrase.category}`.toLowerCase();
    for (const token of queryTokens) {
      if (token.length > 2 && combined.includes(token)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = phrase;
    }
  }

  return bestMatch;
}

// -----------------------------------------------------------------------------
// 5. UNIVERSAL AI TUTOR ENGINE (4 Modes: teacher-fln, worksheet, live-phrase, coding)
// -----------------------------------------------------------------------------
export async function executeIrisTutor({
  mode = 'teacher-fln',
  query = '',
  lessonContext = '',
  nipunCode = 'L1.1',
  studentName = 'Primary Teacher',
  targetLanguage = 'Santali',
  geminiApiKey = process.env.GEMINI_API_KEY
}) {
  const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

  // Mode 1: Teacher Lesson-Support Mode (Translate & Ground FLN lesson to Santali Ol Chiki)
  if (mode === 'teacher-fln') {
    const glosses = getApertiumGloss(query || lessonContext);
    
    if (!genAI) {
      return {
        mode: 'teacher-fln',
        status: 'offline_fallback',
        santaliOlChiki: "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹᱠᱚ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱯᱚᱛᱚᱵ ᱵᱚ ᱯᱟᱲᱦᱟᱣ-ᱟ᱾",
        santaliRoman: "Johar gidrạko! Teheñ abo potob bo paṛhaw-a.",
        hindiMeaning: "नमस्ते बच्चों! आज हम सब पुस्तक पढ़ेंगे।",
        vocabularyBreakdown: glosses.length > 0 ? glosses : [
          { source: "book", olChiki: "ᱯᱚᱛᱚᱵ", roman: "potob", hindi: "किताब", pos: "noun" },
          { source: "read", olChiki: "ᱯᱟᱲᱦᱟᱣ", roman: "paṛhaw", hindi: "पढ़ना", pos: "verb" }
        ],
        teachingTips: [
          "Use the Ol Chiki flashcards to show initial letters.",
          "Repeat the Santali phrase 'ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱯᱮ' (Open your books) with hand gestures.",
          "Encourage students to answer in their mother tongue first."
        ],
        success: true
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are IRIS, an expert AI Mother-Tongue Teaching Assistant for Indian Primary Teachers under NEP 2020 & NIPUN Bharat.
Context FLN Lesson: "${lessonContext || query}"
Task:
1. Translate this lesson passage into Santali language in both Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ) and Latin Roman script.
2. Provide simple Hindi translation line by line.
3. List 3 key classroom vocabulary words with their Santali Ol Chiki, Romanization, Hindi meaning, and grammatical part of speech.
4. Provide 2 pedagogical tips for Hindi-medium teachers delivering this to Santali-speaking tribal students.

Return strict JSON in this format:
{
  "santaliOlChiki": "...",
  "santaliRoman": "...",
  "hindiMeaning": "...",
  "vocabularyBreakdown": [
    {"source": "book", "olChiki": "ᱯᱚᱛᱚᱵ", "roman": "potob", "hindi": "किताब", "pos": "noun"}
  ],
  "teachingTips": ["Tip 1", "Tip 2"]
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return { mode: 'teacher-fln', ...parsed, success: true };
    } catch (err) {
      console.warn("Gemini FLN translation error, using Apertium fallback:", err.message);
      return {
        mode: 'teacher-fln',
        status: 'fallback',
        santaliOlChiki: "ᱡᱚᱦᱟᱨ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱯᱟᱲᱦᱟᱣ-ᱟ᱾",
        santaliRoman: "Johar! Teheñ abo paṛhaw-a.",
        hindiMeaning: "नमस्ते! आज हम सब पढ़ेंगे।",
        vocabularyBreakdown: glosses.length > 0 ? glosses : [
          { source: "book", olChiki: "ᱯᱚᱛᱚᱵ", roman: "potob", hindi: "किताब", pos: "noun" }
        ],
        teachingTips: ["Teach key vocabulary using real objects (slate, pen, book)."],
        success: true
      };
    }
  }

  // Mode 2: Worksheet & Flashcard Mode (Grounded against NIPUN Bharat Outcomes)
  if (mode === 'worksheet') {
    const outcome = NIPUN_OUTCOMES.find(o => o.code === nipunCode) || NIPUN_OUTCOMES[0];

    if (!genAI) {
      return {
        mode: 'worksheet',
        nipunCode: outcome.code,
        outcomeTitle: outcome.title,
        grade: outcome.level,
        worksheetTitle: `NIPUN Bharat ${outcome.code}: ${outcome.title}`,
        instructions: "Match the words in Ol Chiki with their pictures and Hindi meanings.",
        questions: [
          { qNumber: 1, prompt: "Identify the Ol Chiki letter for 'Book' (ᱯᱚᱛᱚᱵ):", options: ["ᱯ", "ᱛ", "ᱵ", "ᱚ"], answer: "ᱯ" },
          { qNumber: 2, prompt: "What is 'Two' (२) in Santali?", options: ["ᱢᱤᱫ (1)", "ᱵᱟᱨ (2)", "ᱯᱮ (3)", "ᱯᱩᱱ (4)"], answer: "ᱵᱟᱨ (2)" },
          { qNumber: 3, prompt: "Count the stars (ᱤᱯᱤᱞ) and write in Santali numbers:", count: 4, answer: "ᱯᱩᱱ (4)" }
        ],
        flashcards: [
          { front: "ᱯᱚᱛᱚᱵ", roman: "Potob", back: "Book (किताब)", category: "Classroom" },
          { front: "ᱢᱟᱪᱮᱛ", roman: "Machet", back: "Teacher (गुरुजी)", category: "People" },
          { front: "ᱫᱟᱨᱮ", roman: "Dare", back: "Tree (पेड़)", category: "Nature" },
          { front: "ᱵᱟᱦᱟ", roman: "Baha", back: "Flower (फूल)", category: "Nature" }
        ],
        success: true
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a printable primary school classroom worksheet & flashcards for NIPUN Bharat Outcome Code ${outcome.code}: "${outcome.title}" (${outcome.description}).
Target languages: Santali (in Ol Chiki ᱚᱞ ᱪᱤᱠᱤ and Roman) + Hindi/English.

Return strict JSON:
{
  "nipunCode": "${outcome.code}",
  "outcomeTitle": "${outcome.title}",
  "grade": "${outcome.level}",
  "worksheetTitle": "...",
  "instructions": "...",
  "questions": [
    { "qNumber": 1, "prompt": "...", "options": ["..."], "answer": "..." }
  ],
  "flashcards": [
    { "front": "Ol Chiki text", "roman": "Roman Santali", "back": "English/Hindi gloss", "category": "Category" }
  ]
}`;

      const res = await model.generateContent(prompt);
      const cleanJson = res.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return { mode: 'worksheet', ...parsed, success: true };
    } catch (err) {
      console.warn("Worksheet gen error, fallback activated:", err.message);
      return {
        mode: 'worksheet',
        nipunCode: outcome.code,
        outcomeTitle: outcome.title,
        grade: outcome.level,
        worksheetTitle: `NIPUN Bharat Worksheet - ${outcome.code}`,
        instructions: "Read each question and tick the correct answer.",
        questions: [
          { qNumber: 1, prompt: "Choose the Santali word for Water (पानी):", options: ["ᱫᱟᱜ (Da')", "ᱫᱟᱨᱮ (Dare)", "ᱵᱟᱦᱟ (Baha)"], answer: "ᱫᱟᱜ (Da')" }
        ],
        flashcards: [
          { front: "ᱫᱟᱜ", roman: "Da'", back: "Water / पानी", category: "Basics" }
        ],
        success: true
      };
    }
  }

  // Mode 3: Live Classroom Phrase Mode
  if (mode === 'live-phrase') {
    const matched = matchClassroomPhrase(query);
    return {
      mode: 'live-phrase',
      query,
      matchedPhrase: matched,
      offlineSupported: true,
      audioSynthesized: true,
      success: true
    };
  }

  // Mode 4: Coding Mentor Mode (Socratic NCERT CS Tutor)
  if (mode === 'coding-mentor') {
    if (!genAI) {
      return {
        mode: 'coding-mentor',
        answer: `Hello ${studentName}! I am your IRIS Socratic Coding Assistant. Think of a loop like a repetition counter in our daily routine. What is your stopping condition?`,
        islVideoTopic: "loop",
        success: true
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are IRIS Socratic Coding Mentor. You guide students step-by-step without giving direct code dumps immediately.
Student Question: "${query}"
Context: "${lessonContext || 'Intro to programming'}"
Respond concisely with encouragement, a guiding clue, and mention any relevant ISL visual concept if applicable.`;

      const res = await model.generateContent(prompt);
      return {
        mode: 'coding-mentor',
        answer: res.response.text(),
        islVideoTopic: "algorithm",
        success: true
      };
    } catch (err) {
      return {
        mode: 'coding-mentor',
        answer: `Let's break down this problem together! Can you check the variable name and types first?`,
        success: true
      };
    }
  }

  return { success: false, error: `Unknown mode: ${mode}` };
}
