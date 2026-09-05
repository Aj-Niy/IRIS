import React, { useState } from 'react';
import { 
  Languages, 
  BookOpen, 
  FileCheck, 
  Volume2, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Radio,
  GraduationCap
} from 'lucide-react';
import { SAMPLE_FLN_LESSONS, TRIBAL_LANGUAGES } from '../services/apertiumSantaliData';
import AudioPlayButton from './AudioPlayButton';

export default function LandingPage({ setCurrentTab, setUserRole, setUserName }) {
  const [selectedLang, setSelectedLang] = useState('sat'); // 'sat' | 'hoc' | 'unr'
  const [demoLesson, setDemoLesson] = useState(SAMPLE_FLN_LESSONS[0]);

  const activeLangObj = TRIBAL_LANGUAGES.find(l => l.code === selectedLang) || TRIBAL_LANGUAGES[0];

  const handleLaunch = (tab = 'santali-studio') => {
    if (setUserName) setUserName('Primary Teacher');
    if (setUserRole) setUserRole('teacher');
    localStorage.setItem('palash_username', 'Primary Teacher');
    localStorage.setItem('palash_userrole', 'teacher');
    setCurrentTab(tab);
  };

  const lessonScript = demoLesson[selectedLang]?.script || demoLesson.sat.script;
  const lessonRoman = demoLesson[selectedLang]?.roman || demoLesson.sat.roman;

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Official Government Header Banner */}
      <div style={{ maxWidth: '1300px', margin: '20px auto 0', padding: '0 20px' }}>
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px solid var(--border-medium)',
          borderRadius: '10px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px'
        }}>
          <div>
            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>
              Government of Jharkhand · Department of Higher & Technical Education
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              PALASH Mother Tongue-Based Multilingual Education (MTB-MLE) Programme · Problem Statement ID: <strong>26042</strong>
            </div>
          </div>
          <button
            onClick={() => handleLaunch('santali-studio')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Launch FLN Studio →
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ maxWidth: '1300px', margin: '32px auto 0', padding: '0 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: '36px',
          alignItems: 'center'
        }}>
          {/* Left Column: Context & Capabilities */}
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}>
              AI-Powered Vernacular Pedagogy & Real-Time Translation
            </div>

            <h1 style={{
              fontSize: '34px',
              fontWeight: '900',
              lineHeight: '1.25',
              margin: '0 0 14px 0',
              color: 'var(--text-main)',
              letterSpacing: '-0.5px'
            }}>
              Mother Tongue-Based Primary Education for <span style={{ color: 'var(--accent)' }}>5,000+ Tribal Schools</span> in Jharkhand
            </h1>

            <p style={{
              fontSize: '15px',
              color: 'var(--text-muted)',
              lineHeight: '1.6',
              margin: '0 0 24px 0'
            }}>
              Enables non-native speaking, Hindi-medium primary school teachers to deliver foundational literacy and numeracy (FLN) in <strong>Santhali (Ol Chiki ᱚᱞ ᱪᱤᱠᱤ)</strong>, <strong>Ho (Warang Chiti 𑢹𑣉𑣉)</strong>, and <strong>Mundari</strong> without prior language training.
            </p>

            {/* 4 Core Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <BookOpen size={18} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>FLN Lesson Translator</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hindi to Santhali, Ho & Mundari</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Volume2 size={18} color="#16A34A" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>Real-Time Voice Dialogue</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sub-3s Response Latency</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FileCheck size={18} color="#0284C7" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>NIPUN Worksheets</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>L1-L5 / M1-M5 Printable PDF</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Radio size={18} color="#7C3AED" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>100% Offline Tablet Engine</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Runs on &le; 2GB RAM Devices</div>
                </div>
              </div>
            </div>

            {/* Launch Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleLaunch('santali-studio')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 22px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent)',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span>Launch FLN Studio</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => handleLaunch('phrasebook')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-medium)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={15} />
                <span>Real-Time Voice Tool</span>
              </button>

              <button
                onClick={() => handleLaunch('worksheets')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-medium)',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FileCheck size={15} />
                <span>NIPUN Worksheets</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Demo Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px'
            }}>
              {/* Demo Language Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Live Translation Demo
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {TRIBAL_LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLang(lang.code)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: selectedLang === lang.code ? '1px solid var(--accent)' : '1px solid var(--border-medium)',
                        backgroundColor: selectedLang === lang.code ? 'var(--accent)' : 'var(--bg-subtle)',
                        color: selectedLang === lang.code ? '#FFFFFF' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tribal Script Display */}
              <div style={{
                padding: '18px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border-medium)',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {lessonScript}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', fontStyle: 'italic' }}>
                  "{lessonRoman}"
                </div>
              </div>

              {/* Hindi Source */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '12px',
                color: 'var(--text-main)',
                marginBottom: '14px'
              }}>
                <strong>Hindi Source:</strong> {demoLesson.sourceText}
              </div>

              {/* Audio Play/Pause Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AudioPlayButton
                  text={lessonRoman || demoLesson.sourceText}
                  label={`Listen in ${activeLangObj.name}`}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Script: <strong>{activeLangObj.script}</strong>
                </span>
              </div>
            </div>

            {/* Deployment Requirements Card */}
            <div style={{
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              fontSize: '12px',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong>Offline Tablet Target:</strong> Android 9+, &le; 2GB RAM
              </div>
              <span style={{ fontWeight: '700' }}>✓ Verified</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
