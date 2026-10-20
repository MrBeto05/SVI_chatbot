/* ═══════════════════════════════════════════════════════
   S.V.I. DASHBOARD — JavaScript
   ═══════════════════════════════════════════════════════ */

'use strict';

// ── Reloj / fecha en topbar ──────────────────────────────
(function initClock() {
  const el = document.getElementById('tbarDate');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleString('es-CO', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
  tick();
  setInterval(tick, 1000);
})();

// ── Cámaras simuladas ────────────────────────────────────
(function initCamGrid() {
  const grid = document.getElementById('camGrid');
  if (!grid) return;

  const cams = [
    { id: 'CAM-01', zone: 'Zona A', status: 'active', hasPerson: true },
    { id: 'CAM-02', zone: 'Zona A', status: 'active', hasPerson: false },
    { id: 'CAM-03', zone: 'Zona A - Ingr.', status: 'alert', hasPerson: true },
    { id: 'CAM-05', zone: 'Zona B', status: 'active', hasPerson: false },
    { id: 'CAM-07', zone: 'Zona C - Norte', status: 'alert', hasPerson: true },
    { id: 'CAM-09', zone: 'Zona C', status: 'inactive', hasPerson: false },
  ];

  cams.forEach(cam => {
    const cell = document.createElement('div');
    cell.className = `cam-cell ${cam.status === 'inactive' ? 'offline' : ''} ${cam.status === 'alert' ? 'alert-cam' : ''}`;
    cell.title = cam.id;

    cell.innerHTML = `
      <div class="cam-scanlines"></div>
      <div class="cam-content">
        ${cam.status === 'inactive'
        ? '<span style="font-size:22px;opacity:0.4">📷</span>'
        : `<div class="cam-crosshair"></div>
             ${cam.hasPerson ? '<span class="cam-person">🚶</span>' : ''}`
      }
      </div>
      <div class="cam-label">${cam.id} · ${cam.zone}</div>
      <div class="cam-status-dot"></div>
    `;
    grid.appendChild(cell);
  });
})();

// ── Gráfico de actividad ─────────────────────────────────
(function initChart() {
  const barsEl = document.getElementById('chartBars');
  const labelsEl = document.getElementById('chartLabels');
  if (!barsEl) return;

  const hours = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000);
    hours.push(h.getHours());
  }

  const values = [
    4, 2, 1, 1, 3, 7, 18, 25, 22, 20, 24, 30,
    28, 26, 22, 20, 18, 22, 28, 32, 30, 24, 18, 12
  ];

  const max = Math.max(...values);
  hours.forEach((h, i) => {
    const pct = Math.round((values[i] / max) * 100);
    const bar = document.createElement('div');
    bar.className = 'chart-bar' + (pct === 100 ? ' peak' : '');
    bar.style.height = pct + '%';
    bar.title = `${h}:00 — ${values[i]} eventos`;
    barsEl.appendChild(bar);

    const lbl = document.createElement('div');
    lbl.className = 'chart-lbl';
    lbl.textContent = i % 4 === 0 ? `${h}h` : '';
    labelsEl.appendChild(lbl);
  });
})();

// ── Topbar nav (simula cambio de vista) ──────────────────
document.querySelectorAll('.tnav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tnav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ══════════════════════════════════════════════════════════
//  CHATBOT WIDGET
// ══════════════════════════════════════════════════════════

const bubbleBtn = document.getElementById('chatBubbleBtn');
const chatWidget = document.getElementById('chatWidget');
const bubbleNotif = document.getElementById('bubbleNotif');
const bubbleCloseI = document.getElementById('bubbleCloseIcon');
const chatTooltip = document.getElementById('chatTooltip');
const tooltipClose = document.getElementById('tooltipClose');

const widgetMessages = document.getElementById('widgetMessages');
const widgetInput = document.getElementById('widgetInput');
const widgetSend = document.getElementById('widgetSend');
const widgetTyping = document.getElementById('widgetTyping');
const widgetSuggs = document.getElementById('widgetSuggestions');
const wClearBtn = document.getElementById('wClearBtn');
const wMinBtn = document.getElementById('wMinBtn');

let isOpen = false;
let isTyping = false;
let chatHistory = [];

// Ocultar tooltip al cerrar
tooltipClose && tooltipClose.addEventListener('click', () => {
  chatTooltip.classList.add('hidden');
});

// Auto ocultar tooltip después de 6s
setTimeout(() => {
  chatTooltip && chatTooltip.classList.add('hidden');
}, 6000);

// ── Toggle widget ────────────────────────────────────────
function toggleWidget() {
  isOpen = !isOpen;
  bubbleBtn.classList.toggle('open', isOpen);
  chatWidget.classList.toggle('open', isOpen);
  chatWidget.setAttribute('aria-hidden', !isOpen);
  chatTooltip.classList.add('hidden');

  if (isOpen) {
    bubbleNotif.classList.add('hidden');
    setTimeout(() => widgetInput.focus(), 300);
  }
}

bubbleBtn.addEventListener('click', toggleWidget);
wMinBtn && wMinBtn.addEventListener('click', toggleWidget);

// ── Input auto-resize ────────────────────────────────────
widgetInput.addEventListener('input', () => {
  widgetInput.style.height = 'auto';
  widgetInput.style.height = Math.min(widgetInput.scrollHeight, 100) + 'px';
  widgetSend.disabled = widgetInput.value.trim().length === 0;
});

widgetInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!widgetSend.disabled) sendMessage();
  }
});
widgetSend.addEventListener('click', sendMessage);

