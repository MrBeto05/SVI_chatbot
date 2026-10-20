/* theme.js — Gestión de temas claro/oscuro/automático */
const Theme = {
  current: 'dark',

  init() {
    const saved = Storage.get('theme', 'dark');
    this.apply(saved);
    this._setupListeners();

    // Watch system preference for auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.current === 'auto') this.apply('auto');
    });
  },

  apply(theme) {
    this.current = theme;
    let effective = theme;

    if (theme === 'auto') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effective);
    Storage.set('theme', theme);
    this._updateButtons(theme);
  },

  _setupListeners() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => this.apply(btn.dataset.theme));
    });
  },

  _updateButtons(theme) {
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === theme);
    });
  }
};

/* Accessibility — Font size */
const FontSize = {
  current: 'md',

  init() {
    const saved = Storage.get('fontSize', 'md');
    this.apply(saved);
    this._setupListeners();
  },

  apply(size) {
    this.current = size;
    document.documentElement.setAttribute('data-font', size);
    Storage.set('fontSize', size);
    this._updateButtons(size);
  },

  _setupListeners() {
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.addEventListener('click', () => this.apply(btn.dataset.size));
    });
  },

  _updateButtons(size) {
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.size === size);
    });
  }
};
