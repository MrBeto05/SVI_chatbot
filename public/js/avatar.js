/* avatar.js — Control de estados del avatar */
const Avatar = {
  container: null,
  state: 'idle',

  init() {
    this.container = document.getElementById('avatarContainer');
  },

  setState(state) {
    if (!this.container) return;
    this.state = state;
    this.container.classList.remove('thinking', 'speaking', 'error', 'idle');
    if (state !== 'idle') this.container.classList.add(state);

    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    const states = {
      idle:     { dot: '',          text: 'Asistente disponible' },
      thinking: { dot: 'thinking',  text: 'Analizando...' },
      speaking: { dot: '',          text: 'Respondiendo...' },
      error:    { dot: 'error',     text: 'Error de conexión' }
    };

    const s = states[state] || states.idle;
    if (statusDot) { statusDot.className = 'status-dot ' + s.dot; }
    if (statusText) statusText.textContent = s.text;
  }
};
