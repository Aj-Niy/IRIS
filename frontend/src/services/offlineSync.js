// =============================================================================
// IRIS Offline-First Synchronization Service
// offlineSync.js | Caches data on 2GB RAM school tablets & syncs when reconnected
// =============================================================================

import { CLASSROOM_PHRASEBOOK, APERTIUM_SANTALI_LEXICON, SAMPLE_FLN_LESSONS, NIPUN_OUTCOMES_MATRIX } from './apertiumSantaliData';

const STORAGE_KEYS = {
  OFFLINE_LOGS: 'iris_offline_logs',
  CACHED_LESSONS: 'iris_cached_fln_lessons',
  CACHED_WORKSHEETS: 'iris_cached_worksheets',
  TRANSLATION_STATS: 'iris_translation_stats',
  LAST_SYNC_TIME: 'iris_last_sync_time',
  TRANSLATION_MEMORY: 'palash_translation_memory',
  COMPETENCY_ASSESSMENTS: 'palash_competency_assessments'
};

/**
 * Initialize offline cache with default seed data if not present
 */
export function initOfflineStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.CACHED_LESSONS)) {
      localStorage.setItem(STORAGE_KEYS.CACHED_LESSONS, JSON.stringify(SAMPLE_FLN_LESSONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSLATION_STATS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSLATION_STATS, JSON.stringify({
        totalLookups: 38,
        phrasesSpoken: 26,
        worksheetsGenerated: 8,
        frequentWords: { "ᱯᱚᱛᱚᱵ": 16, "ᱯᱟᱲᱦᱟᱣ": 14, "ᱢᱟᱪᱮᱛ": 12, "ᱫᱟᱜ": 9, "ᱞᱮᱠᱷᱟ": 8 }
      }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSLATION_MEMORY)) {
      localStorage.setItem(STORAGE_KEYS.TRANSLATION_MEMORY, JSON.stringify([
        {
          id: 'tm-1',
          hindi: "यह हमारा स्कूल है।",
          targetLang: "sat",
          script: "ᱱᱚᱣᱟ ᱫᱚ ᱟᱵᱚᱣᱟᱜ ᱟᱥᱲᱟ ᱠᱟᱱᱟ᱾",
          roman: "Nowa do abowag asṛa kana.",
          approvedBy: "Primary Teacher",
          approvedAt: new Date().toLocaleDateString(),
          confidence: 1.0,
          category: "Lesson"
        },
        {
          id: "tm-2",
          hindi: "कृपया शांत होकर बैठ जाइए।",
          targetLang: "sat",
          script: "ᱛᱷᱤᱨ ᱠᱟᱛᱮ ᱫᱩᱲᱩᱵ ᱯᱮ᱾",
          roman: "Thir kate duṛub pe.",
          approvedBy: "Primary Teacher",
          approvedAt: new Date().toLocaleDateString(),
          confidence: 1.0,
          category: "Classroom Dialogue"
        },
        {
          id: "tm-3",
          hindi: "उंगलियां गिनिए: १, २, ३, ४, ५।",
          targetLang: "sat",
          script: "ᱠᱟᱹᱴᱩᱵ ᱞᱮᱠᱷᱟᱭ ᱯᱮ: ᱢᱤᱫ, ᱵᱟᱨ, ᱯᱮ, ᱯᱩᱱ, ᱢᱚᱬᱮ᱾",
          roman: "Kạtub lekhay pe: mit', bar, pe, pun, mõṛẽ.",
          approvedBy: "Primary Teacher",
          approvedAt: new Date().toLocaleDateString(),
          confidence: 1.0,
          category: "Numeracy"
        }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPETENCY_ASSESSMENTS)) {
      localStorage.setItem(STORAGE_KEYS.COMPETENCY_ASSESSMENTS, JSON.stringify({
        "L1.1": { status: "mastered", score: 88, lastAssessed: "Yesterday", notes: "Children conversing well in Santhali." },
        "L1.2": { status: "developing", score: 76, lastAssessed: "2 days ago", notes: "Recognizing Ol Chiki initial letters." },
        "L2.1": { status: "developing", score: 69, lastAssessed: "3 days ago", notes: "2-3 letter word decoding practice ongoing." },
        "L3.1": { status: "needs_practice", score: 58, lastAssessed: "1 week ago", notes: "Fluency needs reinforcement." },
        "M1.1": { status: "mastered", score: 94, lastAssessed: "Yesterday", notes: "Counting 1-10 in mother tongue mastered." },
        "M1.2": { status: "mastered", score: 82, lastAssessed: "2 days ago", notes: "Concrete object addition working." },
        "M2.1": { status: "developing", score: 71, lastAssessed: "3 days ago", notes: "Place value bundles being taught." },
        "M3.1": { status: "needs_practice", score: 52, lastAssessed: "1 week ago", notes: "Multiplication sharing in progress." }
      }));
    }
  } catch (err) {
    console.warn('LocalStorage not accessible for offline storage:', err);
  }
}

/**
 * Translation Memory: Save teacher approved translation pair
 */
export function saveToTranslationMemory(entry) {
  try {
    const tm = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSLATION_MEMORY) || '[]');
    const newEntry = {
      id: 'tm_' + Date.now(),
      hindi: entry.hindi,
      targetLang: entry.targetLang || 'sat',
      script: entry.script,
      roman: entry.roman,
      approvedBy: entry.approvedBy || 'Primary Teacher',
      approvedAt: new Date().toLocaleDateString(),
      confidence: entry.confidence || 1.0,
      category: entry.category || 'Teacher Review'
    };
    // Replace if exact match exists, else prepend
    const existingIdx = tm.findIndex(t => t.hindi === entry.hindi && t.targetLang === newEntry.targetLang);
    if (existingIdx >= 0) {
      tm[existingIdx] = newEntry;
    } else {
      tm.unshift(newEntry);
    }
    localStorage.setItem(STORAGE_KEYS.TRANSLATION_MEMORY, JSON.stringify(tm));
    recordOfflineInteraction('translation_approved', newEntry);
    return newEntry;
  } catch (err) {
    console.warn('Failed to save to Translation Memory:', err);
    return null;
  }
}

