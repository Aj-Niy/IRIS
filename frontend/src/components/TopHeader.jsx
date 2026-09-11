import React, { useState } from 'react';
import { Search, Menu } from 'lucide-react';

export default function TopHeader({
  setCurrentTab,
  currentLang = 'sat',
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
          placeholder="Search lessons, phrases, worksheets"
        />
        <span className="kbd">⌘F</span>
      </form>

      <div className="header-actions">
        <span className="quiet" style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-sub)' }}>
          {langNames[currentLang] || 'Santhali'}
        </span>
      </div>
    </header>
  );
}
