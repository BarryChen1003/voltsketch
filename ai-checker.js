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

    // net 感知檢查引擎（schematic-check.js）優先；未載入才退回舊存在性規則
    if (window.SchematicCheck && window.CircuitEngine) {
      const r = SchematicCheck.run(components, wires);
      report.issues = r.errors.map(e => ({ rule: 'net', message: e.msg, comps: e.comps, level: 'error' }))
        .concat(r.warns.map(e => ({ rule: 'net', message: e.msg, comps: e.comps, level: 'warn' })));
      report.suggestions = r.infos.map(e => ({ text: e.msg, comps: e.comps }));
      this.analyzeComplexity(components, report);
    } else {
      const issues = SchematicRules.validate(components);
      report.issues = issues;
      this.analyzeComplexity(components, report);
      this.analyzeTopology(components, wires, report);
      this.checkBestPractices(components, report);
    }

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

    // 報告項可點擊 → 高亮相關元件（window.__chkSel 由 schematic-check.js 提供）
    const item = (color, msg, comps) => {
      const ids = JSON.stringify(comps || []).replace(/"/g, '&quot;');
      const click = (comps && comps.length) ? ` onclick="window.__chkSel && __chkSel(JSON.parse(this.dataset.comps))" data-comps="${ids}" style="cursor:pointer;color:${color};font-size:12px;" title="點擊在圖上高亮"` : ` style="color:${color};font-size:12px;"`;
      return `<p${click}>• ${msg}</p>`;
    };
    const errs = report.issues.filter(i => i.level !== 'warn');
    const warns = report.issues.filter(i => i.level === 'warn');
    if (errs.length > 0) {
      html += `<h3 style="color:#dc2626;margin-top:8px;">🛑 錯誤 (${errs.length})</h3>`;
      errs.forEach(i => { html += item('#dc2626', i.message, i.comps); });
    }
    if (warns.length > 0) {
      html += `<h3 style="color:#d97706;margin-top:8px;">⚠️ 警告 (${warns.length})</h3>`;
      warns.forEach(i => { html += item('#d97706', i.message, i.comps); });
    }
    if (report.suggestions.length > 0) {
      html += `<h3 style="color:#0369a1;margin-top:8px;">💡 建議 (${report.suggestions.length})</h3>`;
      report.suggestions.forEach(s => {
        const msg = typeof s === 'string' ? s : s.text;
        const comps = typeof s === 'string' ? [] : s.comps;
        html += item('#0369a1', msg, comps);
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
