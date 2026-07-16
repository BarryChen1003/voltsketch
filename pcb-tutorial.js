// PCB Tutorial Mode
// 課程內容四語字典在 i18n.js（tut_* keys）；資料只存 key，render 時解析（切語言即時生效）
const tutT = (k, vars) => (typeof window !== 'undefined' && window.I18N) ? window.I18N.t(k, vars) : k;
const PCBTutorial = {
  lessons: [
    {
      id: 'basic-layout', k: 'tut_bl',
      steps: [
        { k: 'tut_bl_s1', tips: 3 },
        { k: 'tut_bl_s2', tips: 3 },
        { k: 'tut_bl_s3', tips: 3 },
        { k: 'tut_bl_s4', tips: 3 }
      ]
    },
    {
      id: 'impedance-control', k: 'tut_ic',
      steps: [
        { k: 'tut_ic_s1', tips: 3 },
        { k: 'tut_ic_s2', tips: 3 },
        { k: 'tut_ic_s3', tips: 3 }
      ]
    },
    {
      id: 'power-design', k: 'tut_pd',
      steps: [
        { k: 'tut_pd_s1', tips: 3 },
        { k: 'tut_pd_s2', tips: 3 },
        { k: 'tut_pd_s3', tips: 3 }
      ]
    },
    {
      id: 'emi-design', k: 'tut_emi',
      steps: [
        { k: 'tut_emi_s1', tips: 3 },
        { k: 'tut_emi_s2', tips: 3 },
        { k: 'tut_emi_s3', tips: 3 }
      ]
    }
  ],

  currentLesson: null,
  currentStep: 0,

  // Render tutorial list
  renderTutorialList() {
    const container = document.querySelector('#tutorialList');
    if (!container) return;

    container.innerHTML = this.lessons.map(lesson => `
      <div class="tutorial-item" data-id="${lesson.id}">
        <div class="tutorial-title">${tutT(lesson.k + '_t')}</div>
        <div class="tutorial-desc">${tutT(lesson.k + '_d')}</div>
        <div class="tutorial-steps">${tutT('tut_steps_n', { n: lesson.steps.length })}</div>
      </div>
    `).join('');

    // Bind click events
    container.querySelectorAll('.tutorial-item').forEach(el => {
      el.addEventListener('click', () => this.startLesson(el.dataset.id));
    });
  },

  // Start a lesson
  startLesson(lessonId) {
    this.currentLesson = this.lessons.find(l => l.id === lessonId);
    this.currentStep = 0;
    this.renderLesson();
  },

  // Render current lesson
  renderLesson() {
    if (!this.currentLesson) return;

    const container = document.querySelector('#tutorialContent');
    if (!container) return;

    const step = this.currentLesson.steps[this.currentStep];
    const totalSteps = this.currentLesson.steps.length;
    const progress = ((this.currentStep + 1) / totalSteps) * 100;
    const tips = Array.from({ length: step.tips }, (_, i) => tutT(`${step.k}_p${i + 1}`));

    container.innerHTML = `
      <div class="lesson-header">
        <h3>${tutT(this.currentLesson.k + '_t')}</h3>
        <div class="lesson-progress">
          <div class="progress-bar" style="width: ${progress}%"></div>
          <span>${this.currentStep + 1} / ${totalSteps}</span>
        </div>
      </div>

      <div class="lesson-step">
        <h4>${tutT(step.k + '_t')}</h4>
        <p>${tutT(step.k + '_c')}</p>

        ${tips.length > 0 ? `
          <div class="lesson-tips">
            <strong>${tutT('tut_tips_label')}</strong>
            <ul>
              ${tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <div class="lesson-nav">
        <button class="small-button" id="prevStep" ${this.currentStep === 0 ? 'disabled' : ''}>${tutT('tut_prev')}</button>
        <button class="primary-button" id="nextStep">
          ${this.currentStep === totalSteps - 1 ? tutT('tut_finish') : tutT('tut_next')}
        </button>
      </div>
    `;

    // Bind navigation
    document.querySelector('#prevStep')?.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.currentStep--;
        this.renderLesson();
      }
    });

    document.querySelector('#nextStep')?.addEventListener('click', () => {
      if (this.currentStep < totalSteps - 1) {
        this.currentStep++;
        this.renderLesson();
      } else {
        this.completeLesson();
      }
    });
  },

  // Complete lesson
  completeLesson() {
    alert(tutT('tut_congrats'));
    this.currentLesson = null;
    this.currentStep = 0;

    const container = document.querySelector('#tutorialContent');
    if (container) {
      container.innerHTML = `<p style="color: var(--muted); text-align: center;">${tutT('tut_pick')}</p>`;
    }
  }
};

// 切語言：課程清單＋開啟中的課程重繪
if (typeof document !== 'undefined') {
  document.addEventListener('vs-lang-change', () => {
    PCBTutorial.renderTutorialList();
    if (PCBTutorial.currentLesson) PCBTutorial.renderLesson();
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PCBTutorial;
}
