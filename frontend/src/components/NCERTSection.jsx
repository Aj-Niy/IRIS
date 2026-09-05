import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen, Hand, Download, Play, CheckCircle2, HelpCircle, Sparkles,
  ChevronRight, ChevronDown, Atom, Beaker, Dna, Binary, Calculator,
  BrainCircuit, Volume2, Globe, MessageSquare, Send, Lightbulb,
  Eye, Headphones, Video, CheckCheck, Lock, Star, Mic, X, Film
} from 'lucide-react';
import jsPDF from 'jspdf';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';
import { askTutor, translateText, askNcertTutor } from '../services/api';
import { startListening, speakText } from './speechUtils';
import { videoService } from '../services/supabaseClient';
import { NCERT_CHAPTERS, STEM_MOCK_DATA, HINTS } from './ncertData';
import { uiTranslations } from '../services/uiTranslations';

// Helper to render subject icons dynamically
const getSubjectIcon = (subject, size = 15) => {
  switch (subject) {
    case 'cs': return <Binary size={size} />;
    case 'maths': return <Calculator size={size} />;
    case 'science': return <Atom size={size} />;
    case 'english': return <BookOpen size={size} />;
    default: return <BookOpen size={size} />;
  }
};

// Helper to map language codes to locale codes for Speech Synthesis
const getLocaleCode = (shortCode) => {
  const localeMap = {
    hi: 'hi-IN',
    en: 'en-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    kn: 'kn-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    gu: 'gu-IN'
  };
  return localeMap[shortCode] || 'en-IN';
};

