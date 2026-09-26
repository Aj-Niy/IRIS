import React, { useState, useEffect } from 'react';
import { Search, Menu, Globe, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { subscribeOfflineState } from '../services/offline/offlineMode';
import ContentPackModal from './ContentPackModal';

export default function TopHeader({
  setCurrentTab,
  currentLang = 'sat',
  uiLang = 'en',
  setUiLang,
  userName,
  onMenu
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [offlineStatus, setOfflineStatus] = useState({ isOffline: true, modeLabel: 'Offline Ready' });
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeOfflineState(status => {
      setOfflineStatus(status);
    });
    return unsubscribe;
  }, []);

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
    <>
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

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* OFFLINE STATUS BADGE */}
          <button
            type="button"
            onClick={() => setIsPackModalOpen(true)}
            className="btn-ghost"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              backgroundColor: offlineStatus.isOffline ? '#ECFDF5' : '#EFF6FF',
              border: `1px solid ${offlineStatus.isOffline ? '#A7F3D0' : '#BFDBFE'}`,
              color: offlineStatus.isOffline ? '#065F46' : '#1E40AF',
              fontSize: '11px',
              fontWeight: '750',
              cursor: 'pointer'
            }}
            title="Click to view Offline Content Pack"
          >
            {offlineStatus.isOffline ? <WifiOff size={13} color="#059669" /> : <Wifi size={13} color="#2563EB" />}
            <span>{offlineStatus.isOffline ? (uiLang === 'hi' ? 'ऑफलाइन तैयार' : 'OFFLINE READY') : 'ONLINE'}</span>
          </button>
        </div>
      </header>

      <ContentPackModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        uiLang={uiLang}
      />
    </>
  );
}
