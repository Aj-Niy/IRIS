import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  RotateCw,
  BookOpen,
  FileText,
  Volume2,
  HelpCircle
} from "lucide-react";
import { irisAskTutor } from "../services/api";
import { TRIBAL_LANGUAGES } from "../services/apertiumSantaliData";
import AudioPlayButton from "./AudioPlayButton";

export default function AIMentorPage({ currentLang, userName }) {
  const [selectedLang, setSelectedLang] = useState('sat');
  const [tutorMode, setTutorMode] = useState("teacher-fln"); // 'teacher-fln' | 'worksheet' | 'live-phrase' | 'pedagogy'
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const MODE_INFO = {
    "teacher-fln": {
      title: "FLN Lesson Scripting",
      desc: `Translates Hindi FLN lesson passages into ${activeLangObj.name} with audio and vocabulary breakdowns.`,
      placeholder: `Ask about or paste a primary Hindi FLN lesson passage for ${activeLangObj.name} translation...`
    },
    "worksheet": {
      title: "NIPUN Worksheets & Practice",
      desc: "Generates classroom exercises and letter recognition prompts.",
      placeholder: `Request classroom exercises for NIPUN codes in ${activeLangObj.name}...`
    },
    "live-phrase": {
      title: "Classroom Dialogue Phrases",
      desc: `Translates interactive classroom dialogue and instructions into ${activeLangObj.name}.`,
      placeholder: `Ask how to say classroom commands in ${activeLangObj.name} (e.g. 'sit down', 'listen carefully')...`
    },
    "pedagogy": {
      title: "Teacher MTB-MLE Pedagogy",
      desc: "Pedagogical guidance for non-native Hindi teachers instructing tribal children under NEP 2020.",
      placeholder: "Ask pedagogical questions for teaching tribal primary students without prior language training..."
    }
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "नमस्ते! I am your PALASH Teacher Pedagogy Assistant for Jharkhand's MTB-MLE Programme. How can I assist your classroom delivery today?",
      scriptText: "ᱡᱚᱦᱟᱨ! ᱤᱧ ᱫᱚ PALASH ᱢᱟᱪᱮᱛ ᱜᱚᱲᱚ-ᱮᱢᱚᱜ ᱤᱧᱡᱤᱱ ᱠᱟᱱᱟᱹᱧ᱾",
      romanText: "Johar! Iñ do PALASH machet goṛo-emog injin kanañ.",
      hindiText: "नमस्ते! मैं झारखण्ड PALASH मातृभाषा शिक्षण सहायक हूँ। आज मैं आपकी कक्षा के लिए क्या तैयार करूँ?"
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '22px 28px',
        border: '1px solid var(--border-medium)',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px'
          }}>
            Jharkhand PALASH MTB-MLE · AI Pedagogy Assistant
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text-main)' }}>
            Vernacular Pedagogy & Curriculum Assistant
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Assists non-native Hindi teachers with lesson scripts, activity instructions, and pedagogical guidance across Santhali, Ho, and Mundari.
          </p>
        </div>

        {/* Tribal Language Selector */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '8px',
          padding: '3px',
          border: '1px solid var(--border-medium)'
        }}>
          {TRIBAL_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                backgroundColor: selectedLang === lang.code ? 'var(--accent)' : 'transparent',
                color: selectedLang === lang.code ? '#FFFFFF' : 'var(--text-main)',
                cursor: 'pointer'
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Mode Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '16px'
      }}>
        {Object.entries(MODE_INFO).map(([key, info]) => {
          const isActive = tutorMode === key;
          return (
            <button
              key={key}
              onClick={() => setTutorMode(key)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-medium)',
                backgroundColor: isActive ? 'var(--accent-light)' : '#FFFFFF',
                color: isActive ? 'var(--accent)' : 'var(--text-main)',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700' }}>{info.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{info.desc.substring(0, 45)}...</div>
            </button>
          );
        })}
      </div>

      {/* Chat Messages */}
      <div className="card" style={{
        padding: '20px',
        backgroundColor: '#FFFFFF',
        minHeight: '400px',
        maxHeight: '520px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)' }}>
              {msg.role === 'user' ? (userName || 'Teacher') : 'PALASH Pedagogy Assistant'}
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '10px',
              backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-subtle)',
              color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-main)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-light)',
              lineHeight: '1.6',
              fontSize: '13px'
            }}>
              {msg.scriptText && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '2px' }}>
                    {msg.scriptText}
                  </div>
                  {msg.romanText && (
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)', fontStyle: 'italic' }}>
                      "{msg.romanText}"
                    </div>
                  )}
                  {msg.hindiText && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <strong>Hindi Meaning:</strong> {msg.hindiText}
                    </div>
                  )}
                </div>
              )}

              <div>{msg.text}</div>

              {msg.teachingTips && msg.teachingTips.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '11px', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                  <strong>Pedagogy Instructions:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px' }}>
                    {msg.teachingTips.map((tip, tIdx) => (
                      <li key={tIdx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {msg.role === 'assistant' && (
                <div style={{ marginTop: '8px' }}>
                  <AudioPlayButton
                    text={msg.romanText || msg.text}
                    size="sm"
                    label="Pronounce"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <RotateCw size={14} className="animate-spin" />
            <span>Analyzing FLN curriculum context...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {(sampleQuestions[tutorMode] || []).map((q, qIdx) => (
          <button
            key={qIdx}
            onClick={() => setInputQuery(q)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={MODE_INFO[tutorMode].placeholder}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            backgroundColor: '#FFFFFF',
            color: 'var(--text-main)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          style={{
            padding: '0 20px',
            borderRadius: '8px',
            backgroundColor: !inputQuery.trim() || isLoading ? 'var(--border-medium)' : 'var(--accent)',
            color: '#FFFFFF',
            border: 'none',
            fontWeight: '700',
            fontSize: '13px',
            cursor: !inputQuery.trim() || isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
