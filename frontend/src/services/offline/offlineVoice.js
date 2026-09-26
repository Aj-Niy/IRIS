// =============================================================================
// ShikshaSetu Offline Voice Service
// offlineVoice.js | Constrained Classroom Speech & Audio for Low-Resource Tablets
// =============================================================================

import { CLASSROOM_PHRASEBOOK, recognizeChildTribalSpeech } from '../apertiumSantaliData';
import { speakText, stopSpeech, pauseSpeech, resumeSpeech } from '../../components/speechUtils';

/**
 * Match spoken teacher Hindi or English to preloaded classroom phrase
 */
export function matchClassroomPhrase(spokenText, targetLang = 'sat') {
  if (!spokenText || !spokenText.trim()) return null;
  const clean = spokenText.toLowerCase().trim();

  // 1. Direct or partial match in CLASSROOM_PHRASEBOOK
  const found = CLASSROOM_PHRASEBOOK.find(p => {
    return p.hindi.toLowerCase().includes(clean) || 
           clean.includes(p.hindi.toLowerCase()) ||
           p.english.toLowerCase().includes(clean) ||
           clean.includes(p.english.toLowerCase());
  });

  if (found) {
    const langObj = found[targetLang] || found.sat;
    return {
      matched: true,
      phraseId: found.id,
      category: found.category,
      hindi: found.hindi,
      english: found.english,
      script: langObj.script,
      roman: langObj.roman,
      phonetic: langObj.phonetic
    };
  }

  return null;
}

/**
 * Recognize child response from microphone transcript
 */
export function matchStudentResponse(transcript, targetLang = 'sat') {
  return recognizeChildTribalSpeech(transcript, targetLang);
}

/**
 * Play offline audio using speech synthesis or preloaded audio
 */
export function playOfflineAudio(text, lang = 'hi-IN') {
  speakText(text, lang);
}
