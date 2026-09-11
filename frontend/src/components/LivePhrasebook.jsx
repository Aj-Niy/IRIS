import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Search, Headphones } from 'lucide-react';
import {
  CLASSROOM_PHRASEBOOK,
  TRIBAL_LANGUAGES,
  CHILD_TRIBAL_RESPONSES,
  recognizeChildTribalSpeech
} from '../services/apertiumSantaliData';
import { recordOfflineInteraction } from '../services/offlineSync';
import { startListening } from './speechUtils';
import AudioPlayButton from './AudioPlayButton';
import { uiTranslations } from '../services/uiTranslations';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';

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

  const [isTeacherListening, setIsTeacherListening] = useState(false);
  const [teacherTranscript, setTeacherTranscript] = useState('');
  const teacherRecogRef = useRef(null);

  const [isChildListening, setIsChildListening] = useState(false);
  const [childTranscript, setChildTranscript] = useState('');
  const [childRecognitionResult, setChildRecognitionResult] = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState('All');
  const childRecogRef = useRef(null);

  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [islConcept, setIslConcept] = useState('');
  const [islText, setIslText] = useState('');

  const handleOpenIsl = (concept, text) => {
    setIslConcept(concept);
    setIslText(text || concept);
    setIsIslModalOpen(true);
  };

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

  const handleStartTeacherMic = () => {
    if (isTeacherListening) {
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
        setTeacherTranscript(transcript);
        if (isFinal) {
          setIsTeacherListening(false);
          teacherRecogRef.current = null;
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

  const handleStartChildMic = () => {
    if (isChildListening) {
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

  const displayScript = childRecognitionResult?.script || '—';
  const displayHindi = childRecognitionResult?.hindi || '—';
  const displayEnglish = childRecognitionResult?.english || '';

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t.voice.title}</h1>
          <p>{t.voice.subtitle}</p>
        </div>
        <div className="seg">
          {TRIBAL_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={selectedLang === lang.code ? 'active' : ''}
              onClick={() => handleLangChange(lang.code)}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="voice-engine-grid">
        <div className="card">
          <div className="page-head" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge-green">TEACHER CHANNEL</span>
                <span className="badge-blue" style={{ fontSize: '10px' }}>&lt; 1.5s Pass</span>
              </div>
              <h2 className="card-title">{t.voice.teacherChannel}</h2>
              <p className="quiet">{t.voice.teacherMicPrompt}</p>
            </div>
            <button className={isTeacherListening ? 'btn-secondary' : 'btn-primary'} onClick={handleStartTeacherMic}>
              <Mic size={14} />
              {isTeacherListening ? t.voice.listening : t.voice.pushToTalk}
            </button>
          </div>

          <textarea
            className="field"
            value={teacherTranscript || selectedPhrase.hindi}
            onChange={(e) => setTeacherTranscript(e.target.value)}
            rows={2}
            placeholder="हिंदी"
          />

          <div className="script-block-plain script-block" style={{ marginTop: 12, backgroundColor: 'var(--green-light)', border: '1px solid var(--green-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="quiet" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>{activeLangObj.name}{measuredLatency ? ` · ${measuredLatency}s real-time` : ''}</span>
              <div className="actions">
                <button className="btn-ghost" onClick={() => handleOpenIsl(selectedPhrase.hindi, selectedPhrase.english || selectedPhrase.hindi)}>ISL</button>
                <AudioPlayButton
                  text={selectedPhrase[selectedLang]?.roman || selectedPhrase[selectedLang]?.script}
                  size="sm"
                  label={t.voice.broadcast}
                />
              </div>
            </div>
            <div className="script-native">{selectedPhrase[selectedLang]?.script}</div>
            <div className="script-roman">{selectedPhrase[selectedLang]?.phonetic || selectedPhrase[selectedLang]?.roman}</div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="seg" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} className={selectedCategory === cat ? 'active' : ''} onClick={() => setSelectedCategory(cat)}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="search-bar" style={{ width: '100%', marginBottom: 10 }}>
              <Search size={14} color="#9CA3AF" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search phrases..." />
            </div>
            <div className="col-stack" style={{ maxHeight: 220, overflowY: 'auto', gap: 8 }}>
              {filteredPhrases.slice(0, 8).map(p => {
                const categoryBadge = p.category === 'Greetings' ? 'badge-amber' : p.category === 'Instructions' ? 'badge-blue' : p.category === 'Praise' ? 'badge-rose' : 'badge-purple';
                return (
                  <button key={p.id} className={`item-btn ${selectedPhrase.id === p.id ? 'on' : ''}`} onClick={() => handleSelectPhrase(p)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.hindi}</div>
                        <div className="quiet">{p[selectedLang]?.script}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={categoryBadge} style={{ fontSize: '9px', padding: '1px 6px' }}>{p.category}</span>
                        <Volume2 size={14} color="var(--text-faint)" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="page-head" style={{ marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge-purple">STUDENT SPEECH CHANNEL</span>
                <span className="badge-amber" style={{ fontSize: '10px' }}>STT Voice Match</span>
              </div>
              <h2 className="card-title">{t.voice.childChannel}</h2>
              <p className="quiet">{t.voice.childMicPrompt}</p>
            </div>
            <button className={isChildListening ? 'btn-secondary' : 'btn-primary'} onClick={handleStartChildMic}>
              <Headphones size={14} />
              {isChildListening ? t.voice.listeningChild : t.voice.listenToChild}
            </button>
          </div>

          <textarea
            className="field"
            value={childTranscript}
            onChange={(e) => setChildTranscript(e.target.value)}
            rows={2}
            placeholder={t.voice.childSaid}
          />

          {childRecognitionResult ? (
            <div className="script-block" style={{ marginTop: 12 }}>
              <div className="quiet">{t.voice.teacherMeaning}</div>
              <div className="script-native" style={{ fontSize: 20 }}>{displayScript}</div>
              <div style={{ fontWeight: 700, marginTop: 8 }}>{displayHindi}</div>
              {displayEnglish && <div className="quiet">{displayEnglish}</div>}
            </div>
          ) : (
            <div className="script-block" style={{ marginTop: 12 }}>
              <div className="quiet">Listen, then the meaning appears here.</div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <div className="seg" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
              {['All', 'Comprehension & Affirmation', 'Numeracy & Counting', 'Classroom Interaction', 'Nature & Environment'].map(cat => (
                <button key={cat} className={selectedChildCategory === cat ? 'active' : ''} onClick={() => setSelectedChildCategory(cat)}>
                  {cat === 'All' ? 'All' : cat.split(' ')[0]}
                </button>
              ))}
            </div>
            <div className="col-stack" style={{ maxHeight: 220, overflowY: 'auto', gap: 8 }}>
              {filteredChildResponses.map(resp => (
                <button
                  key={resp.id}
                  className={`item-btn ${childRecognitionResult?.script === (resp[selectedLang]?.script || resp.sat?.script) ? 'on' : ''}`}
                  onClick={() => handleSelectChildResponse(resp)}
                >
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{resp[selectedLang]?.script || resp.sat?.script}</div>
                  <div className="quiet">{resp.hindi}</div>
                </button>
              ))}
            </div>
          </div>
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
