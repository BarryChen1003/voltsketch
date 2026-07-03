// PCB Tutorial Mode
const PCBTutorial = {
  lessons: [
    {
      id: 'basic-layout',
      title: 'PCB Layout 基礎',
      description: '學習 PCB Layout 的基本概念和工具使用',
      steps: [
        {
          title: '認識 PCB 畫布',
          content: 'PCB 畫布是設計 PCB 的主要工作區域。深色背景代表 PCB 板，網格幫助你對齊元件和走線。',
          tips: ['使用滑鼠滾輪縮放', '按住空白鍵拖曳平移', '網格間距為 1mm']
        },
        {
          title: '放置元件',
          content: '從左側工具列選擇 Pad 工具，然後在畫布上點擊放置元件。',
          tips: ['每個元件都有唯一的標籤', '元件可以旋轉和移動', '盡量保持元件之間的間距']
        },
        {
          title: '建立走線',
          content: '選擇走線工具，點擊起點和終點來建立走線。',
          tips: ['走線寬度影響電流承载能力', '避免 90° 轉角，使用 45°', '電源線要較寬']
        },
        {
          title: '新增 Via',
          content: '使用 Via 工具在不同層之間建立連接。',
          tips: ['Via 用於連接不同層的走線', '注意 Via 的大小和間距', '高速訊號盡量減少 Via 數量']
        }
      ]
    },
    {
      id: 'impedance-control',
      title: '阻抗控制設計',
      description: '學習如何在 PCB 上控制訊號線的阻抗',
      steps: [
        {
          title: '了解阻抗',
          content: '阻抗是訊號線對電流的阻礙，對於高速訊號非常重要。',
          tips: ['特性阻抗 Z0 = √(L/C)', '常見阻抗值：50Ω（單端）、100Ω（差分）', '阻抗取決於線寬、介電常數、板厚']
        },
        {
          title: '計算阻抗',
          content: '使用阻抗計算器或公式計算所需的線寬。',
          tips: ['微帶線公式：Z0 = 87/√(Dk+1.41) * ln(5.98*h/(0.8*w+t))', '考慮製程公差', '與 PCB 廠商確認能力']
        },
        {
          title: '走線規則',
          content: '設定走線寬度和間距規則以滿足阻抗要求。',
          tips: ['使用 DRC 檢查阻抗規則', '保持走線寬度一致', '避免阻抗不連續']
        }
      ]
    },
    {
      id: 'power-design',
      title: '電源設計',
      description: '學習如何設計穩定的電源分配網路',
      steps: [
        {
          title: '電源層設計',
          content: '使用完整的電源層來分配電源。',
          tips: ['電源層要完整，避免分割', '電源層緊鄰接地層', '不同電壓使用不同層']
        },
        {
          title: '去耦電容',
          content: '在每個 IC 電源腳附近放置去耦電容。',
          tips: ['0.1µF 電容用於高頻濾波', '10µF 電容用於低頻濾波', '電容盡量靠近 IC 放置']
        },
        {
          title: '電源走線',
          content: '電源走線要足夠寬以承载電流。',
          tips: ['電流越大，走線越寬', '使用公式：寬度 = 電流 / (K * ΔT^0.44)', '考慮溫升和壓降']
        }
      ]
    },
    {
      id: 'emi-design',
      title: 'EMI 設計',
      description: '學習如何減少電磁干擾',
      steps: [
        {
          title: '接地設計',
          content: '良好的接地是 EMI 設計的基礎。',
          tips: ['使用完整的接地平面', '避免接地迴路', '單點接地或多點接地']
        },
        {
          title: '走線屏蔽',
          content: '使用接地線屏蔽敏感訊號。',
          tips: ['高速訊號兩側加接地線', '使用帶狀線結構', '減少走線長度']
        },
        {
          title: '濾波器設計',
          content: '在訊號入口和出口處加濾波器。',
          tips: ['鐵氧體磁珠用於高頻', 'LC 濾波器用於低頻', 'π 型濾波器用於寬頻']
        }
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
        <div class="tutorial-title">${lesson.title}</div>
        <div class="tutorial-desc">${lesson.description}</div>
        <div class="tutorial-steps">${lesson.steps.length} 個步驟</div>
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

    container.innerHTML = `
      <div class="lesson-header">
        <h3>${this.currentLesson.title}</h3>
        <div class="lesson-progress">
          <div class="progress-bar" style="width: ${progress}%"></div>
          <span>${this.currentStep + 1} / ${totalSteps}</span>
        </div>
      </div>
      
      <div class="lesson-step">
        <h4>${step.title}</h4>
        <p>${step.content}</p>
        
        ${step.tips.length > 0 ? `
          <div class="lesson-tips">
            <strong>💡 提示：</strong>
            <ul>
              ${step.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>

      <div class="lesson-nav">
        <button class="small-button" id="prevStep" ${this.currentStep === 0 ? 'disabled' : ''}>上一步</button>
        <button class="primary-button" id="nextStep">
          ${this.currentStep === totalSteps - 1 ? '完成' : '下一步'}
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
    alert('恭喜！你已完成此課程！');
    this.currentLesson = null;
    this.currentStep = 0;
    
    const container = document.querySelector('#tutorialContent');
    if (container) {
      container.innerHTML = '<p style="color: var(--muted); text-align: center;">選擇一個課程開始學習</p>';
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PCBTutorial;
}
