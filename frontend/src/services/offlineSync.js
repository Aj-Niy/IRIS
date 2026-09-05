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
  LAST_SYNC_TIME: 'iris_last_sync_time'
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
        totalLookups: 24,
        phrasesSpoken: 18,
        worksheetsGenerated: 5,
        frequentWords: { "ᱯᱚᱛᱚᱵ": 12, "ᱯᱟᱲᱦᱟᱣ": 8, "ᱢᱟᱪᱮᱛ": 9, "ᱫᱟᱜ": 6 }
      }));
    }
  } catch (err) {
    console.warn('LocalStorage not accessible for offline storage:', err);
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
