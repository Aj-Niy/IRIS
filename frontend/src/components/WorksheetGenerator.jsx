import React, { useState, useRef } from 'react';
import { 
  FileCheck, 
  Download,
  Printer,
  Hand,
  CheckCircle2,
  Eye,
  Sparkles,
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NIPUN_OUTCOMES_MATRIX, TRIBAL_LANGUAGES } from '../services/apertiumSantaliData';
import { irisAskTutor } from '../services/api';
import AudioPlayButton from './AudioPlayButton';
import { uiTranslations } from '../services/uiTranslations';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';

// Comprehensive Bilingual Question Bank in Authentic Santhali Ol Chiki & Tribal Languages
const NIPUN_TRIBAL_WORKSHEETS = {
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
          { sat: "ᱡᱚᱦᱟᱨ / ᱱᱚᱢᱚᱥᱛᱮ", roman: "Johar / Namaste", hindi: "नमस्ते / अभिवादन (Greetings)", english: "Greetings / Hello", isCorrect: true },
          { sat: "ᱫᱟᱜ ᱧᱩ", roman: "Da' ñu", hindi: "पानी पीना (Drinking water)", english: "Drinking water" },
          { sat: "ᱥᱮᱱᱚᱜ", roman: "Senog", hindi: "जाना (Going)", english: "To go" },
          { sat: "ᱚᱞ", roman: "Ol", hindi: "लिखना (Writing)", english: "To write" }
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
          { sat: "ᱦᱮᱸ ᱢᱟᱪᱮᱛ, ᱤᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟᱹᱧ", roman: "Hẽ machet, iñ bujhạw kedañ", hindi: "हाँ शिक्षक जी, मैंने समझ लिया", english: "Yes teacher, I understood", isCorrect: true },
          { sat: "ᱵᱟᱝ ᱵᱟᱰᱟᱭ", roman: "Bang baday", hindi: "नहीं पता", english: "I don't know" },
          { sat: "ᱚᱲᱟᱜ ᱥᱮᱱᱚᱜ-ᱟᱹᱧ", roman: "Oṛag senog-añ", hindi: "घर जा रहा हूँ", english: "I'm going home" },
          { sat: "ᱫᱩᱲᱩᱵ ᱢᱮ", roman: "Duṛub me", hindi: "बैठ जाओ", english: "Sit down" }
        ],
        answer: "ᱦᱮᱸ ᱢᱟᱪᱮᱛ, ᱤᱧ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱮᱫᱟᱹᱧ",
        answerHindi: "हाँ शिक्षक जी, मैंने समझ लिया (Yes teacher, I understood)",
        pedagogyNote: "कक्षा निर्देश और सम्मानजनक संवाद का मूल्यांकन।"
      },
      {
        qNumber: 3,
        type: "fill",
        prompt: "ᱫᱟᱨᱮ (Tree) ᱟᱵᱚ ᱪᱮᱫ ᱮᱢᱟᱵᱚᱱᱟ? (ᱯᱟᱲᱦᱟᱣ ᱢᱮ ᱟᱨ ᱚᱞ ᱢᱮ): _____________",
        roman: "Dare abo chet' emabona? (Paṛhaw me ar ol me):",
        promptHindi: "पेड़ हमें क्या देते हैं? (पढ़ें और खाली स्थान भरें):",
        promptEnglish: "What do trees give us? (Read and fill in the blank):",
        answer: "ᱦᱮᱲᱮᱢ ᱡᱚ (Heṛem jo)",
        answerHindi: "मीठे फल (Sweet fruits / Heṛem jo)",
        pedagogyNote: "सरल पर्यावरण अवधारणा एवं मौखिक शब्दावली समझ।"
      }
    ],
    flashcards: [
      { front: "ᱡᱚᱦᱟᱨ", roman: "Johar", back: "नमस्ते (Greetings / Johar)", category: "Social" },
      { front: "ᱢᱟᱪᱮᱛ", roman: "Machet", back: "शिक्षक (Teacher)", category: "People" },
      { front: "ᱫᱟᱨᱮ", roman: "Dare", back: "पेड़ (Tree)", category: "Nature" },
      { front: "ᱡᱚ", roman: "Jo", back: "फल (Fruit)", category: "Nature" }
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
        promptEnglish: "Identify the starting letter sound for 'Book' (Potob):",
        options: [
          { sat: "ᱯ (ᱯᱚᱛᱚᱵ / Potob)", roman: "P (Potob)", hindi: "प (किताब)", english: "P (Book)", isCorrect: true },
          { sat: "ᱛ (ᱛᱤ / Ti)", roman: "T (Ti)", hindi: "त (हाथ)", english: "T (Hand)" },
          { sat: "ᱵ (ᱵᱟᱦᱟ / Baha)", roman: "B (Baha)", hindi: "ब (फूल)", english: "B (Flower)" },
          { sat: "ᱫ (ᱫᱟᱜ / Da')", roman: "D (Da')", hindi: "द (पानी)", english: "D (Water)" }
        ],
        answer: "ᱯ (ᱯᱚᱛᱚᱵ)",
        answerHindi: "प (पोतोब / किताब)",
        pedagogyNote: "L1.2 प्रारंभिक ध्वनि एवं ओल चिकी लिपि संरेखण।"
      },
      {
        qNumber: 2,
        type: "mcq",
        prompt: "‘ᱫ’ ᱪᱤᱠᱤ ᱠᱷᱚᱱ ᱪᱮᱫ ᱟᱹᱲᱟᱹ ᱦᱩᱭᱩᱜ-ᱟ?",
        roman: "‘D’ chiki khon chet' ạṛạ huyug-a?",
        promptHindi: "'द' अक्षर से कौन सा शब्द शुरू होता है?",
        promptEnglish: "Which word starts with the letter 'D'?",
        options: [
          { sat: "ᱫᱟᱨᱮ (Dare / Tree)", roman: "Dare", hindi: "दारे (पेड़)", english: "Dare (Tree)", isCorrect: true },
          { sat: "ᱚᱞ (Ol / Write)", roman: "Ol", hindi: "ओल (लिखना)", english: "Ol (Write)" },
          { sat: "ᱯᱟᱴᱟ (Pata / Slate)", roman: "Pata", hindi: "पाटा (स्लेट)", english: "Pata (Slate)" },
          { sat: "ᱢᱟᱪᱮᱛ (Machet / Teacher)", roman: "Machet", hindi: "माचेत (शिक्षक)", english: "Machet (Teacher)" }
        ],
        answer: "ᱫᱟᱨᱮ (Dare)",
        answerHindi: "दारे (पेड़ / Dare)",
        pedagogyNote: "वर्ण-शब्द संबंध (Letter-Word Association)।"
      },
      {
        qNumber: 3,
        type: "fill",
        prompt: "ᱪᱤᱛᱟᱹᱨ ᱧᱮᱞ ᱠᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ ᱪᱤᱠᱤ ᱚᱞ ᱢᱮ: [ 🌸 ᱵᱟᱦᱟ / Flower ] -> ᱮᱛᱚᱦᱚᱵ ᱪᱤᱠᱤ = _______",
        roman: "Chitạr ñel kate etohob chiki ol me: [ Baha ] -> Etohob chiki =",
        promptHindi: "चित्र देखकर पहला अक्षर लिखें: [ फूल / Baha ] -> पहला अक्षर = _______",
        promptEnglish: "Look at the picture and write the initial letter: [ Flower / Baha ] -> Initial Letter =",
        answer: "ᱵ (Baha / ᱵ)",
        answerHindi: "ब (बाहा / Baha)",
        pedagogyNote: "दृश्य प्रतीक एवं प्रारंभिक ध्वनि सम्बद्धता।"
      }
    ],
    flashcards: [
      { front: "ᱯᱚᱛᱚᱵ", roman: "Potob", back: "किताब (Book)", category: "Classroom" },
      { front: "ᱫᱟᱨᱮ", roman: "Dare", back: "पेड़ (Tree)", category: "Nature" },
      { front: "ᱵᱟᱦᱟ", roman: "Baha", back: "फूल (Flower)", category: "Nature" },
      { front: "ᱯᱟᱴᱟ", roman: "Pata", back: "स्लेट (Slate)", category: "Classroom" }
    ]
  },
  "L2.1": {
    nipunCode: "L2.1",
    outcomeTitle: "Reads 2-3 letter simple familiar words with 80% accuracy",
    grade: "Grade 2",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱟᱹᱲᱟᱹ ᱯᱟᱲᱦᱟᱣ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (L2.1 Word Decoding)",
    instructions: "ᱟᱹᱲᱟᱹ ᱠᱚ ᱡᱚᱲᱟᱣ ᱠᱟᱛᱮ ᱯᱟᱲᱦᱟᱣ ᱢᱮ ᱟᱨ ᱥᱟᱹᱨᱤ ᱛᱮᱞᱟ ᱵᱟᱪᱷᱟᱣ ᱢᱮ᱾",
    instructionsHindi: "अक्षरों को जोड़कर शब्द पढ़ें और सही अर्थ चुनें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "‘ᱟ-ᱥ-ᱲᱟ’ (A-s-ṛa) ᱪᱤᱠᱤ ᱠᱚ ᱡᱚᱲᱟᱣ ᱠᱟᱛᱮ ᱪᱮᱫ ᱟᱹᱲᱟᱹ ᱵᱮᱱᱟᱣᱜ-ᱟ?",
        roman: "‘A-s-ṛa’ chiki ko joṛaw kate chet' ạṛạ benawg-a?",
        promptHindi: "'आ-स-ड़ा' अक्षरों को जोड़कर कौन सा शब्द बनेगा?",
        promptEnglish: "What word is formed by blending 'A-s-ṛa'?",
        options: [
          { sat: "ᱟᱥᱲᱟ (Asṛa / School)", roman: "Asṛa", hindi: "विद्यालय / स्कूल (School)", english: "School", isCorrect: true },
          { sat: "ᱟᱥᱟ (Asa)", roman: "Asa", hindi: "आशा (Hope)", english: "Hope" },
          { sat: "ᱟᱲᱟᱝ (Aṛang)", roman: "Aṛang", hindi: "आवाज़ (Voice)", english: "Voice" },
          { sat: "ᱟᱢ (Am)", roman: "Am", hindi: "तुम (You)", english: "You" }
        ],
        answer: "ᱟᱥᱲᱟ (Asṛa)",
        answerHindi: "आसड़ा (विद्यालय / School)",
        pedagogyNote: "L2.1 ध्वनि सम्मिश्रण (Syllable Blending) क्षमता।"
      },
      {
        qNumber: 2,
        type: "mcq",
        prompt: "‘ᱯᱟᱲᱦᱟᱣ’ (Paṛhaw) ᱟᱹᱲᱟᱹ ᱨᱮᱭᱟᱜ ᱢᱮᱱᱮᱛ ᱪᱮᱫ ᱠᱟᱱᱟ?",
        roman: "‘Paṛhaw’ ạṛạ reyag menet chet' kana?",
        promptHindi: "'पढ़हाव' (Paṛhaw) शब्द का क्या अर्थ है?",
        promptEnglish: "What does the word 'Paṛhaw' mean?",
        options: [
          { sat: "ᱯᱟᱲᱦᱟᱣ = पढ़ना", roman: "Paṛhna", hindi: "पढ़ना (Reading)", english: "To read", isCorrect: true },
          { sat: "ᱚᱞ = लिखना", roman: "Likhna", hindi: "लिखना (Writing)", english: "To write" },
          { sat: "ᱮᱱᱮᱡ = खेलना", roman: "Khelna", hindi: "खेलना (Playing)", english: "To play" },
          { sat: "ᱡᱚᱢ = खाना", roman: "Khana", hindi: "खाना (Eating)", english: "To eat" }
        ],
        answer: "ᱯᱟᱲᱦᱟᱣ = पढ़ना",
        answerHindi: "पढ़ना (Reading / Paṛhaw)",
        pedagogyNote: "FLN बुनियादी क्रिया शब्दावली समझ।"
      }
    ],
    flashcards: [
      { front: "ᱟᱥᱲᱟ", roman: "Asṛa", back: "विद्यालय (School)", category: "Classroom" },
      { front: "ᱯᱟᱲᱦᱟᱣ", roman: "Paṛhaw", back: "पढ़ना (Reading)", category: "Action" },
      { front: "ᱚᱞ", roman: "Ol", back: "लिखना (Writing)", category: "Action" }
    ]
  },
  "L3.1": {
    nipunCode: "L3.1",
    outcomeTitle: "Reads an age-appropriate unseen passage with fluency (45-60 wpm)",
    grade: "Grade 3",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱯᱟᱲᱦᱟᱣ ᱟᱨ ᱵᱩᱡᱷᱟᱹᱣ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (L3.1 Reading Fluency)",
    instructions: "ᱱᱚᱣᱟ ᱠᱷᱟᱴᱚ ᱠᱟᱹᱦᱱᱤ ᱯᱟᱲᱦᱟᱣ ᱢᱮ ᱟᱨ ᱠᱩᱠᱞᱤ ᱨᱮᱭᱟᱜ ᱛᱮᱞᱟ ᱮᱢ ᱢᱮ᱾",
    instructionsHindi: "इस छोटी कहानी को पढ़ें और नीचे दिए प्रश्नों के उत्तर दें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "‘ᱟᱵᱚᱣᱟᱜ ᱟᱥᱲᱟ ᱨᱮ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱫᱟᱨᱮ ᱢᱮᱱᱟᱜ-ᱟ’ — ᱱᱚᱸᱰᱮ ᱪᱮᱫ ᱢᱮᱱᱟᱜ-ᱟ?",
        roman: "‘Abowag asṛa re ạḍi napay dare mena'-a’ — nonḍe chet' mena'-a?",
        promptHindi: "'हमारे स्कूल में सुंदर पेड़ हैं' — यहाँ क्या है?",
        promptEnglish: "'Our school has beautiful trees' — What is there?",
        options: [
          { sat: "ᱱᱟᱯᱟᱭ ᱫᱟᱨᱮ (Beautiful trees)", roman: "Napay dare", hindi: "सुंदर पेड़ (Trees)", english: "Beautiful trees", isCorrect: true },
          { sat: "ᱜᱟᱹᱭ (Cows)", roman: "Gại", hindi: "गाय", english: "Cows" },
          { sat: "ᱢᱤᱫ ᱥᱟᱫᱚᱢ (A horse)", roman: "Mit' sadom", hindi: "एक घोड़ा", english: "A horse" },
          { sat: "ᱪᱮᱫ ᱦᱚᱸ ᱵᱟᱝ", roman: "Chet' hõ bang", hindi: "कुछ नहीं", english: "Nothing" }
        ],
        answer: "ᱱᱟᱯᱟᱭ ᱫᱟᱨᱮ (Napay dare)",
        answerHindi: "सुंदर पेड़ (Beautiful trees)",
        pedagogyNote: "L3.1 पाठ आधारित समझ (Reading Comprehension)।"
      }
    ],
    flashcards: [
      { front: "ᱱᱟᱯᱟᱭ", roman: "Napay", back: "सुंदर / अच्छा (Good / Beautiful)", category: "General" },
      { front: "ᱠᱟᱹᱦᱱᱤ", roman: "Kahni", back: "कहानी (Story)", category: "Literacy" }
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
        prompt: "ᱱᱚᱸᱰᱮ ᱛᱤᱱᱟᱹᱜ ᱫᱷᱤᱨᱤ (ᱯᱟᱛᱷᱚᱨ) ᱢᱮᱱᱟᱜ-ᱟ? [ 🪨 🪨 🪨 🪨 🪨 ]",
        roman: "Nonḍe tinạ' dhiri mena'-a? [ 5 pebbles ]",
        promptHindi: "यहाँ कितने पत्थर (कंकड़) हैं? [ ५ पत्थर ]",
        promptEnglish: "How many pebbles are here? [ 5 pebbles ]",
        options: [
          { sat: "ᱢᱚᱬᱮ (5 / Mõṛẽ)", roman: "Mõṛẽ (5)", hindi: "पाँच (5)", english: "Five (5)", isCorrect: true },
          { sat: "ᱯᱮ (3 / Pe)", roman: "Pe (3)", hindi: "तीन (3)", english: "Three (3)" },
          { sat: "ᱯᱩᱱ (4 / Pun)", roman: "Pun (4)", hindi: "चार (4)", english: "Four (4)" },
          { sat: "ᱵᱟᱨ (2 / Bar)", roman: "Bar (2)", hindi: "दो (2)", english: "Two (2)" }
        ],
        answer: "ᱢᱚᱬᱮ (5 / Mõṛẽ)",
        answerHindi: "पाँच (5 / Mõṛẽ)",
        pedagogyNote: "M1.1 मात्रा एवं अंक संगति (1-10 Counting)।"
      },
      {
        qNumber: 2,
        type: "mcq",
        prompt: "‘ᱯᱮ’ (Pe / 3) ᱟᱨ ‘ᱢᱤᱫ’ (Mit' / 1) ᱢᱮᱥᱟ ᱠᱟᱛᱮ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜ-ᱟ? (3 + 1 = ?)",
        roman: "‘Pe’ (3) ar ‘Mit'’ (1) mesa kate tinạ' huyug-a?",
        promptHindi: "'तीन' (3) और 'एक' (1) मिलाकर कितने होते हैं? (3 + 1 = ?)",
        promptEnglish: "What is 'Three' (3) plus 'One' (1)?",
        options: [
          { sat: "ᱯᱩᱱ (4 / Pun)", roman: "Pun (4)", hindi: "चार (4)", english: "Four (4)", isCorrect: true },
          { sat: "ᱢᱚᱬᱮ (5 / Mõṛẽ)", roman: "Mõṛẽ (5)", hindi: "पाँच (5)", english: "Five (5)" },
          { sat: "ᱛᱩᱨᱩᱭ (6 / Turuy)", roman: "Turuy (6)", hindi: "छह (6)", english: "Six (6)" },
          { sat: "ᱵᱟᱨ (2 / Bar)", roman: "Bar (2)", hindi: "दो (2)", english: "Two (2)" }
        ],
        answer: "ᱯᱩᱱ (4 / Pun)",
        answerHindi: "चार (4 / Pun)",
        pedagogyNote: "सरल जोड़ (Concrete Addition)।"
      },
      {
        qNumber: 3,
        type: "fill",
        prompt: "ᱤᱯᱤᱞ ᱠᱚ ᱞᱮᱠᱷᱟᱭ ᱢᱮ ᱟᱨ ᱥᱟᱱᱛᱟᱲᱤ ᱮᱞ ᱚᱞ ᱢᱮ: [ ⭐ ⭐ ⭐ ] = _______",
        roman: "Ipil ko lekhay me ar Santali el ol me: [ ⭐ ⭐ ⭐ ] =",
        promptHindi: "तारों को गिनें और संथाली संख्या लिखें: [ ⭐ ⭐ ⭐ ] = _______",
        promptEnglish: "Count the stars and write the tribal numeral: [ ⭐ ⭐ ⭐ ] =",
        answer: "ᱯᱮ (Pe / 3)",
        answerHindi: "तीन (Pe / 3)",
        pedagogyNote: "संख्या लेखन एवं गिनती कौशल।"
      }
    ],
    flashcards: [
      { front: "ᱢᱤᱫ", roman: "Mit'", back: "एक (1 / One)", category: "Numbers" },
      { front: "ᱵᱟᱨ", roman: "Bar", back: "दो (2 / Two)", category: "Numbers" },
      { front: "ᱯᱮ", roman: "Pe", back: "तीन (3 / Three)", category: "Numbers" },
      { front: "ᱯᱩᱱ", roman: "Pun", back: "चार (4 / Four)", category: "Numbers" },
      { front: "ᱢᱚᱬᱮ", roman: "Mõṛẽ", back: "पाँच (5 / Five)", category: "Numbers" }
    ]
  },
  "M1.2": {
    nipunCode: "M1.2",
    outcomeTitle: "Solves simple addition and subtraction problems within 9",
    grade: "Grade 1",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱡᱚᱲᱟᱣ ᱟᱨ ᱵᱷᱮᱜᱟᱨ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (M1.2 Operations within 9)",
    instructions: "ᱞᱮᱠᱷᱟ ᱯᱟᱲᱦᱟᱣ ᱠᱟᱛᱮ ᱡᱚᱲᱟᱣ (Addition) ᱟᱨ ᱵᱷᱮᱜᱟᱨ (Subtraction) ᱠᱟᱹᱢᱤ ᱯᱩᱨᱟᱹᱣ ᱢᱮ᱾",
    instructionsHindi: "गणित समझकर जोड़ और घटाव करें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "ᱟᱥᱲᱟ ᱨᱮ ᱕ ᱴᱤ ᱯᱚᱛᱚᱵ ᱛᱟᱦᱮᱸ ᱠᱟᱱᱟ, ᱢᱟᱪᱮᱛ ᱟᱨᱦᱚᱸ ᱒ ᱴᱤ ᱮᱢᱟᱫ ᱠᱚᱣᱟ᱾ ᱱᱤᱛᱚᱜ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱮᱱᱟ? (5 + 2 = ?)",
        roman: "Asṛa re 5 ti potob tahẽ kana, machet arho 2 ti emad kowa. Nitog tinạ' huyena?",
        promptHindi: "स्कूल में ५ किताबें थीं, गुरुजी ने २ और दीं। अब कुल कितनी हुईं? (5 + 2 = ?)",
        promptEnglish: "There were 5 books, teacher gave 2 more. How many total? (5 + 2 = ?)",
        options: [
          { sat: "ᱮᱭᱟᱭ (7 / Eyay)", roman: "Eyay (7)", hindi: "सात (7)", english: "Seven (7)", isCorrect: true },
          { sat: "ᱛᱩᱨᱩᱭ (6 / Turuy)", roman: "Turuy (6)", hindi: "छह (6)", english: "Six (6)" },
          { sat: "ᱤᱨᱟᱹᱞ (8 / Irạl)", roman: "Irạl (8)", hindi: "आठ (8)", english: "Eight (8)" },
          { sat: "ᱜᱮᱞ (10 / Gel)", roman: "Gel (10)", hindi: "दस (10)", english: "Ten (10)" }
        ],
        answer: "ᱮᱭᱟᱭ (7 / Eyay)",
        answerHindi: "सात (7 / Eyay)",
        pedagogyNote: "M1.2 प्रासंगिक व्यावहारिक जोड़।"
      }
    ],
    flashcards: [
      { front: "ᱮᱭᱟᱭ", roman: "Eyay", back: "सात (7 / Seven)", category: "Numbers" },
      { front: "ᱛᱩᱨᱩᱭ", roman: "Turuy", back: "छह (6 / Six)", category: "Numbers" }
    ]
  },
  "M2.1": {
    nipunCode: "M2.1",
    outcomeTitle: "Reads and writes numbers up to 99 and understands place value",
    grade: "Grade 2",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱜᱮᱞ ᱟᱨ ᱴᱷᱟᱶ ᱮᱞ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (M2.1 Place Value)",
    instructions: "ᱜᱮᱞ (10s) ᱟᱨ ᱢᱤᱫ (1s) ᱴᱷᱟᱶ ᱮᱞ ᱵᱟᱪᱷᱟᱣ ᱢᱮ᱾",
    instructionsHindi: "दहाई (१०) और इकाई (१) का मान पहचानें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "‘ᱜᱮᱞᱵᱟᱨ’ (Gelbar) ᱮᱞ ᱫᱚ ᱛᱤᱱᱟᱹᱜ ᱠᱟᱱᱟ? (10 + 2 = ?)",
        roman: "‘Gelbar’ el do tinạ' kana? (10 + 2 = ?)",
        promptHindi: "'गेलबार' (Gelbar) संख्या का क्या मान है? (10 + 2 = ?)",
        promptEnglish: "What is the value of 'Gelbar'? (10 + 2 = ?)",
        options: [
          { sat: "᱑᱒ (Gelbar / 12)", roman: "Gelbar (12)", hindi: "बारह (12)", english: "Twelve (12)", isCorrect: true },
          { sat: "᱒᱐ (Isi / 20)", roman: "Isi (20)", hindi: "बीस (20)", english: "Twenty (20)" },
          { sat: "᱑᱐ (Gel / 10)", roman: "Gel (10)", hindi: "दस (10)", english: "Ten (10)" },
          { sat: "᱑᱕ (Gel-mõṛẽ / 15)", roman: "Gel-mõṛẽ (15)", hindi: "पंद्रह (15)", english: "Fifteen (15)" }
        ],
        answer: "᱑᱒ (Gelbar / 12)",
        answerHindi: "बारह (12 / Gelbar)",
        pedagogyNote: "M2.1 दहाई और इकाई समझ (Tens & Units Bundling)।"
      }
    ],
    flashcards: [
      { front: "ᱜᱮᱞ", roman: "Gel", back: "दस (10 / Ten)", category: "Numbers" },
      { front: "ᱜᱮᱞᱵᱟᱨ", roman: "Gelbar", back: "बारह (12 / Twelve)", category: "Numbers" }
    ]
  },
  "M3.1": {
    nipunCode: "M3.1",
    outcomeTitle: "Performs operations up to 999 and applies multiplication",
    grade: "Grade 3",
    worksheetTitle: "ᱥᱟᱱᱛᱟᱲᱤ ᱜᱩᱬᱟ ᱟᱨ ᱦᱟᱹᱴᱤᱧ ᱠᱟᱹᱢᱤ ᱥᱟᱠᱟᱢ (M3.1 Multiplication)",
    instructions: "ᱜᱩᱬᱟ (Multiplication) ᱠᱟᱹᱢᱤ ᱯᱩᱨᱟᱹᱣ ᱢᱮ᱾",
    instructionsHindi: "समान वितरण और गुणा के प्रश्न हल करें।",
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: "᱓ ᱡᱚᱠᱷᱮᱡ ᱔ ᱫᱷᱟᱣ (3 × 4) ᱢᱮᱥᱟ ᱞᱮᱠᱷᱟᱱ ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭᱩᱜ-ᱟ?",
        roman: "3 jokhej 4 dhaw (3 × 4) mesa lekhan tinạ' huyug-a?",
        promptHindi: "३ को ४ बार जोड़ने पर (३ × ४) कितना होगा?",
        promptEnglish: "What is 3 multiplied by 4 (3 × 4)?",
        options: [
          { sat: "ᱜᱮᱞᱵᱟᱨ (12 / Gelbar)", roman: "Gelbar (12)", hindi: "बारह (12)", english: "Twelve (12)", isCorrect: true },
          { sat: "ᱜᱮᱞ (10 / Gel)", roman: "Gel (10)", hindi: "दस (10)", english: "Ten (10)" },
          { sat: "ᱜᱮᱞᱯᱮ (13 / Gelpe)", roman: "Gelpe (13)", hindi: "तेरह (13)", english: "Thirteen (13)" },
          { sat: "ᱤᱨᱟᱹᱞ (8 / Irạl)", roman: "Irạl (8)", hindi: "आठ (8)", english: "Eight (8)" }
        ],
        answer: "ᱜᱮᱞᱵᱟᱨ (12 / Gelbar)",
        answerHindi: "बारह (12 / Gelbar)",
        pedagogyNote: "M3.1 बार-बार जोड़ के रूप में गुणा।"
      }
    ],
    flashcards: [
      { front: "ᱜᱩᱬᱟ", roman: "Guṇa", back: "गुणा (Multiplication)", category: "Math" },
      { front: "ᱦᱟᱹᱴᱤᱧ", roman: "Hạṭiñ", back: "भाग / वितरण (Division)", category: "Math" }
    ]
  }
};

