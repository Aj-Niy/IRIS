import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Volume2,
  FileCheck,
  Bot,
  Library,
  LogOut,
  User
} from 'lucide-react';
import { uiTranslations } from '../services/uiTranslations';

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentLang,
  setCurrentLang,
  uiLang = 'en',
  setUiLang,
  userName,
  setUserName,
  open = false
}) {
  const t = uiTranslations[uiLang] || uiTranslations.en;

  const menuItems = [
    { id: 'teacher', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'santali-studio', label: t.nav.flnStudio, icon: BookOpen },
    { id: 'phrasebook', label: t.nav.voiceEngine, icon: Volume2 },
    { id: 'worksheets', label: t.nav.worksheets, icon: FileCheck },
    { id: 'ncert', label: t.nav.curriculumHub, icon: Library },
    { id: 'ai-mentor', label: t.nav.pedagogyAssistant, icon: Bot }
  ];

  const handleLogout = () => {
    if (setUserName) setUserName('');
    localStorage.removeItem('palash_username');
    localStorage.removeItem('codeseekho_username');
    setCurrentTab('landing');
  };

  return (
    <aside className={`app-sidebar ${open ? 'open' : ''}`}>
      <div>
        <div className="sidebar-header" onClick={() => setCurrentTab('landing')} style={{ cursor: 'pointer' }}>
          <img src="/iris-logo.png" alt="PALASH IRIS" className="sidebar-logo" />
          <div>
            <div className="sidebar-brand">PALASH <span>IRIS</span></div>
          </div>
        </div>

        <div className="sidebar-group-label">MENU</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="sidebar-group-label" style={{ marginTop: 18 }}>GENERAL</div>
        <div style={{ padding: '0 8px', display: 'grid', gap: 8 }}>
          <select
            className="field"
            value={uiLang}
            onChange={(e) => setUiLang && setUiLang(e.target.value)}
            aria-label="Interface language"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          <select
            className="field"
            value={currentLang}
            onChange={(e) => setCurrentLang && setCurrentLang(e.target.value)}
            aria-label="Mother tongue"
          >
            <option value="sat">ᱥᱟᱱᱛᱟᱲᱤ Santhali</option>
            <option value="hoc">Ho</option>
            <option value="unr">Mundari</option>
          </select>
        </div>
      </div>

      <div className="sidebar-footer">
        {userName ? (
          <div className="user-chip" style={{ width: '100%', justifyContent: 'space-between', borderRadius: 14, padding: '8px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar"><User size={14} /></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{userName}</div>
                <div className="quiet">Teacher</div>
              </div>
            </div>
            <button onClick={handleLogout} title="Sign out" className="btn-ghost" style={{ padding: 4 }}>
              <LogOut size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
