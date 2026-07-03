// Circuit Animation Module
const CircuitAnimation = {
  animations: {
    'current-flow': {
      name: '電流流動',
      description: '顯示電流在電路中的流動方向',
      create: (container, options = {}) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 300 150');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '150');

        // Circuit path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M50,75 L150,75 L150,30 L250,30 L250,75 L250,120 L150,120 L150,75');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#3498db');
        path.setAttribute('stroke-width', '3');
        svg.appendChild(path);

        // Current particles
        for (let i = 0; i < 5; i++) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('r', '5');
          circle.setAttribute('fill', '#e74c3c');
          
          const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
          animateMotion.setAttribute('dur', `${2 + i * 0.3}s`);
          animateMotion.setAttribute('repeatCount', 'indefinite');
          animateMotion.setAttribute('path', 'M50,75 L150,75 L150,30 L250,30 L250,75 L250,120 L150,120 L150,75');
          animateMotion.setAttribute('begin', `${i * 0.4}s`);
          
          circle.appendChild(animateMotion);
          svg.appendChild(circle);
        }

        // Labels
        const labels = [
          { x: 50, y: 95, text: 'V+' },
          { x: 150, y: 20, text: 'R1' },
          { x: 250, y: 20, text: 'R2' },
          { x: 150, y: 140, text: 'GND' }
        ];

        labels.forEach(label => {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', label.x);
          text.setAttribute('y', label.y);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-size', '12');
          text.setAttribute('fill', '#2c3e50');
          text.textContent = label.text;
          svg.appendChild(text);
        });

        container.appendChild(svg);
        return svg;
      }
    },
    'voltage-drop': {
      name: '電壓降',
      description: '顯示電阻上的電壓降',
      create: (container, options = {}) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 300 150');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '150');

        // Battery
        const battery = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        battery.innerHTML = `
          <rect x="20" y="50" width="30" height="50" fill="none" stroke="#2c3e50" stroke-width="2"/>
          <line x1="35" y1="45" x2="35" y2="55" stroke="#2c3e50" stroke-width="3"/>
          <line x1="30" y1="60" x2="40" y2="60" stroke="#2c3e50" stroke-width="2"/>
          <text x="35" y="115" text-anchor="middle" font-size="10">9V</text>
        `;
        svg.appendChild(battery);

        // Resistor 1
        const r1 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        r1.innerHTML = `
          <rect x="100" y="60" width="60" height="30" fill="none" stroke="#e74c3c" stroke-width="2"/>
          <text x="130" y="55" text-anchor="middle" font-size="10">1kΩ</text>
          <text x="130" y="105" text-anchor="middle" font-size="10" fill="#e74c3c">6V</text>
        `;
        svg.appendChild(r1);

        // Resistor 2
        const r2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        r2.innerHTML = `
          <rect x="200" y="60" width="60" height="30" fill="none" stroke="#3498db" stroke-width="2"/>
          <text x="230" y="55" text-anchor="middle" font-size="10">2kΩ</text>
          <text x="230" y="105" text-anchor="middle" font-size="10" fill="#3498db">3V</text>
        `;
        svg.appendChild(r2);

        // Wires
        const wires = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wires.innerHTML = `
          <line x1="50" y1="75" x2="100" y2="75" stroke="#2c3e50" stroke-width="2"/>
          <line x1="160" y1="75" x2="200" y2="75" stroke="#2c3e50" stroke-width="2"/>
          <line x1="260" y1="75" x2="280" y2="75" stroke="#2c3e50" stroke-width="2"/>
          <line x1="280" y1="75" x2="280" y2="130" stroke="#2c3e50" stroke-width="2"/>
          <line x1="280" y1="130" x2="20" y2="130" stroke="#2c3e50" stroke-width="2"/>
          <line x1="20" y1="130" x2="20" y2="100" stroke="#2c3e50" stroke-width="2"/>
        `;
        svg.appendChild(wires);

        // Voltage bar
        const voltageBar = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        voltageBar.innerHTML = `
          <rect x="80" y="120" width="100" height="10" fill="#e74c3c" opacity="0.3"/>
          <rect x="180" y="120" width="80" height="10" fill="#3498db" opacity="0.3"/>
          <text x="130" y="145" text-anchor="middle" font-size="8">V1 = 6V</text>
          <text x="220" y="145" text-anchor="middle" font-size="8">V2 = 3V</text>
        `;
        svg.appendChild(voltageBar);

        container.appendChild(svg);
        return svg;
      }
    },
    'capacitor-charging': {
      name: '電容器充電',
      description: '顯示電容器充電過程',
      create: (container, options = {}) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 300 150');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '150');

        // Circuit
        svg.innerHTML = `
          <line x1="30" y1="75" x2="80" y2="75" stroke="#2c3e50" stroke-width="2"/>
          <rect x="80" y="60" width="40" height="30" fill="none" stroke="#e74c3c" stroke-width="2"/>
          <text x="100" y="55" text-anchor="middle" font-size="10">R</text>
          <line x1="120" y1="75" x2="160" y2="75" stroke="#2c3e50" stroke-width="2"/>
          <line x1="160" y1="55" x2="160" y2="95" stroke="#2c3e50" stroke-width="3"/>
          <line x1="170" y1="55" x2="170" y2="95" stroke="#2c3e50" stroke-width="3"/>
          <text x="165" y="50" text-anchor="middle" font-size="10">C</text>
          <line x1="170" y1="75" x2="220" y2="75" stroke="#2c3e50" stroke-width="2"/>
          <text x="30" y="70" font-size="10">V+</text>
          <text x="220" y="70" font-size="10">GND</text>
          <line x1="220" y1="75" x2="220" y2="130" stroke="#2c3e50" stroke-width="2"/>
          <line x1="220" y1="130" x2="30" y2="130" stroke="#2c3e50" stroke-width="2"/>
          <line x1="30" y1="130" x2="30" y2="75" stroke="#2c3e50" stroke-width="2"/>
        `;

        // Charging animation
        const chargeBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        chargeBar.setAttribute('x', '160');
        chargeBar.setAttribute('y', '95');
        chargeBar.setAttribute('width', '10');
        chargeBar.setAttribute('height', '0');
        chargeBar.setAttribute('fill', '#3498db');
        
        const animHeight = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animHeight.setAttribute('attributeName', 'height');
        animHeight.setAttribute('from', '0');
        animHeight.setAttribute('to', '40');
        animHeight.setAttribute('dur', '3s');
        animHeight.setAttribute('repeatCount', 'indefinite');
        animHeight.setAttribute('fill', 'freeze');
        
        const animY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animY.setAttribute('attributeName', 'y');
        animY.setAttribute('from', '95');
        animY.setAttribute('to', '55');
        animY.setAttribute('dur', '3s');
        animY.setAttribute('repeatCount', 'indefinite');
        animY.setAttribute('fill', 'freeze');
        
        chargeBar.appendChild(animHeight);
        chargeBar.appendChild(animY);
        svg.appendChild(chargeBar);

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '165');
        label.setAttribute('y', '145');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10');
        label.textContent = '充電中...';
        svg.appendChild(label);

        container.appendChild(svg);
        return svg;
      }
    },
    'inductor-flyback': {
      name: '電感反衝',
      description: '顯示電感反衝現象',
      create: (container, options = {}) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 300 150');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '150');

        svg.innerHTML = `
          <line x1="30" y1="50" x2="80" y2="50" stroke="#2c3e50" stroke-width="2"/>
          <rect x="80" y="35" width="60" height="30" fill="none" stroke="#e74c3c" stroke-width="2"/>
          <text x="110" y="30" text-anchor="middle" font-size="10">L</text>
          <line x1="140" y1="50" x2="180" y2="50" stroke="#2c3e50" stroke-width="2"/>
          <line x1="180" y1="50" x2="180" y2="80" stroke="#2c3e50" stroke-width="2"/>
          <line x1="180" y1="80" x2="220" y2="80" stroke="#2c3e50" stroke-width="2"/>
          <rect x="220" y="65" width="40" height="30" fill="none" stroke="#3498db" stroke-width="2"/>
          <text x="240" y="60" text-anchor="middle" font-size="10">D</text>
          <line x1="260" y1="80" x2="280" y2="80" stroke="#2c3e50" stroke-width="2"/>
          <line x1="280" y1="80" x2="280" y2="130" stroke="#2c3e50" stroke-width="2"/>
          <line x1="280" y1="130" x2="30" y2="130" stroke="#2c3e50" stroke-width="2"/>
          <line x1="30" y1="130" x2="30" y2="50" stroke="#2c3e50" stroke-width="2"/>
          <text x="30" y="45" font-size="10">V+</text>
          <text x="240" y="110" text-anchor="middle" font-size="10">Load</text>
        `;

        // Flyback voltage spike
        const spike = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        spike.setAttribute('d', 'M140,50 L150,50 L155,20 L160,80 L165,30 L170,50 L180,50');
        spike.setAttribute('fill', 'none');
        spike.setAttribute('stroke', '#f39c12');
        spike.setAttribute('stroke-width', '2');
        spike.setAttribute('stroke-dasharray', '5,3');
        
        const animOpacity = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animOpacity.setAttribute('attributeName', 'opacity');
        animOpacity.setAttribute('values', '0;1;0');
        animOpacity.setAttribute('dur', '2s');
        animOpacity.setAttribute('repeatCount', 'indefinite');
        
        spike.appendChild(animOpacity);
        svg.appendChild(spike);

        // Label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', '155');
        label.setAttribute('y', '15');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '10');
        label.setAttribute('fill', '#f39c12');
        label.textContent = '反衝電壓';
        svg.appendChild(label);

        container.appendChild(svg);
        return svg;
      }
    },
    'differential-pair': {
      name: '差分對訊號',
      description: '顯示差分對的訊號傳輸',
      create: (container, options = {}) => {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 300 150');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '150');

        svg.innerHTML = `
          <line x1="30" y1="50" x2="270" y2="50" stroke="#e74c3c" stroke-width="2"/>
          <line x1="30" y1="100" x2="270" y2="100" stroke="#3498db" stroke-width="2"/>
          <text x="15" y="55" font-size="10" fill="#e74c3c">D+</text>
          <text x="15" y="105" font-size="10" fill="#3498db">D-</text>
          <text x="150" y="40" text-anchor="middle" font-size="10">差分訊號</text>
        `;

        // Signal waves
        const wave1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wave1.setAttribute('d', 'M30,50 Q60,30 90,50 Q120,70 150,50 Q180,30 210,50 Q240,70 270,50');
        wave1.setAttribute('fill', 'none');
        wave1.setAttribute('stroke', '#e74c3c');
        wave1.setAttribute('stroke-width', '2');
        
        const anim1 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim1.setAttribute('attributeName', 'd');
        anim1.setAttribute('values', 
          'M30,50 Q60,30 90,50 Q120,70 150,50 Q180,30 210,50 Q240,70 270,50;' +
          'M30,50 Q60,70 90,50 Q120,30 150,50 Q180,70 210,50 Q240,30 270,50;' +
          'M30,50 Q60,30 90,50 Q120,70 150,50 Q180,30 210,50 Q240,70 270,50');
        anim1.setAttribute('dur', '2s');
        anim1.setAttribute('repeatCount', 'indefinite');
        
        wave1.appendChild(anim1);
        svg.appendChild(wave1);

        const wave2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        wave2.setAttribute('d', 'M30,100 Q60,80 90,100 Q120,120 150,100 Q180,80 210,100 Q240,120 270,100');
        wave2.setAttribute('fill', 'none');
        wave2.setAttribute('stroke', '#3498db');
        wave2.setAttribute('stroke-width', '2');
        
        const anim2 = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        anim2.setAttribute('attributeName', 'd');
        anim2.setAttribute('values', 
          'M30,100 Q60,80 90,100 Q120,120 150,100 Q180,80 210,100 Q240,120 270,100;' +
          'M30,100 Q60,120 90,100 Q120,80 150,100 Q180,120 210,100 Q240,80 270,100;' +
          'M30,100 Q60,80 90,100 Q120,120 150,100 Q180,80 210,100 Q240,120 270,100');
        anim2.setAttribute('dur', '2s');
        anim2.setAttribute('repeatCount', 'indefinite');
        
        wave2.appendChild(anim2);
        svg.appendChild(wave2);

        container.appendChild(svg);
        return svg;
      }
    },

    'level-shift': {
      name: 'Level Shift 轉換',
      description: '3.3V 與 5V 域之間的雙向電平轉換',
      create: (container) => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 300 160');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '160');
        svg.innerHTML = `
          <text x="60" y="18" text-anchor="middle" font-size="11" fill="#1f4fd1">3.3V 域</text>
          <text x="240" y="18" text-anchor="middle" font-size="11" fill="#dc2626">5V 域</text>
          <!-- 低壓側方波 -->
          <line x1="20" y1="60" x2="120" y2="60" stroke="#cbd5e1" stroke-width="1"/>
          <polyline points="20,90 50,90 50,60 90,60 90,90 120,90" fill="none" stroke="#1f4fd1" stroke-width="2"/>
          <!-- MOSFET 中介 -->
          <rect x="135" y="55" width="30" height="40" fill="#fff" stroke="#475569" stroke-width="1.5"/>
          <text x="150" y="78" text-anchor="middle" font-size="8">BSS138</text>
          <!-- 高壓側方波（較高振幅） -->
          <line x1="180" y1="50" x2="280" y2="50" stroke="#fca5a5" stroke-width="1"/>
          <polyline points="180,95 210,95 210,50 250,50 250,95 280,95" fill="none" stroke="#dc2626" stroke-width="2"/>
          <text x="150" y="120" text-anchor="middle" font-size="10" fill="#64748b">VGS 導通 → 雙向傳遞</text>
        `;
        // 沿低壓→高壓移動的訊號點
        ['#1f4fd1', '#dc2626'].forEach((col, i) => {
          const c = document.createElementNS(ns, 'circle');
          c.setAttribute('r', '4'); c.setAttribute('fill', col);
          const m = document.createElementNS(ns, 'animateMotion');
          m.setAttribute('dur', '2.5s'); m.setAttribute('repeatCount', 'indefinite');
          m.setAttribute('path', i === 0 ? 'M20,90 L50,90 L50,60 L90,60 L90,90 L120,90 L150,75'
                                          : 'M150,75 L180,95 L210,95 L210,50 L250,50 L250,95 L280,95');
          m.setAttribute('begin', i === 0 ? '0s' : '1.25s');
          c.appendChild(m); svg.appendChild(c);
        });
        container.appendChild(svg);
        return svg;
      }
    },

    'ldo-regulate': {
      name: 'LDO 穩壓',
      description: '輸入漣波被穩壓為平整輸出',
      create: (container) => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 300 150'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '150');
        svg.innerHTML = `
          <text x="50" y="20" font-size="10" fill="#64748b">Vin（含漣波）</text>
          <path d="M20,50 Q35,40 50,50 Q65,60 80,50 Q95,40 110,50 Q125,60 140,50" fill="none" stroke="#dc2626" stroke-width="2"/>
          <rect x="150" y="35" width="50" height="40" fill="#fff" stroke="#1f4fd1" stroke-width="2"/>
          <text x="175" y="59" text-anchor="middle" font-size="10" fill="#1f4fd1">LDO</text>
          <text x="210" y="20" font-size="10" fill="#64748b">Vout（平整）</text>
          <line x1="210" y1="50" x2="285" y2="50" stroke="#16a34a" stroke-width="2.5"/>
          <line x1="20" y1="120" x2="285" y2="120" stroke="#cbd5e1" stroke-width="1"/>
        `;
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('r', '4'); c.setAttribute('fill', '#16a34a');
        const m = document.createElementNS(ns, 'animateMotion');
        m.setAttribute('dur', '2s'); m.setAttribute('repeatCount', 'indefinite');
        m.setAttribute('path', 'M210,50 L285,50');
        c.appendChild(m); svg.appendChild(c);
        container.appendChild(svg);
        return svg;
      }
    },

    'switching-reg': {
      name: '切換式調節（Buck/Boost）',
      description: '開關節點方波經電感/電容平滑為直流',
      create: (container) => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 300 150'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '150');
        svg.innerHTML = `
          <text x="60" y="22" text-anchor="middle" font-size="10" fill="#64748b">SW 節點（PWM）</text>
          <polyline points="20,80 20,45 50,45 50,80 80,80 80,45 110,45 110,80 140,80 140,45 160,45"
            fill="none" stroke="#f59e0b" stroke-width="2"/>
          <path d="M170,62 Q180,55 195,62 L260,62" fill="none" stroke="#7c3aed" stroke-width="2"/>
          <text x="225" y="50" text-anchor="middle" font-size="10" fill="#64748b">L+C 平滑</text>
          <line x1="195" y1="62" x2="285" y2="62" stroke="#16a34a" stroke-width="2.5"/>
        `;
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('r', '4'); c.setAttribute('fill', '#f59e0b');
        const m = document.createElementNS(ns, 'animateMotion');
        m.setAttribute('dur', '1.8s'); m.setAttribute('repeatCount', 'indefinite');
        m.setAttribute('path', 'M20,80 L20,45 L50,45 L50,80 L80,80 L80,45 L110,45 L110,80 L140,80 L140,45 L160,45');
        c.appendChild(m); svg.appendChild(c);
        container.appendChild(svg);
        return svg;
      }
    },

    'mosfet-switch': {
      name: 'MOSFET 開關',
      description: '閘極脈衝控制負載通斷',
      create: (container) => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 300 150'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '150');
        svg.innerHTML = `
          <text x="40" y="30" font-size="10" fill="#64748b">Gate</text>
          <polyline points="20,55 60,55 60,40 110,40 110,55 150,55" fill="none" stroke="#1f4fd1" stroke-width="2"/>
          <line x1="170" y1="40" x2="170" y2="110" stroke="#1f4fd1" stroke-width="2.5"/>
          <line x1="160" y1="55" x2="160" y2="95" stroke="#1f4fd1" stroke-width="2.5"/>
          <text x="200" y="60" font-size="10" fill="#64748b">負載 (LED)</text>
          <circle cx="240" cy="80" r="14" fill="#fef9c3" stroke="#ca8a04" stroke-width="2">
            <animate attributeName="fill" values="#fef9c3;#fde047;#fef9c3" dur="1.6s" repeatCount="indefinite"/>
          </circle>
        `;
        container.appendChild(svg);
        return svg;
      }
    },

    'opamp-amp': {
      name: '運放放大',
      description: '小訊號輸入被放大輸出',
      create: (container) => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 300 150'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '150');
        svg.innerHTML = `
          <path d="M20,75 Q35,67 50,75 Q65,83 80,75 Q95,67 110,75" fill="none" stroke="#1f4fd1" stroke-width="2"/>
          <polygon points="130,45 130,105 190,75" fill="#fff" stroke="#1f4fd1" stroke-width="2"/>
          <text x="150" y="79" font-size="12" fill="#1f4fd1">+</text>
          <path d="M200,75 Q215,45 230,75 Q245,105 260,75" fill="none" stroke="#16a34a" stroke-width="2">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite"/>
          </path>
          <text x="60" y="115" text-anchor="middle" font-size="9" fill="#64748b">Vin</text>
          <text x="230" y="125" text-anchor="middle" font-size="9" fill="#64748b">Vout (×Gain)</text>
        `;
        container.appendChild(svg);
        return svg;
      }
    },

    'esd-clamp': {
      name: 'ESD/突波箝位',
      description: 'TVS 將電壓突波箝位至安全電平',
      create: (container) => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 300 150'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '150');
        svg.innerHTML = `
          <line x1="20" y1="100" x2="280" y2="100" stroke="#cbd5e1" stroke-width="1"/>
          <line x1="20" y1="60" x2="280" y2="60" stroke="#16a34a" stroke-width="1" stroke-dasharray="4,3"/>
          <text x="284" y="63" font-size="8" fill="#16a34a">箝位</text>
          <path d="M20,100 L120,100 L130,15 L140,100 L280,100" fill="none" stroke="#dc2626" stroke-width="2">
            <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite"/>
          </path>
          <path d="M20,100 L120,100 L130,60 L140,60 L150,100 L280,100" fill="none" stroke="#16a34a" stroke-width="2.5"/>
          <text x="150" y="135" text-anchor="middle" font-size="9" fill="#64748b">突波 → TVS 箝位</text>
        `;
        container.appendChild(svg);
        return svg;
      }
    },

    'i2c-bus': {
      name: 'I2C 匯流排',
      description: 'SDA/SCL 開汲極 + 上拉，資料時序',
      create: (container) => {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 300 150'); svg.setAttribute('width', '100%'); svg.setAttribute('height', '150');
        svg.innerHTML = `
          <text x="10" y="50" font-size="10" fill="#1f4fd1">SCL</text>
          <polyline points="40,55 60,55 60,35 80,35 80,55 100,55 100,35 120,35 120,55 140,35 140,55 160,35 160,55 280,55"
            fill="none" stroke="#1f4fd1" stroke-width="2"/>
          <text x="10" y="105" font-size="10" fill="#dc2626">SDA</text>
          <polyline points="40,110 70,110 70,90 130,90 130,110 190,110 190,90 250,90 250,110 280,110"
            fill="none" stroke="#dc2626" stroke-width="2"/>
          <text x="150" y="138" text-anchor="middle" font-size="9" fill="#64748b">START → 位址 → 資料 → ACK</text>
        `;
        container.appendChild(svg);
        return svg;
      }
    }
  },

  // 主題 → 動畫對應（避免顯示無關動畫）
  topicAnimationMap: {
    'level-shift': 'level-shift',
    'ldo-regulator': 'ldo-regulate', 'ldo-noise': 'ldo-regulate', 'ldo-selection': 'ldo-regulate',
    'buck-converter': 'switching-reg', 'buck-converter-advanced': 'switching-reg',
    'boost-converter': 'switching-reg', 'buck-boost-converter': 'switching-reg',
    'mosfet-switching': 'mosfet-switch',
    'i2c-communication': 'i2c-bus',
    'op-amp-basics': 'opamp-amp', 'opamp-configurations': 'opamp-amp', 'current-sensing': 'opamp-amp',
    'esd-protection': 'esd-clamp', 'tvd-selection': 'esd-clamp', 'reverse-polarity': 'esd-clamp',
    'automotive-transient': 'esd-clamp',
    'decoupling-capacitor': 'capacitor-charging',
    'differential-pair': 'differential-pair', 'impedance-matching': 'differential-pair',
    'usb-design': 'differential-pair',
    'flyback-converter': 'switching-reg', 'half-bridge': 'mosfet-switch', 'gate-driver': 'mosfet-switch',
    'comparator-hysteresis': 'opamp-amp', 'tl431-reference': 'ldo-regulate',
    'rc-lowpass': 'capacitor-charging',
    'ntc-thermistor': 'voltage-drop', 'hot-swap': 'mosfet-switch', 'optocoupler-feedback': 'level-shift',
    'charge-pump': 'capacitor-charging',
    'h-bridge-motor': 'mosfet-switch', 'load-switch': 'mosfet-switch',
    'forward-converter': 'switching-reg', 'can-transceiver': 'differential-pair',
    'rs485-transceiver': 'differential-pair', 'relay-driver': 'mosfet-switch',
    'bjt-switch': 'mosfet-switch',
    'push-pull-converter': 'switching-reg', 'full-bridge-converter': 'switching-reg',
    'pwm-control': 'switching-reg', 'ddr-termination': 'differential-pair',
    'zener-regulator': 'ldo-regulate', 'photodiode-tia': 'opamp-amp'
  },

  categoryAnimationMap: {
    'power-management': 'ldo-regulate',
    'signal-processing': 'level-shift',
    'high-speed': 'differential-pair',
    'communication': 'i2c-bus',
    'transistor': 'mosfet-switch',
    'protection': 'esd-clamp',
    'analog': 'opamp-amp',
    'emi-emc': 'inductor-flyback'
  },

  // 取得最相關的動畫 id
  getAnimationFor(topicId, category) {
    return this.topicAnimationMap[topicId]
      || this.categoryAnimationMap[category]
      || 'current-flow';
  },

  // Get available animations
  getAnimations() {
    return Object.entries(this.animations).map(([id, anim]) => ({
      id,
      name: anim.name,
      description: anim.description
    }));
  },

  // Create animation in container
  createAnimation(containerId, animationId, options = {}) {
    const container = document.querySelector(containerId);
    if (!container) return null;

    const animation = this.animations[animationId];
    if (!animation) return null;

    container.innerHTML = '';
    return animation.create(container, options);
  },

  // Add animation selector to knowledge detail
  addAnimationSelector(container, knowledgeId) {
    const animations = this.getAnimations();
    if (animations.length === 0) return;

    const selector = document.createElement('div');
    selector.className = 'animation-selector';
    selector.innerHTML = `
      <h4>電路動畫</h4>
      <select class="animation-select">
        <option value="">選擇動畫...</option>
        ${animations.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
      </select>
      <div class="animation-container" style="margin-top: 12px; border: 1px solid var(--line); border-radius: var(--radius); padding: 12px; min-height: 180px;"></div>
    `;

    container.appendChild(selector);

    // Bind animation selection
    const select = selector.querySelector('.animation-select');
    const animContainer = selector.querySelector('.animation-container');

    select.addEventListener('change', (e) => {
      if (e.target.value) {
        this.createAnimation(null, e.target.value);
        animContainer.innerHTML = '';
        const animation = this.animations[e.target.value];
        if (animation) {
          animation.create(animContainer);
        }
      } else {
        animContainer.innerHTML = '<p style="color: var(--muted); text-align: center;">選擇一個動畫查看效果</p>';
      }
    });
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CircuitAnimation;
}
