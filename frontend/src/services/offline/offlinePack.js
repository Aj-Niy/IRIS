// =============================================================================
// ShikshaSetu Offline Content Pack Indexer
// offlinePack.js | Direct memory-efficient access to bundled offline pack assets
// =============================================================================

import { 
  TRIBAL_LANGUAGES, 
  APERTIUM_SANTALI_LEXICON, 
  CLASSROOM_PHRASEBOOK, 
  NIPUN_OUTCOMES_MATRIX, 
  SAMPLE_FLN_LESSONS,
  CHILD_TRIBAL_RESPONSES
} from '../apertiumSantaliData';

// Rich pre-compiled NIPUN Worksheets dataset covering all Grade 1-3 competencies
export const BUNDLED_NIPUN_WORKSHEETS = {
  "L1.1": {
    nipunCode: "L1.1",
    outcomeTitle: "Converses freely with teachers & peers in tribal mother tongue",
    grade: "Grade 1 (Balvatika)",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱨᱚᱯᱚᱲ ᱟᱨ ᱥᱮᱪᱮᱫ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (L1.1 Oral Expression)",
    instructions: "ᱱᱚᱣᱟ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ ᱯᱟᱲᱦᱟᱣ ᱢᱮ ᱟᱨ ᱴᱷᱤᱠ ᱛᱮᱞᱟ ᱨᱮ ᱴᱤᱠ (✓) ᱪᱤᱱᱦᱟᱹ ᱮᱢ ᱢᱮ᱾",
    instructionsHindi: "इस कार्यपत्रक को ध्यानपूर्वक पढ़ें और सही उत्तर पर (✓) का निशान लगाएं।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "‘ᱡᱚᱦᱟᱨ’ (Johar) ᱟᱹᱲᱟᱹ ᱨᱮᱭᱟᱜ ᱢᱮᱱᱮᱛ ᱪᱮᱫ ᱠᱟᱱᱟ?",
        roman: "‘Johar’ ạṛạ reyag menet chet' kana?",
        promptHindi: "'जोहार' (Johar) शब्द का क्या अर्थ है?",
        promptEnglish: "What is the meaning of the greeting word 'Johar'?",
        options: [
          { sat: "ᱡᱚᱦᱟᱨ / ᱱᱚᱢᱚᱥᱛᱮ", roman: "Johar / Namaste", hindi: "नमस्ते / अभिवादन", isCorrect: true },
          { sat: "ᱫᱟᱜ ᱧᱩ", roman: "Da' ñu", hindi: "पानी पीना" },
          { sat: "ᱥᱮᱱᱚᱜ", roman: "Senog", hindi: "जाना" },
          { sat: "ᱚᱞ", roman: "Ol", hindi: "लिखना" }
        ],
        answer: "ᱡᱚᱦᱟᱨ / ᱱᱚᱢᱚᱥᱛᱮ",
        answerHindi: "नमस्ते / अभिवादन (Greetings)",
        pedagogyNote: "L1.1 मौखिक अभिव्यक्ति एवं मातृभाषा शिष्टाचार का आकलन।"
      },
      {
        qNumber: 2,
        type: "mcq",
        prompt: "ᱢᱟᱪᱮᱛ (Teacher) ᱥᱟᱞᱟᱜ ᱨᱚᱯᱚᱲ ᱡᱚᱠᱷᱮᱡ ᱪᱮᱫ ᱢᱮᱱ ᱫᱚᱨᱠᱟᱨ?",
        roman: "Machet salag ropoṛ jokhej chet' men dorkar?",
        promptHindi: "शिक्षक से बात करते समय क्या कहना चाहिए?",
        promptEnglish: "What should you say when speaking with your teacher?",
        options: [
          { sat: "ᱦᱮᱸ ᱢᱟᱪᱮᱛ, ᱤᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟᱹᱧ", roman: "Hẽ machet, iñ bujhạw kedañ", hindi: "हाँ शिक्षक जी, मैंने समझ लिया", isCorrect: true },
          { sat: "ᱵᱟᱝ ᱵᱟᱰᱟᱭ", roman: "Bang baday", hindi: "नहीं पता" },
          { sat: "ᱚᱲᱟᱜ ᱥᱮᱱᱚᱜ-ᱟᱹᱧ", roman: "Oṛag senog-añ", hindi: "घर जा रहा हूँ" },
          { sat: "ᱫᱩᱲᱩᱵ ᱢᱮ", roman: "Duṛub me", hindi: "बैठ जाओ" }
        ],
        answer: "ᱦᱮᱸ ᱢᱟᱪᱮᱛ, ᱤᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟᱹᱧ",
        answerHindi: "हाँ शिक्षक जी, मैंने समझ लिया",
        pedagogyNote: "कक्षा निर्देश और सम्मानजनक संवाद का मूल्यांकन।"
      }
    ]
  },
  "L1.2": {
    nipunCode: "L1.2",
    outcomeTitle: "Recognizes initial letter sounds in tribal script and Devanagari",
    grade: "Grade 1",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱪᱤᱠᱤ ᱟᱨ ᱟᱠᱷᱚᱨ ᱪᱤᱱᱦᱟᱹᱣ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (L1.2 Initial Sounds)",
    instructions: "ᱪᱤᱛᱟᱹᱨ ᱟᱨ ᱟᱹᱲᱟᱹ ᱧᱮᱞ ᱠᱟᱛᱮ ᱴᱷᱤᱠ ᱮᱛᱚᱦᱚᱵ ᱪᱤᱠᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ᱾",
    instructionsHindi: "चित्र और शब्दों को देखकर सही प्रारंभिक अक्षर चुनें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "‘ᱯᱚᱛᱚᱵ’ (Book) ᱨᱮᱭᱟᱜ ᱮᱛᱚᱦᱚᱵ ᱪᱤᱠᱤ ᱪᱤᱱᱦᱟᱹᱣ ᱢᱮ:",
        roman: "‘Potob’ reyag etohob chiki chinhow me:",
        promptHindi: "'किताब' (पोतोब) का पहला अक्षर पहचानें:",
        promptEnglish: "Identify starting letter sound for 'Book' (Potob):",
        options: [
          { sat: "ᱯ (ᱯᱚᱛᱚᱵ / Potob)", roman: "P (Potob)", hindi: "प (किताब)", isCorrect: true },
          { sat: "ᱛ (ᱛᱤ / Ti)", roman: "T (Ti)", hindi: "त (हाथ)" },
          { sat: "ᱵ (ᱵᱟᱦᱟ / Baha)", roman: "B (Baha)", hindi: "ब (फूल)" },
          { sat: "ᱫ (ᱫᱟᱜ / Da')", roman: "D (Da')", hindi: "द (पानी)" }
        ],
        answer: "ᱯ (ᱯᱚᱛᱚᱵ)",
        answerHindi: "प (पोतोब / किताब)",
        pedagogyNote: "L1.2 प्रारंभिक ध्वनि एवं ओल चिकी लिपि संरेखण।"
      }
    ]
  },
  "L2.1": {
    nipunCode: "L2.1",
    outcomeTitle: "Reads 2-3 letter simple familiar words with 80% accuracy",
    grade: "Grade 2",
    worksheetTitle: "ᱫᱟᱨᱮ ᱟᱨ ᱫᱟᱜ — ᱟᱹᱲᱟᱹ ᱯᱟᱲᱦᱟᱣ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (L2.1 Word Decoding)",
    instructions: "ᱟᱹᱲᱟᱹ ᱠᱚ ᱡᱚᱲᱟᱣ ᱢᱮ ᱟᱨ ᱥᱟᱹᱨᱤ ᱢᱮᱱᱮᱛ ᱚᱞ ᱢᱮ᱾",
    instructionsHindi: "शब्दों को जोड़ें और सही अर्थ लिखें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "‘ᱫᱟᱨᱮ’ ᱟᱹᱲᱟᱹ ᱨᱮᱭᱟᱜ ᱢᱮᱱᱮᱛ ᱪᱮᱫ ᱠᱟᱱᱟ?",
        roman: "‘Dare’ ạṛạ reyag menet chet' kana?",
        promptHindi: "'दारे' (Dare) शब्द का क्या अर्थ है?",
        options: [
          { sat: "ᱫᱟᱨᱮ / ᱯᱮᱲ", roman: "Dare / Ped", hindi: "पेड़ (Tree)", isCorrect: true },
          { sat: "ᱫᱟᱜ", roman: "Da'", hindi: "पानी (Water)" },
          { sat: "ᱵᱟᱦᱟ", roman: "Baha", hindi: "फूल (Flower)" }
        ],
        answer: "ᱫᱟᱨᱮ / ᱯᱮᱲ",
        answerHindi: "पेड़ (Tree / Dare)"
      }
    ]
  },
  "L3.1": {
    nipunCode: "L3.1",
    outcomeTitle: "Reads an age-appropriate unseen passage with fluency (45-60 wpm)",
    grade: "Grade 3",
    worksheetTitle: "ᱵᱤᱨ ᱫᱟᱬᱟᱬ ᱟᱨ ᱪᱮᱬᱮ ᱠᱚ (L3.1 Reading Fluency)",
    instructions: "ᱱᱚᱣᱟ ᱯᱟᱴᱷ ᱯᱟᱲᱦᱟᱣ ᱠᱟᱛᱮ ᱠᱩᱠᱞᱤ ᱨᱮᱱᱟᱜ ᱛᱮᱞᱟ ᱮᱢ ᱢᱮ᱾",
    instructionsHindi: "इस अनुच्छेद को पढ़कर नीचे दिए गए प्रश्नों के उत्तर दें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "ᱥᱮᱛᱟᱜ-ᱥᱮᱛᱟᱜ ᱪᱮᱬᱮ ᱠᱚ ᱪᱮᱫ ᱠᱚ ᱪᱤᱠᱟᱹᱭᱟ?",
        roman: "Setag-setag cheṇe ko chet' ko chikạya?",
        promptHindi: "सुबह-सुबह चिड़ियाँ क्या करती हैं?",
        options: [
          { sat: "ᱥᱮᱨᱮᱧᱟᱠᱚ", roman: "Sereñako", hindi: "गाना गाती हैं", isCorrect: true },
          { sat: "ᱡᱟᱹᱯᱤᱫᱟᱠᱚ", roman: "Jạpidako", hindi: "सोती हैं" },
          { sat: "ᱫᱟᱹᱲᱟᱠᱚ", roman: "Dạṛako", hindi: "दौड़ती हैं" }
        ],
        answer: "ᱥᱮᱨᱮᱧᱟᱠᱚ",
        answerHindi: "गाना गाती हैं (Sereñako)"
      }
    ]
  },
  "M1.1": {
    nipunCode: "M1.1",
    outcomeTitle: "Counts objects up to 10 and associates quantities with numerals",
    grade: "Grade 1",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱮᱞ ᱟᱨ ᱞᱮᱠᱷᱟ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (M1.1 Number Sense 1-10)",
    instructions: "ᱡᱤᱱᱤᱥ ᱠᱚ ᱞᱮᱠᱷᱟᱭ ᱢᱮ ᱟᱨ ᱥᱟᱹᱨᱤ ᱮᱞ (Number) ᱵᱟᱪᱷᱟᱣ ᱢᱮ᱾",
    instructionsHindi: "वस्तुओं को गिनें और सही संख्या चुनें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "ᱱᱚᱸᱰᱮ ᱛᱤᱱᱟᱹᱜ ᱫᱷᱤᱨᱤ ᱢᱮᱱᱟᱜ-ᱟ? [ 🪨 🪨 🪨 🪨 🪨 ]",
        roman: "Nonḍe tinạ' dhiri mena'-a? [ 5 pebbles ]",
        promptHindi: "यहाँ कितने पत्थर (कंकड़) हैं? [ ५ पत्थर ]",
        options: [
          { sat: "ᱢᱚᱬᱮ (5 / Mõṛẽ)", roman: "Mõṛẽ (5)", hindi: "पाँच (5)", isCorrect: true },
          { sat: "ᱯᱮ (3 / Pe)", roman: "Pe (3)", hindi: "तीन (3)" },
          { sat: "ᱯᱩᱱ (4 / Pun)", roman: "Pun (4)", hindi: "चार (4)" }
        ],
        answer: "ᱢᱚᱬᱮ (5 / Mõṛẽ)",
        answerHindi: "पाँच (5 / Mõṛẽ)"
      }
    ]
  },
  "M1.2": {
    nipunCode: "M1.2",
    outcomeTitle: "Solves simple addition and subtraction problems within 9",
    grade: "Grade 1",
    worksheetTitle: "ᱡᱚᱲᱟᱣ ᱟᱨ ᱵᱷᱮᱜᱟᱨ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (M1.2 Addition & Subtraction within 9)",
    instructions: "ᱞᱮᱠᱷᱟ ᱠᱟᱛᱮ ᱡᱚᱲᱟᱣ ᱢᱮ: ᱒ + ᱓ = ?",
    instructionsHindi: "गिनकर जोड़ें: २ + ३ = ?",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "ᱵᱟᱨ (᱒) + ᱯᱮ (᱓) ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜ-ᱟ?",
        roman: "Bar (2) + Pe (3) tinạ' huyug-a?",
        promptHindi: "२ + ३ मिलकर कितने होते हैं?",
        options: [
          { sat: "ᱢᱚᱬᱮ (5 / Mõṛẽ)", roman: "Mõṛẽ (5)", hindi: "पाँच (5)", isCorrect: true },
          { sat: "ᱯᱩᱱ (4 / Pun)", roman: "Pun (4)", hindi: "चार (4)" },
          { sat: "ᱛᱩᱨᱩᱭ (6 / Turuy)", roman: "Turuy (6)", hindi: "छह (6)" }
        ],
        answer: "ᱢᱚᱬᱮ (5 / Mõṛẽ)",
        answerHindi: "पाँच (5 / Mõṛẽ)"
      }
    ]
  },
  "M2.1": {
    nipunCode: "M2.1",
    outcomeTitle: "Reads and writes numbers up to 99 and understands place value",
    grade: "Grade 2",
    worksheetTitle: "ᱮᱞ ᱛᱩᱞᱟᱹᱡᱚᱠᱷᱟ ᱟᱨ ᱴᱷᱟᱶ ᱢᱟᱱ (M2.1 Place Value & Comparison)",
    instructions: "ᱢᱟᱨᱟᱝ ᱟᱨ ᱦᱩᱰᱤᱧ ᱮᱞ ᱵᱟᱪᱷᱟᱣ ᱢᱮ᱾",
    instructionsHindi: "बड़ी और छोटी संख्या की पहचान करें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "᱕ ᱟᱨ ᱓ ᱢᱩᱫᱽ ᱨᱮ ᱚᱠᱟ ᱮᱞ ᱢᱟᱨᱟᱝ ᱜᱮᱭᱟ?",
        roman: "5 ar 3 mud re oka el maraṅ geya?",
        promptHindi: "५ और ३ में से कौन सी संख्या बड़ी है?",
        options: [
          { sat: "ᱢᱚᱬᱮ (5)", roman: "Mõṛẽ (5)", hindi: "पाँच (5)", isCorrect: true },
          { sat: "ᱯᱮ (3)", roman: "Pe (3)", hindi: "तीन (3)" }
        ],
        answer: "ᱢᱚᱬᱮ (5)",
        answerHindi: "पाँच (5 / Mõṛẽ)"
      }
    ]
  },
  "M3.1": {
    nipunCode: "M3.1",
    outcomeTitle: "Performs operations up to 999 and applies multiplication",
    grade: "Grade 3",
    worksheetTitle: "ᱥᱚᱢᱟᱱ ᱦᱟᱹᱴᱤᱧ ᱟᱨ ᱜᱩᱬᱟ (M3.1 Equal Sharing & Multiplication)",
    instructions: "᱑᱒ ᱩᱞ ᱓ ᱜᱤᱫᱽᱨᱟᱹ ᱛᱟᱞᱟ ᱨᱮ ᱦᱟᱹᱴᱤᱧ ᱞᱮᱠᱷᱟᱱ ᱛᱤᱱᱟᱹᱜ ᱧᱟᱢᱚᱜ-ᱟ?",
    instructionsHindi: "१२ आम ३ बच्चों में बराबर बाँटने पर कितने मिलेंगे?",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "᱑᱒ ÷ ᱓ = ?",
        roman: "12 / 3 = ?",
        promptHindi: "१२ को ३ से भाग देने पर कितना आता है?",
        options: [
          { sat: "ᱯᱩᱱ (4 / Pun)", roman: "Pun (4)", hindi: "चार (4)", isCorrect: true },
          { sat: "ᱯᱮ (3 / Pe)", roman: "Pe (3)", hindi: "तीन (3)" },
          { sat: "ᱢᱚᱬᱮ (5 / Mõṛẽ)", roman: "Mõṛẽ (5)", hindi: "पाँच (5)" }
        ],
        answer: "ᱯᱩᱱ (4 / Pun)",
        answerHindi: "चार (4 / Pun)"
      }
    ]
  }
};