/**
 * Translation Memory: Retrieve all approved pairs
 */
export function getTranslationMemory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSLATION_MEMORY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Translation Memory: Lookup approved pair
 */
export function lookupTranslationMemory(hindi, targetLang = 'sat') {
  if (!hindi) return null;
  try {
    const tm = getTranslationMemory();
    const cleanQuery = hindi.trim().toLowerCase();
    return tm.find(t => t.targetLang === targetLang && (
      t.hindi.toLowerCase().includes(cleanQuery) || cleanQuery.includes(t.hindi.toLowerCase())
    )) || null;
  } catch {
    return null;
  }
}

/**
 * Save / update student competency assessment
 */
export function saveCompetencyAssessment(code, status, score = 80, notes = '') {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPETENCY_ASSESSMENTS) || '{}');
    current[code] = {
      status, // 'mastered' | 'developing' | 'needs_practice'
      score,
      lastAssessed: 'Just now',
      notes
    };
    localStorage.setItem(STORAGE_KEYS.COMPETENCY_ASSESSMENTS, JSON.stringify(current));
    recordOfflineInteraction('assessment_recorded', { code, status, score });
    return current;
  } catch (err) {
    console.warn('Failed to save competency assessment:', err);
    return null;
  }
}

/**
 * Get all competency assessments
 */
export function getCompetencyAssessments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPETENCY_ASSESSMENTS) || '{}');
  } catch {
    return {};
  }
}

/**
 * Log a classroom interaction (phrase spoke, lesson translated, worksheet printed)
 * @param {string} type 
 * @param {object} payload 
 */
export function recordOfflineInteraction(type, payload = {}) {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_LOGS) || '[]');
    const newEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type,
      payload,
      timestamp: new Date().toISOString()
    };
    logs.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_LOGS, JSON.stringify(logs));

    // Update stats
    const stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSLATION_STATS) || '{}');
    if (type === 'phrase_used') {
      stats.phrasesSpoken = (stats.phrasesSpoken || 0) + 1;
      if (payload.santaliOlChiki) {
        stats.frequentWords = stats.frequentWords || {};
        stats.frequentWords[payload.santaliOlChiki] = (stats.frequentWords[payload.santaliOlChiki] || 0) + 1;
      }
    } else if (type === 'lesson_translated') {
      stats.totalLookups = (stats.totalLookups || 0) + 1;
    } else if (type === 'worksheet_generated') {
      stats.worksheetsGenerated = (stats.worksheetsGenerated || 0) + 1;
    }
    localStorage.setItem(STORAGE_KEYS.TRANSLATION_STATS, JSON.stringify(stats));

    return newEntry;
  } catch (err) {
    console.warn('Failed to record offline interaction:', err);
    return null;
  }
}

/**
 * Get pending sync queue
 */
export function getPendingOfflineLogs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_LOGS) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear synced logs after successful backend sync
 */
export function clearSyncedLogs(count) {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_LOGS) || '[]');
    const remaining = logs.slice(count);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_LOGS, JSON.stringify(remaining));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, new Date().toISOString());
  } catch (err) {
    console.warn('Failed to clear synced logs:', err);
  }
}

/**
 * Get offline usage statistics
 */
export function getOfflineStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSLATION_STATS) || '{}');
  } catch {
    return {};
  }
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime() {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || 'Never (Offline Mode)';
}
