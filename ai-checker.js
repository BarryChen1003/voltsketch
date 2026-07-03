// AI Checker Module
const AIChecker = {
  reviewHistory: [],

  init() {
    this.reviewHistory = JSON.parse(localStorage.getItem('voltsketch-reviews') || '[]');
  },

  async analyzeCircuit(components, wires, notes) {
    const report = {
      timestamp: new Date().toISOString(),
      componentCount: components.length,
      wireCount: wires.length,
      issues: [],
      suggestions: []
    };

    // Run rule validation
    const issues = SchematicRules.validate(components);
    report.issues = issues;

    // Analyze complexity
    this.analyzeComplexity(components, report);

    // Analyze topology
    this.analyzeTopology(components, wires, report);

    // Check best practices
    this.checkBestPractices(components, report);

    // Store user notes
    if (notes) {
      report.userNotes = notes;
    }

    // Save to history
    this.reviewHistory.push(report);
    localStorage.setItem('voltsketch-reviews', JSON.stringify(this.reviewHistory));
    return report;
  },

  analyzeComplexity(components, report) {
    if (components.length > 20) {
      report.suggestions.push('線路較複雜，建議分區標示');
    }
    const types = new Set(components.map(c => c.type));
    if (types.size > 8) {
      report.suggestions.push('使用了多種元件，建議確認供電需求');
    }
  },

  analyzeTopology(components, wires, report) {
    const sources = components.filter(c => c.type === 'source');
    if (sources.length > 1) {
      report.suggestions.push('多個電源，確認電壓/電流方向');
    }
    const groundCount = components.filter(c => c.type === 'ground').length;
    if (groundCount > 3) {
      report.suggestions.push('多地接，確認共地設計');
    }
  },

  checkBestPractices(components, report) {
    const caps = components.filter(c => c.type === 'capacitor');
    if (caps.length === 0 && components.length > 5) {
      report.suggestions.push('建議加入去耦電容');
    }
    const leds = components.filter(c => c.type === 'led');
    leds.forEach(led => {
      const nearbyResistor = components.some(c =>
        c.type === 'resistor' &&
        Math.abs(c.x - led.x) < 100 && Math.abs(c.y - led.y) < 100
      );
      if (!nearbyResistor) {
        report.issues.push({ rule: 'LED', message: `${led.label || 'LED'} 周圍未發現限流電阻` });
      }
    });
  },

  generateReportHTML(report) {
    let html = `<div style="margin-top:8px;">`;
    html += `<p style="font-size:11px;color:#64748b;">分析時間: ${new Date(report.timestamp).toLocaleString('zh-TW')}</p>`;
    html += `<p>元件數: ${report.componentCount} | 導線數: ${report.wireCount}</p>`;

    if (report.issues.length > 0) {
      html += `<h3 style="color:#dc2626;margin-top:8px;">⚠️ 問題 (${report.issues.length})</h3>`;
      report.issues.forEach(issue => {
        html += `<p style="color:#dc2626;font-size:12px;">• ${issue.message}</p>`;
      });
    }

    if (report.suggestions.length > 0) {
      html += `<h3 style="color:#f59e0b;margin-top:8px;">💡 建議 (${report.suggestions.length})</h3>`;
      report.suggestions.forEach(s => {
        html += `<p style="color:#f59e0b;font-size:12px;">• ${s}</p>`;
      });
    }

    if (report.issues.length === 0 && report.suggestions.length === 0) {
      html += `<p style="color:#16a34a;margin-top:8px;">✅ 線路檢查通過</p>`;
    }

    html += `</div>`;
    return html;
  },

  getHistory() {
    return this.reviewHistory;
  },

  clearHistory() {
    this.reviewHistory = [];
    localStorage.removeItem('voltsketch-reviews');
  }
};

// Initialize
AIChecker.init();
