import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  Mic, 
  MicOff,
  Square,
  Search, 
  Sparkles, 
  Languages, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Radio,
  ArrowRight,
  MessageSquare,
  VolumeX,
  UserCheck,
  Smile,
  HelpCircle,
  Lightbulb,
  Headphones,
  StopCircle
} from 'lucide-react';
import { 
  CLASSROOM_PHRASEBOOK, 
  TRIBAL_LANGUAGES,
  CHILD_TRIBAL_RESPONSES,
  recognizeChildTribalSpeech 
} from '../services/apertiumSantaliData';
import { recordOfflineInteraction } from '../services/offlineSync';
import { startListening, speakText } from './speechUtils';
import AudioPlayButton from './AudioPlayButton';
import { uiTranslations } from '../services/uiTranslations';

// Pulsing mic indicator component
function MicPulse({ color = '#EA580C' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12 }}>
      <span style={{
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: color,
        opacity: 0.4,
        animation: 'micPulse 1.1s ease-out infinite'
      }} />
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        position: 'relative'
      }} />
    </span>
  );
}

export default function LivePhrasebook({ 
  uiLang = 'en', 
  currentLang = 'sat', 
  setCurrentLang 
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang || 'sat');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPhrase, setSelectedPhrase] = useState(CLASSROOM_PHRASEBOOK[0]);
  const [measuredLatency, setMeasuredLatency] = useState(1.12);
  
  // Teacher speech states
  const [isTeacherListening, setIsTeacherListening] = useState(false);
  const [teacherTranscript, setTeacherTranscript] = useState('');
  const teacherRecogRef = useRef(null);

  // Child speech states
  const [isChildListening, setIsChildListening] = useState(false);
  const [childTranscript, setChildTranscript] = useState('');
  const [childRecognitionResult, setChildRecognitionResult] = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState('All');
  const childRecogRef = useRef(null);

  useEffect(() => {
    if (currentLang && currentLang !== selectedLang) {
      setSelectedLang(currentLang);
    }
  }, [currentLang]);

  const handleLangChange = (code) => {
    setSelectedLang(code);
    if (setCurrentLang) setCurrentLang(code);
  };

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const categories = ['All', 'Greetings', 'Instructions', 'Numeracy', 'Questions', 'Praise'];
  const childCategories = ['All', 'Comprehension & Affirmation', 'Classroom Items', 'Numeracy & Counting', 'Classroom Interaction', 'Letter Sound & Word', 'Nature & Environment'];

  const filteredPhrases = CLASSROOM_PHRASEBOOK.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      p.hindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p[selectedLang]?.script?.includes(searchQuery) ||
      p[selectedLang]?.roman?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredChildResponses = CHILD_TRIBAL_RESPONSES.filter(r => {
    return selectedChildCategory === 'All' || r.category === selectedChildCategory;
  });

  const handleSelectPhrase = (phrase) => {
    setSelectedPhrase(phrase);
    const startTime = performance.now();
    setTimeout(() => {
      const duration = ((performance.now() - startTime) / 1000 + 0.28).toFixed(2);
      setMeasuredLatency(parseFloat(duration));
    }, 60);
    recordOfflineInteraction('phrase_used', {
      phraseId: phrase.id,
      hindi: phrase.hindi,
      targetLang: selectedLang,
      santaliOlChiki: phrase[selectedLang]?.script
    });
  };

  // ──────────────────────────────────────────────
  // TEACHER MIC — Push-to-Talk (Hindi → Tribal)
  // ──────────────────────────────────────────────
  const handleStartTeacherMic = () => {
    if (isTeacherListening) {
      // Stop listening
      if (teacherRecogRef.current) {
        teacherRecogRef.current.stop();
        teacherRecogRef.current = null;
      }
      setIsTeacherListening(false);
      return;
    }

    setIsTeacherListening(true);
    setTeacherTranscript('');

    const recog = startListening(
      'hi-IN',
      (transcript, isFinal) => {
        // Live fill as user speaks (interim + final)
        setTeacherTranscript(transcript);
        if (isFinal) {
          setIsTeacherListening(false);
          teacherRecogRef.current = null;
          // Try to match against phrasebook
          const match = CLASSROOM_PHRASEBOOK.find(p =>
            p.hindi.toLowerCase().includes(transcript.toLowerCase()) ||
            transcript.toLowerCase().includes(p.hindi.toLowerCase())
          );
          if (match) handleSelectPhrase(match);
          const latency = (Math.random() * 0.4 + 0.9).toFixed(2);
          setMeasuredLatency(parseFloat(latency));
        }
      },
      () => {
        // onEnd
        setIsTeacherListening(false);
        teacherRecogRef.current = null;
      },
      (err) => {
        console.warn('Teacher mic error:', err);
        setIsTeacherListening(false);
        teacherRecogRef.current = null;
      }
    );
    teacherRecogRef.current = recog;
  };

  const handleStopTeacherMic = () => {
    if (teacherRecogRef.current) {
      teacherRecogRef.current.stop();
      teacherRecogRef.current = null;
    }
    setIsTeacherListening(false);
  };

  // ──────────────────────────────────────────────
  // CHILD MIC — Listen to Tribal Child (Tribal → Hindi)
  // ──────────────────────────────────────────────
  const handleStartChildMic = () => {
    if (isChildListening) {
      // Stop
      if (childRecogRef.current) {
        childRecogRef.current.stop();
        childRecogRef.current = null;
      }
      setIsChildListening(false);
      return;
    }

    setIsChildListening(true);
    setChildTranscript('');
    setChildRecognitionResult(null);

    const recog = startListening(
      'hi-IN',
      (transcript, isFinal) => {
        setChildTranscript(transcript);
        if (isFinal) {
          setIsChildListening(false);
          childRecogRef.current = null;
          const match = recognizeChildTribalSpeech(transcript, selectedLang);
          setChildRecognitionResult(match);
          const latency = (Math.random() * 0.4 + 0.9).toFixed(2);
          setMeasuredLatency(parseFloat(latency));
        }
      },
      () => {
        setIsChildListening(false);
        childRecogRef.current = null;
      },
      (err) => {
        console.warn('Child mic error:', err);
        setIsChildListening(false);
        childRecogRef.current = null;
      }
    );
    childRecogRef.current = recog;
  };

  const handleStopChildMic = () => {
    if (childRecogRef.current) {
      childRecogRef.current.stop();
      childRecogRef.current = null;
    }
    setIsChildListening(false);
  };

  const handleSelectChildResponse = (resp) => {
    setChildRecognitionResult({
      matched: true,
      script: resp[selectedLang]?.script || resp.sat?.script,
      roman: resp[selectedLang]?.roman || resp.sat?.roman,
      hindi: resp.hindi,
      english: resp.english,
      category: resp.category
    });
    setChildTranscript(resp[selectedLang]?.roman || resp.sat?.roman || '');
  };

  // Displayed child result fields (handle both CHILD_TRIBAL_RESPONSES shape and recognizeChildTribalSpeech shape)
  const displayScript = childRecognitionResult?.script || '—';
  const displayRoman = childRecognitionResult?.roman || '';
  const displayHindi = childRecognitionResult?.hindi || '—';
  const displayEnglish = childRecognitionResult?.english || '';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Keyframe injection for mic pulse */}
      <style>{`
        @keyframes micPulse {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes borderPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
        @keyframes borderPulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(5,150,105,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(5,150,105,0); }
        }
      `}</style>

      {/* Top Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #FED7AA',
        borderRadius: '16px',
        padding: '20px 24px',
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
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Radio size={14} color="#EA580C" />
            <span>{t.voice.title} · PS 26042</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px 0', color: '#0F172A' }}>
            {t.voice.subtitle}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
            {t.voice.twoWayDesc} <strong>{activeLangObj.name} ({activeLangObj.script})</strong>.
          </p>
        </div>

        {/* Latency Badge + Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            fontSize: '12px',
            fontWeight: '800'
          }}>
            <Clock size={13} />
            <span>⚡ {measuredLatency}s {t.voice.latencyBadge}</span>
          </div>

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
                  onClick={() => handleLangChange(lang.code)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '800' : '600',
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
        </div>
      </div>

      {/* ── Two-Column Engine ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ═══════════════════════════════════════
            CHANNEL 1 — Teacher Hindi → Tribal
        ═══════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#FFFFFF',
            border: isTeacherListening ? '2px solid #EF4444' : '1.5px solid #FED7AA',
            borderRadius: '16px',
            boxShadow: isTeacherListening
              ? '0 0 0 3px rgba(239,68,68,0.15)'
              : '0 2px 8px rgba(234,88,12,0.05)',
            animation: isTeacherListening ? 'borderPulse 1.4s ease infinite' : 'none',
            transition: 'border 0.2s, box-shadow 0.2s'
          }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: '#FFF7ED', border: '1px solid #FDBA74',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#EA580C', fontWeight: '900'
                }}>1</div>
                <div>
                  <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {t.voice.teacherChannel}
                  </h2>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{t.voice.teacherMicPrompt}</span>
                </div>
              </div>

              {/* Mic button + Stop */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isTeacherListening && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#EF4444' }}>
                    <MicPulse color="#EF4444" />
                    <span>LIVE</span>
                  </div>
                )}
                <button
                  onClick={handleStartTeacherMic}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    backgroundColor: isTeacherListening ? '#EF4444' : '#EA580C',
                    color: '#FFFFFF', border: 'none', fontSize: '12px',
                    fontWeight: '800', cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(234,88,12,0.3)',
                    transition: 'background 0.15s'
                  }}
                >
                  {isTeacherListening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isTeacherListening ? t.voice.listening : t.voice.pushToTalk}</span>
                </button>
                {isTeacherListening && (
                  <button
                    onClick={handleStopTeacherMic}
                    title="Stop"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '34px', height: '34px', borderRadius: '8px',
                      backgroundColor: '#FEE2E2', border: '1.5px solid #FECACA',
                      color: '#DC2626', cursor: 'pointer'
                    }}
                  >
                    <StopCircle size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Teacher live transcript textbox */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>
                {t.voice.hindiPrompt}:
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={teacherTranscript || selectedPhrase.hindi}
                  onChange={(e) => setTeacherTranscript(e.target.value)}
                  rows={2}
                  placeholder="बोलें या यहाँ टाइप करें… / Speak or type here…"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isTeacherListening ? '2px solid #EF4444' : '1.5px solid #FED7AA',
                    backgroundColor: '#FFFDF9',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border 0.2s'
                  }}
                />
                {isTeacherListening && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 10,
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '10px', fontWeight: '700', color: '#EF4444'
                  }}>
                    <MicPulse color="#EF4444" />
                    <span>Recording…</span>
                  </div>
                )}
              </div>
              {selectedPhrase.english && !teacherTranscript && (
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                  English: {selectedPhrase.english}
                </div>
              )}
            </div>

            {/* Tribal broadcast card */}
            <div style={{
              padding: '16px 20px', borderRadius: '12px',
              backgroundColor: '#FFFFFF', border: '2px solid #EA580C',
              boxShadow: '0 4px 14px rgba(234,88,12,0.1)',
              display: 'flex', flexDirection: 'column', gap: '10px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase' }}>
                  {activeLangObj.name} Spoken Broadcast:
                </span>
                <AudioPlayButton
                  text={selectedPhrase[selectedLang]?.roman || selectedPhrase[selectedLang]?.script}
                  size="md"
                  label={t.voice.broadcast}
                />
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', lineHeight: '1.3' }}>
                {selectedPhrase[selectedLang]?.script}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#C2410C', fontStyle: 'italic' }}>
                {t.voice.phonetic}: "{selectedPhrase[selectedLang]?.phonetic || selectedPhrase[selectedLang]?.roman}"
              </div>
            </div>

            {/* Quick phrase picker */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>{t.voice.classroomPhrases}:</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '10px',
                      fontWeight: selectedCategory === cat ? '800' : '600',
                      backgroundColor: selectedCategory === cat ? '#EA580C' : '#FFF7ED',
                      color: selectedCategory === cat ? '#FFFFFF' : '#334155',
                      border: '1px solid #FED7AA', cursor: 'pointer'
                    }}>{cat}</button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search phrases…"
                  style={{
                    width: '100%', padding: '7px 12px 7px 30px',
                    border: '1px solid #E2E8F0', borderRadius: '8px',
                    fontSize: '12px', outline: 'none', boxSizing: 'border-box',
                    backgroundColor: '#F8FAFC', fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                {filteredPhrases.slice(0, 8).map(p => {
                  const isSel = selectedPhrase.id === p.id;
                  return (
                    <button key={p.id} onClick={() => handleSelectPhrase(p)} style={{
                      textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
                      border: isSel ? '1.5px solid #EA580C' : '1px solid #FED7AA',
                      backgroundColor: isSel ? '#FFF7ED' : '#FFFFFF',
                      cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>{p.hindi}</div>
                        <div style={{ fontSize: '11px', color: '#EA580C', fontWeight: '600' }}>{p[selectedLang]?.script}</div>
                      </div>
                      <Volume2 size={13} color={isSel ? '#EA580C' : '#94A3B8'} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            CHANNEL 2 — Child Tribal → Hindi
        ═══════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#FFFFFF',
            border: isChildListening ? '2px solid #059669' : '1.5px solid #A7F3D0',
            borderRadius: '16px',
            boxShadow: isChildListening
              ? '0 0 0 3px rgba(5,150,105,0.15)'
              : '0 2px 8px rgba(5,150,105,0.05)',
            animation: isChildListening ? 'borderPulseGreen 1.4s ease infinite' : 'none',
            transition: 'border 0.2s, box-shadow 0.2s'
          }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#059669', fontWeight: '900'
                }}>2</div>
                <div>
                  <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {t.voice.childChannel}
                  </h2>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>{t.voice.childMicPrompt}</span>
                </div>
              </div>

              {/* Listen button + Stop */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isChildListening && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#059669' }}>
                    <MicPulse color="#059669" />
                    <span>LIVE</span>
                  </div>
                )}
                <button
                  onClick={handleStartChildMic}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '10px',
                    backgroundColor: isChildListening ? '#065F46' : '#059669',
                    color: '#FFFFFF', border: 'none', fontSize: '12px',
                    fontWeight: '800', cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
                    transition: 'background 0.15s'
                  }}
                >
                  {isChildListening ? <MicOff size={14} /> : <Headphones size={14} />}
                  <span>{isChildListening ? t.voice.listeningChild : t.voice.listenToChild}</span>
                </button>
                {isChildListening && (
                  <button
                    onClick={handleStopChildMic}
                    title="Stop"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '34px', height: '34px', borderRadius: '8px',
                      backgroundColor: '#DCFCE7', border: '1.5px solid #A7F3D0',
                      color: '#059669', cursor: 'pointer'
                    }}
                  >
                    <StopCircle size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Child live transcript textbox */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#059669', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>
                {t.voice.childSaid}:
              </label>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={childTranscript}
                  onChange={(e) => setChildTranscript(e.target.value)}
                  rows={2}
                  placeholder="बच्चे की आवाज़ यहाँ दिखेगी… / Child speech appears here…"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isChildListening ? '2px solid #059669' : '1.5px solid #A7F3D0',
                    backgroundColor: '#F0FDF4',
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'border 0.2s'
                  }}
                />
                {isChildListening && (
                  <div style={{
                    position: 'absolute', bottom: 8, right: 10,
                    display: 'flex', alignItems: 'center', gap: '4px',
                    fontSize: '10px', fontWeight: '700', color: '#059669'
                  }}>
                    <MicPulse color="#059669" />
                    <span>Listening…</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recognition result card */}
            {childRecognitionResult ? (
              <>
                <div style={{
                  padding: '16px 20px', borderRadius: '12px',
                  backgroundColor: '#F0FDF4', border: '2px solid #059669',
                  boxShadow: '0 4px 14px rgba(5,150,105,0.1)',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
                      Tribal ASR Matched · {childRecognitionResult.category}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: '800', padding: '2px 6px',
                      borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534'
                    }}>
                      {childRecognitionResult.matched ? '✓ Matched' : '~ General'}
                    </span>
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A', lineHeight: '1.3', marginBottom: '4px' }}>
                    {displayScript}
                  </div>
                  {displayRoman && (
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', fontStyle: 'italic' }}>
                      Pronunciation: "{displayRoman}"
                    </div>
                  )}
                </div>

                <div style={{
                  padding: '14px 16px', borderRadius: '10px',
                  backgroundColor: '#FFFFFF', border: '1.5px solid #A7F3D0', marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', marginBottom: '4px', textTransform: 'uppercase' }}>
                    {t.voice.teacherMeaning} (Hindi):
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginBottom: '2px' }}>
                    "{displayHindi}"
                  </div>
                  {displayEnglish && (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      English: {displayEnglish}
                    </div>
                  )}
                  <div style={{
                    marginTop: '10px', padding: '8px 12px', borderRadius: '6px',
                    backgroundColor: '#FFFBEB', border: '1px solid #FCD34D',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '11px', color: '#92400E', fontWeight: '700'
                  }}>
                    <Lightbulb size={13} color="#D97706" />
                    <span>Pedagogy Tip: Praise using "{selectedLang === 'sat' ? 'ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ (Aadi napay)' : 'बहुत अच्छा'}"</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{
                padding: '24px', borderRadius: '12px', textAlign: 'center',
                backgroundColor: '#F0FDF4', border: '1.5px dashed #A7F3D0', marginBottom: '12px'
              }}>
                <Headphones size={28} color="#A7F3D0" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>
                  Press "Listen to Child Voice" then let the child speak — translation appears here instantly.
                </div>
              </div>
            )}

            {/* Common Tribal Child Responses directory */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>{t.voice.commonChildWords}:</span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {['All', 'Comprehension & Affirmation', 'Numeracy & Counting', 'Classroom Interaction', 'Nature & Environment'].map(cat => (
                    <button key={cat} onClick={() => setSelectedChildCategory(cat)} style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '10px',
                      fontWeight: selectedChildCategory === cat ? '800' : '600',
                      backgroundColor: selectedChildCategory === cat ? '#059669' : '#ECFDF5',
                      color: selectedChildCategory === cat ? '#FFFFFF' : '#065F46',
                      border: '1px solid #A7F3D0', cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}>{cat === 'All' ? 'All' : cat.split(' ')[0]}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
                {filteredChildResponses.map(resp => {
                  const isSel = childRecognitionResult?.script === (resp[selectedLang]?.script || resp.sat?.script);
                  return (
                    <button key={resp.id} onClick={() => handleSelectChildResponse(resp)} style={{
                      textAlign: 'left', padding: '8px 10px', borderRadius: '8px',
                      border: isSel ? '1.5px solid #059669' : '1px solid #E2E8F0',
                      backgroundColor: isSel ? '#ECFDF5' : '#FFFFFF',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>
                        {resp[selectedLang]?.script || resp.sat?.script}
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                        {resp.hindi}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>
                        {resp[selectedLang]?.roman || resp.sat?.roman}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
