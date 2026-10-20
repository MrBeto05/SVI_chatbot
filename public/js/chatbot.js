/* chatbot.js — Core del chat + integración Gemini */
const Chatbot = {
  history: [],
  mode: 'svi',
  language: 'auto',
  isLoading: false,
  lastUserMsg: null,

  elements: {},

  init() {
    this.elements = {
      feed: document.getElementById('chatFeed'),
      welcome: document.getElementById('welcomeScreen'),
      input: document.getElementById('chatInput'),
      sendBtn: document.getElementById('sendBtn'),
      typing: document.getElementById('typingContainer'),
      typingLbl: document.getElementById('typingLabel'),
      clearBtn: document.getElementById('clearChatBtn'),
      exportBtn: document.getElementById('exportChatBtn'),
      counter: document.getElementById('inputCounter'),
    };

    this._setupInput();
    this._setupButtons();
    this._setupQuickActions();
    this._loadHistory();
  },

  setMode(mode) {
    this.mode = mode;
    // Update nav active state
    document.querySelectorAll('.nav-item[data-mode]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  },

  _setupInput() {
    const { input, sendBtn, counter } = this.elements;

    input.addEventListener('input', () => {
      // Auto-resize
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 140) + 'px';
      // Counter
      const len = input.value.length;
      counter.textContent = `${len}/2000`;
      counter.style.color = len > 1800 ? 'var(--red-400)' : 'var(--text-muted)';
      // Enable send
      sendBtn.disabled = len === 0 || this.isLoading;
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) this.sendMessage();
      }
    });

    sendBtn.addEventListener('click', () => this.sendMessage());
  },

  _setupButtons() {
    const { clearBtn, exportBtn } = this.elements;

    clearBtn.addEventListener('click', () => {
      if (this.history.length === 0) return;
      if (confirm('¿Deseas limpiar la conversación actual?')) {
        this.clearChat();
      }
    });

    exportBtn.addEventListener('click', () => this.exportChat());
  },

  _setupQuickActions() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // If button switches mode
        if (btn.dataset.mode) {
          this.setMode(btn.dataset.mode);
          // update nav
          document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
          const navTarget = document.querySelector(`.nav-item[data-mode="${btn.dataset.mode}"]`);
          if (navTarget) navTarget.classList.add('active');
        }
        // Send the associated message
        const msg = btn.dataset.msg;
        if (msg) {
          this.elements.input.value = msg;
          this.sendMessage();
        }
      });
    });
  },

  _loadHistory() {
    const saved = Storage.get('chatHistory', []);
    if (saved.length > 0) {
      this.history = saved;
      this._showFeed();
      saved.forEach(m => this._renderMessage(m.role, m.content, m.timestamp));
      this._scrollToBottom();
    }
  },

  _saveHistory() {
    // Keep last 50 messages
    Storage.set('chatHistory', this.history.slice(-50));
  },

  async sendMessage(customMsg = null) {
    const text = (customMsg || this.elements.input.value).trim();
    if (!text || this.isLoading) return;

    // Switch from welcome to feed
    this._showFeed();

    // Clear input
    this.elements.input.value = '';
    this.elements.input.style.height = 'auto';
    this.elements.sendBtn.disabled = true;
    this.elements.counter.textContent = '0/2000';

    this.lastUserMsg = text;

    // Add user message
    const ts = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    this.history.push({ role: 'user', content: text, timestamp: ts });
    this._renderMessage('user', text, ts);
    this._scrollToBottom();

    // Detect intent for transhuman locally
    const transhumanKeywords = ['principio', 'transhumana', 'reto', 'reflexi', 'evolución', 'evolucio', 'persona transhumana', 'principle', 'transhuman'];
    const isTranshumanQuery = transhumanKeywords.some(k => text.toLowerCase().includes(k));

    if (isTranshumanQuery && this.mode !== 'transhuman') {
      // Auto switch to transhumanist mode
      // but don't force it, just hint
    }

    // Handle "principio del día" locally
    if (/principio del d[ií]a/i.test(text)) {
      const response = Transhuman.formatPrincipleOfDay();
      await this._addBotMessage(response);
      return;
    }

    // Handle principio #N locally
    const principleMatch = text.match(/principio\s+#?(\d+)/i);
    if (principleMatch) {
      const p = Transhuman.getPrincipleById(principleMatch[1]);
      if (p) {
        Transhuman.markExplored(p.id);
        const response = Transhuman.formatPrincipleMessage(p);
        await this._addBotMessage(response);
        return;
      }
    }

    // Otherwise call Gemini via backend
    this._showTyping();
    Avatar.setState('thinking');
    this.isLoading = true;

    try {
      // Get stats context
      let context = {};
      try {
        const statsResp = await fetch('api/stats');
        if (statsResp.ok) context = await statsResp.json();
      } catch { }

      const response = await fetch('api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: this.history.slice(-8),
          mode: this.mode,
          language: this.language,
          context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error de red');
      }

      const botText = data.response;
      await this._addBotMessage(botText);

      // Update transhuman counters on mode
      if (this.mode === 'transhuman') {
        Transhuman.incrementReflections();
      }

    } catch (err) {
      this._hideTyping();
      Avatar.setState('error');
      const errTs = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const errMsg = err.message || 'No se pudo conectar con el asistente.';
      this.history.push({ role: 'error', content: errMsg, timestamp: errTs });
      this._renderError(errMsg, errTs);
      this._scrollToBottom();

      setTimeout(() => Avatar.setState('idle'), 3000);
    } finally {
      this.isLoading = false;
      this.elements.sendBtn.disabled = this.elements.input.value.length === 0;
    }
  },

  async _addBotMessage(text) {
    this._hideTyping();
    Avatar.setState('speaking');

    const ts = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    this.history.push({ role: 'assistant', content: text, timestamp: ts });
    this._saveHistory();
    this._renderMessage('assistant', text, ts);
    this._scrollToBottom();

    setTimeout(() => Avatar.setState('idle'), 1500);
  },

  _showFeed() {
    const { welcome, feed } = this.elements;
    if (welcome.style.display !== 'none') {
      welcome.style.display = 'none';
      feed.style.display = 'flex';
    }
  },

  _showTyping() {
    const { typing, typingLbl } = this.elements;
    const labels = {
      svi: 'S.V.I. está analizando...',
      transhuman: 'Reflexionando...',
      reports: 'Generando reporte...',
      general: 'Procesando...'
    };
    if (typingLbl) typingLbl.textContent = labels[this.mode] || labels.svi;
    typing.style.display = 'flex';
    this._scrollToBottom();
  },

  _hideTyping() {
    this.elements.typing.style.display = 'none';
  },

  _renderMessage(role, content, timestamp) {
    const isUser = role === 'user';
    const isBot = role === 'assistant';

    const row = document.createElement('div');
    row.className = `msg-row ${isUser ? 'user' : 'bot'}`;

    const formatted = isBot ? this._formatMarkdown(content) : this._escapeHtml(content);

    row.innerHTML = `
      ${!isUser ? `
        <div class="msg-avatar" aria-hidden="true">
          <div class="tiny-lens"></div>
        </div>
      ` : ''}
      <div>
        <div class="msg-bubble">${formatted}</div>
        <div class="msg-meta">
          <span class="msg-time">${timestamp || ''}</span>
          ${isBot ? `<button class="msg-copy-btn" title="Copiar">📋 Copiar</button>` : ''}
        </div>
      </div>
    `;

    // Copy handler
    if (isBot) {
      const copyBtn = row.querySelector('.msg-copy-btn');
      copyBtn?.addEventListener('click', () => {
        navigator.clipboard?.writeText(content).then(() => {
          copyBtn.textContent = '✅ Copiado';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = '📋 Copiar';
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });
    }

    this.elements.feed.appendChild(row);
  },

  _renderError(message, timestamp) {
    const row = document.createElement('div');
    row.className = 'msg-row bot error';
    row.innerHTML = `
      <div class="msg-avatar" aria-hidden="true">
        <div class="tiny-lens"></div>
      </div>
      <div>
        <div class="msg-bubble">
          ⚠️ ${this._escapeHtml(message)}
          <br/>
          <button class="msg-retry-btn">↩️ Reintentar</button>
        </div>
        <div class="msg-meta">
          <span class="msg-time">${timestamp || ''}</span>
        </div>
      </div>
    `;

    row.querySelector('.msg-retry-btn')?.addEventListener('click', () => {
      if (this.lastUserMsg) {
        row.remove();
        this.history = this.history.filter(m => m.role !== 'error');
        this.sendMessage(this.lastUserMsg);
      }
    });

    this.elements.feed.appendChild(row);
  },

  _scrollToBottom() {
    requestAnimationFrame(() => {
      const feed = this.elements.feed;
      feed.scrollTop = feed.scrollHeight;
    });
  },

  clearChat() {
    this.history = [];
    this._saveHistory();
    this.elements.feed.innerHTML = '';
    this.elements.feed.style.display = 'none';
    this.elements.welcome.style.display = 'flex';
    Avatar.setState('idle');
    this.lastUserMsg = null;
  },

  exportChat() {
    if (this.history.length === 0) {
      alert('No hay mensajes para exportar.');
      return;
    }

    const lines = this.history.map(m => {
      const who = m.role === 'user' ? 'Tú' : m.role === 'assistant' ? 'S.V.I.' : 'Sistema';
      return `[${m.timestamp || ''}] ${who}:\n${m.content}\n`;
    });

    const blob = new Blob([
      `=== Conversación S.V.I. Assistant ===\n`,
      `Exportado: ${new Date().toLocaleString('es-CO')}\n\n`,
      lines.join('\n---\n\n')
    ], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svi_chat_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /* ── Markdown básico ─────────────────────────────── */
  _formatMarkdown(text) {
    let html = this._escapeHtml(text);

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<strong>$1</strong>');

    // Bold / italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code inline
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Code block
    html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Unordered list
    html = html.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');

    // Horizontal rule
    html = html.replace(/^---+$/gm, '<hr style="border:none;border-top:1px solid var(--border-color);margin:10px 0"/>');

    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br/>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');

    return html;
  },

  _escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  setLanguage(lang) {
    this.language = lang;
    Storage.set('language', lang);
  }
};
