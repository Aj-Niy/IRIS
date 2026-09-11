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
            alt="ShikshaSetu Logo"
            style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover' }}
          />
          <div>
            <div className="nav-brand-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>ShikshaSetu</span>
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

          {/* User Status / Login Button */}
          {userName ? (
            <button
              className="nav-logout-btn"
              onClick={handleLogout}
              title="Sign out"
              style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Sign out</span>
              <LogOut size={12} />
            </button>
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
