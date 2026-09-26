// =============================================================================
// ShikshaSetu Offline Runtime State Service
// offlineMode.js | Manages Network Connectivity, Forced Offline Demo Mode & Events
// =============================================================================

const OFFLINE_MODE_KEY = 'shikshasetu_forced_offline_mode';

let isForcedOffline = localStorage.getItem(OFFLINE_MODE_KEY) === 'true';
let isNetworkOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;

const listeners = new Set();

function notifyListeners() {
  const currentStatus = getOfflineStatus();
  listeners.forEach((callback) => {
    try {
      callback(currentStatus);
    } catch (err) {
      console.warn('Error in offline mode listener:', err);
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isNetworkOnline = true;
    notifyListeners();
  });

  window.addEventListener('offline', () => {
    isNetworkOnline = false;
    notifyListeners();
  });
}

/**
 * Returns current effective offline runtime state
 */
export function isOffline() {
  // If forced offline demo mode is active, always treat as offline
  if (isForcedOffline) return true;
  return !isNetworkOnline;
}

/**
 * Get comprehensive runtime status
 */
export function getOfflineStatus() {
  const offline = isOffline();
  return {
    isOffline: offline,
    isForcedOffline,
    isNetworkOnline,
    modeLabel: isForcedOffline ? 'Forced Offline Demo' : (offline ? 'Offline Ready' : 'Online Cloud Mode'),
    badgeClass: offline ? 'badge-green' : 'badge-blue'
  };
}

/**
 * Set forced offline demo mode (for SIH judging & airplane mode testing)
 */
export function setForcedOfflineMode(enabled) {
  isForcedOffline = !!enabled;
  localStorage.setItem(OFFLINE_MODE_KEY, isForcedOffline ? 'true' : 'false');
  notifyListeners();
  return getOfflineStatus();
}

/**
 * Toggle forced offline mode
 */
export function toggleForcedOfflineMode() {
  return setForcedOfflineMode(!isForcedOffline);
}

/**
 * Subscribe to offline state changes
 */
export function subscribeOfflineState(callback) {
  listeners.add(callback);
  callback(getOfflineStatus());
  return () => {
    listeners.delete(callback);
  };
}
