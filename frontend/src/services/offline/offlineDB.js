// =============================================================================
// ShikshaSetu IndexedDB Storage Service
// offlineDB.js | High-performance offline persistence on 2GB RAM Android tablets
// =============================================================================

const DB_NAME = 'ShikshaSetu_Offline_DB';
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Initialize IndexedDB with necessary object stores
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      resolve(null);
      return;
    }

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Teacher Profile Store
      if (!db.objectStoreNames.contains('teacher_profile')) {
        db.createObjectStore('teacher_profile', { keyPath: 'id' });
      }

      // 2. Lesson Progress Store
      if (!db.objectStoreNames.contains('lesson_progress')) {
        const store = db.createObjectStore('lesson_progress', { keyPath: 'lessonId' });
        store.createIndex('grade', 'grade', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      // 3. Competency Assessments Store
      if (!db.objectStoreNames.contains('competency_assessments')) {
        const store = db.createObjectStore('competency_assessments', { keyPath: 'code' });
        store.createIndex('status', 'status', { unique: false });
      }

      // 4. Translation Memory Store
      if (!db.objectStoreNames.contains('translation_memory')) {
        const store = db.createObjectStore('translation_memory', { keyPath: 'id' });
        store.createIndex('hindi', 'hindi', { unique: false });
        store.createIndex('targetLang', 'targetLang', { unique: false });
      }

      // 5. Offline Activity Logs Store
      if (!db.objectStoreNames.contains('activity_logs')) {
        const store = db.createObjectStore('activity_logs', { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      resolve(null);
    };
  });
}

/**
 * Generic Put into IndexedDB with LocalStorage fallback
 */
export async function dbPut(storeName, item) {
  const db = await initDB();
  if (!db) {
    try {
      const existing = JSON.parse(localStorage.getItem(`shiksha_${storeName}`) || '[]');
      const keyProp = item.id || item.code || item.lessonId;
      const idx = existing.findIndex(e => (e.id || e.code || e.lessonId) === keyProp);
      if (idx >= 0) {
        existing[idx] = item;
      } else {
        existing.push(item);
      }
      localStorage.setItem(`shiksha_${storeName}`, JSON.stringify(existing));
      return item;
    } catch (e) {
      console.warn('LocalStorage put failed:', e);
      return item;
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = (e) => reject(e.target.error);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic Get All from IndexedDB with LocalStorage fallback
 */
export async function dbGetAll(storeName) {
  const db = await initDB();
  if (!db) {
    try {
      return JSON.parse(localStorage.getItem(`shiksha_${storeName}`) || '[]');
    } catch {
      return [];
    }
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Generic Get by Key
 */
export async function dbGet(storeName, key) {
  const db = await initDB();
  if (!db) {
    try {
      const existing = JSON.parse(localStorage.getItem(`shiksha_${storeName}`) || '[]');
      return existing.find(e => (e.id || e.code || e.lessonId) === key) || null;
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}
