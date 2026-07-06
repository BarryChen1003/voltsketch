/**
 * pcb-refboards.js — 開源硬體公版參考庫（block 級樓層平面 + 亮點電路 + 原始碼連結）
 * 用途：PCB Layout「開源公版」分頁載入起手板（板框/層數/主要元件方塊）供編輯或疊加比較。
 * 誠實界定：blocks 為「概略樓層方塊」教學用途，非原廠精確座標；真實幾何在各 github 連結。
 * 座標系：x,y 單位 mm，以板中心為原點（與 pcbApp 一致）。
 */
window.PCB_REFBOARDS = [
  {
    id: 'rp2040-pico30', name: 'Olimex RP2040-PICO30', soc: 'RP2040 (Cortex-M0+)', layers: 2, w: 52, h: 21,
    level: '入門', github: 'https://github.com/OLIMEX/RP2040-PICO30/tree/main/HARDWARE',
    circuits: ['MCU 最小系統：12MHz 晶振 + QSPI Flash + RT6150 buck-boost', 'USB-C 供電/資料', '3.3V 由 buck-boost（輸入可高於或低於電池）'],
    note: 'MCU 入門首選：晶振負載電容、去耦、USB 差動、buck-boost 供電一次到位。',
    blocks: [
      { label: 'U1 RP2040', x: 0, y: 0 }, { label: 'U2 Flash', x: -14, y: 0 }, { label: 'Y1 12M', x: -14, y: 6 },
      { label: 'U3 Buck', x: 14, y: 0 }, { label: 'J1 USB-C', x: 22, y: 0 }, { label: 'LED', x: 14, y: -6 }
    ]
  },
  {
    id: 'arduino-uno-r3', name: 'Arduino Uno R3 (from scratch)', soc: 'ATmega328P (AVR)', layers: 2, w: 68, h: 53,
    level: '教學', github: 'https://github.com/rheingoldheavy/arduino_uno_r3_from_scratch',
    circuits: ['ATmega328P 主控 + 16MHz 晶振', 'ATmega16U2 做 USB 轉序列', 'NCP1117 LDO 5V + 電源選擇（USB vs 桶插）'],
    note: '逐子系統從零建 Uno，教學寫法值得參考：電源選擇、USB-UART 橋、ISP。',
    blocks: [
      { label: 'U1 328P', x: 0, y: -5 }, { label: 'Y1 16M', x: -12, y: -5 }, { label: 'U2 16U2', x: -20, y: 12 },
      { label: 'U3 LDO', x: 18, y: 15 }, { label: 'J1 USB-B', x: -28, y: 20 }, { label: 'J2 Jack', x: 24, y: 20 },
      { label: 'HDR-D', x: 0, y: -22 }, { label: 'HDR-A', x: 0, y: 22 }
    ]
  },
  {
    id: 'esp32-poe2', name: 'Olimex ESP32-POE2', soc: 'ESP32 (Wi-Fi/BT)', layers: 4, w: 80, h: 28,
    level: '專題', github: 'https://github.com/OLIMEX/ESP32-POE2',
    circuits: ['ESP32 模組 + LAN8710 乙太 PHY + RJ45 帶隔離變壓', 'PoE 供電（802.3af，隔離 flyback）', 'PoE → 5V/3.3V 供電鏈'],
    note: '網通 + PoE 教材：乙太 PHY 佈局、RJ45 磁性、隔離返馳供電、共模抑制。',
    blocks: [
      { label: 'ESP32', x: -22, y: -3 }, { label: 'U2 PHY', x: 2, y: -3 }, { label: 'J1 RJ45', x: 30, y: 0 },
      { label: 'PoE Fly', x: -10, y: 9 }, { label: 'U3 Buck', x: 12, y: 9 }, { label: 'USB', x: -34, y: 8 }
    ]
  },
  {
    id: 'a20-lime', name: 'Olimex A20-OLinuXino-LIME', soc: 'Allwinner A20 (dual A7)', layers: 4, w: 84, h: 60,
    level: '中階 Linux', github: 'https://github.com/OLIMEX/OLINUXINO/tree/master/HARDWARE/A20-OLinuXino-LIME',
    circuits: ['A20 SoC + AXP209 PMIC（多軌 + 電池充電）', 'DDR3 x2（16-bit 各）', 'GbE PHY + HDMI + 2×USB + microSD'],
    note: '中階 Linux 板完整教材：PMIC 電源樹、DDR3 佈線、GbE/HDMI 高速。',
    blocks: [
      { label: 'A20', x: 0, y: 0 }, { label: 'AXP209', x: -22, y: 10 }, { label: 'DDR3-A', x: 16, y: -12 },
      { label: 'DDR3-B', x: 16, y: 12 }, { label: 'GbE', x: -28, y: -16 }, { label: 'HDMI', x: 28, y: -18 },
      { label: 'USB', x: 30, y: 14 }, { label: 'uSD', x: -30, y: 18 }
    ]
  },
  {
    id: 'imx233-maxi', name: 'Olimex iMX233-OLinuXino-Maxi', soc: 'i.MX233 (ARM926)', layers: 4, w: 100, h: 80,
    level: '中階 Linux', github: 'https://github.com/OLIMEX/OLINUXINO/tree/master/HARDWARE/iMX233-OLinuXino-Maxi',
    circuits: ['i.MX233（整合 PMU，省外部 PMIC）', 'mDDR 記憶體', 'USB Host + SD 卡 + 外接乙太'],
    note: 'SoC 內建 PMU 案例：對照有無獨立 PMIC 的電源設計差異。',
    blocks: [
      { label: 'iMX233', x: 0, y: 0 }, { label: 'mDDR', x: 20, y: 0 }, { label: 'USB', x: -30, y: -20 },
      { label: 'SD', x: -30, y: 20 }, { label: 'ETH', x: 30, y: -22 }, { label: 'PWR', x: 0, y: 28 }
    ]
  },
  {
    id: 'openrex-imx6', name: 'OpenRex i.MX6 (FEDEVEL)', soc: 'i.MX6 Quad (Cortex-A9)', layers: 8, w: 100, h: 70,
    level: '高階', github: 'https://www.imx6rex.com/open-rex/',
    circuits: ['i.MX6Q + PF0100 PMIC', 'DDR3 x4（64-bit）等長佈線示範', 'PCIe + HDMI + GbE + SATA 全高速'],
    note: '知名開源高階板，附設計指南：DDR3 fly-by/等長、8 層疊層、高速全家桶。',
    blocks: [
      { label: 'iMX6Q', x: 0, y: 0 }, { label: 'PF0100', x: -24, y: 12 }, { label: 'DDR3-1', x: 18, y: -16 },
      { label: 'DDR3-2', x: 30, y: -16 }, { label: 'DDR3-3', x: 18, y: 16 }, { label: 'DDR3-4', x: 30, y: 16 },
      { label: 'PCIe', x: -30, y: -18 }, { label: 'HDMI', x: -34, y: 4 }, { label: 'GbE', x: -30, y: 20 }, { label: 'SATA', x: 34, y: 0 }
    ]
  },
  {
    id: 'imx8mp-som', name: 'Olimex iMX8MP-SOM', soc: 'i.MX8M Plus (quad A53 + NPU)', layers: 8, w: 40, h: 60,
    level: '高階 SoM', github: 'https://github.com/OLIMEX/iMX8MP-SOM/tree/main',
    circuits: ['i.MX8M Plus + PCA9450 PMIC（NXP 專用 SoC 電源）', 'LPDDR4 + eMMC', 'SoM 板對板連接器接出（載板負責 IO）'],
    note: 'AI 伺服器縮小版：現代 SoC+專用 PMIC+LPDDR4，SoM/載板分工的高密度電源與時序。',
    blocks: [
      { label: 'iMX8MP', x: 0, y: 0 }, { label: 'PCA9450', x: 0, y: 16 }, { label: 'LPDDR4', x: 0, y: -14 },
      { label: 'eMMC', x: -12, y: 10 }, { label: 'B2B-L', x: -16, y: -8 }, { label: 'B2B-R', x: 16, y: -8 }
    ]
  },
  {
    id: 'librevna', name: 'LibreVNA (開源向量網路分析儀)', soc: 'FPGA + MAX2871 合成器', layers: 4, w: 100, h: 60,
    level: '儀器', github: 'https://github.com/jankae/LibreVNA',
    circuits: ['MAX2871 PLL 合成器 ×2（源 + 本振）+ Si5351 參考時鐘', 'RF 混頻器 + ADC 做 S 參數量測', 'FPGA 做 DSP + USB 傳輸'],
    note: '對應你儀器實驗台的虛擬 VNA——這是它的真實硬體：合成器/混頻/校準的實作。',
    blocks: [
      { label: 'FPGA', x: 0, y: 0 }, { label: 'Synth1', x: -24, y: -12 }, { label: 'Synth2', x: -24, y: 12 },
      { label: 'Si5351', x: -34, y: 0 }, { label: 'Mixer', x: 20, y: -12 }, { label: 'ADC', x: 20, y: 12 }, { label: 'USB', x: 36, y: 0 }
    ]
  }
];
