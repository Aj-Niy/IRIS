import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Languages, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Download,
  HelpCircle,
  Mic,
  Headphones,
  Sparkles,
  Layers,
  GraduationCap,
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
  const [selectedGrade, setSelectedGrade] = useState('All'); // 'All' | 'Grade 1' | 'Grade 2' | 'Grade 3'
  const [selectedLesson, setSelectedLesson] = useState(SAMPLE_FLN_LESSONS[0]);
  const [customText, setCustomText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTranslation, setActiveTranslation] = useState(null);
  const [scriptMode, setScriptMode] = useState('both'); // 'both' | 'native' | 'roman'

  // Embedded Voice Practice state
  const [isTeacherListening, setIsTeacherListening] = useState(false);
  const [isChildListening, setIsChildListening] = useState(false);
  const [childSpeechMatch, setChildSpeechMatch] = useState(CHILD_TRIBAL_RESPONSES[0]);

  // ISL Video Player state
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

  // Embedded Push-to-Talk Mic for Teacher Practice
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

  // Embedded Child Voice Matcher
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* Top Banner with Clean Borders */}
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
            marginBottom: '4px'
          }}>
            {t.fln.headerTag} · Grades 1, 2, 3
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px 0', color: '#0F172A' }}>
            {t.fln.title}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
            {t.fln.subtitle} <strong>Santhali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)</strong>, <strong>Ho (Warang Chiti 𑢹𑣉𑣉)</strong>, and <strong>Mundari</strong>.
          </p>
        </div>

        {/* Tribal Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Language:</span>
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
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Studio Grid - Clean 2 Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Lesson Library & Custom Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Preloaded Lessons with Grade 1-3 Filter Tabs */}
          <div className="card" style={{ padding: '18px', backgroundColor: '#FFFFFF' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                {t.fln.preloadedLessons}:
              </h3>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#EA580C', backgroundColor: '#FFF7ED', padding: '2px 6px', borderRadius: '4px' }}>
                NIPUN FLN
              </span>
            </div>

            {/* Grade 1, Grade 2, Grade 3 Filter Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {['All', 'Grade 1', 'Grade 2', 'Grade 3'].map(gr => {
                const isSelected = selectedGrade === gr;
                return (
                  <button
                    key={gr}
                    onClick={() => setSelectedGrade(gr)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: isSelected ? '800' : '600',
                      backgroundColor: isSelected ? '#EA580C' : '#FFF7ED',
                      color: isSelected ? '#FFFFFF' : '#334155',
                      border: '1px solid #FED7AA',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {gr === 'All' ? t.fln.allGrades : gr === 'Grade 1' ? t.fln.grade1 : gr === 'Grade 2' ? t.fln.grade2 : t.fln.grade3}
                  </button>
                );
              })}
            </div>

            {/* Lesson Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {filteredLessons.map((lesson) => {
                const isSelected = selectedLesson.id === lesson.id && !activeTranslation;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectPreloaded(lesson)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #EA580C' : '1.5px solid #FED7AA',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>
                      {lesson.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span style={{ fontWeight: '700', color: '#EA580C' }}>{lesson.grade}</span>
                      <span>{lesson.subject}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Translation Input */}
          <div className="card" style={{ padding: '18px', backgroundColor: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: '#0F172A' }}>
                {t.fln.customPassage}:
              </h3>
              <button
                onClick={handleStartTeacherMic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: isTeacherListening ? '#EF4444' : '#FFF7ED',
                  border: '1px solid #FDBA74',
                  color: isTeacherListening ? '#FFFFFF' : '#EA580C',
                  fontSize: '10px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                <Mic size={11} />
                <span>{isTeacherListening ? 'Listening…' : 'Dictate'}</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="e.g. आज हम सब मिलकर पेड़ों और पक्षियों के बारे में पढ़ेंगे..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1.5px solid #FED7AA',
                backgroundColor: '#FFFDF9',
                color: '#0F172A',
                fontSize: '12px',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '10px'
              }}
            />

            <button
              onClick={handleTranslateCustom}
              disabled={isTranslating || !customText.trim()}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '8px',
                backgroundColor: isTranslating || !customText.trim() ? '#FED7AA' : '#EA580C',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '12px',
                cursor: isTranslating || !customText.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isTranslating ? 'Translating via Apertium…' : `${t.fln.translateBtn} ${activeLangObj.name} →`}
            </button>
          </div>
        </div>

        {/* Right Column: Dual-Script Classroom Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Dual Script View Card */}
          <div className="card card-highlight" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            {/* Header & Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '14px',
              marginBottom: '18px',
              borderBottom: '1.5px solid #FED7AA'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase' }}>
                  {currentLessonData.grade} · {currentLessonData.subject}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '2px 0 0 0', color: '#0F172A' }}>
                  {currentLessonData.title}
                </h2>
              </div>

              {/* View Mode & Export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  display: 'flex',
                  backgroundColor: '#FFF7ED',
                  borderRadius: '6px',
                  padding: '2px',
                  border: '1px solid #FDBA74'
                }}>
                  <button
                    onClick={() => setScriptMode('both')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      backgroundColor: scriptMode === 'both' ? '#EA580C' : 'transparent',
                      color: scriptMode === 'both' ? '#FFFFFF' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {t.fln.dualScript}
                  </button>
                  <button
                    onClick={() => setScriptMode('native')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '800',
                      backgroundColor: scriptMode === 'native' ? '#EA580C' : 'transparent',
                      color: scriptMode === 'native' ? '#FFFFFF' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {t.fln.nativeOnly}
                  </button>
                </div>

                <button
                  onClick={handleExportLessonNotes}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #FED7AA',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                  title="Export Teacher Lesson Notes"
                >
                  <Download size={13} />
                  <span>{t.fln.exportNotes}</span>
                </button>
              </div>
            </div>

            {/* Step 1: Standard Hindi Original */}
            <div style={{
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: '#FFFDF9',
              border: '1.5px solid #FED7AA',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                {t.fln.hindiSource}:
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', lineHeight: '1.6' }}>
                {currentLessonData.sourceText}
              </div>
            </div>

            {/* Step 2: Target Tribal Script with Audio Controls */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #EA580C',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase' }}>
                  {t.fln.tribalDelivery} ({activeLangObj.name} · {activeLangObj.script}):
                </div>
                
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleOpenIsl(currentLessonData.title, currentLessonData.sourceText || currentLessonData.title)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FCD34D',
                      color: '#92400E',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title="Watch ISL (Indian Sign Language) Clip"
                  >
                    <Hand size={12} color="#D97706" />
                    <span>Watch ISL</span>
                  </button>
                  {/* Universal Play/Pause/Stop Button */}
                  <AudioPlayButton
                    text={currentLessonData.romanText || currentLessonData.scriptText}
                    size="sm"
                    label={t.fln.pronounce}
                  />
                </div>
              </div>

              {/* Native Script Display */}
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', lineHeight: '1.6', marginBottom: '6px' }}>
                {currentLessonData.scriptText}
              </div>

              {/* Phonetic Pronunciation Guide for Non-Native Hindi Teachers */}
              {(scriptMode === 'both' || scriptMode === 'roman') && currentLessonData.romanText && (
                <div style={{
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px dashed #FED7AA',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#C2410C',
                  fontStyle: 'italic'
                }}>
                  Teacher Phonetic Guide: "{currentLessonData.romanText}"
                </div>
              )}
            </div>

            {/* Step 3: Vocabulary Breakdown Tiles */}
            {currentLessonData.vocabulary && currentLessonData.vocabulary.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  {t.fln.vocabBreakdown}:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                  {currentLessonData.vocabulary.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFDF9',
                        border: '1px solid #FED7AA',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{v.hindi}</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>
                          {v[selectedLang] || v.sat || 'ᱟᱹᱲᱟᱹ'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenIsl(v.hindi, v.english || v.hindi)}
                        style={{
                          padding: '3px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#FFFBEB',
                          border: '1px solid #FDE68A',
                          color: '#B45309',
                          fontSize: '10px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          cursor: 'pointer'
                        }}
                        title="Watch ISL sign"
                      >
                        <Hand size={10} color="#D97706" />
                        <span>ISL</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Embedded Interactive Classroom Practice Bar */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '10px',
              backgroundColor: '#F0FDF4',
              border: '1.5px solid #A7F3D0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Two-Way Classroom Voice Practice for This Lesson:
                </div>
                <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: '700' }}>
                  Expected Child Response: <span style={{ color: '#059669' }}>"{childSpeechMatch.olChiki}"</span> ({childSpeechMatch.hindi})
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleStartChildMic}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: isChildListening ? '#EF4444' : '#059669',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  <Headphones size={12} />
                  <span>{isChildListening ? 'Listening…' : 'Test Child Response'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('phrasebook')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Open Full Voice Engine →
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

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

