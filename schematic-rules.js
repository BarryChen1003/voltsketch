// Schematic Rules Module
const SchematicRules = {
  rules: [
    { id: 'has-power', name: '需要電源', check: (components) => components.some(c => c.type === 'source') ? null : '電路中缺少直流電源' },
    { id: 'has-ground', name: '需要接地', check: (components) => components.some(c => c.type === 'ground') ? null : '電路中缺少接地' },
    { id: 'led-resistor', name: 'LED 需限流電阻', check: (components) => {
      const leds = components.filter(c => c.type === 'led');
      const resistors = components.filter(c => c.type === 'resistor');
      return (leds.length > 0 && resistors.length === 0) ? 'LED 建議串联限流電阻' : null;
    }},
    { id: 'series-load', name: '負載需形成迴路', check: (components) => {
      const sources = components.filter(c => c.type === 'source');
      const loads = components.filter(c => ['lamp', 'resistor', 'led', 'inductor'].includes(c.type));
      return (sources.length > 0 && loads.length === 0) ? '電源未連接負載' : null;
    }},
    { id: 'voltage-range', name: '電壓範圍檢查', check: (components) => {
      const warnings = [];
      components.filter(c => c.value).forEach(c => {
        if (c.type === 'source' && c.value > 48) {
          warnings.push(`${c.label || '電源'} 電壓超過 48V，注意安全`);
        }
      });
      return warnings.length > 0 ? warnings : null;
    }},
    { id: 'no-floating', name: '避免浮空接腳', check: (components) => {
      const warnings = [];
      components.forEach(c => {
        if (c.type === 'nmos' || c.type === 'pmos' || c.type === 'npn' || c.type === 'pnp') {
          if (!c.connections || c.connections.length < 2) {
            warnings.push(`${c.label || c.type} 可能有浮空接腳`);
          }
        }
      });
      return warnings.length > 0 ? warnings : null;
    }}
  ],

  validate(components) {
    const issues = [];
    for (const rule of this.rules) {
      const result = rule.check(components);
      if (result) {
        const msgs = Array.isArray(result) ? result : [result];
        msgs.forEach(msg => issues.push({ rule: rule.name, message: msg }));
      }
    }
    return issues;
  }
};
