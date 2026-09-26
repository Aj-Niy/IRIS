// =============================================================================
// ShikshaSetu Offline Translation Engine
// offlineTranslations.js | Fast on-device linguistic translation & translation memory
// =============================================================================

import { translateAadiVaani, isOlChiki, devanagariToOlChiki, olChikiToLatin } from '../aadiVaaniTranslator';
import { lookupTranslationMemory, saveToTranslationMemory } from '../offlineSync';
import { APERTIUM_SANTALI_LEXICON } from '../apertiumSantaliData';

/**
 * Universal Offline Translation Dispatcher
 * Checks Teacher Translation Memory first, then Aadi Vaani local corpus
 */
export async function translateOffline({
  text = '',
  sourceLang = 'hin',
  targetLang = 'sat'
}) {
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      romanPhonetic: '',
      hindiMeaning: '',
      backend: 'noop',
      latency: 0.01,
      source: 'offline'
    };
  }

  const cleanText = text.trim();

  // 1. Check Local Approved Translation Memory
  const tmMatch = lookupTranslationMemory(cleanText, targetLang);
  if (tmMatch) {
    return {
      translatedText: tmMatch.script,
      romanPhonetic: tmMatch.roman || (isOlChiki(tmMatch.script) ? olChikiToLatin(tmMatch.script).toUpperCase() : ''),
      hindiMeaning: tmMatch.hindi,
      backend: 'translation-memory (Teacher Approved)',
      latency: 0.02,
      confidence: 1.0,
      source: 'tm'
    };
  }

  // 2. Local Aadi Vaani Corpus & Lexicon Engine
  const res = await translateAadiVaani({
    text: cleanText,
    sourceLang,
    targetLang
  });

  return {
    ...res,
    source: 'local-corpus'
  };
}

/**
 * Save a teacher verified translation pair to Translation Memory
 */
export function recordTeacherTranslationApproval(hindi, targetLang, script, roman = '') {
  return saveToTranslationMemory({
    hindi,
    targetLang,
    script,
    roman: roman || (isOlChiki(script) ? olChikiToLatin(script).toUpperCase() : script),
    approvedBy: 'Primary Teacher',
    confidence: 1.0
  });
}
