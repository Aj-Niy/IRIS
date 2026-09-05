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
import { uiTranslations } from '../services/uiTranslations';

export default function LandingPage({ 
  setCurrentTab, 
  setUserRole, 
  setUserName,
  uiLang = 'en',
  currentLang = 'sat'
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;
  const [selectedLang, setSelectedLang] = useState(currentLang || 'sat');
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
          backgroundColor: '#FFFDF9',
          border: '1px solid #FDBA74',
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
            <div style={{ fontWeight: '700', color: '#0F172A' }}>
              {t.common.govtHeader} · Department of Higher & Technical Education
            </div>
            <div style={{ color: '#334155', marginTop: '2px' }}>
              {t.common.psTag}
            </div>
          </div>
          <button
            onClick={() => handleLaunch('santali-studio')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {t.landing.launchBtn} →
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
              color: '#EA580C',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}>
              {t.landing.badge}
            </div>

            <h1 style={{
              fontSize: '34px',
              fontWeight: '900',
              lineHeight: '1.25',
              margin: '0 0 14px 0',
              color: '#0F172A',
              letterSpacing: '-0.5px'
            }}>
              {t.landing.title}
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#334155',
              lineHeight: '1.6',
              margin: '0 0 24px 0'
            }}>
              {t.landing.subtitle}
            </p>

            {/* 4 Core Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDBA74',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <BookOpen size={18} color="#EA580C" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{t.landing.pillar1Title}</div>
                  <div style={{ fontSize: '11px', color: '#334155' }}>{t.landing.pillar1Desc}</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDBA74',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Volume2 size={18} color="#16A34A" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{t.landing.pillar2Title}</div>
                  <div style={{ fontSize: '11px', color: '#334155' }}>{t.landing.pillar2Desc}</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDBA74',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <FileCheck size={18} color="#0284C7" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{t.landing.pillar3Title}</div>
                  <div style={{ fontSize: '11px', color: '#334155' }}>{t.landing.pillar3Desc}</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #FDBA74',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Radio size={18} color="#7C3AED" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>{t.landing.pillar4Title}</div>
                  <div style={{ fontSize: '11px', color: '#334155' }}>{t.landing.pillar4Desc}</div>
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
                  backgroundColor: '#EA580C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <span>{t.landing.launchBtn}</span>
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
                  color: '#0F172A',
                  border: '1px solid #FDBA74',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={15} />
                <span>{t.landing.voiceBtn}</span>
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
                  color: '#0F172A',
                  border: '1px solid #FDBA74',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FileCheck size={15} />
                <span>{t.landing.worksheetsBtn}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Interactive Demo Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FDBA74',
              borderRadius: '12px'
            }}>
              {/* Demo Language Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>
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
                        border: selectedLang === lang.code ? '1px solid #EA580C' : '1px solid #FDBA74',
                        backgroundColor: selectedLang === lang.code ? '#EA580C' : '#FFF7ED',
                        color: selectedLang === lang.code ? '#FFFFFF' : '#334155',
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
                backgroundColor: '#FFFDF9',
                border: '1px solid #FDBA74',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', marginBottom: '4px' }}>
                  {lessonScript}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#EA580C', fontStyle: 'italic' }}>
                  "{lessonRoman}"
                </div>
              </div>

              {/* Hindi Source */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: '#FFF7ED',
                fontSize: '12px',
                color: '#0F172A',
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
                <span style={{ fontSize: '11px', color: '#334155' }}>
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
