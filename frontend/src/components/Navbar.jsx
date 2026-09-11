import React from 'react';
import { Languages, Globe, User, LogOut, Sparkles } from 'lucide-react';
import { uiTranslations } from '../services/uiTranslations';

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentLang,
  setCurrentLang,
  uiLang = 'en',
  setUiLang,
  userRole,
  setUserRole,
  userName,
  setUserName
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;

  const tribalLanguages = [
    { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ (Santhali)' },
    { code: 'hoc', name: '𑢹𑣉𑣉 (Ho)' },
    { code: 'unr', name: 'ᱢᱩᱱᱰᱟᱨᱤ (Mundari)' }
  ];

  const navItems = [
    { id: 'teacher',        label: t.nav.dashboard },
    { id: 'santali-studio', label: t.nav.flnStudio },
    { id: 'phrasebook',     label: t.nav.voiceEngine },
    { id: 'worksheets',     label: t.nav.worksheets },
    { id: 'ncert',          label: t.nav.curriculumHub },
    { id: 'ai-mentor',      label: t.nav.pedagogyAssistant },
  ];

  const handleLogout = () => {
    setUserName('');
    localStorage.removeItem('palash_username');
    localStorage.removeItem('codeseekho_username');
    setCurrentTab('landing');
  };

  return (
    <header className="app-navbar">
      <div className="nav-inner">

        {/* Brand */}
        <div className="nav-brand" onClick={() => setCurrentTab('landing')}>
          <img
            src="/iris-logo.png"
            alt="PALASH IRIS Logo"
            style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }}
          />
          <div>
            <div className="nav-brand-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>PALASH IRIS</span>
              <span className="badge-green" style={{ fontSize: '9px', padding: '1px 5px' }}>v2.0</span>
            </div>
            <div className="nav-brand-sub">Vernacular Pedagogy Engine</div>
          </div>
        </div>

        {/* Center Nav Links (No scrollbar) */}
        <nav className="nav-links">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-link-btn${currentTab === item.id ? ' active' : ''}`}
              onClick={() => setCurrentTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="nav-right">
          {/* UI Language Selector */}
          <div className="nav-select-wrap">
            <Globe size={12} color="var(--text-muted)" />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>UI:</span>
            <select
              value={uiLang}
              onChange={(e) => setUiLang && setUiLang(e.target.value)}
              title="Interface language"
            >
              <option value="en">EN</option>
              <option value="hi">हिं</option>
            </select>
          </div>

          {/* Classroom Tribal Language Selector */}
          <div className="nav-select-wrap">
            <Languages size={12} color="var(--green-primary)" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              title="Classroom tribal language"
            >
              {tribalLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* User Status / Login Button */}
          {userName ? (
            <div className="nav-user-pill">
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                backgroundColor: 'var(--badge-green-bg)',
                border: '1px solid var(--badge-green-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <User size={12} color="var(--badge-green-text)" />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-main)' }}>{userName}</span>
              <button
                className="nav-logout-btn"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut size={11} />
              </button>
            </div>
          ) : (
            <button
              className="nav-cta-btn"
              onClick={() => setCurrentTab('landing')}
            >
              {t.common.teacherLogin} →
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
