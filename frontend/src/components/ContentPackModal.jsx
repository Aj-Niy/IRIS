import React from 'react';
import { X, CheckCircle2, HardDrive, BookOpen, FileCheck, Layers, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import { getOfflinePackManifest } from '../services/offline/offlinePack';
import { getOfflineStatus, toggleForcedOfflineMode } from '../services/offline/offlineMode';

export default function ContentPackModal({ isOpen, onClose, uiLang = 'en' }) {
  if (!isOpen) return null;

  const manifest = getOfflinePackManifest();
  const status = getOfflineStatus();

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(19, 78, 63, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-medium)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HardDrive size={18} color="#059669" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
                {uiLang === 'hi' ? 'ऑफलाइन सामग्री पैक स्थिति' : 'Offline Content Pack Status'}
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {manifest.packVersion} · {manifest.targetAudience || 'FLN Grades 1-3'}
              </div>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Runtime Mode Status */}
        <div style={{
          backgroundColor: status.isOffline ? '#F0FDF4' : '#EFF6FF',
          border: `1px solid ${status.isOffline ? '#BBF7D0' : '#BFDBFE'}`,
          borderRadius: '14px',
          padding: '14px 16px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: status.isOffline ? '#166534' : '#1E40AF', textTransform: 'uppercase' }}>
              {status.isOffline ? 'OFFLINE READY · AIRPLANE MODE COMPATIBLE' : 'ONLINE CLOUD MODE'}
            </div>
            <div style={{ fontSize: '12px', color: status.isOffline ? '#15803D' : '#1D4ED8', marginTop: 2 }}>
              {status.isForcedOffline ? 'Forced Offline Demo Mode active' : (status.isOffline ? 'Zero cloud dependencies active' : 'Connected to internet')}
            </div>
          </div>
          <button 
            className={status.isForcedOffline ? 'btn-primary' : 'btn-secondary'}
            onClick={() => {
              toggleForcedOfflineMode();
            }}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            {status.isForcedOffline ? 'Disable Forced Demo' : 'Force Offline Demo'}
          </button>
        </div>

        {/* Manifest Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
          <div className="card" style={{ padding: '12px 14px', backgroundColor: '#F8FAF9' }}>
            <div className="quiet" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={13} /> {uiLang === 'hi' ? 'FLN पाठ' : 'FLN Lessons'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: 4, color: 'var(--green-primary)' }}>
              {manifest.lessonsCount} {uiLang === 'hi' ? 'पाठ उपलब्ध' : 'Available'}
            </div>
            <div className="quiet" style={{ fontSize: '10px' }}>Grades 1, 2, 3</div>
          </div>

          <div className="card" style={{ padding: '12px 14px', backgroundColor: '#F8FAF9' }}>
            <div className="quiet" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileCheck size={13} /> {uiLang === 'hi' ? 'NIPUN कार्यपत्रक' : 'NIPUN Worksheets'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: 4, color: 'var(--green-primary)' }}>
              {manifest.worksheetsCount} {uiLang === 'hi' ? 'कार्यपत्रक' : 'Worksheets'}
            </div>
            <div className="quiet" style={{ fontSize: '10px' }}>L1.1 - M3.1 Bundled</div>
          </div>

          <div className="card" style={{ padding: '12px 14px', backgroundColor: '#F8FAF9' }}>
            <div className="quiet" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={13} /> {uiLang === 'hi' ? 'द्विभाषी फ्लैशकार्ड' : 'Flashcards'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: 4, color: 'var(--green-primary)' }}>
              {manifest.flashcardsCount} {uiLang === 'hi' ? 'कार्ड' : 'Cards'}
            </div>
            <div className="quiet" style={{ fontSize: '10px' }}>Ol Chiki + Roman + Hindi</div>
          </div>

          <div className="card" style={{ padding: '12px 14px', backgroundColor: '#F8FAF9' }}>
            <div className="quiet" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Volume2 size={13} /> {uiLang === 'hi' ? 'कक्षा संवाद वाक्य' : 'Classroom Phrases'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: 4, color: 'var(--green-primary)' }}>
              {manifest.phrasesCount} {uiLang === 'hi' ? 'वाक्य' : 'Phrases'}
            </div>
            <div className="quiet" style={{ fontSize: '10px' }}>Preloaded Teacher Audio</div>
          </div>
        </div>

        {/* Supported Languages */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: '750', marginBottom: '8px', color: 'var(--text-main)' }}>
            {uiLang === 'hi' ? 'स्थापित जनजातीय भाषाएँ:' : 'Installed Tribal Languages:'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {manifest.languages.map(l => (
              <div key={l.code} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-medium)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} color="#059669" />
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>{l.name} ({l.nativeName})</span>
                </div>
                <span className="badge-green" style={{ fontSize: '10px' }}>{l.script}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last Sync */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-medium)',
          paddingTop: '12px'
        }}>
          <span>Last Pack Sync: <strong>{manifest.lastSyncDate}</strong></span>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '12px', fontWeight: '700' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
