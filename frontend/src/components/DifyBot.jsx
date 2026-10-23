import React from 'react';
import { Bot, Mic } from 'lucide-react';

export default function DifyBot({ selectedLangName = 'Santhali' }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Bot Card Header aligned with website design */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-medium)',
          background: 'var(--bg-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'var(--green-light)',
              border: '1px solid var(--green-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--green-primary)'
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 750, margin: 0, color: 'var(--text-main)' }}>
                IRIS Pedagogy Assistant
              </h2>
              <span className="pill ok" style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                Online
              </span>
            </div>
            <p className="quiet" style={{ margin: '2px 0 0', fontSize: 12 }}>
              Tribal Language MTB-MLE Classroom Assistant for Jharkhand · {selectedLangName}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="pill"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-sub)',
              fontSize: 11,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Mic size={12} color="var(--green-primary)" /> Voice Enabled
          </span>
        </div>
      </div>

      {/* Dify Chat Embed */}
      <iframe
        src="https://udify.app/chat/ytuDEH6TZXi3uTEb"
        title="IRIS Santali AI Assistant"
        allow="microphone"
        style={{
          width: '100%',
          height: '680px',
          border: 'none',
          display: 'block',
          background: '#FFFFFF'
        }}
      />
    </div>
  );
}