// ── Sugerencias rápidas ──────────────────────────────────
document.querySelectorAll('.ws-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const msg = chip.dataset.msg;
    if (msg) {
      widgetInput.value = msg;
      widgetSend.disabled = false;
      widgetSuggs.classList.add('hidden');
      sendMessage();
    }
  });
});

// ── Limpiar chat ─────────────────────────────────────────
wClearBtn && wClearBtn.addEventListener('click', () => {
  chatHistory = [];
  widgetMessages.innerHTML = '';
  addBotMessage('Conversación reiniciada. ¿En qué te puedo ayudar?');
  widgetSuggs.classList.remove('hidden');
});

// ── Agregar mensaje de bot ───────────────────────────────
function addBotMessage(text, isError = false) {
  const row = document.createElement('div');
  row.className = 'wm-row wm-bot';

  const time = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  // Convertir markdown básico
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  row.innerHTML = `
    <div class="wm-icon">
      <div class="wm-mini-avatar"><div class="wma-lens"></div></div>
    </div>
    <div class="wm-bubble ${isError ? 'error' : ''}">
      <p>${formatted}</p>
      <div class="wm-time">${time}</div>
    </div>
  `;
  widgetMessages.appendChild(row);
  scrollMessages();
  return row;
}

// ── Agregar mensaje de usuario ───────────────────────────
function addUserMessage(text) {
  const row = document.createElement('div');
  row.className = 'wm-row wm-user';
  const time = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  row.innerHTML = `
    <div class="wm-bubble">
      <p>${text}</p>
      <div class="wm-time">${time}</div>
    </div>
  `;
  widgetMessages.appendChild(row);
  scrollMessages();
}

// ── Scroll al fondo ──────────────────────────────────────
function scrollMessages() {
  widgetMessages.scrollTo({ top: widgetMessages.scrollHeight, behavior: 'smooth' });
}

// ── Mostrar / ocultar typing ─────────────────────────────
function showTyping(show) {
  widgetTyping.style.display = show ? 'flex' : 'none';
  if (show) scrollMessages();
}

// ── Enviar mensaje a la API del servidor ─────────────────
async function sendMessage() {
  const text = widgetInput.value.trim();
  if (!text || isTyping) return;

  // Reset input
  widgetInput.value = '';
  widgetInput.style.height = 'auto';
  widgetSend.disabled = true;
  widgetSuggs.classList.add('hidden');

  // Mostrar mensaje usuario
  addUserMessage(text);
  chatHistory.push({ role: 'user', content: text });

  // Mostrar typing
  isTyping = true;
  showTyping(true);

  try {
    const response = await fetch('api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory.slice(-10),
        mode: 'svi',
        language: 'auto',
        context: {
          cameras: { total: 12, active: 10, inactive: 2 },
          alerts: { today: 7, critical: 2, high: 3, low: 2 }
        }
      })
    });

    showTyping(false);
    isTyping = false;

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.demo
        ? '⚠️ API Key no configurada. Ve al archivo **.env** y agrega tu API key de Google AI Studio (comienza con `AIza...`).'
        : (data.error || 'Error al contactar con el asistente.');
      addBotMessage(errMsg, true);
    } else {
      const botReply = data.response || 'No pude procesar tu consulta.';
      addBotMessage(botReply);
      chatHistory.push({ role: 'model', content: botReply });
    }

  } catch (err) {
    showTyping(false);
    isTyping = false;
    addBotMessage('❌ No se pudo conectar con el servidor. Asegúrate de que el servidor esté corriendo (`node server.js`).', true);
    console.error('Widget fetch error:', err);
  }
}

// ── Inicio: mensaje de bienvenida ya existe en HTML ──────
// Mostrar burbuja con animación después de 1s
setTimeout(() => {
  bubbleBtn.style.opacity = '0';
  bubbleBtn.style.transform = 'scale(0) rotate(-180deg)';
  bubbleBtn.style.transition = 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)';

  requestAnimationFrame(() => {
    setTimeout(() => {
      bubbleBtn.style.opacity = '1';
      bubbleBtn.style.transform = 'scale(1) rotate(0deg)';
    }, 50);
  });
}, 500);
