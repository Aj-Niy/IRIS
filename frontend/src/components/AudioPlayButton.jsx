import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { 
  speakText, 
  pauseSpeech, 
  resumeSpeech, 
  stopSpeech, 
  subscribeAudioState 
} from './speechUtils';

export default function AudioPlayButton({ 
  text, 
  language = 'hi-IN', 
  label = 'Pronounce', 
  size = 'md',
  showStop = true,
  style = {} 
}) {
  const [audioStatus, setAudioStatus] = useState('idle'); // 'idle' | 'playing' | 'paused'
  const isThisTextActive = audioStatus !== 'idle';

  useEffect(() => {
    const unsubscribe = subscribeAudioState(({ state, text: currentText }) => {
      if (currentText === text) {
        setAudioStatus(state);
      } else {
        setAudioStatus('idle');
      }
    });
    return unsubscribe;
  }, [text]);

  const handlePlay = (e) => {
    e?.stopPropagation();
    if (audioStatus === 'playing') {
      pauseSpeech();
    } else if (audioStatus === 'paused') {
      resumeSpeech();
    } else {
      speakText(text, language);
    }
  };

  const handleStop = (e) => {
    e?.stopPropagation();
    stopSpeech();
  };

  const isSmall = size === 'sm';
  const iconSize = isSmall ? 13 : 15;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ...style }}>
      <button
        onClick={handlePlay}
        type="button"
        title={audioStatus === 'playing' ? 'Pause Audio' : audioStatus === 'paused' ? 'Resume Audio' : 'Play Audio Pronunciation'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: isSmall ? '4px 8px' : '6px 12px',
          borderRadius: '6px',
          fontSize: isSmall ? '11px' : '12px',
          fontWeight: '600',
          border: audioStatus === 'playing' ? '1px solid #16A34A' : '1px solid var(--border-medium)',
          backgroundColor: audioStatus === 'playing' ? '#DCFCE7' : audioStatus === 'paused' ? '#FEF3C7' : 'var(--bg-subtle)',
          color: audioStatus === 'playing' ? '#15803D' : audioStatus === 'paused' ? '#B45309' : 'var(--text-main)',
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        {audioStatus === 'playing' ? (
          <>
            <Pause size={iconSize} />
            <span>Pause</span>
          </>
        ) : audioStatus === 'paused' ? (
          <>
            <Play size={iconSize} />
            <span>Resume</span>
          </>
        ) : (
          <>
            <Volume2 size={iconSize} />
            <span>{label}</span>
          </>
        )}
      </button>

      {showStop && isThisTextActive && (
        <button
          onClick={handleStop}
          type="button"
          title="Stop Audio"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isSmall ? '4px' : '6px',
            borderRadius: '6px',
            fontSize: '11px',
            border: '1px solid #FECACA',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            cursor: 'pointer'
          }}
        >
          <Square size={iconSize - 2} fill="#DC2626" />
        </button>
      )}
    </div>
  );
}
