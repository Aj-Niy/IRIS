import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Search, 
  Maximize2, 
  Minimize2, 
  Zap
} from 'lucide-react';
import { CLASSROOM_PHRASEBOOK, TRIBAL_LANGUAGES } from '../services/apertiumSantaliData';
import { recordOfflineInteraction } from '../services/offlineSync';
import { startListening, stopSpeech } from './speechUtils';
import AudioPlayButton from './AudioPlayButton';

export default function LivePhrasebook() {
  const [selectedLang, setSelectedLang] = useState('sat'); // 'sat' | 'hoc' | 'unr'
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePhrase, setActivePhrase] = useState(CLASSROOM_PHRASEBOOK[0]);
  const [isListening, setIsListening] = useState(false);
  const [activeRecognition, setActiveRecognition] = useState(null);
  const [isBigScreen, setIsBigScreen] = useState(false);
  const [liveLatencyMs, setLiveLatencyMs] = useState(45); // Benchmark latency <3s

  const categories = ['All', 'Greetings', 'Instructions', 'Praise', 'Numeracy', 'Questions'];
  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const handleToggleMic = () => {
    if (isListening) {
      if (activeRecognition) activeRecognition.stop();
      setIsListening(false);
      return;
    }

    stopSpeech();
    const startTime = performance.now();

    const rec = startListening(
      'hi-IN',
      (transcript, isFinal) => {
        setQuery(transcript);
        handleFuzzyMatch(transcript);
        const elapsed = Math.round(performance.now() - startTime);
        setLiveLatencyMs(elapsed);
        if (isFinal) {
          setIsListening(false);
        }
      },
      () => {
        setIsListening(false);
        setActiveRecognition(null);
      },
      () => {
        setIsListening(false);
        setActiveRecognition(null);
      }
    );

    if (rec) {
      setActiveRecognition(rec);
      setIsListening(true);
    }
  };

  const handleFuzzyMatch = (searchText) => {
    const q = searchText.toLowerCase().trim();
    if (!q) return;

    const matched = CLASSROOM_PHRASEBOOK.find(p => {
      const targetObj = p[selectedLang] || p.sat;
      return p.hindi.toLowerCase().includes(q) ||
        p.english.toLowerCase().includes(q) ||
        targetObj.roman.toLowerCase().includes(q) ||
        targetObj.script.includes(q);
    });

    if (matched) {
      setActivePhrase(matched);
      recordOfflineInteraction('phrase_used', { phraseId: matched.id, lang: selectedLang });
    } else {
      const tokens = q.split(/\s+/);
      const partial = CLASSROOM_PHRASEBOOK.find(p => {
        return tokens.some(t => t.length > 2 && (p.hindi.includes(t) || p.english.toLowerCase().includes(t)));
      });
      if (partial) {
        setActivePhrase(partial);
        recordOfflineInteraction('phrase_used', { phraseId: partial.id, lang: selectedLang });
      }
    }
  };

  const filteredPhrases = CLASSROOM_PHRASEBOOK.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    if (!matchesCat) return false;
    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    const targetObj = p[selectedLang] || p.sat;
    return p.hindi.toLowerCase().includes(q) ||
      p.english.toLowerCase().includes(q) ||
      targetObj.roman.toLowerCase().includes(q) ||
      targetObj.script.includes(q);
  });

  const currentPhraseData = activePhrase[selectedLang] || activePhrase.sat;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Banner with Clean Borders */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
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
            Jharkhand PALASH MTB-MLE · Interactive Voice Bridge
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            Real-Time Voice Translation & Classroom Dialogue
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Speak in Hindi to deliver real-time spoken dialogue in <strong>{activeLangObj.name} ({activeLangObj.script})</strong> with sub-3s response on classroom tablets.
          </p>
        </div>

        {/* Target Tribal Language Selector & Benchmark Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'var(--secondary-light)',
            border: '1px solid var(--secondary-border)',
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--secondary-accent)'
          }}>
            <Zap size={13} color="var(--secondary-accent)" />
            <span>Latency: {liveLatencyMs}ms (&lt; 3.0s standard)</span>
          </div>

          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-medium)'
          }}>
            {TRIBAL_LANGUAGES.map(lang => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '600',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                    backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
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

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isBigScreen ? '1fr' : '360px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Speech Input & Bounded Phrasebook */}
        {!isBigScreen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Real-Time Speech Input Bar with Crisp Border */}
            <div className="card" style={{ padding: '18px', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                Live Speech Input (Hindi):
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: '6px',
                  padding: '0 12px',
                  border: '1px solid var(--border-medium)'
                }}>
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      handleFuzzyMatch(e.target.value);
                    }}
                    placeholder="Speak or search (e.g. 'बैठ जाओ')..."
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '10px 0',
                      fontSize: '13px',
                      color: 'var(--text-main)',
                      outline: 'none'
                    }}
                  />
                </div>

                <button
                  onClick={handleToggleMic}
                  type="button"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    backgroundColor: isListening ? '#DC2626' : 'var(--accent)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title={isListening ? 'Listening... click to stop' : 'Click to speak in Hindi'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              {isListening && (
                <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <span>● Listening live... speak Hindi classroom instruction</span>
                </div>
              )}

              {/* Category Filter Pills with Crisp Borders */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {categories.map(cat => {
                  const isCatSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        border: isCatSelected ? '1px solid var(--accent)' : '1px solid var(--border-medium)',
                        backgroundColor: isCatSelected ? 'var(--accent-light)' : '#FFFFFF',
                        color: isCatSelected ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phrasebook List */}
            <div className="card" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-light)'
              }}>
                Classroom Phrases ({filteredPhrases.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
                {filteredPhrases.map((phrase) => {
                  const isSelected = activePhrase.id === phrase.id;
                  const itemLang = phrase[selectedLang] || phrase.sat;
                  return (
                    <div
                      key={phrase.id}
                      onClick={() => {
                        setActivePhrase(phrase);
                        recordOfflineInteraction('phrase_used', { phraseId: phrase.id, lang: selectedLang });
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-light)',
                        backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-main)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? 'var(--accent)' : 'var(--text-main)', marginBottom: '2px' }}>
                        {itemLang.script}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {phrase.hindi}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Live Translation Presentation Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card card-highlight" style={{
            padding: isBigScreen ? '36px' : '26px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: isBigScreen ? '480px' : '380px'
          }}>
            {/* Card Header with Subtle Divider */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '18px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase' }}>
                  {activePhrase.category} · {activeLangObj.name} Language Bridge
                </span>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Real-Time Classroom Dialogue Output
                </div>
              </div>

              <button
                onClick={() => setIsBigScreen(!isBigScreen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isBigScreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                <span>{isBigScreen ? 'Normal View' : 'Classroom Display'}</span>
              </button>
            </div>

            {/* Tribal Language Large Script Display */}
            <div style={{
              textAlign: 'center',
              padding: '24px 20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1.5px solid var(--border-medium)',
              marginBottom: '18px'
            }}>
              <div style={{
                fontSize: isBigScreen ? '38px' : '28px',
                fontWeight: '900',
                color: 'var(--text-main)',
                lineHeight: '1.4',
                letterSpacing: '0.3px',
                marginBottom: '8px'
              }}>
                {currentPhraseData.script}
              </div>

              <div style={{
                fontSize: isBigScreen ? '20px' : '15px',
                fontWeight: '600',
                color: 'var(--accent)',
                fontStyle: 'italic',
                marginBottom: '10px'
              }}>
                "{currentPhraseData.roman}"
              </div>

              <div style={{
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--text-muted)',
                backgroundColor: '#FFFFFF',
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-medium)'
              }}>
                Phonetic Guide: {currentPhraseData.phonetic}
              </div>
            </div>

            {/* Translation Meanings */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-main)',
                borderRadius: '6px',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Standard Hindi Instruction (Teacher)
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
                  {activePhrase.hindi}
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-main)',
                borderRadius: '6px',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                  English Meaning
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {activePhrase.english}
                </div>
              </div>
            </div>

            {/* Audio Play/Pause Control Bar */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <AudioPlayButton
                text={currentPhraseData.roman || activePhrase.hindi}
                label="Pronounce Aloud to Class"
                size="md"
                style={{ width: '100%', justifyContent: 'center' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
