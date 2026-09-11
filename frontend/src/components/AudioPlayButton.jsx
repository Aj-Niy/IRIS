import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import {
  speakText,
  pauseSpeech,
  resumeSpeech,
  subscribeAudioState
} from './speechUtils';

export default function AudioPlayButton({
  text,
  language = 'hi-IN',
  label = 'Play',
  size = 'md',
  showStop = false,
  style = {}
}) {
  const [audioStatus, setAudioStatus] = useState('idle');

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

  const iconSize = size === 'sm' ? 13 : 15;
  const isOn = audioStatus === 'playing';

  return (
    <button
      type="button"
      onClick={handlePlay}
      className={`audio-btn ${size === 'sm' ? 'sm' : ''} ${isOn ? 'on' : ''}`}
      style={style}
      title={isOn ? 'Pause' : label}
    >
      {audioStatus === 'playing' ? (
        <Pause size={iconSize} />
      ) : audioStatus === 'paused' ? (
        <Play size={iconSize} />
      ) : (
        <Volume2 size={iconSize} />
      )}
      {size !== 'sm' && (
        <span>{audioStatus === 'playing' ? 'Pause' : audioStatus === 'paused' ? 'Resume' : label}</span>
      )}
    </button>
  );
}