export default function WorksheetGenerator({ 
  uiLang = 'en', 
  currentLang = 'sat' 
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang || 'sat');
  const [selectedOutcome, setSelectedOutcome] = useState(NIPUN_OUTCOMES_MATRIX[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [worksheetData, setWorksheetData] = useState(null);
  const [activeTab, setActiveTab] = useState('worksheet'); // 'worksheet' | 'flashcards'
  const [flippedCardIndex, setFlippedCardIndex] = useState(null);
  const [schoolName, setSchoolName] = useState('Govt. Primary School, Jharkhand');
  const [isExporting, setIsExporting] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const worksheetRef = useRef(null);

  // ISL Video Player state
  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [islConcept, setIslConcept] = useState('');
  const [islText, setIslText] = useState('');

  const handleOpenIsl = (concept, text) => {
    setIslConcept(concept);
    setIslText(text || concept);
    setIsIslModalOpen(true);
  };

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  // Active worksheet dataset based on selected NIPUN code
  const currentWorksheet = worksheetData || NIPUN_TRIBAL_WORKSHEETS[selectedOutcome.code] || NIPUN_TRIBAL_WORKSHEETS["L1.2"];

  const handleGenerate = async (outcome) => {
    setSelectedOutcome(outcome);
    setIsGenerating(true);
    setFlippedCardIndex(null);

    // If predefined tribal worksheet exists for this code, load it instantly
    if (NIPUN_TRIBAL_WORKSHEETS[outcome.code]) {
      setWorksheetData(NIPUN_TRIBAL_WORKSHEETS[outcome.code]);
      setIsGenerating(false);
      return;
    }

    try {
      const res = await irisAskTutor({
        mode: 'worksheet',
        nipunCode: outcome.code,
        lessonContext: `${outcome.grade} ${outcome.domain} ${outcome.lakshya} ${activeLangObj.name}`,
        targetLanguage: activeLangObj.name
      });
      if (res && res.questions) {
        setWorksheetData(res);
      }
    } catch (err) {
      console.warn("Worksheet gen fallback:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // High-Resolution Unicode PDF Export preserving exact Ol Chiki & Indic glyphs
  const exportPDF = async () => {
    if (!worksheetRef.current) return;
    setIsExporting(true);
    try {
      const element = worksheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pdfHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
      } else {
        let remainingHeight = contentHeight;
        let sourceY = 0;
        const pageContentHeight = pdfHeight - margin * 2;

        while (remainingHeight > 0) {
          const sliceH = Math.min(remainingHeight, pageContentHeight);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = (sliceH / contentHeight) * canvas.height;

          const ctx = sliceCanvas.getContext('2d');
          ctx.drawImage(canvas,
            0, sourceY * (canvas.height / contentHeight),
            canvas.width, sliceCanvas.height,
            0, 0,
            canvas.width, sliceCanvas.height
          );

          if (sourceY > 0) pdf.addPage();
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceH);
          sourceY += sliceH;
          remainingHeight -= sliceH;
        }
      }

      pdf.save(`PALASH_NIPUN_${currentWorksheet.nipunCode}_${selectedLang}_${isTeacherMode ? 'TeacherKey' : 'StudentWorksheet'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Top Banner with Clean Borders */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '1.5px solid #FED7AA',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(234,88,12,0.06)'
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#EA580C',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            {t.worksheets.headerTag}
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            {t.worksheets.title}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
            {t.worksheets.subtitle}
          </p>
        </div>

        {/* Tribal Language & Tab Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#FFF7ED',
            borderRadius: '8px',
            padding: '3px',
            border: '1.5px solid #FDBA74'
          }}>
            {TRIBAL_LANGUAGES.map(lang => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setWorksheetData(null);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '600',
                    border: isSelected ? '1px solid #EA580C' : '1px solid transparent',
                    backgroundColor: isSelected ? '#EA580C' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#0F172A',
                    cursor: 'pointer'
                  }}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            backgroundColor: '#FFF7ED',
            borderRadius: '8px',
            padding: '3px',
            border: '1.5px solid #FDBA74'
          }}>
            <button
              onClick={() => setActiveTab('worksheet')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: activeTab === 'worksheet' ? '800' : '600',
                fontSize: '12px',
                cursor: 'pointer',
                border: activeTab === 'worksheet' ? '1px solid #EA580C' : '1px solid transparent',
                backgroundColor: activeTab === 'worksheet' ? '#EA580C' : 'transparent',
                color: activeTab === 'worksheet' ? '#FFFFFF' : '#0F172A'
              }}
            >
              {t.worksheets.worksheetView}
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: activeTab === 'flashcards' ? '800' : '600',
                fontSize: '12px',
                cursor: 'pointer',
                border: activeTab === 'flashcards' ? '1px solid #EA580C' : '1px solid transparent',
                backgroundColor: activeTab === 'flashcards' ? '#EA580C' : 'transparent',
                color: activeTab === 'flashcards' ? '#FFFFFF' : '#0F172A'
              }}
            >
              {t.worksheets.flashcardsView}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: NIPUN Outcomes Framework */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '18px', backgroundColor: '#FFFFFF' }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: '800',
              margin: '0 0 10px 0',
              paddingBottom: '8px',
              borderBottom: '1.5px solid #FED7AA',
              color: '#0F172A'
            }}>
              Select NIPUN Bharat Lakshya:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto' }}>
              {NIPUN_OUTCOMES_MATRIX.map((outcome) => {
                const isSelected = selectedOutcome.code === outcome.code;
                return (
                  <button
                    key={outcome.code}
                    onClick={() => handleGenerate(outcome)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #EA580C' : '1.5px solid #FED7AA',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#EA580C'
                      }}>
                        {outcome.code} · {outcome.domain}
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748B' }}>{outcome.grade}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', lineHeight: '1.4' }}>
                      {outcome.lakshya}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', display: 'block', marginBottom: '6px' }}>
              School Name on PDF Header:
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1.5px solid #FDBA74',
                backgroundColor: '#FFFDF9',
                color: '#0F172A',
                fontSize: '12px',
                fontWeight: '600'
              }}
            />
          </div>
        </div>

        {/* Right Column: Printable Worksheet / Flashcard View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'worksheet' && (
            <div className="card card-highlight worksheet-printable-area" ref={worksheetRef} id="worksheet-print-area" style={{ padding: '26px', backgroundColor: '#FFFFFF' }}>
              
              {/* Header Controls / Teacher Mode Switcher */}
              <div className="no-print" style={{
                borderBottom: '1.5px dashed #FED7AA',
                paddingBottom: '14px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase' }}>
                    {currentWorksheet.grade} · Competency: {currentWorksheet.nipunCode}
                  </span>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', margin: '2px 0 0 0', color: '#0F172A' }}>
                    {currentWorksheet.worksheetTitle}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Teacher View & Evaluation Toggle */}
                  <button
                    onClick={() => setIsTeacherMode(!isTeacherMode)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: isTeacherMode ? '#ECFDF5' : '#FFF7ED',
                      border: isTeacherMode ? '1.5px solid #059669' : '1.5px solid #FDBA74',
                      color: isTeacherMode ? '#065F46' : '#EA580C',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Toggle between Student Mode and Teacher Answer Key with Hindi/English Translations"
                  >
                    <CheckCircle2 size={14} color={isTeacherMode ? "#059669" : "#EA580C"} />
                    <span>{isTeacherMode ? "✓ Teacher Mode (Key & Translations)" : "👦 Student Mode (Tribal)"}</span>
                  </button>

                  <button
                    onClick={() => handleOpenIsl(currentWorksheet.outcomeTitle, currentWorksheet.outcomeTitle)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFBEB',
                      color: '#92400E',
                      border: '1.5px solid #FCD34D',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    title="Watch ISL Sign Language Guide"
                  >
                    <Hand size={14} color="#D97706" />
                    <span>Watch ISL</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      border: '1.5px solid #BFDBFE',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>

                  <button
                    onClick={exportPDF}
                    disabled={isExporting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: isExporting ? '#FED7AA' : '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: isExporting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(234,88,12,0.25)'
                    }}
                  >
                    <Download size={14} />
                    <span>{isExporting ? 'Generating PDF…' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Printable Institutional Header */}
              <div style={{
                backgroundColor: '#FFF7ED',
                borderRadius: '8px',
                border: '1.5px solid #FDBA74',
                padding: '12px 16px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase', marginBottom: '2px' }}>
                      PALASH MTB-MLE Programme · Government of Jharkhand
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#0F172A' }}>
                      NIPUN Bharat {currentWorksheet.nipunCode} — {activeLangObj.name} ({activeLangObj.script})
                    </div>
                    <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
                      {schoolName} · <strong>Competency:</strong> {currentWorksheet.outcomeTitle}
                    </div>
                  </div>
                  {isTeacherMode && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#DCFCE7',
                      color: '#166534',
                      fontWeight: '800',
                      fontSize: '11px',
                      border: '1px solid #86EFAC'
                    }}>
                      👩‍🏫 TEACHER EVALUATION KEY
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions Bar */}
              <div style={{
                padding: '8px 14px',
                backgroundColor: '#FFFDF9',
                border: '1px solid #FED7AA',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#0F172A',
                marginBottom: '14px',
                fontWeight: '600'
              }}>
                <strong>ᱫᱤᱥᱟᱹ (Instructions):</strong> {currentWorksheet.instructions}
                {isTeacherMode && currentWorksheet.instructionsHindi && (
                  <div style={{ fontSize: '11px', color: '#1E40AF', marginTop: '2px', fontWeight: '700' }}>
                    (निर्देश: {currentWorksheet.instructionsHindi})
                  </div>
                )}
              </div>

              {/* Student Header Line */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #FDBA74',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '18px'
              }}>
                <span><strong>ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱧᱩᱛᱩᱢ (Student Name):</strong> _____________________</span>
                <span><strong>ᱪᱟᱱᱟᱪ (Class):</strong> {currentWorksheet.grade}</span>
                <span><strong>ᱢᱟᱹᱦᱤᱛ (Date):</strong> ____________</span>
              </div>

              {/* Questions List in Authentic Santhali / Tribal Script */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {currentWorksheet.questions.map((q, idx) => {
                  const promptTribal = q.prompt;
                  const promptRoman = q.roman;
                  const promptHindi = q.promptHindi;
                  const promptEnglish = q.promptEnglish;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '10px',
                        border: '1.5px solid #FED7AA',
                        backgroundColor: '#FFFFFF',
                        position: 'relative'
                      }}
                    >
                      {/* Question Header & Tribal Prompt for Kids */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', lineHeight: '1.5' }}>
                          <span style={{ color: '#EA580C', marginRight: '8px', fontWeight: '900' }}>Q{idx + 1}.</span>
                          <span>{promptTribal}</span>
                        </div>
                        {promptRoman && (
                          <div style={{ fontSize: '12px', color: '#C2410C', fontWeight: '600', fontStyle: 'italic', marginTop: '2px', marginLeft: '28px' }}>
                            ({promptRoman})
                          </div>
                        )}

                        {/* Teacher Mode: Dual Hindi & English Translations */}
                        {isTeacherMode && (
                          <div style={{
                            marginTop: '8px',
                            marginLeft: '28px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                            fontSize: '12px'
                          }}>
                            <div style={{ color: '#1E40AF', fontWeight: '700' }}>
                              <strong>हिंदी अनुवाद:</strong> {promptHindi || '—'}
                            </div>
                            {promptEnglish && (
                              <div style={{ color: '#475569' }}>
                                <strong>English:</strong> {promptEnglish}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      {q.options && q.options.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginLeft: '28px' }}>
                          {q.options.map((opt, optIdx) => {
                            const isCorrect = opt.isCorrect || opt.sat === q.answer || opt === q.answer;
                            const optTribal = opt.sat || opt.script || (typeof opt === 'string' ? opt : '');
                            const optRoman = opt.roman || '';
                            const optHindi = opt.hindi || '';
                            const optEnglish = opt.english || '';

                            return (
                              <div
                                key={optIdx}
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: isTeacherMode && isCorrect ? '#ECFDF5' : '#FFFDF9',
                                  border: isTeacherMode && isCorrect ? '2px solid #059669' : '1.5px solid #FED7AA',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  color: '#0F172A',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    border: isTeacherMode && isCorrect ? '2px solid #059669' : '2px solid #FDBA74',
                                    backgroundColor: isTeacherMode && isCorrect ? '#059669' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFFFFF',
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    flexShrink: 0
                                  }}>
                                    {isTeacherMode && isCorrect ? '✓' : ''}
                                  </span>
                                  <div>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                                      {optTribal}
                                    </div>
                                    {optRoman && (
                                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                                        ({optRoman})
                                      </div>
                                    )}
                                    {isTeacherMode && (optHindi || optEnglish) && (
                                      <div style={{ fontSize: '11px', color: isCorrect ? '#065F46' : '#64748B', fontWeight: '700', marginTop: '2px' }}>
                                        {optHindi} {optEnglish ? `· ${optEnglish}` : ''}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isTeacherMode && isCorrect && (
                                  <span style={{
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: '#DCFCE7',
                                    color: '#166534'
                                  }}>
                                    ✓ Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ marginLeft: '28px' }}>
                          {/* Fill-in line for students */}
                          <div style={{
                            minHeight: '36px',
                            borderBottom: '2px dashed #FDBA74',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '8px',
                            color: '#059669',
                            fontWeight: '800',
                            fontSize: '14px'
                          }}>
                            {isTeacherMode ? `✓ Answer: ${q.answer} (${q.answerHindi || ''})` : ''}
                          </div>
                        </div>
                      )}

                      {/* Teacher Pedagogy / Answer Key Note Box */}
                      {isTeacherMode && (
                        <div style={{
                          marginTop: '12px',
                          marginLeft: '28px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#FFFBEB',
                          border: '1px solid #FCD34D',
                          fontSize: '11px',
                          color: '#92400E',
                          fontWeight: '700'
                        }}>
                          💡 <strong>शिक्षक मूल्यांकन मार्गदर्शन (Pedagogy Note):</strong> {q.pedagogyNote || `Assesses NIPUN competency ${currentWorksheet.nipunCode}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PDF Footer */}
              <div style={{
                marginTop: '24px',
                paddingTop: '12px',
                borderTop: '1.5px solid #FED7AA',
                fontSize: '11px',
                color: '#64748B',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>Government of Jharkhand · PALASH MTB-MLE Programme</span>
                <span>NIPUN Bharat FLN Alignment · {activeLangObj.name} ({activeLangObj.script})</span>
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
              <div style={{ marginBottom: '16px', paddingBottom: '10px', borderBottom: '1.5px solid #FED7AA' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                  Visual Classroom Flashcard Decks ({activeLangObj.name})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#334155' }}>
                  Click card to flip between native script and Hindi gloss. Use audio controls to play and pause.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {currentWorksheet.flashcards.map((card, idx) => {
                  const isFlipped = flippedCardIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setFlippedCardIndex(isFlipped ? null : idx)}
                      style={{
                        height: '170px',
                        borderRadius: '10px',
                        padding: '14px',
                        backgroundColor: isFlipped ? '#FFF7ED' : '#FFFFFF',
                        border: isFlipped ? '2px solid #EA580C' : '1.5px solid #FED7AA',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        boxShadow: isFlipped ? '0 4px 12px rgba(234,88,12,0.15)' : '0 1px 4px rgba(234,88,12,0.06)'
                      }}
                    >
                      <div style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        color: '#EA580C'
                      }}>
                        {card.category} · {isFlipped ? 'Hindi' : activeLangObj.name}
                      </div>

                      {!isFlipped ? (
                        <div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', marginBottom: '4px' }}>
                            {card.front}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#EA580C' }}>
                            ({card.roman})
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                            {card.back}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                            {activeLangObj.name}: {card.front}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <AudioPlayButton
                          text={card.roman || card.front}
                          size="sm"
                          showStop={false}
                          label="Audio"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenIsl(card.back, card.back);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            color: '#B45309',
                            fontSize: '10px',
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            cursor: 'pointer'
                          }}
                          title="Watch ISL sign"
                        >
                          <Hand size={10} color="#D97706" />
                          <span>ISL</span>
                        </button>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>Tap to flip</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ISL Sign Language Video Modal */}
      <ISLVideoPlayerModal
        isOpen={isIslModalOpen}
        onClose={() => setIsIslModalOpen(false)}
        conceptName={islConcept}
        fullText={islText}
        displayText={islText}
      />
    </div>
  );
}