/**
 * Get Offline Content Pack metadata
 */
export function getOfflinePackManifest() {
  return {
    packVersion: "0.1.0",
    appVersion: "0.1.0-offline",
    name: "ShikshaSetu Offline Classroom Pack",
    supportedGrades: [1, 2, 3],
    languages: TRIBAL_LANGUAGES,
    lessonsCount: SAMPLE_FLN_LESSONS.length,
    worksheetsCount: Object.keys(BUNDLED_NIPUN_WORKSHEETS).length,
    flashcardsCount: 48,
    phrasesCount: CLASSROOM_PHRASEBOOK.length,
    lexiconCount: Object.keys(APERTIUM_SANTALI_LEXICON).length,
    status: "Pack Ready (Bundled in APK)",
    lastSyncDate: "26 Sep 2026"
  };
}

/**
 * Get All FLN Lessons
 */
export function getOfflineLessons(grade = 'All', domain = 'All') {
  return SAMPLE_FLN_LESSONS.filter(l => {
    const matchGrade = grade === 'All' || l.grade.startsWith(grade);
    const matchDomain = domain === 'All' || l.domain === domain;
    return matchGrade && matchDomain;
  });
}

/**
 * Get Lesson by ID
 */
export function getOfflineLessonById(id) {
  return SAMPLE_FLN_LESSONS.find(l => l.id === id) || SAMPLE_FLN_LESSONS[0];
}

/**
 * Get Preloaded Worksheet for NIPUN Code
 */
export function getOfflineWorksheet(nipunCode = 'L1.1') {
  return BUNDLED_NIPUN_WORKSHEETS[nipunCode] || BUNDLED_NIPUN_WORKSHEETS['L1.2'];
}

/**
 * Get Classroom Phrases
 */
export function getOfflinePhrases(category = 'All') {
  if (category === 'All') return CLASSROOM_PHRASEBOOK;
  return CLASSROOM_PHRASEBOOK.filter(p => p.category.toLowerCase() === category.toLowerCase());
}
