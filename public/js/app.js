/* app.js — Bootstrap principal. Integra todos los módulos */
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Init theme + font size
  Theme.init();
  FontSize.init();

  // 2. Init avatar
  Avatar.init();

  // 3. Init transhuman
  await Transhuman.init();

  // 4. Init chatbot
  Chatbot.init();

  // 5. Restore language
  const savedLang = Storage.get('language', 'auto');
  if (window.I18n) I18n.init();
  document.getElementById('languageSelect').value = savedLang;
  Chatbot.setLanguage(savedLang);

  // 6. Language change
  document.getElementById('languageSelect').addEventListener('change', (e) => {
    Chatbot.setLanguage(e.target.value);
    if (window.I18n) I18n.setLanguage(e.target.value);
  });

  // 7. Sidebar mobile toggle
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const sidebarToggle = document.getElementById('sidebarToggle');

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
  }

  menuBtn.addEventListener('click', openSidebar);
  sidebarToggle.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // 8. Nav items
  document.querySelectorAll('.nav-item[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      btn.classList.add('active');
      Chatbot.setMode(btn.dataset.mode);

      // Auto send welcome for transhuman or reports
      if (btn.dataset.mode === 'transhuman') {
        closeSidebar();
        const principleOfDay = Transhuman.formatPrincipleOfDay();
        Chatbot._showFeed();
        Chatbot._addBotMessage(principleOfDay);
      } else if (btn.dataset.mode === 'reports') {
        closeSidebar();
        Chatbot._showFeed();
        if (window.Reports) {
          Reports.generateQuickReport('daily').then(rep => Chatbot._addBotMessage(rep));
        }
      } else {
        closeSidebar();
      }
    });
  });

  // Evolution panel
  document.querySelector('.nav-item[data-panel="evolution"]')?.addEventListener('click', () => {
    const panel = document.getElementById('evolutionPanel');
    panel.style.display = 'flex';
    closeSidebar();
  });

  document.getElementById('closeEvolution')?.addEventListener('click', () => {
    document.getElementById('evolutionPanel').style.display = 'none';
  });

  // Close panel on overlay click
  document.getElementById('evolutionPanel')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('evolutionPanel')) {
      document.getElementById('evolutionPanel').style.display = 'none';
    }
  });

  // 9. Load stats
  loadStats();

  // 10. Keyboard shortcut: Escape closes panels
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
      document.getElementById('evolutionPanel').style.display = 'none';
    }
  });

  console.log('%c🔵 S.V.I. Assistant inicializado', 'color:#3b82f6;font-weight:bold;font-size:14px');
});

async function loadStats() {
  try {
    const resp = await fetch('api/stats');
    if (!resp.ok) return;
    const data = await resp.json();

    const cVal = document.getElementById('statCamerasVal');
    const aVal = document.getElementById('statAlertsVal');

    if (cVal) cVal.textContent = `${data.cameras?.active || '—'}/${data.cameras?.total || '—'}`;
    if (aVal) aVal.textContent = data.alerts?.today ?? '—';
  } catch {
    // Stats endpoint not reachable — ok in demo mode
  }
}
