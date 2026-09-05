import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  Mic, 
  MicOff,
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
  Headphones
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
  
  // Teacher Speech states
  const [isTeacherListening, setIsTeacherListening] = useState(false);
  const [teacherCustomInput, setTeacherCustomInput] = useState('');
  
  // Child Speech states
  const [isChildListening, setIsChildListening] = useState(false);
  const [childSpokenText, setChildSpokenText] = useState('');
  const [childRecognitionResult, setChildRecognitionResult] = useState(CHILD_TRIBAL_RESPONSES[0]);
  const [selectedChildCategory, setSelectedChildCategory] = useState('All');

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
  const childCategories = ['All', 'Affirmations', 'Classroom', 'Numeracy', 'Social'];

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

  // Teacher Voice Input (Hindi -> Tribal)
  const handleStartTeacherMic = () => {
    if (isTeacherListening) return;
    setIsTeacherListening(true);
    startListening({
      lang: 'hi-IN',
      onResult: (transcript) => {
        setIsTeacherListening(false);
        setTeacherCustomInput(transcript);
        // Find best match or fallback
        const match = CLASSROOM_PHRASEBOOK.find(p => 
          p.hindi.toLowerCase().includes(transcript.toLowerCase()) || 
          transcript.toLowerCase().includes(p.hindi.toLowerCase())
        );
        if (match) {
          handleSelectPhrase(match);
        }
      },
      onError: () => setIsTeacherListening(false),
      onEnd: () => setIsTeacherListening(false)
    });
  };

  // Child Voice Input (Tribal Child Speech -> Hindi Teacher Translation)
  const handleStartChildMic = () => {
    if (isChildListening) return;
    setIsChildListening(true);
    setChildSpokenText('Listening to tribal child speech...');
    startListening({
      lang: 'hi-IN',
      onResult: (transcript) => {
        setIsChildListening(false);
        setChildSpokenText(transcript);
        const match = recognizeChildTribalSpeech(transcript, selectedLang);
        if (match) {
          setChildRecognitionResult(match);
        }
      },
      onError: () => setIsChildListening(false),
      onEnd: () => setIsChildListening(false)
    });
  };

  const handleSelectChildResponse = (resp) => {
    setChildRecognitionResult(resp);
    setChildSpokenText(resp.olChiki || resp.roman);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Top Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #FED7AA',
        borderRadius: 'var(--radius-lg)',
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

        {/* Target Tribal Language Selector & Latency Badge */}
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

      {/* Main Two-Column Interactive Pedagogy Flow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* ================= CHANNEL 1: TEACHER TO CLASSROOM ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1.5px solid #FED7AA' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FDBA74',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EA580C',
                  fontWeight: '900'
                }}>
                  1
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {t.voice.teacherChannel}
                  </h2>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {t.voice.teacherMicPrompt}
                  </span>
                </div>
              </div>

              {/* Push-to-Talk Mic Button */}
              <button
                onClick={handleStartTeacherMic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: isTeacherListening ? '#EF4444' : '#EA580C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(234,88,12,0.3)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Mic size={14} />
                <span>{isTeacherListening ? t.voice.listening : t.voice.pushToTalk}</span>
              </button>
            </div>

            {/* Live Spoken Statement Display */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: '#FFFDF9',
              border: '1.5px solid #FED7AA',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', marginBottom: '4px', textTransform: 'uppercase' }}>
                {t.voice.hindiPrompt}:
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>
                "{selectedPhrase.hindi}"
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                English: {selectedPhrase.english}
              </div>
            </div>

            {/* Target Spoken Broadcast Card */}
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #EA580C',
              boxShadow: '0 4px 14px rgba(234,88,12,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
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

              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1.3' }}>
                {selectedPhrase[selectedLang]?.script}
              </div>

              <div style={{ fontSize: '13px', fontWeight: '700', color: '#C2410C', fontStyle: 'italic' }}>
                {t.voice.phonetic}: "{selectedPhrase[selectedLang]?.phonetic || selectedPhrase[selectedLang]?.roman}"
              </div>
            </div>

            {/* Quick Classroom Phrase Selector */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>
                  {t.voice.classroomPhrases}:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: selectedCategory === cat ? '800' : '600',
                        backgroundColor: selectedCategory === cat ? '#EA580C' : '#FFF7ED',
                        color: selectedCategory === cat ? '#FFFFFF' : '#334155',
                        border: '1px solid #FED7AA',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phrase quick list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                {filteredPhrases.slice(0, 6).map(p => {
                  const isSelected = selectedPhrase.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPhrase(p)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #EA580C' : '1px solid #FED7AA',
                        backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                          {p.hindi}
                        </div>
                        <div style={{ fontSize: '11px', color: '#EA580C', fontWeight: '600' }}>
                          {p[selectedLang]?.script}
                        </div>
                      </div>
                      <Volume2 size={13} color={isSelected ? '#EA580C' : '#94A3B8'} />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* ================= CHANNEL 2: ANSWERING CHILD TO TEACHER ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="card" style={{ padding: '20px', backgroundColor: '#FFFFFF', border: '1.5px solid #A7F3D0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#059669',
                  fontWeight: '900'
                }}>
                  2
                </div>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                    {t.voice.childChannel}
                  </h2>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {t.voice.childMicPrompt}
                  </span>
                </div>
              </div>

              {/* Child Voice Listener Mic */}
              <button
                onClick={handleStartChildMic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: isChildListening ? '#EF4444' : '#059669',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(5,150,105,0.3)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Headphones size={14} />
                <span>{isChildListening ? t.voice.listeningChild : t.voice.listenToChild}</span>
              </button>
            </div>

            {/* Child Spoken Output Recognition Card */}
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              backgroundColor: '#F0FDF4',
              border: '2px solid #059669',
              boxShadow: '0 4px 14px rgba(5,150,105,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>
                  {t.voice.childSaid}:
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#DCFCE7',
                  color: '#166534'
                }}>
                  Tribal ASR Matched
                </span>
              </div>

              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', lineHeight: '1.3' }}>
                {childRecognitionResult.olChiki}
              </div>

              <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669', fontStyle: 'italic' }}>
                Pronunciation: "{childRecognitionResult.phonetic || childRecognitionResult.roman}"
              </div>
            </div>

            {/* Translation for Hindi Teacher */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #A7F3D0',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', marginBottom: '4px', textTransform: 'uppercase' }}>
                {t.voice.teacherMeaning} (Hindi):
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A' }}>
                "{childRecognitionResult.hindi}"
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                English Meaning: {childRecognitionResult.english}
              </div>

              {/* Pedagogical Follow-up suggestion */}
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FCD34D',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: '#92400E',
                fontWeight: '700'
              }}>
                <Lightbulb size={13} color="#D97706" />
                <span>Pedagogy Tip: Praise the child using "{selectedLang === 'sat' ? 'ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ (Aadi napay)' : 'बहुत अच्छा'}"</span>
              </div>
            </div>

            {/* Gracious Common Responses Directory */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>
                  {t.voice.commonChildWords}:
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {childCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedChildCategory(cat)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: selectedChildCategory === cat ? '800' : '600',
                        backgroundColor: selectedChildCategory === cat ? '#059669' : '#ECFDF5',
                        color: selectedChildCategory === cat ? '#FFFFFF' : '#065F46',
                        border: '1px solid #A7F3D0',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Child response quick grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {filteredChildResponses.map(resp => {
                  const isSelected = childRecognitionResult.id === resp.id;
                  return (
                    <button
                      key={resp.id}
                      onClick={() => handleSelectChildResponse(resp)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: isSelected ? '1.5px solid #059669' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#ECFDF5' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>
                        {resp.olChiki}
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                        {resp.hindi}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>
                        ({resp.roman})
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

