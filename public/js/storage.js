/* storage.js — localStorage wrapper */
const Storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem('svi_' + key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('svi_' + key, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem('svi_' + key); } catch {}
  }
};
