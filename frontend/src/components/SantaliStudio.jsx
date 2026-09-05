import React, { useState } from 'react';
import { 
  BookOpen, 
  Languages, 
  FileText, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  Download,
  HelpCircle
} from 'lucide-react';
import { SAMPLE_FLN_LESSONS, APERTIUM_SANTALI_LEXICON, TRIBAL_LANGUAGES } from '../services/apertiumSantaliData';
import { irisAskTutor } from '../services/api';
import AudioPlayButton from './AudioPlayButton';
import jsPDF from 'jspdf';

export default function SantaliStudio({ setCurrentTab }) {
  const [selectedLang, setSelectedLang] = useState('sat'); // 'sat' | 'hoc' | 'unr'
  const [selectedLesson, setSelectedLesson] = useState(SAMPLE_FLN_LESSONS[0]);
  const [customText, setCustomText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTranslation, setActiveTranslation] = useState(null);
  const [scriptMode, setScriptMode] = useState('both'); // 'both' | 'native' | 'roman'

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const currentLessonData = activeTranslation || {
    title: selectedLesson.title,
    grade: selectedLesson.grade,
    subject: selectedLesson.subject,
    sourceText: selectedLesson.sourceText,
    scriptText: selectedLesson[selectedLang]?.script || selectedLesson.sat.script,
    romanText: selectedLesson[selectedLang]?.roman || selectedLesson.sat.roman,
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
            Jharkhand PALASH MTB-MLE · FLN Curriculum Bridge
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            FLN Lesson Translation & Scripting Studio
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Translates standard Hindi primary FLN lessons into tribal mother tongues with synthesized audio guides for teachers.
          </p>
        </div>

        {/* Tribal Language Selector Pills with Crisp Borders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Language:</span>
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
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setActiveTranslation(null);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isSelected ? '700' : '600',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                    backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {lang.name} ({lang.nativeName})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Spacious 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Lesson Library (Decluttered) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '18px', backgroundColor: '#FFFFFF' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={15} color="var(--accent)" />
                <span>FLN Lessons Library</span>
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NCERT / JCERT</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SAMPLE_FLN_LESSONS.map((lesson) => {
                const isSelected = selectedLesson.id === lesson.id && !activeTranslation;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectPreloaded(lesson)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-medium)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? 'var(--accent)' : 'var(--text-main)', marginBottom: '3px' }}>
                      {lesson.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{lesson.grade}</span>
                      <span>{lesson.subject}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Guidance Note */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border-medium)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: '1.5'
          }}>
            <div style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={14} color="var(--accent)" />
              <span>Target Script: {activeLangObj.script}</span>
            </div>
            <span>Primary teachers can read phonetic transliterations aloud or show native script on tablet.</span>
          </div>
        </div>

        {/* Right Column: Studio Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Custom Input Bar (Clean & Compact) */}
          <div className="card" style={{ padding: '16px 20px', backgroundColor: '#FFFFFF' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} color="var(--accent)" />
              <span>Translate Custom Hindi Lesson Text into {activeLangObj.name}:</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type any Hindi lesson sentence or question..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleTranslateCustom}
                disabled={isTranslating || !customText.trim()}
                style={{
                  padding: '0 16px',
                  borderRadius: '6px',
                  backgroundColor: isTranslating || !customText.trim() ? 'var(--border-medium)' : 'var(--accent)',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '12px',
                  border: 'none',
                  cursor: isTranslating || !customText.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isTranslating ? <RefreshCw className="animate-spin" size={14} /> : <ArrowRight size={14} />}
                <span>{isTranslating ? 'Translating' : 'Translate'}</span>
              </button>
            </div>
          </div>

          {/* Main Lesson Translation Card */}
          <div className="card card-highlight" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
            {/* Header & Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {currentLessonData.grade} · {currentLessonData.subject} · {activeLangObj.name}
                </span>
                <h2 style={{ fontSize: '17px', fontWeight: '800', margin: '2px 0 0 0', color: 'var(--text-main)' }}>
                  {currentLessonData.title}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Script Switcher */}
                <div style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '6px',
                  padding: '2px',
                  border: '1px solid var(--border-medium)'
                }}>
                  <button
                    onClick={() => setScriptMode('both')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: 'none',
                      backgroundColor: scriptMode === 'both' ? 'var(--accent)' : 'transparent',
                      color: scriptMode === 'both' ? '#FFFFFF' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Dual Script
                  </button>
                  <button
                    onClick={() => setScriptMode('native')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      border: 'none',
                      backgroundColor: scriptMode === 'native' ? 'var(--accent)' : 'transparent',
                      color: scriptMode === 'native' ? '#FFFFFF' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Native Only
                  </button>
                </div>

                {/* Audio Play/Pause Button */}
                <AudioPlayButton
                  text={currentLessonData.romanText || currentLessonData.sourceText}
                  label="Listen Aloud"
                />

                {/* Export Lesson PDF */}
                <button
                  onClick={handleExportLessonNotes}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  title="Export printable lesson plan PDF"
                >
                  <Download size={13} />
                  <span>PDF Notes</span>
                </button>
              </div>
            </div>

            {/* Tribal Language Script Box with Clear Highlight */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1.5px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '18px 20px',
              marginBottom: '16px'
            }}>
              {(scriptMode === 'both' || scriptMode === 'native') && (
                <div style={{
                  fontSize: '19px',
                  fontWeight: '800',
                  color: 'var(--text-main)',
                  lineHeight: '1.7',
                  marginBottom: scriptMode === 'both' ? '8px' : '0',
                  letterSpacing: '0.3px'
                }}>
                  {currentLessonData.scriptText}
                </div>
              )}

              {(scriptMode === 'both' || scriptMode === 'roman') && (
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--accent)',
                  lineHeight: '1.5',
                  fontStyle: 'italic'
                }}>
                  "{currentLessonData.romanText}"
                </div>
              )}
            </div>

            {/* Standard Hindi Curriculum Box */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Standard Hindi Curriculum Text
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: '1.5' }}>
                {currentLessonData.sourceText}
              </div>
            </div>

            {/* Vocabulary Breakdown Table */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                Key Vocabulary in Lesson:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {(currentLessonData.vocabulary || []).map((v, idx) => {
                  const tribalVal = v[selectedLang] || v.sat || Object.values(v)[0];
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ fontWeight: '700', color: 'var(--accent)' }}>{tribalVal}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v.hindi}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pedagogical Guidance */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--secondary-light)',
              border: '1px solid var(--secondary-border)',
              fontSize: '12px',
              color: 'var(--secondary-accent)'
            }}>
              <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} />
                <span>Pedagogical Instructions for Non-Native Hindi Teachers:</span>
              </div>
              <ul style={{ margin: '2px 0 0 0', paddingLeft: '18px', lineHeight: '1.5' }}>
                <li>Listen to the audio guide using the <strong>Listen Aloud</strong> control before reading to class.</li>
                <li>Encourage students to repeat the phrase in {activeLangObj.name} before reviewing Hindi meaning.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
