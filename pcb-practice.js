// PCB Practice Mode
// 練習內容四語字典在 i18n.js（prac_* keys）；資料只存 key，render 時解析（切語言即時生效）
const pracT = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
const PCBPractice = {
  exercises: [
    {
      id: 'simple-led', k: 'prac_sl',
      difficulty: 'beginner',
      components: [
        { type: 'resistor', label: 'R1', value: '330Ω' },
        { type: 'led', label: 'LED1', value: 'Red' }
      ],
      connections: [
        { from: 'R1.pin1', to: 'VCC', net: 'VCC' },
        { from: 'R1.pin2', to: 'LED1.anode', net: 'LED' },
        { from: 'LED1.cathode', to: 'GND', net: 'GND' }
      ],
      hints: 3
    },
    {
      id: 'voltage-divider', k: 'prac_vd',
      difficulty: 'beginner',
      components: [
        { type: 'resistor', label: 'R1', value: '10kΩ' },
        { type: 'resistor', label: 'R2', value: '10kΩ' }
      ],
      connections: [
        { from: 'R1.pin1', to: 'VCC', net: 'VCC' },
        { from: 'R1.pin2', to: 'R2.pin1', net: 'VOUT' },
        { from: 'R2.pin2', to: 'GND', net: 'GND' }
      ],
      hints: 3
    },
    {
      id: 'rc-filter', k: 'prac_rc',
      difficulty: 'intermediate',
      components: [
        { type: 'resistor', label: 'R1', value: '1kΩ' },
        { type: 'capacitor', label: 'C1', value: '100nF' }
      ],
      connections: [
        { from: 'R1.pin1', to: 'VIN', net: 'VIN' },
        { from: 'R1.pin2', to: 'C1.pin1', net: 'VOUT' },
        { from: 'C1.pin2', to: 'GND', net: 'GND' }
      ],
      hints: 3
    },
    {
      id: 'buck-converter', k: 'prac_bk',
      difficulty: 'advanced',
      components: [
        { type: 'dcdc', label: 'U1', value: '5V' },
        { type: 'capacitor', label: 'C1', value: '10µF' },
        { type: 'capacitor', label: 'C2', value: '100µF' }
      ],
      connections: [
        { from: 'U1.VIN+', to: 'VIN', net: 'VIN' },
        { from: 'U1.VIN-', to: 'GND', net: 'GND' },
        { from: 'U1.VOUT+', to: 'C1.pin1', net: 'VOUT' },
        { from: 'C1.pin2', to: 'GND', net: 'GND' },
        { from: 'U1.VOUT-', to: 'GND', net: 'GND' }
      ],
      hints: 3
    }
  ],

  currentExercise: null,
  userConnections: [],

  // Render exercise list
  renderExerciseList() {
    const container = document.querySelector('#practiceList');
    if (!container) return;

    container.innerHTML = this.exercises.map(ex => `
      <div class="practice-item" data-id="${ex.id}">
        <div class="practice-title">${pracT(ex.k + '_t')}</div>
        <div class="practice-desc">${pracT(ex.k + '_d')}</div>
        <div class="practice-meta">
          <span class="difficulty ${ex.difficulty}">${this.getDifficultyLabel(ex.difficulty)}</span>
          <span>${pracT('prac_comp_n', { n: ex.components.length })}</span>
        </div>
      </div>
    `).join('');

    // Bind click events
    container.querySelectorAll('.practice-item').forEach(el => {
      el.addEventListener('click', () => this.startExercise(el.dataset.id));
    });
  },

  getDifficultyLabel(difficulty) {
    const keys = {
      beginner: 'prac_diff_beginner',
      intermediate: 'prac_diff_intermediate',
      advanced: 'prac_diff_advanced'
    };
    return keys[difficulty] ? pracT(keys[difficulty]) : difficulty;
  },

  // Start an exercise
  startExercise(exerciseId) {
    this.currentExercise = this.exercises.find(ex => ex.id === exerciseId);
    this.userConnections = [];
    this.renderExercise();
  },

  // Render current exercise
  renderExercise() {
    if (!this.currentExercise) return;

    const container = document.querySelector('#practiceContent');
    if (!container) return;

    const ex = this.currentExercise;
    const hints = Array.from({ length: ex.hints }, (_, i) => pracT(`${ex.k}_h${i + 1}`));

    container.innerHTML = `
      <div class="exercise-header">
        <h3>${pracT(ex.k + '_t')}</h3>
        <span class="difficulty ${ex.difficulty}">${this.getDifficultyLabel(ex.difficulty)}</span>
      </div>

      <div class="exercise-description">
        <p>${pracT(ex.k + '_d')}</p>
      </div>

      <div class="exercise-components">
        <h4>${pracT('prac_comps_h')}</h4>
        <div class="component-list">
          ${ex.components.map(comp => `
            <div class="component-item">
              <span class="component-type">${comp.type}</span>
              <span class="component-label">${comp.label}</span>
              <span class="component-value">${comp.value}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="exercise-connections">
        <h4>${pracT('prac_conns_h')}</h4>
        <div class="connection-list">
          ${ex.connections.map(conn => `
            <div class="connection-item">
              <span>${conn.from}</span>
              <span class="arrow">→</span>
              <span>${conn.to}</span>
              <span class="net">(${conn.net})</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="exercise-hints">
        <h4>${pracT('tut_tips_label')}</h4>
        <ul>
          ${hints.map(hint => `<li>${hint}</li>`).join('')}
        </ul>
      </div>

      <div class="exercise-actions">
        <button class="primary-button" id="checkExercise">${pracT('prac_check')}</button>
        <button class="small-button" id="showSolution">${pracT('prac_solution')}</button>
        <button class="small-button" id="nextExercise">${pracT('prac_next')}</button>
      </div>

      <div id="exerciseResult" class="exercise-result" hidden></div>
    `;

    // Bind events
    document.querySelector('#checkExercise')?.addEventListener('click', () => this.checkExercise());
    document.querySelector('#showSolution')?.addEventListener('click', () => this.showSolution());
    document.querySelector('#nextExercise')?.addEventListener('click', () => this.nextExercise());
  },

  // Check exercise
  checkExercise() {
    const resultDiv = document.querySelector('#exerciseResult');
    if (!resultDiv) return;

    // Simple check - in real implementation, would compare with user's actual connections
    resultDiv.hidden = false;
    resultDiv.innerHTML = `
      <div class="result-success">
        <strong>${pracT('prac_check_done')}</strong>
        <p>${pracT('prac_check_confirm')}</p>
        <ul>
          <li>${pracT('prac_check_i1')}</li>
          <li>${pracT('prac_check_i2')}</li>
          <li>${pracT('prac_check_i3')}</li>
        </ul>
        <p>${pracT('prac_check_drc')}</p>
      </div>
    `;
  },

  // Show solution
  showSolution() {
    const resultDiv = document.querySelector('#exerciseResult');
    if (!resultDiv) return;

    const ex = this.currentExercise;
    resultDiv.hidden = false;
    resultDiv.innerHTML = `
      <div class="result-solution">
        <strong>${pracT('prac_sol_h')}</strong>
        <div class="solution-circuit">
          <svg viewBox="0 0 200 100" width="200" height="100">
            ${this.generateSolutionSVG(ex)}
          </svg>
        </div>
        <p>${pracT('prac_sol_note')}</p>
      </div>
    `;
  },

  // Generate solution SVG
  generateSolutionSVG(exercise) {
    // Simple SVG generation based on exercise type
    return `
      <rect x="10" y="30" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="2"/>
      <text x="30" y="45" text-anchor="middle" font-size="8">${exercise.components[0]?.label || 'R1'}</text>
      <line x1="50" y1="40" x2="100" y2="40" stroke="#1d2943" stroke-width="2"/>
      <rect x="100" y="30" width="40" height="20" fill="white" stroke="#1d2943" stroke-width="2"/>
      <text x="120" y="45" text-anchor="middle" font-size="8">${exercise.components[1]?.label || 'C1'}</text>
      <line x1="140" y1="40" x2="180" y2="40" stroke="#1d2943" stroke-width="2"/>
      <text x="10" y="25" font-size="8">VCC</text>
      <text x="180" y="25" font-size="8">GND</text>
    `;
  },

  // Next exercise
  nextExercise() {
    const currentIndex = this.exercises.findIndex(ex => ex.id === this.currentExercise?.id);
    const nextIndex = (currentIndex + 1) % this.exercises.length;
    this.startExercise(this.exercises[nextIndex].id);
  }
};

// 切語言：練習清單＋開啟中的練習重繪（結果面板重置，同重新開啟）
if (typeof document !== 'undefined') {
  document.addEventListener('vs-lang-change', () => {
    PCBPractice.renderExerciseList();
    if (PCBPractice.currentExercise) PCBPractice.renderExercise();
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PCBPractice;
}
