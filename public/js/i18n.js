/* i18n.js — Internacionalización del frontend de S.V.I. */
const I18n = {
  currentLang: 'es',

  translations: {
    es: {
      brandSub: 'Assistant',
      navSvi: 'Asistente S.V.I.',
      navReports: 'Análisis y Reportes',
      navTranshuman: 'Persona Transhumana',
      navEvolution: 'Mi Evolución',
      statCameras: 'cámaras',
      statAlerts: 'alertas hoy',
      themeLabel: '🎨 Tema',
      langLabel: '🌎 Idioma',
      fontSizeLabel: '🔤 Tamaño texto',
      statusAvailable: 'Asistente disponible',
      welcomeTitle: 'Hola, soy el Asistente S.V.I.',
      welcomeSubtitle: 'Puedo ayudarte a consultar cámaras, alertas, eventos, estadísticas y reportes.<br/>También puedes explorar la <strong>Declaración de la Persona Transhumana</strong>.',
      inputPlaceholder: 'Escribe un mensaje al asistente S.V.I....',
      qbCameras: 'Cámaras',
      qbAlerts: 'Alertas',
      qbStats: 'Estadísticas',
      qbReports: 'Reportes',
      qbTranshuman: 'Persona Transhumana',
      qbHelp: 'Ayuda',
      cleanChatConfirm: '¿Deseas limpiar la conversación actual?',
      copied: '✅ Copiado',
      copy: '📋 Copiar'
    },
    en: {
      brandSub: 'Assistant',
      navSvi: 'S.V.I. Assistant',
      navReports: 'Analysis & Reports',
      navTranshuman: 'Transhuman Person',
      navEvolution: 'My Evolution',
      statCameras: 'cameras',
      statAlerts: 'alerts today',
      themeLabel: '🎨 Theme',
      langLabel: '🌎 Language',
      fontSizeLabel: '🔤 Font size',
      statusAvailable: 'Assistant ready',
      welcomeTitle: 'Hello, I am the S.V.I. Assistant',
      welcomeSubtitle: 'I can assist you with cameras, alerts, events, statistics, and reports.<br/>You can also explore the <strong>Transhuman Person Declaration</strong>.',
      inputPlaceholder: 'Type a message for the S.V.I. assistant...',
      qbCameras: 'Cameras',
      qbAlerts: 'Alerts',
      qbStats: 'Statistics',
      qbReports: 'Reports',
      qbTranshuman: 'Transhuman Person',
      qbHelp: 'Help',
      cleanChatConfirm: 'Do you want to clear the current conversation?',
      copied: '✅ Copied',
      copy: '📋 Copy'
    },
    fr: {
      brandSub: 'Assistant',
      navSvi: 'Assistant S.V.I.',
      navReports: 'Analyses et Rapports',
      navTranshuman: 'Personne Transhumaine',
      navEvolution: 'Mon Évolution',
      statCameras: 'caméras',
      statAlerts: 'alertes aujourd\'hui',
      themeLabel: '🎨 Thème',
      langLabel: '🌎 Langue',
      fontSizeLabel: '🔤 Taille du texte',
      statusAvailable: 'Assistant disponible',
      welcomeTitle: 'Bonjour, je suis l\'Assistant S.V.I.',
      welcomeSubtitle: 'Je peux vous aider à vérifier les caméras, alertes, événements, statistiques et rapports.<br/>Vous pouvez également explorer la <strong>Déclaration de la Personne Transhumaine</strong>.',
      inputPlaceholder: 'Écrivez un message à l\'assistant S.V.I....',
      qbCameras: 'Caméras',
      qbAlerts: 'Alertes',
      qbStats: 'Statistiques',
      qbReports: 'Rapports',
      qbTranshuman: 'Personne Transhumaine',
      qbHelp: 'Aide',
      cleanChatConfirm: 'Voulez-vous effacer la conversation actuelle ?',
      copied: '✅ Copié',
      copy: '📋 Copier'
    },
    pt: {
      brandSub: 'Assistente',
      navSvi: 'Assistente S.V.I.',
      navReports: 'Análises e Relatórios',
      navTranshuman: 'Pessoa Trans-humana',
      navEvolution: 'Minha Evolução',
      statCameras: 'câmeras',
      statAlerts: 'alertas hoje',
      themeLabel: '🎨 Tema',
      langLabel: '🌎 Idioma',
      fontSizeLabel: '🔤 Tamanho do texto',
      statusAvailable: 'Assistente disponível',
      welcomeTitle: 'Olá, sou o Assistente S.V.I.',
      welcomeSubtitle: 'Posso ajudá-lo a consultar câmeras, alertas, eventos, estatísticas e relatórios.<br/>Você também pode explorar a <strong>Declaração da Pessoa Trans-humana</strong>.',
      inputPlaceholder: 'Digite uma mensagem para o assistente S.V.I....',
      qbCameras: 'Câmeras',
      qbAlerts: 'Alertas',
      qbStats: 'Estatísticas',
      qbReports: 'Relatórios',
      qbTranshuman: 'Pessoa Trans-humana',
      qbHelp: 'Ajuda',
      cleanChatConfirm: 'Deseja limpar a conversa atual?',
      copied: '✅ Copiado',
      copy: '📋 Copiar'
    }
  },

  init() {
    const saved = Storage.get('language', 'auto');
    this.setLanguage(saved);
  },

  setLanguage(lang) {
    if (lang === 'auto') {
      const browserLang = (navigator.language || 'es').slice(0, 2).toLowerCase();
      this.currentLang = this.translations[browserLang] ? browserLang : 'es';
    } else {
      this.currentLang = this.translations[lang] ? lang : 'es';
    }
    this.applyToDOM();
  },

  t(key) {
    const dict = this.translations[this.currentLang] || this.translations.es;
    return dict[key] || key;
  },

  applyToDOM() {
    const t = (k) => this.t(k);
    
    // Welcome screen texts
    const title = document.getElementById('welcomeTitle');
    if (title) title.textContent = t('welcomeTitle');

    const sub = document.getElementById('welcomeSubtitle');
    if (sub) sub.innerHTML = t('welcomeSubtitle');

    const input = document.getElementById('chatInput');
    if (input) input.placeholder = t('inputPlaceholder');

    const status = document.getElementById('statusText');
    if (status && status.textContent.includes('disponible')) {
      status.textContent = t('statusAvailable');
    }
  }
};
