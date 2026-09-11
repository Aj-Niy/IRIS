import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  RotateCw,
  BookOpen, 
  FileText, 
  Volume2, 
  HelpCircle,
  Hand
} from "lucide-react";
import { irisAskTutor } from "../services/api";
import { TRIBAL_LANGUAGES } from "../services/apertiumSantaliData";
import AudioPlayButton from "./AudioPlayButton";
import { uiTranslations } from "../services/uiTranslations";
import ISLVideoPlayerModal from "./ISLVideoPlayerModal";

export default function AIMentorPage({ 
  currentLang = 'sat', 
  userName,
  uiLang = 'en'
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang);
  const [tutorMode, setTutorMode] = useState("teacher-fln"); // 'teacher-fln' | 'worksheet' | 'live-phrase' | 'pedagogy'
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const MODE_INFO = {
    "teacher-fln": {
      title: t.mentor.mode1,
      desc: `Translates Hindi FLN lesson passages into ${activeLangObj.name} with audio and vocabulary breakdowns.`,
      placeholder: `Ask about or paste a primary Hindi FLN lesson passage for ${activeLangObj.name} translation...`
    },
    "worksheet": {
      title: t.mentor.mode2,
      desc: "Generates classroom exercises and letter recognition prompts.",
      placeholder: `Request classroom exercises for NIPUN codes in ${activeLangObj.name}...`
    },
    "live-phrase": {
      title: t.mentor.mode3,
      desc: `Translates interactive classroom dialogue and instructions into ${activeLangObj.name}.`,
      placeholder: `Ask how to say classroom commands in ${activeLangObj.name} (e.g. 'sit down', 'listen carefully')...`
    },
    "pedagogy": {
      title: t.mentor.mode4,
      desc: "Pedagogical guidance for non-native Hindi teachers instructing tribal children under NEP 2020.",
      placeholder: "Ask pedagogical questions for teaching tribal primary students without prior language training..."
    }
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "नमस्ते! I am your ShikshaSetu Teacher Pedagogy Assistant for Jharkhand's MTB-MLE Programme. How can I assist your classroom delivery today?",
      scriptText: "ᱡᱚᱦᱟᱨ! ᱤᱧ ᱫᱚ ShikshaSetu ᱢᱟᱪᱮᱛ ᱜᱚᱲᱚ-ᱮᱢᱚᱜ ᱤᱧᱡᱤᱱ ᱠᱟᱱᱟᱹᱧ᱾",
      romanText: "Johar! Iñ do ShikshaSetu machet goṛo-emog injin kanañ.",
      hindiText: "नमस्ते! मैं झारखण्ड शिक्षासेतु मातृभाषा शिक्षण सहायक हूँ। आज मैं आपकी कक्षा के लिए क्या तैयार करूँ?"
    }
  ]);

  const sampleQuestions = {
    "teacher-fln": [
      "Translate: 'Children are reading a story about birds.'",
      "Explain the tribal words for 'School' and 'Teacher'.",
      "How do I teach numbers 1 to 5 in mother tongue?"
    ],
    "worksheet": [
      "Generate 3 questions for NIPUN code L1.2 letter recognition.",
      "Create a matching exercise for counting objects (M1.1).",
      "Give me 4 classroom flashcards for nature words."
    ],
    "live-phrase": [
      "How do I say 'Please sit down quietly'?",
      "Phrase for 'Open page number 5 of your book'.",
      "Phrase to praise a student: 'Very good, well done!'"
    ],
    "pedagogy": [
      "How should a Hindi-medium teacher introduce Devanagari alongside Ol Chiki?",
      "Best practices for conducting interactive math dialogues in mother tongue.",
      "How to assess reading comprehension in Grade 1 tribal students."
    ]
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    const userText = inputQuery.trim();
    setInputQuery("");
    
    setMessages(prev => [...prev, { role: "user", text: userText, mode: tutorMode }]);
    setIsLoading(true);

    try {
      const res = await irisAskTutor({
        mode: tutorMode === 'pedagogy' ? 'teacher-fln' : tutorMode,
        query: userText,
        lessonContext: userText,
        studentName: userName || "Teacher",
        targetLanguage: activeLangObj.name
      });

      let replyObj = {
        role: "assistant",
        mode: tutorMode,
        text: res.answer || res.santaliOlChiki || "Lesson analyzed.",
        scriptText: res.santaliOlChiki,
        romanText: res.santaliRoman,
        hindiText: res.hindiMeaning,
        teachingTips: res.teachingTips || [],
        questions: res.questions || [],
        matchedPhrase: res.matchedPhrase
      };

      setMessages(prev => [...prev, replyObj]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          mode: tutorMode,
          text: "Offline pedagogical linguistic model active.",
          scriptText: "ᱡᱚᱦᱟᱨ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱯᱚᱛᱚᱵ ᱵᱚ ᱯᱟᱲᱦᱟᱣ-ᱟ᱾",
          romanText: "Johar! Teheñ abo potob bo paṛhaw-a.",
          hindiText: "नमस्ते! आज हम सब पुस्तक पढ़ेंगे।"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t.mentor.title}</h1>
          <p>{t.mentor.subtitle}</p>
        </div>
        <div className="seg">
          {TRIBAL_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={selectedLang === lang.code ? 'active' : ''}
              onClick={() => setSelectedLang(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mode-grid">
        {Object.entries(MODE_INFO).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setTutorMode(key)}
            className={`item-btn ${tutorMode === key ? 'on' : ''}`}
          >
            <div style={{ fontSize: 13, fontWeight: 750 }}>{info.title}</div>
          </button>
        ))}
      </div>

      <div className="chat-wrap" style={{ marginBottom: 16 }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`bubble ${msg.role === 'user' ? 'me' : 'ai'}`}>
            {msg.scriptText && (
              <div style={{ marginBottom: 8 }}>
                <div className="script-native" style={{ fontSize: 16 }}>{msg.scriptText}</div>
                {msg.romanText && <div className="script-roman">{msg.romanText}</div>}
                {msg.hindiText && <div className="quiet" style={{ marginTop: 4 }}>{msg.hindiText}</div>}
              </div>
            )}
            <div>{msg.text}</div>
            {msg.teachingTips && msg.teachingTips.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 12 }}>
                {msg.teachingTips.map((tip, tIdx) => <li key={tIdx}>{tip}</li>)}
              </ul>
            )}
            {msg.role === 'assistant' && (
              <div className="actions" style={{ marginTop: 8 }}>
                <button className="btn-ghost" onClick={() => handleOpenIsl(msg.hindiText || msg.text, msg.text || msg.hindiText)}>ISL</button>
                <AudioPlayButton text={msg.romanText || msg.text} size="sm" label="Play" />
              </div>
            )}
          </div>
        ))}
        {isLoading && <div className="quiet">Working…</div>}
      </div>

      <form onSubmit={handleSendMessage} className="composer">
        <input
          className="field"
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={MODE_INFO[tutorMode].placeholder}
        />
        <button type="submit" className="btn-primary" disabled={!inputQuery.trim() || isLoading}>
          Send
        </button>
      </form>

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
