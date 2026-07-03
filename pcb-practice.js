// PCB Practice Mode
const PCBPractice = {
  exercises: [
    {
      id: 'simple-led',
      title: '簡單 LED 電路',
      description: '練習放置電阻和 LED，建立簡單的 LED 電路',
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
      hints: [
        '電阻用於限制電流',
        'LED 的陽極（長腳）連接到電阻',
        'LED 的陰極（短腳）連接到 GND'
      ]
    },
    {
      id: 'voltage-divider',
      title: '分壓器電路',
      description: '練習建立電阻分壓器',
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
      hints: [
        'VOUT = VCC * R2 / (R1 + R2)',
        '兩個電阻串聯',
        '輸出電壓在兩個電阻之間'
      ]
    },
    {
      id: 'rc-filter',
      title: 'RC 濾波器',
      description: '練習建立 RC 低通濾波器',
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
      hints: [
        '截止頻率 fc = 1 / (2π * R * C)',
        '電阻和電容串聯',
        '輸出在 R 和 C 之間'
      ]
    },
    {
      id: 'buck-converter',
      title: 'Buck 轉換器',
      description: '練習建立 Buck 降壓轉換器電路',
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
      hints: [
        'Buck 轉換器用於降壓',
        '輸入和輸出都需要電容濾波',
        '注意接線正確'
      ]
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
        <div class="practice-title">${ex.title}</div>
        <div class="practice-desc">${ex.description}</div>
        <div class="practice-meta">
          <span class="difficulty ${ex.difficulty}">${this.getDifficultyLabel(ex.difficulty)}</span>
          <span>${ex.components.length} 個元件</span>
        </div>
      </div>
    `).join('');

    // Bind click events
    container.querySelectorAll('.practice-item').forEach(el => {
      el.addEventListener('click', () => this.startExercise(el.dataset.id));
    });
  },

  getDifficultyLabel(difficulty) {
    const labels = {
      beginner: '入門',
      intermediate: '中級',
      advanced: '進階'
    };
    return labels[difficulty] || difficulty;
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

    container.innerHTML = `
      <div class="exercise-header">
        <h3>${ex.title}</h3>
        <span class="difficulty ${ex.difficulty}">${this.getDifficultyLabel(ex.difficulty)}</span>
      </div>
      
      <div class="exercise-description">
        <p>${ex.description}</p>
      </div>

      <div class="exercise-components">
        <h4>需要的元件：</h4>
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
        <h4>需要的連接：</h4>
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
        <h4>💡 提示：</h4>
        <ul>
          ${ex.hints.map(hint => `<li>${hint}</li>`).join('')}
        </ul>
      </div>

      <div class="exercise-actions">
        <button class="primary-button" id="checkExercise">檢查答案</button>
        <button class="small-button" id="showSolution">顯示解答</button>
        <button class="small-button" id="nextExercise">下一個練習</button>
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
        <strong>✓ 線路檢查完成</strong>
        <p>請確認以下項目：</p>
        <ul>
          <li>所有元件已正確放置</li>
          <li>所有連接已完成</li>
          <li>電源和接地已連接</li>
        </ul>
        <p>使用 DRC 檢查按鈕進行更詳細的檢查。</p>
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
        <strong>解答：</strong>
        <div class="solution-circuit">
          <svg viewBox="0 0 200 100" width="200" height="100">
            ${this.generateSolutionSVG(ex)}
          </svg>
        </div>
        <p>按照圖示連接元件即可完成練習。</p>
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PCBPractice;
}
