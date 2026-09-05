import React from 'react';
import { 
  Languages, 
  BookOpen, 
  FileCheck, 
  Volume2, 
  GraduationCap, 
  Bot, 
  User, 
  LogOut, 
  ShieldCheck, 
  Globe
} from 'lucide-react';
import { uiTranslations } from '../services/uiTranslations';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentLang, 
  setCurrentLang,
  uiLang = 'en',
  setUiLang,
  userName,
  setUserName
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;

  const tribalLanguages = [
    { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ (Santhali)', script: 'Ol Chiki' },
    { code: 'hoc', name: '𑢹𑣉𑣉 (Ho)', script: 'Warang Chiti' },
    { code: 'unr', name: 'ᱢᱩᱱᱰᱟᱨᱤ (Mundari)', script: 'Mundari' }
  ];

  // Primary MTB-MLE Navigation Modules
  const navItems = [
    { id: 'santali-studio', label: t.nav.flnStudio, icon: BookOpen, color: '#EA580C' },
    { id: 'phrasebook', label: t.nav.voiceEngine, icon: Volume2, color: '#059669' },
    { id: 'worksheets', label: t.nav.worksheets, icon: FileCheck, color: '#2563EB' },
    { id: 'teacher', label: t.nav.dashboard, icon: GraduationCap, color: '#7C3AED' },
    { id: 'ai-mentor', label: t.nav.pedagogyAssistant, icon: Bot, color: '#D97706' },
    { id: 'ncert', label: t.nav.curriculumHub, icon: BookOpen, color: '#0284C7' }
  ];

  const handleLogout = () => {
    setUserName('');
    localStorage.removeItem('palash_username');
    localStorage.removeItem('codeseekho_username');
    setCurrentTab('landing');
  };

  const currentLangObj = tribalLanguages.find(l => l.code === currentLang) || tribalLanguages[0];

  return (
    <header style={{
      backgroundColor: '#FAF8F5',
      borderBottom: '2px solid #FED7AA',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.06)'
    }}>
      {/* Top Institutional Sub-Bar with Modular Blocks */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #FED7AA',
        padding: '6px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#334155'
      }}>
        {/* Left Modular Info Blocks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#FFF7ED',
            color: '#EA580C',
            border: '1px solid #FDBA74',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: '800',
            letterSpacing: '0.3px',
            fontSize: '10px'
          }}>
            <ShieldCheck size={12} />
            <span>{t.common.govtHeader}</span>
          </div>

          <div style={{
            backgroundColor: '#EFF6FF',
            color: '#1E40AF',
            border: '1px solid #BFDBFE',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '11px'
          }}>
            {t.common.psTag}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '11px'
          }}>
            <span className="pulse-dot"></span>
            <span>{t.common.offlineReady}</span>
          </div>
        </div>

        {/* Right Modular Status Blocks: UI Language Selector + Target Tribal Language */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* UI Interface Language Selector (English / Hindi) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            borderRadius: '8px',
            padding: '3px 8px',
            boxShadow: '0 1px 2px rgba(217, 119, 6, 0.08)'
          }}>
            <Globe size={13} color="#D97706" />
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#92400E' }}>UI:</span>
            <select
              value={uiLang}
              onChange={(e) => setUiLang && setUiLang(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11px',
                fontWeight: '800',
                color: '#92400E',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Change platform interface language"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* Target Tribal Classroom Language */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #FED7AA',
            borderRadius: '8px',
            padding: '3px 8px',
            boxShadow: '0 1px 2px rgba(234, 88, 12, 0.05)'
          }}>
            <Languages size={13} color="#EA580C" />
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#EA580C' }}>LANG:</span>
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11px',
                fontWeight: '800',
                color: '#0F172A',
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Target MTB-MLE Tribal Language"
            >
              {tribalLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (Modular Block Layout) */}
      <div style={{
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1500px',
        margin: '0 auto',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Brand Block */}
        <div 
          onClick={() => setCurrentTab('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #FED7AA',
            borderRadius: '12px',
            padding: '6px 14px 6px 8px',
            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.1)',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#EA580C'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#FED7AA'}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: '900',
            fontSize: '18px',
            boxShadow: '0 3px 6px rgba(234, 88, 12, 0.35)'
          }}>
            P
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
              PALASH <span style={{ color: '#EA580C' }}>IRIS</span>
            </div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '1px', fontWeight: '700' }}>
              Vernacular Pedagogy Engine
            </div>
          </div>
        </div>

        {/* Modular Navigation Tabs Bar */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: '#FFFFFF',
          padding: '4px',
          borderRadius: '12px',
          border: '1.5px solid #FED7AA',
          boxShadow: '0 2px 6px rgba(234, 88, 12, 0.06)',
          flexWrap: 'wrap'
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`nav-tab-block ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '800'
                }}
              >
                <Icon size={14} color={isActive ? '#FFFFFF' : item.color} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Teacher Identity / Account Module Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {userName ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #FED7AA',
              borderRadius: '10px',
              padding: '4px 6px 4px 10px',
              boxShadow: '0 1px 3px rgba(234, 88, 12, 0.08)'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                backgroundColor: '#FFF7ED',
                border: '1px solid #FDBA74',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C',
                fontWeight: '800',
                fontSize: '11px'
              }}>
                <User size={13} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#0F172A', lineHeight: 1.1 }}>
                  {userName}
                </span>
                <span style={{ fontSize: '9px', fontWeight: '600', color: '#059669' }}>
                  Jharkhand Primary
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '4px 6px',
                  borderRadius: '6px',
                  backgroundColor: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  color: '#E11D48',
                  cursor: 'pointer',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '4px'
                }}
                title="Sign out"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentTab('landing')}
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#FFFFFF',
                padding: '8px 16px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.3)',
                cursor: 'pointer'
              }}
            >
              {t.common.teacherLogin} →
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
