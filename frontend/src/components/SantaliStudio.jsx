import React, { useState, useEffect } from 'react';
import { 
  Menu,
  X,
  BookOpen,
  Download,
  Mic,
  Languages,
  CheckCircle2,
  Check,
  FileText,
  Hand,
  Search,
  RotateCcw,
  Volume2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  SAMPLE_FLN_LESSONS, 
  TRIBAL_LANGUAGES 
} from '../services/apertiumSantaliData';
import { irisAskTutor } from '../services/api';
import { translateAadiVaani } from '../services/aadiVaaniTranslator';
import { recordOfflineInteraction } from '../services/offlineSync';
import AudioPlayButton from './AudioPlayButton';
import { startListening } from './speechUtils';
import { uiTranslations } from '../services/uiTranslations';
import ISLVideoPlayerModal from './ISLVideoPlayerModal';
import jsPDF from 'jspdf';
import SaveToVocab from './SaveToVocab';

const TAUGHT_STORAGE_KEY = 'shikshasetu_taught_lessons';

export default function SantaliStudio({ 
  setCurrentTab, 
  uiLang = 'en', 
  currentLang = 'sat', 
  setCurrentLang 
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;

  // Drawer toggle for decluttered lesson selection
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Mode: 'curriculum' (structured FLN lessons) or 'custom' (teacher's own Hindi text)
  const [activeTabMode, setActiveTabMode] = useState('curriculum');

  // Filter & Search states
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(SAMPLE_FLN_LESSONS[0]);

  // Language & Script selection
  const [selectedLang, setSelectedLang] = useState(currentLang || 'sat');
  const [scriptMode, setScriptMode] = useState('both'); // 'both' | 'native' | 'roman'

  // Custom text translation state
  const [customText, setCustomText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState(null);
  const [activeTranslation, setActiveTranslation] = useState(null);
  const [isTeacherListening, setIsTeacherListening] = useState(false);

  // Classroom tracking: Taught lessons state (persisted)
  const [taughtLessonIds, setTaughtLessonIds] = useState(() => {
    try {
      const saved = localStorage.getItem(TAUGHT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Inclusive education: ISL Modal
  const [isIslModalOpen, setIsIslModalOpen] = useState(false);
  const [islConcept, setIslConcept] = useState('');
  const [islText, setIslText] = useState('');

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Sync external language preference if updated by parent
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

  // Filter lessons based on grade, domain, and search query
  const filteredLessons = SAMPLE_FLN_LESSONS.filter(l => {
    const matchesGrade = selectedGrade === 'All' || l.grade.toLowerCase().includes(selectedGrade.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || (l.domain && l.domain.toLowerCase() === selectedDomain.toLowerCase());
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || 
      l.title.toLowerCase().includes(query) ||
      (l.competencyCode && l.competencyCode.toLowerCase().includes(query)) ||
      (l.subject && l.subject.toLowerCase().includes(query)) ||
      (l.sourceText && l.sourceText.toLowerCase().includes(query));

    return matchesGrade && matchesDomain && matchesQuery;
  });

  // Build the active display data
  const currentLessonData = (activeTabMode === 'custom' && activeTranslation) ? activeTranslation : {
    id: selectedLesson.id,
    title: selectedLesson.title,
    grade: selectedLesson.grade,
    domain: selectedLesson.domain || 'Literacy',
    competencyCode: selectedLesson.competencyCode || 'FLN',
    subject: selectedLesson.subject,
    sourceText: selectedLesson.sourceText,
    scriptText: selectedLesson[selectedLang]?.script || selectedLesson.sat?.script || 'ᱚᱞ',
    romanText: selectedLesson[selectedLang]?.roman || selectedLesson.sat?.roman || 'ol',
    teacherScript: selectedLesson.teacherScript,
    vocabulary: selectedLesson.vocabulary || []
  };

  const isCurrentLessonTaught = currentLessonData?.id && taughtLessonIds.includes(currentLessonData.id);

  const handleToggleTaught = () => {
    if (!currentLessonData?.id) return;
    const isTaught = taughtLessonIds.includes(currentLessonData.id);
    let updated;
    if (isTaught) {
      updated = taughtLessonIds.filter(id => id !== currentLessonData.id);
    } else {
      updated = [...taughtLessonIds, currentLessonData.id];
      recordOfflineInteraction('lesson_taught', {
        lessonId: currentLessonData.id,
        title: currentLessonData.title,
        grade: currentLessonData.grade,
        language: activeLangObj.name,
        competencyCode: currentLessonData.competencyCode
      });
    }
    setTaughtLessonIds(updated);
    try {
      localStorage.setItem(TAUGHT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save taught state:", e);
    }
  };

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setActiveTabMode('curriculum');
    setActiveTranslation(null);
    setTranslateError(null);
    setIsDrawerOpen(false); // Seamlessly close drawer after selection
  };

  const handleTranslateCustom = async () => {
    if (!customText.trim()) return;
    setIsTranslating(true);
    setTranslateError(null);

    try {
      let scriptText = '';
      let romanText = '';
      let vocab = [];

      try {
        const res = await irisAskTutor({
          mode: 'teacher-fln',
          query: customText,
          lessonContext: customText,
          targetLanguage: activeLangObj.name
        });

        if (res) {
          scriptText = res.santaliOlChiki || '';
          romanText = res.santaliRoman || '';
          if (Array.isArray(res.vocabularyBreakdown) && res.vocabularyBreakdown.length > 0) {
            vocab = res.vocabularyBreakdown.map(v => ({
              hindi: v.hindi || v.source || 'Word',
              [selectedLang]: `${v.olChiki || 'ᱚᱞ'} (${v.roman || 'ol'})`
            }));
          }
        }
      } catch (irisErr) {
        console.warn("irisAskTutor note:", irisErr);
      }

      if (!scriptText || selectedLang !== 'sat') {
        const aadiRes = await translateAadiVaani({
          text: customText,
          sourceLang: 'hin',
          targetLang: selectedLang
        });

        if (aadiRes?.translatedText) {
          scriptText = aadiRes.translatedText;
          romanText = aadiRes.romanPhonetic || aadiRes.translatedText;
        }
      }

      if (!scriptText) {
        throw new Error("Empty translation result");
      }

      setActiveTranslation({
        id: 'custom-' + Date.now(),
        title: "कक्षा पाठ (Custom Passage)",
        grade: selectedGrade === 'All' ? 'Grade 1–3' : selectedGrade,
        domain: selectedDomain === 'All' ? 'Classroom' : selectedDomain,
        competencyCode: 'FLN-CUSTOM',
        subject: `${activeLangObj.name} MTB-MLE Bridge`,
        sourceText: customText,
        scriptText,
        romanText,
        teacherScript: {
          hindi: customText,
          [selectedLang]: { script: scriptText, roman: romanText }
        },
        vocabulary: vocab
      });

      setIsDrawerOpen(false); // Close drawer to display translated lesson
    } catch (err) {
      console.error("Custom translation failed:", err);
      setTranslateError(t.fln.translateError || "Could not complete translation. Please check the text and try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleStartTeacherMic = () => {
    if (isTeacherListening) return;
    setIsTeacherListening(true);
    setTranslateError(null);
    startListening({
      lang: 'hi-IN',
      onResult: (transcript) => {
        setIsTeacherListening(false);
        setCustomText(transcript);
        const match = SAMPLE_FLN_LESSONS.find(l => 
          l.sourceText.includes(transcript) || transcript.includes(l.title)
        );
        if (match) {
          handleSelectLesson(match);
        }
      },
      onError: () => setIsTeacherListening(false),
      onEnd: () => setIsTeacherListening(false)
    });
  };

  const handleOpenIsl = (concept, text) => {
    setIslConcept(concept);
    setIslText(text || concept);
    setIsIslModalOpen(true);
  };

  const handleExportLessonNotes = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("ShikshaSetu MTB-MLE Programme — Government of Jharkhand", 20, 20);
    doc.setFontSize(11);
    doc.text(`FLN Classroom Lesson Plan (${activeLangObj.name} Language Bridge)`, 20, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Target Grade: ${currentLessonData.grade}    Domain: ${currentLessonData.domain || 'FLN'}    Competency: ${currentLessonData.competencyCode}`, 20, 35);
    doc.setLineWidth(0.4);
    doc.line(20, 39, 190, 39);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text("1. Standard Hindi Source Curriculum:", 20, 47);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitHindi = doc.splitTextToSize(currentLessonData.sourceText || '', 170);
    doc.text(splitHindi, 20, 54);

    let y = 54 + (splitHindi.length * 6) + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`2. Mother-Tongue Transliteration (${activeLangObj.name} Roman Phonetics):`, 20, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitRoman = doc.splitTextToSize(currentLessonData.romanText || '', 170);
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

    doc.save(`ShikshaSetu_FLN_Lesson_${selectedLang}.pdf`);
  };

  const parseVocab = (v, lang) => {
    const raw = v[lang] || v.sat || '';
    if (typeof raw === 'object' && raw !== null) {
      return {
        script: raw.script || '',
        roman: raw.roman || '',
        audioText: raw.roman || raw.script || ''
      };
    }
    if (typeof raw === 'string') {
      const match = raw.match(/^(.*?)\s*\((.*?)\)$/);
      if (match) {
        return {
          script: match[1],
          roman: match[2],
          audioText: match[2]
        };
      }
      return {
        script: raw,
        roman: '',
        audioText: raw
      };
    }
    return { script: '', roman: '', audioText: '' };
  };

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      
      {/* ── Page Header ── */}
      <div className="page-head" style={{ marginBottom: 16 }}>
        <div>
          <div className="pill ok" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sparkles size={12} />
            <span>{t.fln.headerTag}</span>
          </div>
          <h1 style={{ fontSize: 28, letterSpacing: '-0.5px' }}>{t.fln.title}</h1>
          <p style={{ marginTop: 2 }}>{t.fln.subtitle}</p>
        </div>
      </div>

      {/* ── Unified Top Control Bar (Hamburger + Language + Script) ── */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 12, 
          padding: '12px 18px',
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xs)',
          marginBottom: 16 
        }}
      >
        {/* Left: Hamburger Button to browse lessons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 750,
              fontSize: 13,
              cursor: 'pointer',
              borderColor: 'var(--green-border)',
              background: 'var(--green-light)',
              color: 'var(--green-primary)'
            }}
            title="Open lesson drawer"
          >
            <Menu size={18} />
            <span>{t.fln.browseLessons}</span>
            <span 
              className="pill info" 
              style={{ fontSize: 10, padding: '2px 7px', background: 'var(--green-primary)', color: '#fff' }}
            >
              {filteredLessons.length}
            </span>
          </button>

          {/* Quick Active Lesson Info Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="pill" style={{ background: 'var(--bg-subtle)', fontWeight: 700, fontSize: 11 }}>
              {currentLessonData.grade}
            </span>
            <span className="pill info" style={{ fontWeight: 800, fontSize: 11 }}>
              {currentLessonData.competencyCode}
            </span>
            {activeTabMode === 'custom' && (
              <button
                type="button"
                onClick={() => {
                  setActiveTabMode('curriculum');
                  setActiveTranslation(null);
                }}
                className="btn-ghost"
                style={{ fontSize: 11, padding: '2px 8px', color: 'var(--green-primary)' }}
              >
                {t.fln.backToLessons}
              </button>
            )}
          </div>
        </div>

        {/* Right: Target Language & Script View */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          
          {/* Target Language Toggle */}
          <div className="seg">
            {TRIBAL_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type="button"
                className={selectedLang === lang.code ? 'active' : ''}
                onClick={() => handleLangChange(lang.code)}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                <span style={{ fontWeight: 700 }}>{lang.name}</span>
                <span style={{ opacity: 0.8, fontSize: 11, marginLeft: 4 }}>
                  ({lang.code === 'sat' ? 'ᱥᱟᱱᱛᱟᱲᱤ' : lang.code === 'hoc' ? '𑢹𑣉𑣉' : 'ᱢᱩᱱᱰᱟᱨᱤ'})
                </span>
              </button>
            ))}
          </div>

          {/* Script Mode Toggle */}
          <div className="seg">
            <button 
              type="button"
              className={scriptMode === 'both' ? 'active' : ''} 
              onClick={() => setScriptMode('both')}
              style={{ fontSize: 11, padding: '5px 11px' }}
              title="Dual script: Native + Roman"
            >
              {t.fln.dualScript}
            </button>
            <button 
              type="button"
              className={scriptMode === 'native' ? 'active' : ''} 
              onClick={() => setScriptMode('native')}
              style={{ fontSize: 11, padding: '5px 11px' }}
              title="Native script only"
            >
              {t.fln.nativeOnly}
            </button>
            <button 
              type="button"
              className={scriptMode === 'roman' ? 'active' : ''} 
              onClick={() => setScriptMode('roman')}
              style={{ fontSize: 11, padding: '5px 11px' }}
              title="Pronunciation only"
            >
              {t.fln.romanOnly}
            </button>
          </div>

        </div>
      </div>

      {/* ── Main Lesson Content Card (Full Width, Uncluttered) ── */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24 }}>
        
        {/* Lesson Header with Actions */}
        <div style={{ borderBottom: '1px solid var(--border-medium)', paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
            
            {/* Metadata Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="pill info" style={{ fontWeight: 800 }}>
                {currentLessonData.competencyCode}
              </span>
              <span className="pill" style={{ background: 'var(--bg-subtle)', color: 'var(--text-sub)', fontWeight: 700 }}>
                {currentLessonData.grade}
              </span>
              <span className="pill ok" style={{ fontWeight: 700 }}>
                {currentLessonData.domain}
              </span>
              {isCurrentLessonTaught && (
                <span className="pill ok" style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                  <CheckCircle2 size={13} />
                  <span>{t.fln.markedTaught}</span>
                </span>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={isCurrentLessonTaught ? 'btn-secondary' : 'btn-primary'}
                onClick={handleToggleTaught}
                style={{
                  padding: '7px 14px',
                  fontSize: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  borderColor: isCurrentLessonTaught ? 'var(--green-primary)' : undefined,
                  color: isCurrentLessonTaught ? 'var(--green-primary)' : undefined
                }}
              >
                <CheckCircle2 size={14} />
                <span>{isCurrentLessonTaught ? t.fln.markedTaught : t.fln.markTaught}</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentTab && setCurrentTab('worksheets')}
                style={{ padding: '7px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Open aligned bilingual NIPUN worksheets"
              >
                <FileText size={14} />
                <span>{t.fln.openWorksheet}</span>
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCurrentTab && setCurrentTab('phrasebook')}
                style={{ padding: '7px 12px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                title="Practice live classroom conversation with students"
              >
                <Volume2 size={14} />
                <span>{t.fln.voicePractice}</span>
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleOpenIsl(currentLessonData.title, currentLessonData.sourceText || currentLessonData.title)}
                style={{ padding: '7px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                title="Open Indian Sign Language instructional video"
              >
                <Hand size={14} />
                <span>{t.fln.signLanguage}</span>
              </button>

              <button
                type="button"
                className="btn-ghost"
                onClick={handleExportLessonNotes}
                style={{ padding: '7px 10px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                title="Download printable lesson plan as PDF"
              >
                <Download size={14} />
                <span>PDF</span>
              </button>
            </div>

          </div>

          <h2 className="card-title" style={{ fontSize: 23, lineHeight: 1.3, margin: '6px 0 4px' }}>
            {currentLessonData.title}
          </h2>
          <div className="quiet" style={{ fontSize: 13 }}>
            {currentLessonData.subject}
          </div>
        </div>

        {/* Section 1: Standard Hindi Textbook Passage */}
        <div className="script-block" style={{ marginBottom: 16, borderLeft: '4px solid var(--border-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div className="quiet" style={{ fontWeight: 750, color: 'var(--text-sub)' }}>
              {t.fln.hindiSource}
            </div>
            <span className="pill" style={{ background: '#fff', fontSize: 10 }}>Hindi</span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 550, lineHeight: 1.6, color: 'var(--text-main)' }}>
            {currentLessonData.sourceText}
          </div>
        </div>

        {/* Section 2: Mother-Tongue Translation */}
        <div 
          className="script-block script-block-plain" 
          style={{ 
            marginBottom: 20, 
            border: '1.5px solid var(--green-border)', 
            borderRadius: 14, 
            padding: '20px 22px',
            background: '#FAFCFA'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="quiet" style={{ fontWeight: 750, color: 'var(--green-primary)' }}>
                {t.fln.tribalDelivery} ({activeLangObj.name})
              </div>
              <span className="pill ok" style={{ fontSize: 10 }}>{activeLangObj.script}</span>
            </div>
            
            <div className="actions">
              <SaveToVocab
                text={currentLessonData.scriptText}
                roman={currentLessonData.romanText}
                hindi={currentLessonData.sourceText}
                lang={selectedLang}
                langName={activeLangObj.name}
                source="lesson"
                context={'Lesson: ' + currentLessonData.title}
              />
              <AudioPlayButton 
                text={currentLessonData.romanText || currentLessonData.scriptText} 
                size="sm" 
                label={t.fln.pronounce} 
              />
            </div>
          </div>

          {/* Native Script */}
          {(scriptMode === 'both' || scriptMode === 'native') && (
            <div 
              className="script-native" 
              style={{ 
                fontSize: 23, 
                fontWeight: 750, 
                lineHeight: 1.55, 
                color: 'var(--text-main)', 
                marginBottom: (scriptMode === 'both' && currentLessonData.romanText) ? 10 : 0 
              }}
            >
              {currentLessonData.scriptText}
            </div>
          )}

          {/* Roman Phonetic Pronunciation */}
          {(scriptMode === 'both' || scriptMode === 'roman') && currentLessonData.romanText && (
            <div 
              className="script-roman" 
              style={{ 
                fontSize: 14, 
                lineHeight: 1.5, 
                color: 'var(--green-primary)',
                background: 'rgba(15, 76, 58, 0.06)',
                padding: '8px 12px',
                borderRadius: 8,
                fontStyle: 'normal',
                fontWeight: 500
              }}
            >
              <span style={{ fontWeight: 700, fontStyle: 'italic', marginRight: 6 }}>Phonetic:</span>
              {currentLessonData.romanText}
            </div>
          )}
        </div>

        {/* Section 3: Teacher's Classroom Spoken Intro */}
        {currentLessonData.teacherScript && (
          <div 
            style={{ 
              marginBottom: 20, 
              padding: '16px 18px', 
              borderRadius: 14, 
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 750, color: 'var(--text-main)' }}>
                  {t.fln.teacherGuidance}
                </span>
                <span className="quiet" style={{ fontSize: 11, marginLeft: 8 }}>
                  {t.fln.teacherGuidanceDesc}
                </span>
              </div>
              {currentLessonData.teacherScript[selectedLang]?.roman && (
                <AudioPlayButton 
                  text={currentLessonData.teacherScript[selectedLang].roman} 
                  size="sm" 
                  label={t.fln.pronounce}
                />
              )}
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 6, fontStyle: 'italic' }}>
              "{currentLessonData.teacherScript.hindi}"
            </div>

            {currentLessonData.teacherScript[selectedLang]?.script && (
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--green-primary)', marginTop: 4 }}>
                {currentLessonData.teacherScript[selectedLang].script}
              </div>
            )}
            {currentLessonData.teacherScript[selectedLang]?.roman && (
              <div className="quiet" style={{ fontSize: 12, marginTop: 2 }}>
                Phonetic: {currentLessonData.teacherScript[selectedLang].roman}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Key Vocabulary Breakdown */}
        {currentLessonData.vocabulary && currentLessonData.vocabulary.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h4 className="card-title" style={{ fontSize: 14, margin: 0 }}>
                {t.fln.vocabBreakdown}
              </h4>
              <span className="quiet" style={{ fontSize: 11 }}>
                {currentLessonData.vocabulary.length} core classroom words
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {currentLessonData.vocabulary.map((v, vIdx) => {
                const parsed = parseVocab(v, selectedLang);
                return (
                  <div 
                    key={vIdx} 
                    className="script-block" 
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: 12, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-between',
                      gap: 6
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 650, color: 'var(--text-sub)' }}>
                        {v.hindi}
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <SaveToVocab
                          text={parsed.script}
                          roman={parsed.roman}
                          hindi={v.hindi}
                          lang={selectedLang}
                          langName={activeLangObj.name}
                          source="lesson"
                          context={currentLessonData.title}
                        />
                        {parsed.audioText && (
                          <AudioPlayButton 
                            text={parsed.audioText} 
                            size="sm" 
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
                        {parsed.script || '—'}
                      </div>
                      {parsed.roman && (
                        <div className="quiet" style={{ fontSize: 11, fontStyle: 'italic', marginTop: 2, color: 'var(--green-primary)' }}>
                          {parsed.roman}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ── Slide-over Lesson Drawer (Hamburger Navigation) ── */}
      {isDrawerOpen && (
        <div 
          onClick={() => setIsDrawerOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'stretch'
          }}
        >
          {/* Drawer Content Panel */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(380px, 90vw)',
              height: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '4px 0 28px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1001,
              padding: '20px 20px 24px'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-medium)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="var(--green-primary)" />
                <h3 className="card-title" style={{ fontSize: 16, margin: 0 }}>
                  {t.fln.selectLesson}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="btn-ghost"
                style={{ padding: 6, borderRadius: '50%', color: 'var(--text-muted)' }}
                title="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="seg" style={{ width: '100%', display: 'flex', marginBottom: 14 }}>
              <button
                type="button"
                style={{ flex: 1, textAlign: 'center' }}
                className={activeTabMode === 'curriculum' ? 'active' : ''}
                onClick={() => {
                  setActiveTabMode('curriculum');
                  setTranslateError(null);
                }}
              >
                {t.fln.curriculumTab}
              </button>
              <button
                type="button"
                style={{ flex: 1, textAlign: 'center' }}
                className={activeTabMode === 'custom' ? 'active' : ''}
                onClick={() => setActiveTabMode('custom')}
              >
                {t.fln.customTab}
              </button>
            </div>

            {/* Mode A: Curriculum Lessons */}
            {activeTabMode === 'curriculum' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                {/* Grade and Domain Filters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <label className="quiet" style={{ display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      Class
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="select"
                      style={{ padding: '7px 10px', fontSize: 12, fontWeight: 600 }}
                    >
                      <option value="All">{t.fln.allGrades}</option>
                      <option value="Grade 1">{t.fln.grade1}</option>
                      <option value="Grade 2">{t.fln.grade2}</option>
                      <option value="Grade 3">{t.fln.grade3}</option>
                    </select>
                  </div>
                  <div>
                    <label className="quiet" style={{ display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      Topic
                    </label>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="select"
                      style={{ padding: '7px 10px', fontSize: 12, fontWeight: 600 }}
                    >
                      <option value="All">{t.fln.allDomains}</option>
                      <option value="Literacy">{t.fln.literacy}</option>
                      <option value="Numeracy">{t.fln.numeracy}</option>
                    </select>
                  </div>
                </div>

                {/* Quick Search */}
                <div style={{ position: 'relative', marginBottom: 12 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.fln.searchPlaceholder}
                    className="field"
                    style={{ paddingLeft: 30, paddingRight: searchQuery ? 28 : 10, paddingTop: 7, paddingBottom: 7, fontSize: 12 }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 2
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Results count & reset */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="quiet" style={{ fontSize: 11, fontWeight: 600 }}>
                    {filteredLessons.length} {t.fln.preloadedLessons}
                  </span>
                  {(selectedGrade !== 'All' || selectedDomain !== 'All' || searchQuery) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGrade('All');
                        setSelectedDomain('All');
                        setSearchQuery('');
                      }}
                      className="btn-ghost"
                      style={{ padding: '2px 6px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <RotateCcw size={11} />
                      Reset
                    </button>
                  )}
                </div>

                {/* Lessons Scroll List */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson) => {
                      const isSelected = selectedLesson.id === lesson.id && !activeTranslation;
                      const isTaught = taughtLessonIds.includes(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleSelectLesson(lesson)}
                          className={`item-btn ${isSelected ? 'on' : ''}`}
                          style={{
                            padding: '10px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 4,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span 
                                className="pill info" 
                                style={{ fontSize: 10, padding: '2px 6px', lineHeight: 1 }}
                              >
                                {lesson.competencyCode}
                              </span>
                              <span className="quiet" style={{ fontSize: 11, fontWeight: 600 }}>
                                {lesson.grade}
                              </span>
                            </div>

                            {isTaught && (
                              <span 
                                className="pill ok" 
                                style={{ fontSize: 10, padding: '2px 6px', display: 'flex', alignItems: 'center', gap: 3 }}
                                title="Taught today in class"
                              >
                                <Check size={10} />
                                <span>Taught</span>
                              </span>
                            )}
                          </div>

                          <div 
                            style={{ 
                              fontSize: 13, 
                              fontWeight: 700, 
                              lineHeight: 1.35,
                              color: isSelected ? 'var(--green-primary)' : 'var(--text-main)',
                              textAlign: 'left'
                            }}
                          >
                            {lesson.title}
                          </div>

                          <div className="quiet" style={{ fontSize: 11 }}>
                            {lesson.domain} · {lesson.subject}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div 
                      style={{ 
                        padding: '24px 12px', 
                        textAlign: 'center', 
                        background: 'var(--bg-subtle)', 
                        borderRadius: 12,
                        border: '1px dashed var(--border-medium)',
                        marginTop: 20
                      }}
                    >
                      <BookOpen size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 8 }}>
                        {t.fln.noLessonsFound}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedGrade('All');
                          setSelectedDomain('All');
                          setSearchQuery('');
                        }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: 11 }}
                      >
                        {t.fln.clearFilters}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mode B: Custom Hindi Text */}
            {activeTabMode === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p className="quiet" style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.4 }}>
                  {t.fln.customPassagePrompt}
                </p>

                <textarea
                  className="field"
                  rows={5}
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    if (translateError) setTranslateError(null);
                  }}
                  placeholder={t.fln.customPlaceholder}
                  style={{ marginBottom: 10, fontSize: 13 }}
                />

                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <button 
                    type="button"
                    className="btn-secondary" 
                    onClick={handleStartTeacherMic}
                    style={{ flex: 1, padding: '8px 10px', fontSize: 12 }}
                  >
                    <Mic size={14} color={isTeacherListening ? '#e53e3e' : 'currentColor'} />
                    {isTeacherListening ? t.fln.listening : t.fln.dictate}
                  </button>
                </div>

                {translateError && (
                  <div 
                    style={{ 
                      padding: '10px 12px', 
                      background: '#FFF5F5', 
                      border: '1px solid #FEB2B2', 
                      borderRadius: 8, 
                      color: '#C53030', 
                      fontSize: 12, 
                      marginBottom: 10,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 6
                    }}
                  >
                    <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div style={{ flex: 1 }}>
                      <div>{translateError}</div>
                      <button 
                        type="button"
                        onClick={handleTranslateCustom}
                        style={{ background: 'none', border: 'none', color: '#9B2C2C', textDecoration: 'underline', fontSize: 11, cursor: 'pointer', marginTop: 4, padding: 0 }}
                      >
                        {t.fln.tryAgain}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', padding: '10px 14px', fontSize: 13 }}
                  onClick={handleTranslateCustom}
                  disabled={isTranslating || !customText.trim()}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{t.fln.translating}</span>
                    </>
                  ) : (
                    <>
                      <Languages size={14} />
                      <span>{t.fln.translateBtn} {activeLangObj.name}</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Inclusive Classroom ISL Modal */}
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
