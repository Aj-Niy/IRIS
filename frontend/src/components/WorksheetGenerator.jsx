import React, { useState, useRef } from 'react';
import { 
  FileCheck, 
  Download,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { NIPUN_OUTCOMES_MATRIX, TRIBAL_LANGUAGES } from '../services/apertiumSantaliData';
import { irisAskTutor } from '../services/api';
import AudioPlayButton from './AudioPlayButton';

export default function WorksheetGenerator() {
  const [selectedLang, setSelectedLang] = useState('sat'); // 'sat' | 'hoc' | 'unr'
  const [selectedOutcome, setSelectedOutcome] = useState(NIPUN_OUTCOMES_MATRIX[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [worksheetData, setWorksheetData] = useState(null);
  const [activeTab, setActiveTab] = useState('worksheet'); // 'worksheet' | 'flashcards'
  const [flippedCardIndex, setFlippedCardIndex] = useState(null);
  const [schoolName, setSchoolName] = useState('Govt. Primary School, Jharkhand');
  const [isExporting, setIsExporting] = useState(false);
  const worksheetRef = useRef(null);

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  // Default worksheet data
  const currentWorksheet = worksheetData || {
    nipunCode: selectedOutcome.code,
    outcomeTitle: selectedOutcome.lakshya,
    grade: selectedOutcome.grade,
    worksheetTitle: `NIPUN Bharat ${selectedOutcome.code} Practice Worksheet (${activeLangObj.name})`,
    instructions: `Read each prompt carefully. Complete your answers using ${activeLangObj.name} vocabulary and numerals.`,
    questions: [
      {
        qNumber: 1,
        type: "mcq",
        prompt: `Identify the initial letter/word for 'Book' in ${activeLangObj.name}:`,
        options: selectedLang === 'sat' 
          ? ["ᱯ (ᱯᱚᱛᱚᱵ)", "ᱛ (ᱛᱤ)", "ᱵ (ᱵᱟᱦᱟ)", "ᱫ (ᱫᱟᱜ)"] 
          : ["ᱯ (ᱯᱩᱛᱷᱤ)", "ᱫ (ᱫᱟᱨᱩ)", "ᱵ (ᱵᱟ)", "ᱥ (ᱥᱤᱸᱜᱤ)"],
        answer: selectedLang === 'sat' ? "ᱯ (ᱯᱚᱛᱚᱵ)" : "ᱯ (ᱯᱩᱛᱷᱤ)"
      },
      {
        qNumber: 2,
        type: "mcq",
        prompt: `What is 'Two' (२) in ${activeLangObj.name}?`,
        options: selectedLang === 'sat'
          ? ["ᱢᱤᱫ (1)", "ᱵᱟᱨ (2)", "ᱯᱮ (3)", "ᱯᱩᱱ (4)"]
          : ["ᱢᱤᱭᱟᱹᱫ (1)", "ᱵᱟᱹᱨᱤᱭᱟᱹ (2)", "ᱟᱹᱯᱤᱭᱟᱹ (3)", "ᱩᱯᱩᱱᱤᱭᱟᱹ (4)"],
        answer: selectedLang === 'sat' ? "ᱵᱟᱨ (2)" : "ᱵᱟᱹᱨᱤᱭᱟᱹ (2)"
      },
      {
        qNumber: 3,
        type: "mcq",
        prompt: `Choose the ${activeLangObj.name} word for Water (पानी):`,
        options: ["ᱫᱟᱜ (Da')", "ᱫᱟᱨᱮ / ᱫᱟᱨᱩ (Tree)", "ᱵᱟᱦᱟ / ᱵᱟ (Flower)", "ᱜᱟᱹᱭ (Cow)"],
        answer: "ᱫᱟᱜ (Da')"
      },
      {
        qNumber: 4,
        type: "fill",
        prompt: `Count the stars and write in numerals: [ ⭐ ⭐ ⭐ ] = _____________`,
        answer: selectedLang === 'sat' ? "ᱯᱮ (pe / 3)" : "ᱟᱹᱯᱤᱭᱟᱹ (apia / 3)"
      }
    ],
    flashcards: [
      { front: selectedLang === 'sat' ? "ᱯᱚᱛᱚᱵ" : "ᱯᱩᱛᱷᱤ", roman: selectedLang === 'sat' ? "Potob" : "Puthi", back: "Book (किताब)", category: "Classroom" },
      { front: selectedLang === 'sat' ? "ᱢᱟᱪᱮᱛ" : "ᱢᱟᱪᱮᱫ", roman: selectedLang === 'sat' ? "Machet" : "Mached", back: "Teacher (शिक्षक)", category: "People" },
      { front: selectedLang === 'sat' ? "ᱫᱟᱨᱮ" : "ᱫᱟᱨᱩ", roman: selectedLang === 'sat' ? "Dare" : "Daru", back: "Tree (पेड़)", category: "Nature" },
      { front: "ᱫᱟᱜ", roman: "Da'", back: "Water (पानी)", category: "Basics" },
      { front: selectedLang === 'sat' ? "ᱵᱟᱦᱟ" : "ᱵᱟ", roman: selectedLang === 'sat' ? "Baha" : "Ba", back: "Flower (फूल)", category: "Nature" },
      { front: selectedLang === 'sat' ? "ᱟᱥᱲᱟ" : "ᱤᱥᱠᱩᱞ", roman: selectedLang === 'sat' ? "Asṛa" : "Iskul", back: "School (विद्यालय)", category: "Classroom" }
    ]
  };

  const handleGenerate = async (outcome) => {
    setSelectedOutcome(outcome);
    setIsGenerating(true);
    setFlippedCardIndex(null);

    try {
      const res = await irisAskTutor({
        mode: 'worksheet',
        nipunCode: outcome.code,
        lessonContext: `${outcome.grade} ${outcome.domain} ${outcome.lakshya} ${activeLangObj.name}`,
        targetLanguage: activeLangObj.name
      });
      if (res && res.questions) {
        setWorksheetData(res);
      }
    } catch (err) {
      console.warn("Worksheet gen fallback:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportPDF = async () => {
    if (!worksheetRef.current) return;
    setIsExporting(true);
    try {
      // Use html2canvas to screenshot the rendered DOM preserving all Unicode (Ol Chiki, Devanagari, Warang Chiti)
      const canvas = await html2canvas(worksheetRef.current, {
        scale: 2.5, // High DPI for print quality
        useCORS: true,
        backgroundColor: '#FFFFFF',
        logging: false,
        width: worksheetRef.current.scrollWidth,
        height: worksheetRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let yPos = margin;
      if (contentHeight <= pdfHeight - margin * 2) {
        pdf.addImage(imgData, 'PNG', margin, yPos, contentWidth, contentHeight);
      } else {
        // Multi-page support for long worksheets
        let remainingHeight = contentHeight;
        let sourceY = 0;
        const pageContentHeight = pdfHeight - margin * 2;

        while (remainingHeight > 0) {
          const sliceH = Math.min(remainingHeight, pageContentHeight);
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = (sliceH / contentHeight) * canvas.height;

          const ctx = sliceCanvas.getContext('2d');
          ctx.drawImage(canvas,
            0, sourceY * (canvas.height / contentHeight),
            canvas.width, sliceCanvas.height,
            0, 0,
            canvas.width, sliceCanvas.height
          );

          if (sourceY > 0) pdf.addPage();
          pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, contentWidth, sliceH);
          sourceY += sliceH;
          remainingHeight -= sliceH;
        }
      }

      pdf.save(`PALASH_NIPUN_${currentWorksheet.nipunCode}_${selectedLang}_${activeLangObj.name}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF export failed. Please use the Print button to save as PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Banner with Vibrant Borders */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '2px solid #FED7AA',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 2px 8px rgba(234,88,12,0.07)'
      }}>
        <div>
          <div style={{
            fontSize: '11px', fontWeight: '800', color: '#EA580C',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'
          }}>
            NIPUN Bharat Outcomes Framework · Jharkhand MTB-MLE
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#0F172A' }}>
            Auto-Generated Bilingual Worksheets &amp; Visual Flashcards
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
            Generate classroom worksheets and printable flashcard decks aligned with Foundational Literacy and Numeracy Lakshyas.
          </p>
        </div>

        {/* Tribal Language & Tab Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', backgroundColor: '#FFF7ED',
            borderRadius: '10px', padding: '3px',
            border: '1.5px solid #FDBA74'
          }}>
            {TRIBAL_LANGUAGES.map(lang => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setWorksheetData(null);
                  }}
                  style={{
                    padding: '6px 12px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: isSelected ? '800' : '600',
                    border: isSelected ? '1.5px solid #EA580C' : '1.5px solid transparent',
                    background: isSelected ? 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#334155',
                    cursor: 'pointer'
                  }}
                >
                  {lang.name}
                </button>
              );
            })}
          </div>

          <div style={{
            display: 'flex', backgroundColor: '#FFF7ED',
            borderRadius: '10px', padding: '3px',
            border: '1.5px solid #FDBA74'
          }}>
            <button
              onClick={() => setActiveTab('worksheet')}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                fontWeight: activeTab === 'worksheet' ? '800' : '600',
                fontSize: '12px', cursor: 'pointer',
                border: activeTab === 'worksheet' ? '1.5px solid #EA580C' : '1.5px solid transparent',
                background: activeTab === 'worksheet' ? 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' : 'transparent',
                color: activeTab === 'worksheet' ? '#FFFFFF' : '#334155'
              }}
            >
              Worksheet View
            </button>
            <button
              onClick={() => setActiveTab('flashcards')}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                fontWeight: activeTab === 'flashcards' ? '800' : '600',
                fontSize: '12px', cursor: 'pointer',
                border: activeTab === 'flashcards' ? '1.5px solid #EA580C' : '1.5px solid transparent',
                background: activeTab === 'flashcards' ? 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)' : 'transparent',
                color: activeTab === 'flashcards' ? '#FFFFFF' : '#334155'
              }}
            >
              Flashcards
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: NIPUN Outcomes Framework */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '18px', backgroundColor: '#FFFFFF' }}>
            <h3 style={{
              fontSize: '13px', fontWeight: '800',
              margin: '0 0 10px 0', paddingBottom: '8px',
              borderBottom: '2px solid #FED7AA', color: '#0F172A'
            }}>
              Select NIPUN Bharat Lakshya:
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto' }}>
              {NIPUN_OUTCOMES_MATRIX.map((outcome) => {
                const isSelected = selectedOutcome.code === outcome.code;
                return (
                  <button
                    key={outcome.code}
                    onClick={() => handleGenerate(outcome)}
                    style={{
                      textAlign: 'left', padding: '10px 12px', borderRadius: '8px',
                      border: isSelected ? '2px solid #EA580C' : '1.5px solid #FED7AA',
                      backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C' }}>
                        {outcome.code} · {outcome.domain}
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748B' }}>{outcome.grade}</span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0F172A', lineHeight: '1.4' }}>
                      {outcome.lakshya}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', display: 'block', marginBottom: '6px' }}>
              School Name on PDF Header:
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '8px',
                border: '1.5px solid #FDBA74', backgroundColor: '#FFF7ED',
                color: '#0F172A', fontSize: '12px', fontWeight: '600', outline: 'none'
              }}
            />
          </div>
        </div>


        {/* Right Column: Printable Worksheet / Flashcard View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeTab === 'worksheet' && (
            <div className="card card-highlight" ref={worksheetRef} id="worksheet-print-area" style={{ padding: '26px', backgroundColor: '#FFFFFF' }}>
              {/* Header (not captured in PDF - shown only as toolbar) */}
              <div className="no-print" style={{
                borderBottom: '2px solid #FED7AA',
                paddingBottom: '14px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase' }}>
                    {currentWorksheet.grade} · {selectedOutcome.domain} · Code: {currentWorksheet.nipunCode} · {activeLangObj.name}
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', margin: '4px 0', color: '#0F172A' }}>
                    {currentWorksheet.worksheetTitle}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#334155' }}>
                    Competency: {currentWorksheet.outcomeTitle}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={handlePrint}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 12px', borderRadius: '8px',
                      backgroundColor: '#EFF6FF', color: '#2563EB',
                      border: '1.5px solid #BFDBFE', fontWeight: '700',
                      fontSize: '12px', cursor: 'pointer'
                    }}
                  >
                    <Printer size={14} />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={exportPDF}
                    disabled={isExporting}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '8px',
                      background: isExporting ? '#FED7AA' : 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                      color: '#FFFFFF', border: 'none',
                      fontWeight: '700', fontSize: '12px',
                      cursor: isExporting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 6px rgba(234,88,12,0.3)'
                    }}
                  >
                    <Download size={14} />
                    <span>{isExporting ? 'Generating PDF…' : 'Download PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Printable Header Block (captured in PDF canvas) */}
              <div style={{
                backgroundColor: '#FFF7ED', borderRadius: '8px',
                border: '1.5px solid #FDBA74', padding: '12px 16px',
                marginBottom: '14px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#EA580C', textTransform: 'uppercase', marginBottom: '2px' }}>
                  PALASH MTB-MLE Programme · Government of Jharkhand
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                  NIPUN Bharat {currentWorksheet.nipunCode} — {activeLangObj.name} Worksheet
                </div>
                <div style={{ fontSize: '11px', color: '#334155', marginTop: '2px' }}>
                  {schoolName} · Competency: {currentWorksheet.outcomeTitle}
                </div>
              </div>

              {/* Student Header Line */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#FFF7ED',
                border: '1.5px solid #FDBA74',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '18px'
              }}>
                <span><strong>Student Name:</strong> _____________________</span>
                <span><strong>Class:</strong> {currentWorksheet.grade}</span>
                <span><strong>Date:</strong> ____________</span>
              </div>

              {/* Questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {currentWorksheet.questions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #FED7AA',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>
                      <span style={{ color: '#EA580C', marginRight: '6px', fontWeight: '900' }}>Q{idx + 1}.</span>
                      {q.prompt}
                    </div>

                    {q.options ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '6px',
                              backgroundColor: '#FFFDF9',
                              border: '1.5px solid #FED7AA',
                              fontSize: '13px',
                              fontWeight: '700',
                              color: '#0F172A',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <span style={{
                              width: '16px', height: '16px', borderRadius: '50%',
                              border: '2px solid #FDBA74', display: 'inline-block',
                              flexShrink: 0
                            }}></span>
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        height: '32px',
                        borderBottom: '2px dashed #FDBA74',
                        marginTop: '8px'
                      }} />
                    )}
                  </div>
                ))}
              </div>

              {/* PDF Footer */}
              <div style={{
                marginTop: '20px', paddingTop: '12px',
                borderTop: '2px solid #FED7AA',
                fontSize: '10px', color: '#64748B', textAlign: 'center'
              }}>
                Government of Jharkhand · PALASH MTB-MLE · NIPUN Bharat FLN Programme
              </div>
            </div>
          )}


          {activeTab === 'flashcards' && (
            <div className="card" style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
              <div style={{ marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                  Visual Classroom Flashcard Decks ({activeLangObj.name})
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Click card to flip between native script and Hindi gloss. Use audio controls to play and pause.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                {currentWorksheet.flashcards.map((card, idx) => {
                  const isFlipped = flippedCardIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setFlippedCardIndex(isFlipped ? null : idx)}
                      style={{
                        height: '170px',
                        borderRadius: '8px',
                        padding: '14px',
                        backgroundColor: isFlipped ? '#FFFFFF' : '#F8FAFC',
                        border: isFlipped ? '1.5px solid var(--accent)' : '1px solid var(--border-medium)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)'
                      }}>
                        {card.category} · {isFlipped ? 'Hindi' : activeLangObj.name}
                      </div>

                      {!isFlipped ? (
                        <div>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '4px' }}>
                            {card.front}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)' }}>
                            ({card.roman})
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                            {card.back}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {activeLangObj.name}: {card.front}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AudioPlayButton
                          text={card.roman || card.front}
                          size="sm"
                          showStop={false}
                          label="Audio"
                        />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tap to flip</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
