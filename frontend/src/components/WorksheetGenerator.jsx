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

const FLASHCARD_COLOR_SCHEMES = [
  { bg: '#EFF6FF', border: '#BFDBFE', badgeClass: 'badge-blue', text: '#1E40AF', subText: '#2563EB' },   // Light Blue
  { bg: '#FFF7ED', border: '#FED7AA', badgeClass: 'badge-orange', text: '#9A3412', subText: '#EA580C' }, // Warm Peach / Orange
  { bg: '#ECFDF5', border: '#A7F3D0', badgeClass: 'badge-green', text: '#065F46', subText: '#059669' },  // Soft Mint
  { bg: '#FFF1F2', border: '#FECDD3', badgeClass: 'badge-rose', text: '#9F1239', subText: '#E11D48' },   // Soft Rose
  { bg: '#FFFBEB', border: '#FDE68A', badgeClass: 'badge-amber', text: '#92400E', subText: '#D97706' },  // Soft Amber
  { bg: '#FAF5FF', border: '#E9D5FF', badgeClass: 'badge-purple', text: '#6B21A8', subText: '#9333EA' }, // Soft Lavender
  { bg: '#F0FDFA', border: '#99F6E4', badgeClass: 'badge-blue', text: '#115E59', subText: '#0D9488' },   // Teal
  { bg: '#F0F9FF', border: '#BAE6FD', badgeClass: 'badge-blue', text: '#075985', subText: '#0284C7' }    // Sky Blue
];

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
      { front: "ᱡᱚᱦᱟᱨ", roman: "Johar", back: "नमस्ते (Greetings / Hello)", category: "Social" },
      { front: "ᱢᱟᱪᱮᱛ", roman: "Machet", back: "शिक्षक (Teacher)", category: "People" },
      { front: "ᱯᱚᱛᱚᱵ", roman: "Potob", back: "किताब (Book)", category: "Classroom" },
      { front: "ᱫᱟᱨᱮ", roman: "Dare", back: "पेड़ (Tree)", category: "Nature" },
      { front: "ᱵᱟᱦᱟ", roman: "Baha", back: "फूल (Flower)", category: "Nature" },
      { front: "ᱯᱟᱴᱟ", roman: "Pata", back: "स्लेट (Slate / Board)", category: "Classroom" },
      { front: "ᱫᱟᱜ", roman: "Da'", back: "पानी (Water)", category: "Nature" },
      { front: "ᱥᱤᱝ", roman: "Siñ", back: "सूर्य / सूरज (Sun)", category: "Sky" },
      { front: "ᱪᱟᱸᱫᱚ", roman: "Chando", back: "चन्द्रमा / चाँद (Moon)", category: "Sky" },
      { front: "ᱪᱮᱬᱮ", roman: "Cheṇe", back: "पक्षिया / चिड़िया (Bird)", category: "Animals" },
      { front: "ᱢᱤᱫ", roman: "Mit'", back: "एक (1 / One)", category: "Numbers" },
      { front: "ᱵᱟᱨ", roman: "Bar", back: "दो (2 / Two)", category: "Numbers" },
      { front: "ᱯᱮ", roman: "Pe", back: "तीन (3 / Three)", category: "Numbers" },
      { front: "ᱯᱩᱱ", roman: "Pun", back: "चार (4 / Four)", category: "Numbers" },
      { front: "ᱢᱚᱬᱮ", roman: "Mõṛẽ", back: "पाँच (5 / Five)", category: "Numbers" },
      { front: "ᱚᱲᱟᱜ", roman: "Oṛag", back: "घर (Home / House)", category: "Family" }
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
      { front: "ᱯᱟᱴᱟ", roman: "Pata", back: "स्लेट (Slate)", category: "Classroom" },
      { front: "ᱫᱟᱜ", roman: "Da'", back: "पानी (Water)", category: "Nature" },
      { front: "ᱥᱤᱝ", roman: "Siñ", back: "सूरज (Sun)", category: "Sky" },
      { front: "ᱪᱟᱸᱫᱚ", roman: "Chando", back: "चाँद (Moon)", category: "Sky" },
      { front: "ᱪᱮᱬᱮ", roman: "Cheṇe", back: "चिड़िया (Bird)", category: "Animals" },
      { front: "ᱢᱤᱫ", roman: "Mit'", back: "एक (1 / One)", category: "Numbers" },
      { front: "ᱵᱟᱨ", roman: "Bar", back: "दो (2 / Two)", category: "Numbers" },
      { front: "ᱯᱮ", roman: "Pe", back: "तीन (3 / Three)", category: "Numbers" },
      { front: "ᱯᱩᱱ", roman: "Pun", back: "चार (4 / Four)", category: "Numbers" }
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
      }
    ],
    flashcards: [
      { front: "ᱢᱤᱫ", roman: "Mit'", back: "एक (1 / One)", category: "Numbers" },
      { front: "ᱵᱟᱨ", roman: "Bar", back: "दो (2 / Two)", category: "Numbers" },
      { front: "ᱯᱮ", roman: "Pe", back: "तीन (3 / Three)", category: "Numbers" },
      { front: "ᱯᱩᱱ", roman: "Pun", back: "चार (4 / Four)", category: "Numbers" },
      { front: "ᱢᱚᱬᱮ", roman: "Mõṛẽ", back: "पाँच (5 / Five)", category: "Numbers" },
      { front: "ᱛᱩᱨᱩᱭ", roman: "Turui", back: "छह (6 / Six)", category: "Numbers" },
      { front: "ᱮᱭᱟᱭ", roman: "Eyai", back: "सात (7 / Seven)", category: "Numbers" },
      { front: "ᱤᱨᱟᱹᱞ", roman: "Irạl", back: "आठ (8 / Eight)", category: "Numbers" }
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
  const [activeTab, setActiveTab] = useState('worksheet');
  const [flippedCardIndex, setFlippedCardIndex] = useState(null);
  const [schoolName, setSchoolName] = useState('Govt. Primary School, Jharkhand');
  const [isExporting, setIsExporting] = useState(false);
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const worksheetRef = useRef(null);

  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [islConcept, setIslConcept] = useState('');
  const [islText, setIslText] = useState('');

  const handleOpenIsl = (concept, text) => {
    setIslConcept(concept);
    setIslText(text || concept);
    setIsIslModalOpen(true);
  };

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const currentWorksheet = worksheetData || NIPUN_TRIBAL_WORKSHEETS[selectedOutcome.code] || NIPUN_TRIBAL_WORKSHEETS["L1.2"];

  const handleGenerate = async (outcome) => {
    setSelectedOutcome(outcome);
    setIsGenerating(true);
    setFlippedCardIndex(null);

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

      pdf.save(`ShikshaSetu_NIPUN_${currentWorksheet.nipunCode}_${selectedLang}_${isTeacherMode ? 'TeacherKey' : 'StudentWorksheet'}.pdf`);
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
    <div>
      <div className="page-head">
        <div>
          <h1>{t.worksheets.title}</h1>
          <p>{t.worksheets.subtitle}</p>
        </div>
        <div className="actions">
          <div className="seg">
            {TRIBAL_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={selectedLang === lang.code ? 'active' : ''}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setWorksheetData(null);
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
          <div className="seg">
            <button className={activeTab === 'worksheet' ? 'active' : ''} onClick={() => setActiveTab('worksheet')}>
              {t.worksheets.worksheetView}
            </button>
            <button className={activeTab === 'flashcards' ? 'active' : ''} onClick={() => setActiveTab('flashcards')}>
              {t.worksheets.flashcardsView}
            </button>
          </div>
        </div>
      </div>

      <div className="two-col ws-grid">
        <div className="col-stack">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>NIPUN lakshya</h3>
            <div className="col-stack" style={{ maxHeight: 460, overflowY: 'auto', gap: 8 }}>
              {NIPUN_OUTCOMES_MATRIX.map((outcome) => {
                const isSelected = selectedOutcome.code === outcome.code;
                return (
                  <button
                    key={outcome.code}
                    onClick={() => handleGenerate(outcome)}
                    className={`item-btn ${isSelected ? 'on' : ''}`}
                  >
                    <div className="quiet">{outcome.code} · {outcome.grade}</div>
                    <div style={{ fontSize: 13, fontWeight: 650, marginTop: 2 }}>{outcome.lakshya}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <label className="quiet" style={{ display: 'block', marginBottom: 6 }}>School</label>
            <input className="field" type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
          </div>
        </div>

        {/* Right Column: Printable Worksheet / Flashcard View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'worksheet' && (
            <div
              className="card worksheet-printable-area"
              ref={worksheetRef}
              id="worksheet-print-area"
              style={{
                padding: '28px 32px',
                borderRadius: '24px',
                border: '1.5px solid #059669',
                boxShadow: '0 10px 30px -10px rgba(5, 150, 105, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.2)',
                backgroundColor: '#FFFFFF'
              }}
            >
              
              {/* Header Controls */}
              <div className="no-print page-head" style={{ borderBottom: '1px solid var(--border-medium)', paddingBottom: 14, marginBottom: 16 }}>
                <div>
                  <div className="quiet">{currentWorksheet.grade} · {currentWorksheet.nipunCode}</div>
                  <h2 className="card-title">{currentWorksheet.worksheetTitle}</h2>
                </div>
                <div className="actions">
                  <button onClick={() => setIsTeacherMode(!isTeacherMode)} className="btn-secondary">
                    {isTeacherMode ? 'Teacher key' : 'Student sheet'}
                  </button>
                  <button onClick={() => handleOpenIsl(currentWorksheet.outcomeTitle, currentWorksheet.outcomeTitle)} className="btn-ghost">ISL</button>
                  <button onClick={handlePrint} className="btn-secondary">
                    <Printer size={14} /> Print
                  </button>
                  <button onClick={exportPDF} disabled={isExporting} className="btn-primary">
                    <Download size={14} />
                    {isExporting ? 'PDF…' : 'PDF'}
                  </button>
                </div>
              </div>

              {/* Printable Institutional Header */}
              <div style={{
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                padding: '14px 18px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--green-primary)', textTransform: 'uppercase', marginBottom: '2px' }}>
                      ShikshaSetu MTB-MLE Programme · Government of Jharkhand
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                      NIPUN Bharat {currentWorksheet.nipunCode} — {activeLangObj.name} ({activeLangObj.script})
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {schoolName} · <strong>Competency:</strong> {currentWorksheet.outcomeTitle}
                    </div>
                  </div>
                  {isTeacherMode && (
                    <span className="badge-green">
                      TEACHER EVALUATION KEY
                    </span>
                  )}
                </div>
              </div>

              {/* Instructions Bar */}
              <div style={{
                padding: '10px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                color: 'var(--text-main)',
                marginBottom: '14px',
                fontWeight: '500'
              }}>
                <strong>ᱫᱤᱥᱟᱹ (Instructions):</strong> {currentWorksheet.instructions}
                {isTeacherMode && currentWorksheet.instructionsHindi && (
                  <div style={{ fontSize: '11px', color: 'var(--badge-blue-text)', marginTop: '2px', fontWeight: '600' }}>
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
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: '500',
                color: 'var(--text-sub)',
                marginBottom: '18px'
              }}>
                <span><strong>ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱧᱩᱛᱩᱢ (Student Name):</strong> _____________________</span>
                <span><strong>ᱪᱟᱱᱟᱪ (Class):</strong> {currentWorksheet.grade}</span>
                <span><strong>ᱢᱟᱹᱦᱤᱛ (Date):</strong> ____________</span>
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentWorksheet.questions.map((q, idx) => {
                  const promptTribal = q.prompt;
                  const promptRoman = q.roman;
                  const promptHindi = q.promptHindi;
                  const promptEnglish = q.promptEnglish;

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.5' }}>
                          <span style={{ color: 'var(--green-primary)', marginRight: '8px' }}>Q{idx + 1}.</span>
                          <span>{promptTribal}</span>
                        </div>
                        {promptRoman && (
                          <div style={{ fontSize: '12px', color: 'var(--green-primary)', fontWeight: '600', fontStyle: 'italic', marginTop: '2px', marginLeft: '26px' }}>
                            ({promptRoman})
                          </div>
                        )}

                        {isTeacherMode && (
                          <div style={{
                            marginTop: '8px',
                            marginLeft: '26px',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--badge-blue-bg)',
                            border: '1px solid var(--badge-blue-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            fontSize: '12px'
                          }}>
                            <div style={{ color: 'var(--badge-blue-text)', fontWeight: '600' }}>
                              <strong>हिंदी अनुवाद:</strong> {promptHindi || '—'}
                            </div>
                            {promptEnglish && (
                              <div style={{ color: 'var(--text-sub)' }}>
                                <strong>English:</strong> {promptEnglish}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Options */}
                      {q.options && q.options.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginLeft: '26px' }}>
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
                                  padding: '8px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: isTeacherMode && isCorrect ? 'var(--badge-green-bg)' : 'var(--bg-subtle)',
                                  border: isTeacherMode && isCorrect ? '1.5px solid var(--green-primary)' : '1px solid var(--border-medium)',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: 'var(--text-main)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    border: isTeacherMode && isCorrect ? '2px solid var(--green-primary)' : '1.5px solid var(--border-dark)',
                                    backgroundColor: isTeacherMode && isCorrect ? 'var(--green-primary)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFFFFF',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    flexShrink: 0
                                  }}>
                                    {isTeacherMode && isCorrect ? '✓' : ''}
                                  </span>
                                  <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                                      {optTribal}
                                    </div>
                                    {optRoman && (
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                        ({optRoman})
                                      </div>
                                    )}
                                    {isTeacherMode && (optHindi || optEnglish) && (
                                      <div style={{ fontSize: '11px', color: isCorrect ? 'var(--badge-green-text)' : 'var(--text-muted)', fontWeight: '600', marginTop: '2px' }}>
                                        {optHindi} {optEnglish ? `· ${optEnglish}` : ''}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {isTeacherMode && isCorrect && (
                                  <span className="badge-green" style={{ fontSize: '9px', padding: '1px 6px' }}>
                                    ✓ Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ marginLeft: '26px' }}>
                          <div style={{
                            minHeight: '32px',
                            borderBottom: '1px dashed var(--border-dark)',
                            marginTop: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '6px',
                            color: 'var(--green-primary)',
                            fontWeight: '700',
                            fontSize: '13px'
                          }}>
                            {isTeacherMode ? `✓ Answer: ${q.answer} (${q.answerHindi || ''})` : ''}
                          </div>
                        </div>
                      )}

                      {/* Pedagogy Note Box */}
                      {isTeacherMode && (
                        <div style={{
                          marginTop: '10px',
                          marginLeft: '26px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--badge-amber-bg)',
                          border: '1px solid var(--badge-amber-border)',
                          fontSize: '11px',
                          color: 'var(--badge-amber-text)',
                          fontWeight: '600'
                        }}>
                          <strong>शिक्षक मूल्यांकन मार्गदर्शन (Pedagogy Note):</strong> {q.pedagogyNote || `Assesses NIPUN competency ${currentWorksheet.nipunCode}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* PDF Footer */}
              <div style={{
                marginTop: '20px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-medium)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>Government of Jharkhand · ShikshaSetu MTB-MLE Programme</span>
                <span>NIPUN Bharat FLN Alignment · {activeLangObj.name} ({activeLangObj.script})</span>
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>{activeLangObj.name} Flashcards</h3>
                  <div className="quiet" style={{ fontSize: 12, marginTop: 2 }}>Interactive vocabulary deck with audio pronunciation</div>
                </div>
                <span className="badge-blue" style={{ fontSize: 11, fontWeight: 700 }}>{currentWorksheet.flashcards.length} Cards Deck</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '14px' }}>
                {currentWorksheet.flashcards.map((card, idx) => {
                  const isFlipped = flippedCardIndex === idx;
                  const scheme = FLASHCARD_COLOR_SCHEMES[idx % FLASHCARD_COLOR_SCHEMES.length];

                  return (
                    <div
                      key={idx}
                      onClick={() => setFlippedCardIndex(isFlipped ? null : idx)}
                      style={{
                        height: '165px',
                        borderRadius: '14px',
                        padding: '16px',
                        backgroundColor: isFlipped ? '#FFFFFF' : scheme.bg,
                        border: isFlipped ? '2px solid var(--green-primary)' : `1.5px solid ${scheme.border}`,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        boxShadow: isFlipped ? 'var(--shadow-md)' : 'var(--shadow-xs)'
                      }}
                    >
                      <span className={scheme.badgeClass} style={{ fontSize: '9px', textTransform: 'uppercase', padding: '2px 8px' }}>
                        {card.category} · {isFlipped ? 'Hindi' : activeLangObj.name}
                      </span>

                      {!isFlipped ? (
                        <div>
                          <div style={{ fontSize: '24px', fontWeight: '800', color: scheme.text, marginBottom: '2px' }}>
                            {card.front}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: scheme.subText }}>
                            ("{card.roman}")
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
                            {card.back}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {activeLangObj.name}: {card.front}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                        <AudioPlayButton
                          text={card.roman || card.front}
                          size="sm"
                          showStop={false}
                          label="Listen"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

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
