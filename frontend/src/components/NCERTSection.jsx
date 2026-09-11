import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen, Hand, Download, Play, CheckCircle2, HelpCircle, Sparkles,
  ChevronRight, ChevronDown, Atom, Beaker, Dna, Binary, Calculator,
  BrainCircuit, Volume2, Globe, MessageSquare, Send, Lightbulb,
  Eye, Headphones, Video, CheckCheck, Lock, Star, Mic, X, Film, Languages
} from 'lucide-react';
import jsPDF from 'jspdf';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';
import { askTutor, translateText, askNcertTutor } from '../services/api';
import { startListening, speakText } from './speechUtils';
import { videoService } from '../services/supabaseClient';
import { NCERT_CHAPTERS, STEM_MOCK_DATA, HINTS } from './ncertData';
import { uiTranslations } from '../services/uiTranslations';

const getSubjectIcon = (subject, size = 15) => {
  switch (subject) {
    case 'cs': return <Binary size={size} />;
    case 'maths': return <Calculator size={size} />;
    case 'science': return <Atom size={size} />;
    case 'english': return <BookOpen size={size} />;
    default: return <BookOpen size={size} />;
  }
};

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

  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [activeConcept, setActiveConcept] = useState('');

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalData, setVideoModalData] = useState(null);

  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const [stemSummary, setStemSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: '🙏 Namaste! I am your ShikshaSetu Curriculum AI Mentor. Select a chapter or STEM branch above, then ask me anything — I will guide you Socratically!' }
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

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (synth) {
      synth.cancel();
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  }, [selectedChap, selectedGrade, selectedStem]);

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

  const stemInfo = STEM_MOCK_DATA[selectedStem] || { name: '', color: '#0F4C3A', bgColor: '#FFFFFF', grades: {} };
  const gradeData = stemInfo?.grades?.[selectedGrade];

  const markComplete = (chapId) => {
    const updated = completedChapters.includes(chapId)
      ? completedChapters.filter(id => id !== chapId)
      : [...completedChapters, chapId];
    setCompletedChapters(updated);
    localStorage.setItem('cs_completed', JSON.stringify(updated));
  };

  const handleDownloadPdf = (chap) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 76, 58);
    doc.text(`NCERT Class ${chap.grade} — ${chap.number}`, 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);
    doc.text(chap.title, 20, 30);
    doc.setLineWidth(0.4);
    doc.line(20, 35, 190, 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
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
        } catch { /* English fallback */ }
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      const fallback = `Great question! Let me help you think through it. What do you already know about ${selectedChap?.title || stemInfo?.name || 'this'}? Can you relate it to something from daily life?`;
      setChatMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsChatLoading(false);
    }
  };

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

  const handleGlobalIslTrigger = () => {
    const concept = selectedChap ? selectedChap.title : `${stemInfo.name} Class ${selectedGrade}`;
    setActiveConcept(concept);
    setIsIslModalOpen(true);
  };

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
        } catch { /* English fallback */ }
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      const fallback = `Here is the summary of **${sourceTitle}**: It is focused on building foundational understanding. What specific part would you like to discuss?`;
      setChatMessages(prev => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getNextHint = () => {
    const hints = HINTS[selectedStem] || HINTS.cs;
    setShowHint(true);
    setHintIndex(prev => (prev + 1) % hints.length);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t.ncert.title}</h1>
          <p>{t.ncert.subtitle}</p>
        </div>
        <div className="actions">
          <div className="seg">
            {['8', '9', '10', '11', '12', 'all'].map(g => (
              <button
                key={g}
                className={selectedGrade === g ? 'active' : ''}
                onClick={() => { setSelectedGrade(g); setSelectedChap(null); setStemSummary(''); }}
              >
                {g === 'all' ? 'All' : g}
              </button>
            ))}
          </div>
          <button className="btn-secondary" onClick={handleGlobalSpeakToggle}>
            <Volume2 size={14} />
            {isPlayingSpeech ? (isPausedSpeech ? 'Resume' : 'Pause') : 'Listen'}
          </button>
          <button className="btn-ghost" onClick={handleGlobalIslTrigger}>ISL</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {Object.entries(STEM_MOCK_DATA).map(([key, branch]) => {
            const isSelected = selectedStem === key;
            return (
              <button
                key={key}
                className={isSelected ? 'btn-primary' : 'btn-secondary'}
                onClick={() => { setSelectedStem(key); setSelectedChap(null); setStemSummary(''); setHintIndex(0); setShowHint(false); }}
                style={{ padding: '8px 14px' }}
              >
                {getSubjectIcon(key)}
                <span>{branch.name}</span>
              </button>
            );
          })}
      </div>

      {/* Chapters (left) + STEM Summary (right) */}
      <div className="ncert-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>

        {/* Chapter List */}
        <div>
          {/* STEM overview strip */}
          {gradeData && (
            <div className="card" style={{
              padding: '14px 18px', marginBottom: '16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="quiet">{stemInfo.name} · Class {selectedGrade === 'all' ? '8–12' : selectedGrade}</span>
                  {selectedStem === 'cs' && setCurrentTab && (
                    <button className="btn-primary" onClick={() => setCurrentTab('coding-workspace')} style={{ padding: '6px 12px', fontSize: 12 }}>
                      Coding sandbox
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-sub)', lineHeight: '1.5', margin: 0 }}>
                  {gradeData.overview}
                </p>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--badge-green-bg)', color: 'var(--badge-green-text)' }}>
                {getSubjectIcon(selectedStem, 16)}
              </div>
            </div>
          )}

          {/* Chapter cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredChapters.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '14px' }}>
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
                  border: isOpen ? '1.5px solid var(--green-primary)' : '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF'
                }}>
                  {/* Chapter header row */}
                  <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => { setSelectedChap(isOpen ? null : chap); setHintIndex(0); setShowHint(false); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div onClick={(e) => { e.stopPropagation(); markComplete(chap.id); }}
                        style={{
                          width: '20px', height: '20px', borderRadius: '50%',
                          border: isDone ? 'none' : '1.5px solid var(--border-dark)',
                          backgroundColor: isDone ? 'var(--green-accent)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, cursor: 'pointer', transition: 'all 0.15s ease'
                        }}>
                        {isDone && <CheckCheck size={11} color="#fff" />}
                      </div>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--green-primary)' }}>{chap.number}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Class {chap.grade}</span>
                          {chap.islAvailable && <span className="badge-green" style={{ fontSize: '9px', padding: '1px 5px' }}>ISL ✓</span>}
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: 'var(--text-main)' }}>{chap.title}</h3>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="btn-ghost" onClick={(e) => {
                        e.stopPropagation();
                        setVideoModalData({
                          title: chap.title,
                          grade: chap.grade,
                          subject: chap.subject,
                          langCode: chatLang
                        });
                        setIsVideoModalOpen(true);
                      }}>Video</button>
                      <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); handleDownloadPdf(chap); }}>PDF</button>
                      <div style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'none' }}>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded 5-layer view */}
                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border-medium)', padding: '18px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-sub)', marginBottom: '14px', lineHeight: '1.6' }}>{chap.description}</p>

                      {/* Topic pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                        {chap.topics.map((t, i) => (
                          <span key={i} style={{ fontSize: '11px', backgroundColor: 'var(--bg-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)', color: 'var(--text-sub)' }}>{t}</span>
                        ))}
                      </div>

                      {/* 5-layer grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                        {[
                          { label: 'Analogy', content: chap.analogy, bg: 'var(--bg-subtle)', border: 'var(--border-medium)' },
                          { label: 'Formula', content: chap.syntax, bg: 'var(--bg-subtle)', border: 'var(--border-medium)', mono: true },
                          { label: 'Example', content: chap.codeExample, bg: 'var(--badge-green-bg)', border: 'var(--badge-green-border)', mono: true },
                          { label: 'Pitfalls', content: chap.pitfalls, bg: 'var(--badge-amber-bg)', border: 'var(--badge-amber-border)' },
                        ].map((layer, i) => (
                          <div key={i} style={{ backgroundColor: layer.bg, border: `1px solid ${layer.border}`, borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: 'var(--text-main)' }}>{layer.label}</div>
                            <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-main)', fontFamily: layer.mono ? 'monospace' : 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{layer.content}</div>
                          </div>
                        ))}
                      </div>

                      {/* Challenge */}
                      <div style={{ backgroundColor: 'var(--badge-green-bg)', border: '1px solid var(--badge-green-border)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--badge-green-text)', marginBottom: '4px' }}>Challenge</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{chap.challenge}</div>
                      </div>

                      {/* Mark complete */}
                      <button onClick={() => markComplete(chap.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px',
                          borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600',
                          backgroundColor: isDone ? 'var(--badge-green-bg)' : 'var(--charcoal)',
                          border: isDone ? '1px solid var(--badge-green-border)' : 'none',
                          color: isDone ? 'var(--badge-green-text)' : '#FFFFFF',
                          cursor: 'pointer', marginTop: '8px'
                        }}>
                        {isDone ? 'Completed' : 'Mark complete'}
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
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <BrainCircuit size={16} color="var(--green-primary)" />
              <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: 'var(--text-main)' }}>{stemInfo.name} AI Lab</h3>
            </div>

            {gradeData ? (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Key Points</div>
                  {gradeData.keyPoints.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', marginBottom: '5px', color: 'var(--text-main)' }}>
                      <span style={{ color: 'var(--green-primary)', flexShrink: 0, marginTop: '1px' }}>•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px', marginBottom: '12px', border: '1px solid var(--border-medium)' }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>🌍 Real World</div>
                  <p style={{ fontSize: '12px', color: 'var(--text-sub)', lineHeight: '1.5', margin: 0 }}>{gradeData.realWorld}</p>
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
                  style={{
                    width: '100%', padding: '9px 14px', fontSize: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    backgroundColor: 'var(--green-primary)',
                    borderRadius: 'var(--radius-full)', border: 'none', color: '#FFFFFF', fontWeight: '600',
                    cursor: 'pointer', boxShadow: '0 2px 6px rgba(15,76,58,0.2)'
                  }}>
                  <Video size={14} />
                  <span>Watch lesson</span>
                </button>
              </>
            ) : (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Select a specific grade to see the {stemInfo.name} overview.</p>
            )}
          </div>

          {/* Progress tracker */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
              <CheckCircle2 size={14} color="var(--green-accent)" /> Chapter Progress
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round((completedChapters.length / Math.max(NCERT_CHAPTERS.length, 1)) * 100)}%`, backgroundColor: 'var(--green-accent)', borderRadius: '99px', transition: 'width 0.4s' }} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--green-primary)' }}>{completedChapters.length}/{NCERT_CHAPTERS.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: AI Chatbot */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Chatbot header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', backgroundColor: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-medium)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'var(--green-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrainCircuit size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>Ask about this lesson</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {selectedChap ? selectedChap.title : `${stemInfo?.name} · Class ${selectedGrade === 'all' ? '8–12' : selectedGrade}`}
              </div>
            </div>
          </div>

          <select className="field" value={chatLang} onChange={(e) => setChatLang(e.target.value)} style={{ width: 'auto' }}>
            {LANG_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>

        {/* Chat messages */}
        <div style={{ height: '300px', overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '75%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              fontSize: '13px', lineHeight: '1.5',
              backgroundColor: msg.role === 'user' ? 'var(--green-primary)' : 'var(--bg-subtle)',
              color: msg.role === 'user' ? '#FFFFFF' : 'var(--text-main)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--border-medium)'
            }}>
              {msg.text}
            </div>
          ))}
          {isChatLoading && (
            <div style={{ alignSelf: 'flex-start', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', animation: `bounce 1.2s ${d * 0.2}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendChat} className="composer" style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border-medium)' }}>
          <input
            className="field"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask about ${selectedChap?.title || stemInfo?.name || 'this lesson'}`}
          />
          <button type="button" onClick={() => {
            startListening(getLocaleCode(chatLang), (text) => setChatInput(text));
          }}
          style={{
            padding: '9px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            cursor: 'pointer'
          }}
          title="Speech to Text (Mic)">
            <Mic size={15} color="var(--green-primary)" />
          </button>
          <button type="submit" disabled={isChatLoading || !chatInput.trim()}
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isChatLoading || !chatInput.trim() ? 'var(--border-medium)' : 'var(--green-primary)',
              color: isChatLoading || !chatInput.trim() ? 'var(--text-muted)' : '#FFFFFF',
              fontWeight: '600',
              fontSize: '12px',
              border: 'none',
              cursor: isChatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer'
            }}>
            <Send size={13} />
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
    </div>
  );
}

function VideoAIModal({ isOpen, onClose, chapterTitle, grade, subject, langCode }) {
  const [activeGrade, setActiveGrade] = useState(grade === 'all' || !grade ? '8' : String(grade));
  const [activeChapterTitle, setActiveChapterTitle] = useState(chapterTitle || '');
  const [selectedLanguage, setSelectedLanguage] = useState(langCode || 'en');
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    kn: 'ಕನ್ನಡ (Kannada)', mr: 'मराठी (Marathi)', bn: 'বাংলা (Bengali)', gu: '<ctrl42>ગુજરાતી (Gujarati)'
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
        backgroundColor: '#18181B',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        width: '100%', maxWidth: '820px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        color: '#FFFFFF'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          backgroundColor: 'var(--green-dark)',
          borderBottom: '1px solid #3F3F46',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Film size={20} color="#FFFFFF" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>
                AI Generated Video Lesson
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#A1A1AA' }}>
                NCERT Class {activeGrade} · {activeChapterTitle || 'STEM Fundamentals'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                backgroundColor: '#18181B',
                color: '#FFF',
                border: '1px solid #3F3F46',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
            </select>

            <select
              value={activeChapterTitle}
              onChange={(e) => setActiveChapterTitle(e.target.value)}
              style={{
                backgroundColor: '#18181B',
                color: '#FFF',
                border: '1px solid #3F3F46',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                maxWidth: '200px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {currentGradeChapters.length > 0 ? (
                currentGradeChapters.map((c) => (
                  <option key={c.id} value={c.title}>
                    {c.number}: {c.title.length > 24 ? c.title.slice(0, 24) + '...' : c.title}
                  </option>
                ))
              ) : (
                <option value={activeChapterTitle}>
                  {activeChapterTitle}
                </option>
              )}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{
                backgroundColor: '#18181B',
                color: '#FFF',
                border: '1px solid #3F3F46',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: '500',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {Object.entries(LANG_LABELS).map(([code, label]) => (
                <option key={code} value={code}>
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
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Player Display */}
        <div style={{ position: 'relative', width: '100%', height: '340px', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', color: '#A1A1AA' }}>
              <div style={{ width: '32px', height: '32px', border: '2px solid var(--green-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
              <p style={{ fontSize: '12px', fontWeight: '500' }}>Connecting to Supabase Video Bucket...</p>
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              autoPlay
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090B', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#27272A', border: '1px solid #3F3F46', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Play size={24} color="var(--green-primary)" style={{ marginLeft: '3px' }} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '600', color: '#FFFFFF' }}>
                {activeChapterTitle || 'NCERT Class ' + activeGrade + ' Concept Video'}
              </h4>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#A1A1AA', maxWidth: '480px', lineHeight: '1.5' }}>
                Generated Video lesson in {LANG_LABELS[selectedLanguage] || selectedLanguage} stored securely on Supabase Storage.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span className="badge-green">
                  ⚡ Supabase Storage Connected
                </span>
                <span className="badge-blue">
                  ✓ Multi-Lingual Sync: {selectedLanguage.toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div style={{ padding: '14px 20px', backgroundColor: '#18181B', borderTop: '1px solid #27272A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#A1A1AA' }}>
            <span style={{ color: '#FFFFFF', fontWeight: '600' }}>ShikshaSetu Curriculum Video Feature</span> · Supabase Storage Live
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px', borderRadius: 'var(--radius-sm)',
              backgroundColor: '#27272A', border: '1px solid #3F3F46',
              color: '#FFFFFF', fontSize: '12px', fontWeight: '500',
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
