// =============================================================================
// PALASH IRIS — Speech Synthesis & Recognition Engine
// speechUtils.js | Real-time Voice Recognition & Audio Player with Pause/Resume
// =============================================================================

let activeUtterance = null;
let audioListeners = new Set();
let currentAudioState = 'idle'; // 'idle' | 'playing' | 'paused'
let currentlyPlayingText = '';

function notifyListeners(state, text = '') {
  currentAudioState = state;
  currentlyPlayingText = state === 'idle' ? '' : text;
  audioListeners.forEach(listener => {
    try {
      listener({ state: currentAudioState, text: currentlyPlayingText });
    } catch (e) {
      console.warn('Audio listener error:', e);
    }
  });
}

/**
 * Subscribe to global audio playback state changes
 * @param {Function} listener callback ({ state: 'idle'|'playing'|'paused', text })
 * @returns {Function} unsubscribe function
 */
export function subscribeAudioState(listener) {
  audioListeners.add(listener);
  // Send current state immediately
  listener({ state: currentAudioState, text: currentlyPlayingText });
  return () => {
    audioListeners.delete(listener);
  };
}

export function getAudioPlayerState() {
  return {
    state: currentAudioState,
    text: currentlyPlayingText,
    isPlaying: currentAudioState === 'playing',
    isPaused: currentAudioState === 'paused',
    isIdle: currentAudioState === 'idle'
  };
}

/**
 * Start live speech recognition (Hindi / English / Tribal phonetics)
 */
export function startListening(language = 'hi-IN', onResult, onEnd, onError) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError(new Error("Speech recognition not supported in this browser."));
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = language;
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) onResult(transcript, event.results[0].isFinal);
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    if (onError) onError(event);
    if (onEnd) onEnd();
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    console.warn("Failed to start recognition:", err);
    if (onEnd) onEnd();
    return null;
  }
}

/**
 * Play synthesized speech with full Play/Pause/Stop lifecycle
 * @param {string} text 
 * @param {string} language 
 * @param {object} options { rate, pitch, onStart, onEnd, onPause, onResume }
 */
export function speakText(text, language = 'hi-IN', options = {}) {
  if (!("speechSynthesis" in window)) {
    console.warn("Text-to-speech is not supported in this browser.");
    return;
  }

  // Cancel any existing utterance
  window.speechSynthesis.cancel();

  if (!text || !text.trim()) {
    notifyListeners('idle');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = options.rate || 0.9; // Slightly slower for classroom clarity
  utterance.pitch = options.pitch || 1.0;

  utterance.onstart = () => {
    activeUtterance = utterance;
    notifyListeners('playing', text);
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    activeUtterance = null;
    notifyListeners('idle');
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (err) => {
    console.warn("Speech synthesis error:", err);
    activeUtterance = null;
    notifyListeners('idle');
    if (options.onEnd) options.onEnd();
  };

  utterance.onpause = () => {
    notifyListeners('paused', text);
    if (options.onPause) options.onPause();
  };

  utterance.onresume = () => {
    notifyListeners('playing', text);
    if (options.onResume) options.onResume();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Pause current speech playback
 */
export function pauseSpeech() {
  if ("speechSynthesis" in window && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    notifyListeners('paused', currentlyPlayingText);
  }
}

/**
 * Resume paused speech playback
 */
export function resumeSpeech() {
  if ("speechSynthesis" in window && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    notifyListeners('playing', currentlyPlayingText);
  }
}

/**
 * Stop speech playback completely
 */
export function stopSpeech() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
    notifyListeners('idle');
  }
}

/**
 * Toggle speech play / pause / stop
 * @param {string} text 
 * @param {string} language 
 */
export function togglePlayPauseSpeech(text, language = 'hi-IN') {
  if (currentAudioState === 'playing' && currentlyPlayingText === text) {
    pauseSpeech();
  } else if (currentAudioState === 'paused' && currentlyPlayingText === text) {
    resumeSpeech();
  } else {
    speakText(text, language);
  }
}

// Converts short language codes to full locale codes
export function getLocaleCode(shortCode) {
  const localeMap = {
    sat: "hi-IN", // Santali phonetics render well through Indian English / Hindi voice synthesis
    hoc: "hi-IN", // Ho
    unr: "hi-IN", // Mundari
    hi: "hi-IN",
    en: "en-IN",
    ta: "ta-IN",
    te: "te-IN",
    kn: "kn-IN",
    mr: "mr-IN",
    bn: "bn-IN",
    gu: "gu-IN",
  };
  return localeMap[shortCode] || "hi-IN";
}
