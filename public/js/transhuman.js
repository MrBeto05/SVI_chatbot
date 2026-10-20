/* transhuman.js — Módulo Persona Transhumana */
const Transhuman = {
  principles: [],
  progress: {
    explored: [],
    challenges: 0,
    reflections: 0,
    lastPrinciple: null
  },

  async init() {
    try {
      const resp = await fetch('knowledge/transhuman_knowledge.json');
      const data = await resp.json();
      this.principles = data.principles || [];
    } catch (e) {
      console.warn('No se pudo cargar transhuman_knowledge.json');
    }

    const saved = Storage.get('transhumanProgress', null);
    if (saved) this.progress = saved;

    this._buildEvolutionPanel();
  },

  saveProgress() {
    Storage.set('transhumanProgress', this.progress);
    this._buildEvolutionPanel();
  },

  markExplored(principleId) {
    const id = Number(principleId);
    if (!this.progress.explored.includes(id)) {
      this.progress.explored.push(id);
    }
    const p = this.principles.find(x => x.id === id);
    if (p) this.progress.lastPrinciple = `#${p.id} ${p.title}`;
    this.saveProgress();
  },

  incrementReflections() {
    this.progress.reflections++;
    this.saveProgress();
  },

  incrementChallenges() {
    this.progress.challenges++;
    this.saveProgress();
  },

  getPrincipleOfDay() {
    if (this.principles.length === 0) return null;
    const dayOfYear = Math.floor(Date.now() / 86400000);
    return this.principles[dayOfYear % this.principles.length];
  },

  getPrincipleById(id) {
    return this.principles.find(p => p.id === Number(id)) || null;
  },

  formatPrincipleMessage(p) {
    if (!p) return 'No encontré ese principio.';
    return `## ${p.icon} Principio #${p.id}: ${p.title}

*${p.subtitle}*

${p.description}

**💭 Pregunta de reflexión:**
${p.reflection_questions[0]}

**🎯 Reto:**
${p.challenges[0]}

¿Deseas profundizar en este principio con una reflexión guiada?`;
  },

  formatPrincipleOfDay() {
    const p = this.getPrincipleOfDay();
    if (!p) return '🌱 No hay principio del día disponible por el momento.';
    this.markExplored(p.id);
    return `## 🌱 Principio del Día — #${p.id}

# ${p.icon} ${p.title}

*${p.subtitle}*

${p.description}

---

**💭 Para reflexionar:**
${p.reflection_questions[Math.floor(Math.random() * p.reflection_questions.length)]}

**🎯 Reto de hoy:**
${p.challenges[0]}

¿Quieres explorar este principio más profundamente?`;
  },

  _buildEvolutionPanel() {
    const explored = this.progress.explored.length;
    const total = 12;
    const pct = Math.round((explored / total) * 100);

    const bar = document.getElementById('evoPrinciplesBar');
    const count = document.getElementById('evoPrinciplesCount');
    const challenges = document.getElementById('evoChallenges');
    const reflections = document.getElementById('evoReflections');
    const last = document.getElementById('evoLastPrinciple');
    const grid = document.getElementById('principlesGrid');

    if (bar) bar.style.width = pct + '%';
    if (count) count.textContent = `${explored} / ${total}`;
    if (challenges) challenges.textContent = this.progress.challenges;
    if (reflections) reflections.textContent = this.progress.reflections;
    if (last) last.textContent = this.progress.lastPrinciple || '—';

    if (grid && this.principles.length > 0) {
      grid.innerHTML = this.principles.map(p => `
        <div class="principle-badge ${this.progress.explored.includes(p.id) ? 'explored' : ''}" title="${p.title}">
          <span class="pb-icon">${p.icon}</span>
          <span class="pb-num">#${p.id}</span>
        </div>
      `).join('');
    }
  }
};
