// Non-sensitive UI preferences only. Wrapped in try/catch: storage can be blocked.
const KEY = 'mediscan.settings';
const DEFAULTS = { pageSize: 10, confirmDelete: true };

export function loadSettings() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY)) ?? {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
