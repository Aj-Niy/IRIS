// =============================================================================
// ShikshaSetu — Vocabulary Memory Service
// Persistent per-word/phrase memory layer built on localStorage
// (Offline-first, no DB credentials required)
// =============================================================================

export const VOCAB_MEMORY_KEY = 'shikshasetu_vocab_memory';

/**
 * Normalise a vocab entry's deduplication key.
 * Two entries are considered the same if they have identical
 * normalised text (trimmed, lowercased) AND the same lang code.
 */
function dedupeKey(text, lang) {
  return `${(text || '').trim().toLowerCase()}|${lang || 'sat'}`;
}

/**
 * Read all entries from localStorage.
 * Returns an empty array on any parse error.
 */
export function getVocabEntries() {
  try {
    const raw = localStorage.getItem(VOCAB_MEMORY_KEY);
    const entries = raw ? JSON.parse(raw) : [];
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

/**
 * Save a vocab entry.
 * - Validates that `text` is a non-empty string.
 * - If an entry with the same deduplication key already exists,
 *   updates its `updatedAt` timestamp and returns isDuplicate: true.
 * - Otherwise prepends the new entry and returns isDuplicate: false.
 *
 * @param {{ text: string, roman?: string, hindi?: string, lang: string,
 *            langName?: string, source?: string, context?: string }} entry
 * @returns {{ saved: boolean, isDuplicate: boolean, entry: object } | { saved: false, error: string }}
 */
export function saveVocabEntry(entry) {
  try {
    const text = (entry.text || '').trim();
    if (!text) {
      return { saved: false, error: 'Text is required.' };
    }

    const lang = entry.lang || 'sat';
    const key = dedupeKey(text, lang);
    const entries = getVocabEntries();
    const existingIdx = entries.findIndex(e => dedupeKey(e.text, e.lang) === key);

    if (existingIdx >= 0) {
      // Update timestamp only — do not inflate counts
      entries[existingIdx].updatedAt = new Date().toISOString();
      localStorage.setItem(VOCAB_MEMORY_KEY, JSON.stringify(entries));
      return { saved: true, isDuplicate: true, entry: entries[existingIdx] };
    }

    const now = new Date().toISOString();
    const newEntry = {
      id: 'vm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      text,
      roman: (entry.roman || '').trim(),
      hindi: (entry.hindi || '').trim(),
      lang,
      langName: entry.langName || lang,
      source: entry.source || 'lesson',   // 'lesson' | 'voice' | 'translation'
      context: (entry.context || '').trim(),
      savedAt: now,
      updatedAt: now
    };

    entries.unshift(newEntry);
    localStorage.setItem(VOCAB_MEMORY_KEY, JSON.stringify(entries));
    return { saved: true, isDuplicate: false, entry: newEntry };
  } catch (err) {
    console.warn('[VocabMemory] saveVocabEntry failed:', err);
    return { saved: false, error: err.message || 'Unknown error' };
  }
}

/**
 * Check whether an entry with the same text + lang already exists.
 */
export function isDuplicateVocab(text, lang) {
  const key = dedupeKey(text, lang);
  return getVocabEntries().some(e => dedupeKey(e.text, e.lang) === key);
}

/**
 * Remove a vocab entry by its ID.
 */
export function removeVocabEntry(id) {
  try {
    const entries = getVocabEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(VOCAB_MEMORY_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.warn('[VocabMemory] removeVocabEntry failed:', err);
    return false;
  }
}

/**
 * Clear all vocab entries.
 */
export function clearVocabEntries() {
  try {
    localStorage.removeItem(VOCAB_MEMORY_KEY);
    return true;
  } catch (err) {
    console.warn('[VocabMemory] clearVocabEntries failed:', err);
    return false;
  }
}

/**
 * Return aggregated stats for the Words in Use dashboard.
 */
export function getVocabStats() {
  const entries = getVocabEntries();

  const byLang = { sat: 0, hoc: 0, unr: 0 };
  const bySource = { lesson: 0, voice: 0, translation: 0 };

  entries.forEach(e => {
    if (byLang[e.lang] !== undefined) byLang[e.lang]++;
    else byLang[e.lang] = 1;
    const src = e.source || 'lesson';
    if (bySource[src] !== undefined) bySource[src]++;
    else bySource[src] = 1;
  });

  return {
    total: entries.length,
    byLang,
    bySource,
    recent: entries.slice(0, 5)
  };
}