const LANG_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'मराठी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function NCERTSection({ 
  setCurrentTab, 
  setSelectedProject,
  uiLang = 'en'
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedGrade, setSelectedGrade] = useState('8');
  const [selectedStem, setSelectedStem] = useState('cs');
  const [selectedChap, setSelectedChap] = useState(null);

  const [chatLang, setChatLang] = useState(uiLang === 'hi' ? 'hi' : 'en');
  const [completedChapters, setCompletedChapters] = useState(() => {
    const saved = localStorage.getItem('cs_completed');
    return saved ? JSON.parse(saved) : [];
  });

  // ISL Modal
  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [activeConcept, setActiveConcept] = useState('');

  // Generated Video Modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalData, setVideoModalData] = useState(null);

  // Socratic hint state
  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // STEM summary state
  const [stemSummary, setStemSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Chatbot state
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: '🙏 Namaste! I am your PALASH Curriculum AI Mentor. Select a chapter or STEM branch above, then ask me anything — I will guide you Socratically!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (chatMessages && chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Cancel speech on chapter, grade, or subject switch
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  }, [selectedChap, selectedGrade, selectedStem]);

  // Auto-switch subject when selected grade doesn't support the current subject
  useEffect(() => {
    if (selectedGrade !== 'all') {
      const hasChapters = NCERT_CHAPTERS.some(c => c.grade === selectedGrade && c.subject === selectedStem);
      if (!hasChapters) {
        const availableChap = NCERT_CHAPTERS.find(c => c.grade === selectedGrade);
        if (availableChap) {
          setSelectedStem(availableChap.subject);
        }
      }
    }
  }, [selectedGrade]);

  const filteredChapters = NCERT_CHAPTERS.filter(c =>
    (c.grade === selectedGrade || selectedGrade === 'all') && c.subject === selectedStem
  );

  const stemInfo = STEM_MOCK_DATA[selectedStem] || { name: '', color: '#000', bgColor: '#fff', grades: {} };
  const gradeData = stemInfo?.grades?.[selectedGrade];

  // ── Mark chapter complete ──
  const markComplete = (chapId) => {
    const updated = completedChapters.includes(chapId)
      ? completedChapters.filter(id => id !== chapId)
      : [...completedChapters, chapId];
    setCompletedChapters(updated);
    localStorage.setItem('cs_completed', JSON.stringify(updated));
  };

  // ── PDF download ──
  const handleDownloadPdf = (chap) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(200, 75, 36);
    doc.text(`NCERT Class ${chap.grade} — ${chap.number}`, 20, 20);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.text(chap.title, 20, 30);
    doc.setLineWidth(0.4);
    doc.line(20, 35, 190, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Summary: ${chap.description}`, 20, 45, { maxWidth: 170 });
    doc.setFont('helvetica', 'bold');
    doc.text('Key Topics:', 20, 62);
    doc.setFont('helvetica', 'normal');
    let y = 70;
    chap.topics.forEach(t => { doc.text(`  • ${t}`, 20, y); y += 7; });
    doc.setFont('helvetica', 'bold');
    doc.text('Real-World Analogy:', 20, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(chap.analogy, 20, y + 13, { maxWidth: 170 });
    doc.save(`NCERT_Class${chap.grade}_${chap.number.replace(' ', '_')}.pdf`);
  };

  // ── STEM AI Summary ──
  const generateStemSummary = async () => {
    if (!gradeData) return;
    setIsSummarizing(true);
    setStemSummary('');
    const prompt = `You are a Socratic AI tutor. Summarize in 3 short paragraphs (simple, engaging, Class ${selectedGrade} level) the topic: "${stemInfo.name} for Class ${selectedGrade}". Overview: ${gradeData.overview}. Include these key points: ${gradeData.keyPoints.join(', ')}. End with one real-world connection.`;
    try {
      const res = await askTutor(prompt, 'Student');
      setStemSummary(res?.answer || res?.reply || res?.response || gradeData.overview);
    } catch {
      setStemSummary(gradeData.overview + '\n\n📌 Key Points:\n• ' + gradeData.keyPoints.join('\n• ') + '\n\n🌍 Real World: ' + gradeData.realWorld);
    } finally {
      setIsSummarizing(false);
    }
  };

  // ── Chatbot send ──
  const handleSendChat = async (e) => {
    e?.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;
    setChatInput('');
    setIsChatLoading(true);
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);

    const context = selectedChap
      ? `The student is studying: ${selectedChap.title} (Class ${selectedChap.grade} ${stemInfo?.name}). `
      : selectedStem
        ? `The student is interested in: ${stemInfo?.name} for Class ${selectedGrade}. `
        : '';

    const prompt = `${context}Student asks: "${msg}". Respond in a Socratic way — guide with questions and hints rather than giving direct answers. Keep it simple for Class 8-12.`;
    try {
      const res = await askNcertTutor(msg, context || `NCERT Class ${selectedGrade} ${stemInfo?.name}`, 'Student');
      let reply = res?.answer || res?.reply || res?.response || '';
      if (!reply) reply = `Great question! 🤔 Think about: what do you already know about ${selectedChap?.title || stemInfo?.name || 'this topic'}? Let's break it down step by step.`;

      if (chatLang !== 'en' && reply) {
        try {
          const trans = await translateText(reply, chatLang, 'Student');
          reply = trans?.translatedText || reply;
        } catch { /* use English fallback */ }
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      const fallback = `Great question! Let me help you think through it. What do you already know about ${selectedChap?.title || stemInfo?.name || 'this'}? Can you relate it to something from daily life?`;
      setChatMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Global Speech playback (with Play/Pause/Resume functionality) ──
  const handleGlobalSpeakToggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlayingSpeech) {
      if (isPausedSpeech) {
        synth.resume();
        setIsPausedSpeech(false);
      } else {
        synth.pause();
        setIsPausedSpeech(true);
      }
    } else {
      synth.cancel();
      let textToRead = '';
      if (selectedChap) {
        textToRead = `${selectedChap.title}. Summary: ${selectedChap.description}. Analogy: ${selectedChap.analogy}. Common pitfall: ${selectedChap.pitfalls}. Challenge: ${selectedChap.challenge}`;
      } else if (gradeData) {
        textToRead = `${stemInfo.name} for Class ${selectedGrade === 'all' ? '8 to 12' : selectedGrade}. ${gradeData.overview}. Key points: ${gradeData.keyPoints.join('. ')}. Real world: ${gradeData.realWorld}`;
      } else {
        textToRead = `Please select a chapter or subject to listen to.`;
      }

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = getLocaleCode(chatLang);
      
      utterance.onend = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };
      
      utterance.onerror = () => {
        setIsPlayingSpeech(false);
        setIsPausedSpeech(false);
      };

      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
      synth.speak(utterance);
    }
  };

  // ── Global ISL trigger ──
  const handleGlobalIslTrigger = () => {
    const concept = selectedChap ? selectedChap.title : `${stemInfo.name} Class ${selectedGrade}`;
    setActiveConcept(concept);
    setIsIslModalOpen(true);
  };

  // ── NotebookLM-style source summarization chatbot trigger ──
  const handleSummarizeSourceChat = async () => {
    setIsChatLoading(true);
    const sourceTitle = selectedChap ? selectedChap.title : `${stemInfo?.name} Class ${selectedGrade}`;
    const sourceContext = selectedChap
      ? `Chapter: ${selectedChap.title}. Description: ${selectedChap.description}. Analogy: ${selectedChap.analogy}. Key Topics: ${selectedChap.topics.join(', ')}.`
      : `${stemInfo?.name} for Class ${selectedGrade}. Overview: ${gradeData?.overview}. Key Points: ${gradeData?.keyPoints?.join(', ')}.`;

    setChatMessages(prev => [...prev, { role: 'user', text: `✨ Summarize the source: ${sourceTitle}` }]);

    const prompt = `You are a Socratic AI Mentor. Provide a structured, engaging, and easy-to-understand summary of this source content for a student:
${sourceContext}
Use simple language, bold key terms, and end with a quick quiz question to check understanding.`;

    try {
      const res = await askNcertTutor(prompt, `Source: ${sourceTitle}`, 'Student');
      let reply = res?.answer || res?.reply || res?.response || '';
      if (!reply) reply = `Here is a quick summary of **${sourceTitle}**: It covers key concepts including ${selectedChap ? selectedChap.topics.join(', ') : gradeData?.keyPoints?.join(', ')}. Try to relate it to daily life!`;

      if (chatLang !== 'en' && reply) {
        try {
          const trans = await translateText(reply, chatLang, 'Student');
          reply = trans?.translatedText || reply;
        } catch { /* use English fallback */ }
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      const fallback = `Here is the summary of **${sourceTitle}**: It is focused on building foundational understanding. What specific part would you like to discuss?`;
      setChatMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Get Hint ──
  const getNextHint = () => {
    const hints = HINTS[selectedStem] || HINTS.cs;
    setShowHint(true);
    setHintIndex(prev => (prev + 1) % hints.length);
  };

  // ─────── RENDER ───────
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px 80px' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <div className="pill-badge" style={{ marginBottom: '8px' }}>
          <BookOpen size={14} />
          <span>{t.ncert.badge}</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
          {t.ncert.title}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          {t.ncert.subtitle}
        </p>
      </div>

      {/* ── Top Controls Row: Grade + STEM branch tabs + Mode switcher ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>

        {/* Grade tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          backgroundColor: 'var(--bg-card)', padding: '4px',
          borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)'
        }}>
          {['8', '9', '10', '11', '12', 'all'].map(g => (
            <button key={g} onClick={() => { setSelectedGrade(g); setSelectedChap(null); setStemSummary(''); }}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                fontSize: '12px', fontWeight: '700',
                backgroundColor: selectedGrade === g ? 'var(--accent)' : 'transparent',
                color: selectedGrade === g ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.15s'
              }}>
              {g === 'all' ? 'All' : `Cl ${g}`}
            </button>
          ))}
        </div>

        {/* STEM branch pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(STEM_MOCK_DATA).map(([key, branch]) => {
            const isSelected = selectedStem === key;
            return (
              <button key={key}
                onClick={() => { setSelectedStem(key); setSelectedChap(null); setStemSummary(''); setHintIndex(0); setShowHint(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: branch.highlight ? '6px 14px' : '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px', fontWeight: isSelected ? '800' : '600',
                  backgroundColor: isSelected ? branch.color : (branch.highlight ? 'rgba(235,94,40,0.07)' : 'var(--bg-card)'),
                  color: isSelected ? '#fff' : branch.color,
                  border: branch.highlight
                    ? `${isSelected ? '2px solid' : '1.5px dashed'} ${branch.color}`
                    : `1px solid ${isSelected ? branch.color : 'var(--border-light)'}`,
                  transition: 'all 0.2s',
                  boxShadow: branch.highlight ? '0 2px 8px rgba(235,94,40,0.15)' : 'none'
                }}>
                {getSubjectIcon(key)}
                <span>{branch.name}</span>
                {branch.highlight && <span style={{
                  fontSize: '8px', backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : branch.color,
                  color: '#fff', padding: '1px 5px', borderRadius: 'var(--radius-full)', fontWeight: '900'
                }}>CORE</span>}
              </button>
            );
          })}

          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-medium)', margin: '0 6px' }} />

          {/* Audio Reader button */}
          <button onClick={handleGlobalSpeakToggle}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '12px', fontWeight: '700',
              backgroundColor: isPlayingSpeech ? (isPausedSpeech ? '#FEF3C7' : '#DCFCE7') : 'var(--bg-card)',
              color: isPlayingSpeech ? (isPausedSpeech ? '#92400E' : '#15803D') : 'var(--text-muted)',
              border: `1px solid ${isPlayingSpeech ? (isPausedSpeech ? '#FCD34D' : '#86EFAC') : 'var(--border-medium)'}`,
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
            <Volume2 size={13} style={{ animation: isPlayingSpeech && !isPausedSpeech ? 'pulse 1.5s infinite' : 'none' }} />
            <span>{isPlayingSpeech ? (isPausedSpeech ? '▶ Resume' : '⏸ Pause') : '🔊 Listen'}</span>
          </button>

          {/* ISL Guide button */}
          <button onClick={handleGlobalIslTrigger}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 12px', borderRadius: 'var(--radius-full)',
              fontSize: '12px', fontWeight: '700',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}>
            <Hand size={13} color="#D97706" />
            <span>ISL Guide</span>
          </button>
        </div>


      </div>

      {/* ── UPPER SECTION: Chapters (left) + STEM Summary (right) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', marginBottom: '28px', alignItems: 'start' }}>

        {/* Chapter List */}
        <div>
          {/* STEM overview strip */}
          {gradeData && (
            <div style={{
              backgroundColor: stemInfo.highlight ? 'var(--accent-light)' : stemInfo.bgColor,
              border: `1px solid ${stemInfo.highlight ? 'var(--accent-border)' : stemInfo.color}30`,
              borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: stemInfo.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {stemInfo.name} · Class {selectedGrade === 'all' ? '8–12' : selectedGrade} Overview
                  </span>
                  {selectedStem === 'cs' && setCurrentTab && (
                    <button
                      onClick={() => setCurrentTab('coding-workspace')}
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--accent)',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="Open Interactive Coding Sandbox & Practice"
                    >
                      Open Coding Sandbox 💻
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>
                  {gradeData.overview}
                </p>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: stemInfo.color + '20', color: stemInfo.color }}>
                {getSubjectIcon(selectedStem, 18)}
              </div>
            </div>
          )}

          {/* Chapter cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredChapters.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-faint)', fontSize: '14px' }}>
                📚 No chapters available for {stemInfo?.name} in Class {selectedGrade}.<br />
                <span style={{ fontSize: '12px' }}>Try switching to Computer Science or All Grades.</span>
              </div>
            )}
            {filteredChapters.map((chap) => {
              const isDone = completedChapters.includes(chap.id);
              const isOpen = selectedChap?.id === chap.id;
              return (
                <div key={chap.id} className="card" style={{
                  padding: '0', overflow: 'hidden',
                  border: isOpen ? '1.5px solid var(--accent)' : isDone ? '1px solid #86EFAC' : '1px solid var(--border-light)',
                  boxShadow: isOpen ? '0 0 0 2px var(--accent-border)' : 'var(--shadow-sm)'
                }}>
                  {/* Chapter header row */}
                  <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => { setSelectedChap(isOpen ? null : chap); setHintIndex(0); setShowHint(false); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {/* Complete indicator */}
                      <div onClick={(e) => { e.stopPropagation(); markComplete(chap.id); }}
                        style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          border: isDone ? 'none' : '2px solid var(--border-medium)',
                          backgroundColor: isDone ? '#22C55E' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                        {isDone && <CheckCheck size={12} color="#fff" />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)' }}>{chap.number}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Class {chap.grade}</span>
                          {chap.islAvailable && <span style={{ fontSize: '9px', backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: '700' }}>ISL ✓</span>}
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{chap.title}</h3>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        setVideoModalData({
                          title: chap.title,
                          grade: chap.grade,
                          subject: chap.subject,
                          langCode: chatLang
                        });
                        setIsVideoModalOpen(true);
                      }}
                        style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(200,75,36,0.1)', border: '1px solid rgba(200,75,36,0.3)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', cursor: 'pointer' }}>
                        <Video size={11} color="var(--accent)" /> Video
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDownloadPdf(chap); }}
                        style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Download size={11} /> PDF
                      </button>
                      {chap.islAvailable && (
                        <button onClick={(e) => { e.stopPropagation(); setActiveConcept(chap.title); setIsIslModalOpen(true); }}
                          style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: '600', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', display: 'flex', alignItems: 'center', gap: '4px', color: '#92400E' }}>
                          <Hand size={11} color="#D97706" /> ISL
                        </button>
                      )}
                      <div style={{ color: 'var(--text-faint)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded: 5-layer reading view */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border-light)', padding: '20px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>{chap.description}</p>

                      {/* Topic pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                        {chap.topics.map((t, i) => (
                          <span key={i} style={{ fontSize: '11px', backgroundColor: 'var(--bg-subtle)', padding: '3px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>{t}</span>
                        ))}
                      </div>

                      {/* 5-layer grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        {[
                          { label: '🎭 Analogy', content: chap.analogy, color: '#EFF6FF', border: '#BFDBFE' },
                          { label: '📐 Syntax / Formula', content: chap.syntax, color: '#F5F3FF', border: '#C4B5FD', mono: true },
                          { label: '💻 Code Example', content: chap.codeExample, color: '#F0FDF4', border: '#86EFAC', mono: true },
                          { label: '⚠️ Common Pitfalls', content: chap.pitfalls, color: '#FEF9C3', border: '#FDE68A' },
                        ].map((layer, i) => (
                          <div key={i} style={{ backgroundColor: layer.color, border: `1px solid ${layer.border}`, borderRadius: 'var(--radius-md)', padding: '12px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '800', marginBottom: '6px', color: '#374151' }}>{layer.label}</div>
                            <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#1F2937', fontFamily: layer.mono ? 'monospace' : 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{layer.content}</div>
                          </div>
                        ))}
                      </div>

                      {/* Challenge */}
                      <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#C2410C', marginBottom: '6px' }}>🏆 Practice Challenge</div>
                        <div style={{ fontSize: '13px', color: '#1F2937', fontWeight: '600' }}>{chap.challenge}</div>
                      </div>

                      {/* Mark complete */}
                      <button onClick={() => markComplete(chap.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                          borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: '700',
                          backgroundColor: isDone ? '#DCFCE7' : 'var(--accent)', border: isDone ? '1px solid #86EFAC' : 'none',
                          color: isDone ? '#166534' : '#fff', cursor: 'pointer', marginTop: '8px'
                        }}>
                        {isDone ? <><CheckCircle2 size={14} /> Marked Complete ✓</> : <><Star size={14} /> Mark as Complete</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEM Summary Sidebar */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Branch overview card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <BrainCircuit size={18} color={stemInfo.color} />
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>{stemInfo.name} AI Lab</h3>
            </div>

            {gradeData ? (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Key Points</div>
                  {gradeData.keyPoints.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', marginBottom: '5px', color: 'var(--text-main)' }}>
                      <span style={{ color: stemInfo.color, flexShrink: 0, marginTop: '2px' }}>▸</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '10px 12px', marginBottom: '12px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: '4px' }}>🌍 Real World</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{gradeData.realWorld}</p>
                </div>

                <button
                  onClick={() => {
                    setVideoModalData({
                      title: selectedChap?.title || `${stemInfo.name} AI Video Explanation`,
                      grade: selectedGrade === 'all' ? '8' : selectedGrade,
                      subject: stemInfo.name,
                      langCode: chatLang
                    });
                    setIsVideoModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: 'linear-gradient(135deg, var(--accent) 0%, #E55322 100%)',
                    boxShadow: '0 4px 12px rgba(200,75,36,0.25)',
                    borderRadius: 'var(--radius-md)', border: 'none', color: '#fff', fontWeight: '700',
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}>
                  <Video size={16} />
                  <span>🎬 AI-Video Lesson Class {selectedGrade === 'all' ? '8-12' : selectedGrade}</span>
                </button>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Select a specific grade to see the {stemInfo.name} overview.</p>
            )}
          </div>

          {/* Progress tracker */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <CheckCircle2 size={14} color="#22C55E" /> Chapter Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((completedChapters.length / Math.max(NCERT_CHAPTERS.length, 1)) * 100)}%`, backgroundColor: '#22C55E', borderRadius: '99px', transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#22C55E' }}>{completedChapters.length}/{NCERT_CHAPTERS.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOWER SECTION: Full-width AI Chatbot ── */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Chatbot header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', backgroundColor: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>STEM Socratic AI Mentor</div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
                {selectedChap ? `📖 ${selectedChap.title}` : `🔭 ${stemInfo?.name} · Class ${selectedGrade === 'all' ? '8-12' : selectedGrade}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Socratic Hint button */}
            <button onClick={getNextHint}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                backgroundColor: showHint ? '#FEF3C7' : 'var(--bg-card)',
                border: `1px solid ${showHint ? '#FCD34D' : 'var(--border-medium)'}`,
                color: showHint ? '#92400E' : 'var(--text-muted)',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer'
              }}>
              <Lightbulb size={14} color={showHint ? '#D97706' : 'currentColor'} />
              Get Hint
            </button>

            {/* Language selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', padding: '5px 10px' }}>
              <Globe size={13} color="var(--text-faint)" />
              <select value={chatLang} onChange={(e) => setChatLang(e.target.value)}
                style={{ background: 'none', border: 'none', fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}>
                {LANG_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Hint strip */}
        {showHint && (
          <div style={{
            backgroundColor: '#FFFBEB', borderBottom: '1px solid #FDE68A',
            padding: '10px 20px', fontSize: '13px', color: '#92400E', fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Lightbulb size={14} color="#D97706" />
            <span>{(HINTS[selectedStem] || HINTS.cs)[hintIndex]}</span>
            <button onClick={() => setShowHint(false)} style={{ marginLeft: 'auto', fontSize: '11px', color: '#D97706', cursor: 'pointer' }}>✕ Hide</button>
          </div>
        )}

        {/* Chat messages */}
        <div style={{ height: '320px', overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
              fontSize: '13px', lineHeight: '1.6',
              backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-subtle)',
              color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-light)'
            }}>
              {msg.text}
            </div>
          ))}
          {isChatLoading && (
            <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--text-faint)', animation: `bounce 1.2s ${d * 0.2}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat quick starters */}
        <div style={{ padding: '0 20px 10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={handleSummarizeSourceChat} disabled={isChatLoading}
            style={{
              fontSize: '11px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--accent) 0%, #F59E0B 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(235,94,40,0.2)'
            }}>
            <Sparkles size={11} /> Summarize Source
          </button>
          {[
            `Explain ${selectedChap?.title || stemInfo?.name} with a real-life example`,
            'What are the most common mistakes students make?',
            'Give me a practice problem to test my understanding',
            'How is this useful in real life?'
          ].map((q, i) => (
            <button key={i} type="button" onClick={() => { setChatInput(q); }}
              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              💬 {q}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSendChat} style={{
          padding: '12px 20px 16px', borderTop: '1px solid var(--border-light)',
          display: 'flex', gap: '10px', alignItems: 'center'
        }}>
          <input
            className="form-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask anything about ${selectedChap?.title || stemInfo?.name || 'STEM'} in ${LANG_OPTIONS.find(l => l.code === chatLang)?.label || 'English'}...`}
            style={{ flex: 1, fontSize: '13px' }}
          />
          <button type="button" onClick={() => {
            startListening(getLocaleCode(chatLang), (text) => setChatInput(text));
          }}
          style={{
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            cursor: 'pointer'
          }}
          title="Speech to Text (Mic)">
            <Mic size={16} color="var(--accent)" />
          </button>
          <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Send size={14} /> Ask Mentor
          </button>
        </form>
      </div>

      <ISLVideoPlayerModal
        isOpen={isIslModalOpen}
        onClose={() => setIsIslModalOpen(false)}
        conceptName={activeConcept}
        signDescription="NCERT syllabus mapped ISL gesture video clip"
      />

      <VideoAIModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        chapterTitle={videoModalData?.title}
        grade={videoModalData?.grade}
        subject={videoModalData?.subject}
        langCode={videoModalData?.langCode}
      />

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// VIDEO AI GENERATION MODAL (SUPABASE CONNECTED)
// ─────────────────────────────────────────────
function VideoAIModal({ isOpen, onClose, chapterTitle, grade, subject, langCode }) {
  const [activeGrade, setActiveGrade] = useState(grade === 'all' || !grade ? '8' : String(grade));
  const [activeChapterTitle, setActiveChapterTitle] = useState(chapterTitle || '');
  const [selectedLanguage, setSelectedLanguage] = useState(langCode || 'en');
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      const initGrade = grade === 'all' || !grade ? '8' : String(grade);
      setActiveGrade(initGrade);
      const chaps = NCERT_CHAPTERS.filter(c => c.grade === initGrade);
      const initTitle = chapterTitle || (chaps.length > 0 ? chaps[0].title : `Class ${initGrade} Computer Science Overview`);
      setActiveChapterTitle(initTitle);
      setSelectedLanguage(langCode || 'en');
    }
  }, [isOpen, chapterTitle, grade, langCode]);

  const currentGradeChapters = NCERT_CHAPTERS.filter(c => c.grade === String(activeGrade));

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    videoService.getChapterVideoUrl(activeChapterTitle, activeGrade, selectedLanguage)
      .then(url => {
        setVideoUrl(url);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [isOpen, activeChapterTitle, activeGrade, selectedLanguage]);

  if (!isOpen) return null;

  const LANG_LABELS = {
    en: 'English', hi: 'हिंदी (Hindi)', ta: 'தமிழ் (Tamil)', te: 'తెలుగు (Telugu)',
    kn: 'ಕನ್ನಡ (Kannada)', mr: 'मराठी (Marathi)', bn: 'বাংলা (Bengali)', gu: 'ગુજરાતી (Gujarati)'
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1E1917',
        border: '1.5px solid var(--accent)',
        borderRadius: '16px',
        width: '100%', maxWidth: '820px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        color: '#FFFFFF'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, var(--accent) 0%, #9A3412 100%)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Film size={22} color="#FFF" />
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#FFF' }}>
                AI Generated Video Lesson
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
                NCERT Class {activeGrade} · {activeChapterTitle || 'STEM Fundamentals'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Class Selector Dropdown */}
            <select
              value={activeGrade}
              onChange={(e) => {
                const newGrade = e.target.value;
                setActiveGrade(newGrade);
                const chaps = NCERT_CHAPTERS.filter(c => c.grade === newGrade);
                if (chaps.length > 0) {
                  setActiveChapterTitle(chaps[0].title);
                } else {
                  setActiveChapterTitle(`Class ${newGrade} Computer Science Overview`);
                }
              }}
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="8" style={{ backgroundColor: '#1E1917' }}>Class 8</option>
              <option value="9" style={{ backgroundColor: '#1E1917' }}>Class 9</option>
              <option value="10" style={{ backgroundColor: '#1E1917' }}>Class 10</option>
              <option value="11" style={{ backgroundColor: '#1E1917' }}>Class 11</option>
              <option value="12" style={{ backgroundColor: '#1E1917' }}>Class 12</option>
            </select>

            {/* Chapter Selector Dropdown */}
            <select
              value={activeChapterTitle}
              onChange={(e) => setActiveChapterTitle(e.target.value)}
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: '700',
                maxWidth: '220px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {currentGradeChapters.length > 0 ? (
                currentGradeChapters.map((c) => (
                  <option key={c.id} value={c.title} style={{ backgroundColor: '#1E1917' }}>
                    {c.number}: {c.title.length > 26 ? c.title.slice(0, 26) + '...' : c.title}
                  </option>
                ))
              ) : (
                <option value={activeChapterTitle} style={{ backgroundColor: '#1E1917' }}>
                  {activeChapterTitle}
                </option>
              )}
            </select>

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                backgroundColor: 'rgba(0,0,0,0.4)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <option key={code} value={code} style={{ backgroundColor: '#1E1917', color: '#FFF' }}>
                  {label}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: '#FFF', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Video Player Display */}
        <div style={{ position: 'relative', width: '100%', height: '360px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--accent)' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#D4D4D4' }}>Connecting to Supabase Video Bucket...</p>
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #2C1810 0%, #0F0906 100%)', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(200,75,36,0.25)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Play size={28} color="var(--accent)" style={{ marginLeft: '4px' }} />
              </div>
              <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '800', color: '#FFF' }}>
                {activeChapterTitle || 'NCERT Class ' + activeGrade + ' Concept Video'}
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#A3A3A3', maxWidth: '500px', lineHeight: '1.5' }}>
                Generated Video lesson in {LANG_LABELS[selectedLanguage] || selectedLanguage} stored securely on Supabase Storage.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(200,75,36,0.2)', color: 'var(--accent)', fontWeight: '700', border: '1px solid rgba(200,75,36,0.4)' }}>
                  ⚡ Supabase Storage Connected
                </span>
                <span style={{ fontSize: '11px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(22,163,74,0.2)', color: '#4ADE80', fontWeight: '700', border: '1px solid rgba(22,163,74,0.4)' }}>
                  ✓ Multi-Lingual Sync: {selectedLanguage.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div style={{ padding: '16px 24px', backgroundColor: '#14100E', borderTop: '1px solid #2C221E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#A3A3A3' }}>
            <span style={{ color: 'var(--accent)', fontWeight: '700' }}>PALASH Curriculum Video Feature</span> · Supabase Storage Live
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', borderRadius: '8px',
              backgroundColor: 'var(--accent)', border: 'none',
              color: '#FFF', fontSize: '12px', fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Close Video
          </button>
        </div>
      </div>
    </div>
  );
}
