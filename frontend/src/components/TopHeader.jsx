import React, { useState } from 'react';
import { Search, Menu, Globe } from 'lucide-react';

export default function TopHeader({
  setCurrentTab,
  currentLang = 'sat',
  uiLang = 'en',
  setUiLang,
  userName,
  onMenu
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const langNames = {
    sat: 'Santhali',
    hoc: 'Ho',
    unr: 'Mundari'
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase();
    if (!q.trim()) return;
    if (q.includes('phrase') || q.includes('voice') || q.includes('आवा')) {
      setCurrentTab('phrasebook');
    } else if (q.includes('worksheet') || q.includes('nipun') || q.includes('कार्य')) {
      setCurrentTab('worksheets');
    } else if (q.includes('ncert') || q.includes('class')) {
      setCurrentTab('ncert');
    } else {
      setCurrentTab('santali-studio');
    }
  };

  return (
    <header className="top-header no-print">
      <button type="button" className="menu-btn" onClick={onMenu} aria-label="Open menu">
        <Menu size={18} />
      </button>
      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <Search size={15} color="#9CA3AF" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={uiLang === 'hi' ? "पाठ, वाक्य, कार्यपत्रक खोजें..." : "Search lessons, phrases, worksheets"}
        />
        <span className="kbd">⌘F</span>
      </form>

      <div className="header-actions">
        {/* UI Language Switcher */}
        <div className="nav-select-wrap" style={{ backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-medium)' }}>
          <Globe size={12} color="var(--text-muted)" />
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>UI:</span>
          <select
            value={uiLang}
            onChange={(e) => setUiLang && setUiLang(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: '11px', fontWeight: '700', cursor: 'pointer', outline: 'none', color: 'var(--text-main)' }}
          >
            <option value="en">EN</option>
            <option value="hi">हिं</option>
          </select>
        </div>

        <span className="quiet" style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-sub)' }}>
          {langNames[currentLang] || 'Santhali'}
        </span>
      </div>
    </header>
  );
}
