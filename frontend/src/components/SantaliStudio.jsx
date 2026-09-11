import React, { useState, useEffect } from 'react';
import { 
  Download,
  Mic,
  Headphones,
  Hand
} from 'lucide-react';
import { 
  SAMPLE_FLN_LESSONS, 
  APERTIUM_SANTALI_LEXICON, 
  TRIBAL_LANGUAGES,
  CHILD_TRIBAL_RESPONSES,
  recognizeChildTribalSpeech
} from '../services/apertiumSantaliData';
import { irisAskTutor } from '../services/api';
import AudioPlayButton from './AudioPlayButton';
import { startListening } from './speechUtils';
import { uiTranslations } from '../services/uiTranslations';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';
import jsPDF from 'jspdf';

export default function SantaliStudio({ 
  setCurrentTab, 
  uiLang = 'en', 
  currentLang = 'sat', 
  setCurrentLang 
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang || 'sat');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedLesson, setSelectedLesson] = useState(SAMPLE_FLN_LESSONS[0]);
  const [customText, setCustomText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTranslation, setActiveTranslation] = useState(null);
  const [scriptMode, setScriptMode] = useState('both');

  const [isTeacherListening, setIsTeacherListening] = useState(false);
  const [isChildListening, setIsChildListening] = useState(false);
  const [childSpeechMatch, setChildSpeechMatch] = useState(CHILD_TRIBAL_RESPONSES[0]);

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
    setActiveTranslation(null);
  };

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const filteredLessons = SAMPLE_FLN_LESSONS.filter(l => {
    if (selectedGrade === 'All') return true;
    return l.grade.startsWith(selectedGrade);
  });

  const currentLessonData = activeTranslation || {
    title: selectedLesson.title,
    grade: selectedLesson.grade,
    subject: selectedLesson.subject,
    sourceText: selectedLesson.sourceText,
    scriptText: selectedLesson[selectedLang]?.script || selectedLesson.sat?.script || 'ᱚᱞ',
    romanText: selectedLesson[selectedLang]?.roman || selectedLesson.sat?.roman || 'ol',
    vocabulary: selectedLesson.vocabulary
  };

  const handleSelectPreloaded = (lesson) => {
    setSelectedLesson(lesson);
    setActiveTranslation(null);
    setCustomText('');
  };

  const handleTranslateCustom = async () => {
    if (!customText.trim()) return;
    setIsTranslating(true);
    try {
      const res = await irisAskTutor({
        mode: 'teacher-fln',
        query: customText,
        lessonContext: customText,
        targetLanguage: activeLangObj.name
      });

      setActiveTranslation({
        title: "Custom Classroom FLN Script",
        grade: "Classroom Custom",
        subject: "FLN Mother-Tongue Bridge",
        sourceText: customText,
        scriptText: res.santaliOlChiki || "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹᱠᱚ!",
        romanText: res.santaliRoman || "Johar gidrạko!",
        vocabulary: (res.vocabularyBreakdown || []).map(v => ({
          hindi: v.hindi || v.source || 'Word',
          [selectedLang]: `${v.olChiki || 'ᱚᱞ'} (${v.roman || 'ol'})`
        })),
        teachingTips: res.teachingTips || []
      });
    } catch (err) {
      console.warn("Translation fallback activated:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleStartTeacherMic = () => {
    if (isTeacherListening) return;
    setIsTeacherListening(true);
    startListening({
      lang: 'hi-IN',
      onResult: (transcript) => {
        setIsTeacherListening(false);
        setCustomText(transcript);
        const match = SAMPLE_FLN_LESSONS.find(l => 
          l.sourceText.includes(transcript) || transcript.includes(l.title)
        );
        if (match) {
          handleSelectPreloaded(match);
        }
      },
      onError: () => setIsTeacherListening(false),
      onEnd: () => setIsTeacherListening(false)
    });
  };

  const handleStartChildMic = () => {
    if (isChildListening) return;
    setIsChildListening(true);
    startListening({
      lang: 'hi-IN',
      onResult: (transcript) => {
        setIsChildListening(false);
        const match = recognizeChildTribalSpeech(transcript, selectedLang);
        if (match) {
          setChildSpeechMatch(match);
        }
      },
      onError: () => setIsChildListening(false),
      onEnd: () => setIsChildListening(false)
    });
  };

  const handleExportLessonNotes = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("PALASH MTB-MLE Programme — Government of Jharkhand", 20, 20);
    doc.setFontSize(11);
    doc.text(`FLN Classroom Lesson Plan (${activeLangObj.name} Language Bridge)`, 20, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Target Grade: ${currentLessonData.grade}    Subject: ${currentLessonData.subject}`, 20, 35);
    doc.setLineWidth(0.4);
    doc.line(20, 39, 190, 39);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("1. Standard Hindi Source Curriculum:", 20, 47);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitHindi = doc.splitTextToSize(currentLessonData.sourceText, 170);
    doc.text(splitHindi, 20, 54);

    let y = 54 + (splitHindi.length * 6) + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`2. Mother-Tongue Transliteration (${activeLangObj.name} Roman Phonetics):`, 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitRoman = doc.splitTextToSize(currentLessonData.romanText, 170);
    doc.text(splitRoman, 20, y);

    y += (splitRoman.length * 6) + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("3. Teacher Instructional Guidance (NEP 2020 MTB-MLE):", 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text("- Speak the tribal language phrase aloud first using the phonetic guide.", 20, y);
    y += 6;
    doc.text("- Allow children to respond in their mother tongue before validating in Hindi.", 20, y);
    y += 6;
    doc.text("- Reinforce key classroom vocabulary through concrete objects and slate drawings.", 20, y);

    doc.save(`PALASH_FLN_Lesson_${selectedLang}.pdf`);
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>{t.fln.title}</h1>
          <p>{t.fln.subtitle}</p>
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

      <div className="two-col studio-grid">
        <div className="col-stack">
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: 12 }}>{t.fln.preloadedLessons}</h3>
            <div className="seg" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
              {['All', 'Grade 1', 'Grade 2', 'Grade 3'].map(gr => (
                <button key={gr} className={selectedGrade === gr ? 'active' : ''} onClick={() => setSelectedGrade(gr)}>
                  {gr === 'All' ? t.fln.allGrades : gr === 'Grade 1' ? t.fln.grade1 : gr === 'Grade 2' ? t.fln.grade2 : t.fln.grade3}
                </button>
              ))}
            </div>
            <div className="col-stack" style={{ maxHeight: 360, overflowY: 'auto', gap: 8 }}>
              {filteredLessons.map((lesson) => {
                const isSelected = selectedLesson.id === lesson.id && !activeTranslation;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectPreloaded(lesson)}
                    className={`item-btn ${isSelected ? 'on' : ''}`}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{lesson.title}</div>
                    <div className="quiet">{lesson.grade} · {lesson.subject}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="page-head" style={{ marginBottom: 10 }}>
              <h3 className="card-title">{t.fln.customPassage}</h3>
              <button className="btn-ghost" onClick={handleStartTeacherMic}>
                <Mic size={14} />
                {isTeacherListening ? 'Listening…' : 'Dictate'}
              </button>
            </div>
            <textarea
              className="field"
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="आज हम सब मिलकर पेड़ों के बारे में पढ़ेंगे..."
              style={{ marginBottom: 10 }}
            />
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={handleTranslateCustom}
              disabled={isTranslating || !customText.trim()}
            >
              {isTranslating ? 'Translating…' : `${t.fln.translateBtn} ${activeLangObj.name}`}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="page-head" style={{ borderBottom: '1px solid var(--border-medium)', paddingBottom: 14, marginBottom: 18 }}>
            <div>
              <div className="quiet">{currentLessonData.grade} · {currentLessonData.subject}</div>
              <h2 className="card-title" style={{ fontSize: 20 }}>{currentLessonData.title}</h2>
            </div>
            <div className="actions">
              <div className="seg">
                <button className={scriptMode === 'both' ? 'active' : ''} onClick={() => setScriptMode('both')}>{t.fln.dualScript}</button>
                <button className={scriptMode === 'native' ? 'active' : ''} onClick={() => setScriptMode('native')}>{t.fln.nativeOnly}</button>
              </div>
              <button className="btn-secondary" onClick={handleExportLessonNotes}>
                <Download size={13} />
                {t.fln.exportNotes}
              </button>
            </div>
          </div>

          <div className="script-block" style={{ marginBottom: 16 }}>
            <div className="quiet" style={{ marginBottom: 4 }}>{t.fln.hindiSource}</div>
            <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>{currentLessonData.sourceText}</div>
          </div>

          <div className="script-block script-block-plain" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="quiet">{activeLangObj.name}</div>
              <div className="actions">
                <button className="btn-ghost" onClick={() => handleOpenIsl(currentLessonData.title, currentLessonData.sourceText || currentLessonData.title)}>
                  <Hand size={14} /> ISL
                </button>
                <AudioPlayButton text={currentLessonData.romanText || currentLessonData.scriptText} size="sm" label={t.fln.pronounce} />
              </div>
            </div>
            <div className="script-native">{currentLessonData.scriptText}</div>
            {(scriptMode === 'both' || scriptMode === 'roman') && currentLessonData.romanText && (
              <div className="script-roman">{currentLessonData.romanText}</div>
            )}
          </div>

          {currentLessonData.vocabulary && currentLessonData.vocabulary.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="card-title" style={{ marginBottom: 8 }}>{t.fln.vocabBreakdown}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                {currentLessonData.vocabulary.map((v, vIdx) => (
                  <div key={vIdx} className="script-block" style={{ padding: '10px 12px' }}>
                    <div className="quiet">{v.hindi}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{v[selectedLang] || v.sat || 'ᱟᱹᱲᱟᱹ'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="script-block-plain script-block" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 750 }}>Child reply</div>
              <div className="quiet">{childSpeechMatch.olChiki} · {childSpeechMatch.hindi}</div>
            </div>
            <div className="actions">
              <button className="btn-primary" onClick={handleStartChildMic}>
                <Headphones size={13} />
                {isChildListening ? 'Listening…' : 'Listen'}
              </button>
              <button className="btn-secondary" onClick={() => setCurrentTab('phrasebook')}>Voice</button>
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
