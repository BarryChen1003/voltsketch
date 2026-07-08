/**
 * pcb-refboards.js — 開源硬體公版參考庫（教學重建版佈局 + 亮點電路 + 原始碼連結）
 * 用途：PCB Layout「開源公版」分頁載入起手板（板框/層數/料件/代表性走線/via）供編輯或疊加比較。
 * 誠實界定：components/traces 為「教學重建版」——依公板文件與照片近似重建主要 BOM 與代表性走線，
 * 非原廠精確座標/完整 netlist；真實幾何在各 github 連結。
 * 座標系：x,y 單位 mm，以板中心為原點（與 pcbApp 一致）。
 * schema v2：components[{ref,part,x,y,w,h,side:'top'|'bottom',kind:'ic'|'passive'|'conn'|'mech'}]
 *            traces[{x1,y1,x2,y2,layer,width,net}]  vias[{x,y,net}]
 */
window.PCB_REFBOARDS = [
  {
    "id": "rp2040-pico30",
    "name": "Olimex RP2040-PICO30",
    "soc": "RP2040 (Cortex-M0+)",
    "layers": 4,
    "w": 52,
    "h": 21,
    "level": "入門",
    "github": "https://github.com/OLIMEX/RP2040-PICO30/tree/main/HARDWARE",
    "circuits": [
      "MCU 最小系統：12MHz 晶振 + QSPI Flash + RT6150 buck-boost",
      "USB-C 供電/資料",
      "3.3V 由 buck-boost（輸入可高於或低於電池）"
    ],
    "note": "MCU 入門首選：晶振負載電容、去耦、USB 差動、buck-boost 供電一次到位。",
    "components": [
      {
        "ref": "U1",
        "part": "RP2040",
        "x": 0,
        "y": 0,
        "w": 7,
        "h": 7,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "W25Q16 QSPI Flash",
        "x": -13,
        "y": 0,
        "w": 5,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U3",
        "part": "RT6150B-33",
        "x": 14,
        "y": -2,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "L1",
        "part": "4.7µH",
        "x": 14,
        "y": 3,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "Y1",
        "part": "12MHz",
        "x": -7,
        "y": 6,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C1",
        "part": "15pF",
        "x": -9.5,
        "y": 3.8,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "15pF",
        "x": -5,
        "y": 3.8,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C3",
        "part": "100nF",
        "x": -4.8,
        "y": -2,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C4",
        "part": "100nF",
        "x": -4.8,
        "y": 2,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C5",
        "part": "100nF",
        "x": 4.8,
        "y": -2,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C6",
        "part": "100nF",
        "x": 4.8,
        "y": 2,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C7",
        "part": "100nF",
        "x": 0,
        "y": -4.8,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C8",
        "part": "1µF",
        "x": 0,
        "y": 4.8,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C9",
        "part": "10µF",
        "x": 10.5,
        "y": -5,
        "w": 1.6,
        "h": 0.8,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C10",
        "part": "10µF",
        "x": 17.5,
        "y": -5,
        "w": 1.6,
        "h": 0.8,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C11",
        "part": "1µF",
        "x": -13,
        "y": -3.5,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "1kΩ (LED)",
        "x": 7,
        "y": -7,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "LED1",
        "part": "綠 0805",
        "x": 10,
        "y": -7,
        "w": 2,
        "h": 1.2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "R2",
        "part": "5.1kΩ (CC1)",
        "x": 18,
        "y": 5,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "R3",
        "part": "5.1kΩ (CC2)",
        "x": 20.5,
        "y": 5,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "R4",
        "part": "10kΩ (CS 上拉)",
        "x": -16.5,
        "y": 3.5,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "J1",
        "part": "USB-C 16P",
        "x": 21.5,
        "y": 0,
        "w": 8,
        "h": 7,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW1",
        "part": "BOOTSEL",
        "x": -19,
        "y": -5,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR1",
        "part": "GPIO 上排 (castellated)",
        "x": 0,
        "y": -9.7,
        "w": 46,
        "h": 1.4,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR2",
        "part": "GPIO 下排 (castellated)",
        "x": 0,
        "y": 9.7,
        "w": 46,
        "h": 1.4,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "TP1",
        "part": "SWDIO",
        "x": -22,
        "y": 7,
        "w": 1.5,
        "h": 1.5,
        "side": "bottom",
        "kind": "mech"
      },
      {
        "ref": "TP2",
        "part": "SWCLK",
        "x": -19.5,
        "y": 7,
        "w": 1.5,
        "h": 1.5,
        "side": "bottom",
        "kind": "mech"
      },
      {
        "ref": "TP3",
        "part": "GND",
        "x": -17,
        "y": 7,
        "w": 1.5,
        "h": 1.5,
        "side": "bottom",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": 21.5,
        "y1": -1,
        "x2": 17,
        "y2": -1,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VBUS"
      },
      {
        "x1": 17,
        "y1": -1,
        "x2": 15.5,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VBUS"
      },
      {
        "x1": 12.5,
        "y1": -2.8,
        "x2": 4,
        "y2": -2.8,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "3V3"
      },
      {
        "x1": 4,
        "y1": -2.8,
        "x2": 4,
        "y2": -1.5,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "3V3"
      },
      {
        "x1": 4,
        "y1": -2.8,
        "x2": -11,
        "y2": -2.8,
        "layer": "F.Cu",
        "width": 0.4,
        "net": "3V3"
      },
      {
        "x1": -11,
        "y1": -2.8,
        "x2": -11,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.4,
        "net": "3V3"
      },
      {
        "x1": 17.5,
        "y1": 1,
        "x2": 3.5,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DP"
      },
      {
        "x1": 17.5,
        "y1": 2.2,
        "x2": 3.5,
        "y2": 2.2,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DM"
      },
      {
        "x1": -10.5,
        "y1": -1.5,
        "x2": -3.5,
        "y2": -1.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "x1": -10.5,
        "y1": -0.5,
        "x2": -3.5,
        "y2": -0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD1"
      },
      {
        "x1": -10.5,
        "y1": 0.5,
        "x2": -3.5,
        "y2": 0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SCLK"
      },
      {
        "x1": -10.5,
        "y1": 1.5,
        "x2": -3.5,
        "y2": 1.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_CS"
      },
      {
        "x1": -7,
        "y1": 4.7,
        "x2": -7,
        "y2": 3.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "x1": -7,
        "y1": 3.6,
        "x2": -3.5,
        "y2": 3.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "x1": -5.5,
        "y1": 4.7,
        "x2": -3,
        "y2": 4.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "x1": -3,
        "y1": 4.7,
        "x2": -3,
        "y2": 2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "x1": -3,
        "y1": 2.6,
        "x2": -3.5,
        "y2": 2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "x1": 3.5,
        "y1": -7,
        "x2": 6,
        "y2": -7,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "GPIO25"
      },
      {
        "x1": 8,
        "y1": -7,
        "x2": 9,
        "y2": -7,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LED_A"
      },
      {
        "x1": -19,
        "y1": -3.5,
        "x2": -19,
        "y2": 6,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "BOOTSEL"
      },
      {
        "x1": -19,
        "y1": 6,
        "x2": -13,
        "y2": 6,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "BOOTSEL"
      },
      {
        "x1": -24,
        "y1": 8.5,
        "x2": 24,
        "y2": 8.5,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -24,
        "y1": -8.5,
        "x2": 24,
        "y2": -8.5,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": 0,
        "y1": -8.5,
        "x2": 0,
        "y2": 8.5,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      }
    ],
    "vias": [
      {
        "x": -24,
        "y": 8.5,
        "net": "GND"
      },
      {
        "x": 24,
        "y": 8.5,
        "net": "GND"
      },
      {
        "x": -24,
        "y": -8.5,
        "net": "GND"
      },
      {
        "x": 24,
        "y": -8.5,
        "net": "GND"
      },
      {
        "x": 0,
        "y": -8.5,
        "net": "GND"
      },
      {
        "x": 0,
        "y": 8.5,
        "net": "GND"
      },
      {
        "x": 1,
        "y": 0,
        "net": "GND"
      },
      {
        "x": -1,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 0,
        "y": 1,
        "net": "GND"
      },
      {
        "x": 0,
        "y": -1,
        "net": "GND"
      },
      {
        "x": 11,
        "y": -7,
        "net": "GND"
      },
      {
        "x": 15.5,
        "y": -5,
        "net": "GND"
      },
      {
        "x": -19,
        "y": -3.5,
        "net": "BOOTSEL"
      }
    ]
  },
  {
    "id": "arduino-uno-r3",
    "name": "Arduino Uno R3 (from scratch)",
    "soc": "ATmega328P (AVR)",
    "layers": 2,
    "w": 68,
    "h": 53,
    "level": "教學",
    "github": "https://github.com/rheingoldheavy/arduino_uno_r3_from_scratch",
    "circuits": [
      "ATmega328P 主控 + 16MHz 晶振",
      "ATmega16U2 做 USB 轉序列",
      "NCP1117 LDO 5V + 電源選擇（USB vs 桶插）"
    ],
    "note": "逐子系統從零建 Uno，教學寫法值得參考：電源選擇、USB-UART 橋、ISP。",
    "components": [
      {
        "ref": "U1",
        "part": "ATmega328P-AU (TQFP32)",
        "x": 2,
        "y": -2,
        "w": 9,
        "h": 9,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "Y1",
        "part": "16MHz XTAL",
        "x": -9,
        "y": -8,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C1",
        "part": "22pF",
        "x": -11.5,
        "y": -8,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "22pF",
        "x": -6.5,
        "y": -8,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U2",
        "part": "ATmega16U2-MU (QFN32)",
        "x": -24,
        "y": 10,
        "w": 5,
        "h": 5,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "Y2",
        "part": "16MHz Resonator",
        "x": -24,
        "y": 4,
        "w": 3,
        "h": 2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U3",
        "part": "NCP1117ST50T3G 5V LDO",
        "x": 20,
        "y": 16,
        "w": 6.5,
        "h": 3.5,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "D1",
        "part": "SS14 (reverse-polarity)",
        "x": 14,
        "y": 16,
        "w": 3,
        "h": 1.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "J1",
        "part": "USB-B",
        "x": -28,
        "y": 18,
        "w": 8,
        "h": 7,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J2",
        "part": "DC Barrel Jack 2.1mm",
        "x": 27,
        "y": 20,
        "w": 9,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW1",
        "part": "Reset Tact SW",
        "x": 10,
        "y": -20,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "ICSP1",
        "part": "ICSP 6P (MCU)",
        "x": 6,
        "y": 8,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "ICSP2",
        "part": "ICSP 6P (USB)",
        "x": -19,
        "y": -2,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR1",
        "part": "Digital D0-D13 Header",
        "x": 0,
        "y": -24,
        "w": 48,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR2",
        "part": "Power Header",
        "x": -14,
        "y": 24,
        "w": 16,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR3",
        "part": "Analog A0-A5 Header",
        "x": 16,
        "y": 24,
        "w": 14,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "LED1",
        "part": "Power LED",
        "x": 0,
        "y": 14,
        "w": 2,
        "h": 1.2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "1k (Power LED)",
        "x": 0,
        "y": 17,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "LED2",
        "part": "TX LED",
        "x": 4,
        "y": 14,
        "w": 2,
        "h": 1.2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "LED3",
        "part": "RX LED",
        "x": 8,
        "y": 14,
        "w": 2,
        "h": 1.2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "R2",
        "part": "1k (TX LED)",
        "x": 4,
        "y": 17,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "R3",
        "part": "1k (RX LED)",
        "x": 8,
        "y": 17,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C3",
        "part": "100nF (U1 decouple)",
        "x": 5,
        "y": 2,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C4",
        "part": "100nF (U2 decouple)",
        "x": -20,
        "y": 8,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C5",
        "part": "10uF (LDO out)",
        "x": 24,
        "y": 13,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C6",
        "part": "10uF (LDO in)",
        "x": 17,
        "y": 13,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "R4",
        "part": "10k (reset pull-up)",
        "x": 10,
        "y": -17,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "MH1",
        "part": "M3 mount",
        "x": -30,
        "y": -23,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH2",
        "part": "M3 mount",
        "x": 30,
        "y": -23,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH3",
        "part": "M3 mount",
        "x": -30,
        "y": 23,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": 26,
        "y1": 20,
        "x2": 19.5,
        "y2": 20,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VIN"
      },
      {
        "x1": 19.5,
        "y1": 20,
        "x2": 19.5,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VIN"
      },
      {
        "x1": 19.5,
        "y1": 16,
        "x2": 16,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VIN"
      },
      {
        "x1": 12,
        "y1": 16,
        "x2": 5,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "5V"
      },
      {
        "x1": 5,
        "y1": 16,
        "x2": 5,
        "y2": 3,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "5V"
      },
      {
        "x1": 5,
        "y1": 3,
        "x2": 2,
        "y2": 3,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "5V"
      },
      {
        "x1": 18.5,
        "y1": 17,
        "x2": -14,
        "y2": 17,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "5V"
      },
      {
        "x1": -14,
        "y1": 17,
        "x2": -14,
        "y2": 23,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "5V"
      },
      {
        "x1": -28,
        "y1": 16,
        "x2": -25,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DP"
      },
      {
        "x1": -25,
        "y1": 16,
        "x2": -25,
        "y2": 12,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DP"
      },
      {
        "x1": -28,
        "y1": 17,
        "x2": -24,
        "y2": 17,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DM"
      },
      {
        "x1": -24,
        "y1": 17,
        "x2": -24,
        "y2": 12,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DM"
      },
      {
        "x1": -21.5,
        "y1": 8,
        "x2": -4,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "RXD"
      },
      {
        "x1": -21.5,
        "y1": 9,
        "x2": -4,
        "y2": 9,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "TXD"
      },
      {
        "x1": -9,
        "y1": -6.8,
        "x2": -9,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "x1": -9,
        "y1": -4,
        "x2": -2,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "x1": -6.5,
        "y1": -6.8,
        "x2": -6.5,
        "y2": -5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL2"
      },
      {
        "x1": -6.5,
        "y1": -5,
        "x2": -1.5,
        "y2": -5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL2"
      },
      {
        "x1": -1.5,
        "y1": -5,
        "x2": -1.5,
        "y2": -3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL2"
      },
      {
        "x1": -1.5,
        "y1": -3,
        "x2": -2,
        "y2": -3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL2"
      },
      {
        "x1": -2,
        "y1": -6.5,
        "x2": -2,
        "y2": -24,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "D2"
      },
      {
        "x1": 2,
        "y1": -6.5,
        "x2": 2,
        "y2": -24,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "D3"
      },
      {
        "x1": -32,
        "y1": -25,
        "x2": 32,
        "y2": -25,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -32,
        "y1": 25,
        "x2": 32,
        "y2": 25,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": 0,
        "y1": -25,
        "x2": 0,
        "y2": 25,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      }
    ],
    "vias": [
      {
        "x": -32,
        "y": -25,
        "net": "GND"
      },
      {
        "x": 32,
        "y": -25,
        "net": "GND"
      },
      {
        "x": -32,
        "y": 25,
        "net": "GND"
      },
      {
        "x": 32,
        "y": 25,
        "net": "GND"
      },
      {
        "x": 0,
        "y": -25,
        "net": "GND"
      },
      {
        "x": 0,
        "y": 25,
        "net": "GND"
      },
      {
        "x": 5,
        "y": 16,
        "net": "5V"
      },
      {
        "x": -14,
        "y": 17,
        "net": "5V"
      },
      {
        "x": -24,
        "y": 10,
        "net": "GND"
      },
      {
        "x": 3.5,
        "y": -6.5,
        "net": "GND"
      }
    ]
  },
  {
    "id": "esp32-poe2",
    "name": "Olimex ESP32-POE2",
    "soc": "ESP32 (Wi-Fi/BT)",
    "layers": 4,
    "w": 80,
    "h": 28,
    "level": "專題",
    "github": "https://github.com/OLIMEX/ESP32-POE2",
    "circuits": [
      "ESP32 模組 + LAN8710 乙太 PHY + RJ45 帶隔離變壓",
      "PoE 供電（802.3af，隔離 flyback）",
      "PoE → 5V/3.3V 供電鏈"
    ],
    "note": "網通 + PoE 教材：乙太 PHY 佈局、RJ45 磁性、隔離返馳供電、共模抑制。",
    "components": [
      {
        "ref": "U1",
        "part": "ESP32-WROOM-32",
        "x": -16,
        "y": -1,
        "w": 18,
        "h": 13,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "LAN8710A (QFN32)",
        "x": 6,
        "y": -3,
        "w": 5,
        "h": 5,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "Y2",
        "part": "25MHz XTAL",
        "x": 6,
        "y": -8,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "J1",
        "part": "RJ45 w/ magnetics",
        "x": 32,
        "y": 0,
        "w": 12,
        "h": 13,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "T1",
        "part": "PoE isolation transformer",
        "x": -8,
        "y": 8,
        "w": 8,
        "h": 6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U3",
        "part": "PoE PD 控制器（隔離 flyback）",
        "x": -18,
        "y": 8,
        "w": 5,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "Q1",
        "part": "Flyback FET",
        "x": -13,
        "y": 10,
        "w": 3,
        "h": 2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U4",
        "part": "AP2112K-3.3 LDO",
        "x": 16,
        "y": 8,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "L1",
        "part": "Flyback inductor",
        "x": -3,
        "y": 9,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "J2",
        "part": "USB-C (prog/power)",
        "x": -34.5,
        "y": 0,
        "w": 8,
        "h": 7,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "U5",
        "part": "USB-UART 橋接",
        "x": -30,
        "y": -6,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J3",
        "part": "microSD",
        "x": 33,
        "y": -8,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J4",
        "part": "UEXT connector",
        "x": 0,
        "y": 11.5,
        "w": 10,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J5",
        "part": "Battery JST-PH2",
        "x": -36,
        "y": 10,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW1",
        "part": "Reset button",
        "x": 24,
        "y": -9,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW2",
        "part": "Boot button",
        "x": 20,
        "y": -9,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "LED1",
        "part": "Power LED",
        "x": -24,
        "y": 10,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "LED2",
        "part": "Status LED",
        "x": -21,
        "y": 10,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C1",
        "part": "100nF (PHY decouple)",
        "x": 8,
        "y": 1,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "10uF (3V3 bulk)",
        "x": 19,
        "y": 8,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "49.9R (RJ45 term)",
        "x": 22,
        "y": 3,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "MH1",
        "part": "M2.5 mount",
        "x": -37,
        "y": -11.5,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH2",
        "part": "M2.5 mount",
        "x": 37,
        "y": -11.5,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH3",
        "part": "M2.5 mount",
        "x": -37,
        "y": 11.5,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH4",
        "part": "M2.5 mount",
        "x": 37,
        "y": 11.5,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": 8.5,
        "y1": -3.5,
        "x2": 22,
        "y2": -3.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXP"
      },
      {
        "x1": 22,
        "y1": -3.5,
        "x2": 22,
        "y2": -1,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXP"
      },
      {
        "x1": 22,
        "y1": -1,
        "x2": 26,
        "y2": -1,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXP"
      },
      {
        "x1": 8.5,
        "y1": -2.5,
        "x2": 21,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXN"
      },
      {
        "x1": 21,
        "y1": -2.5,
        "x2": 21,
        "y2": 0,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXN"
      },
      {
        "x1": 21,
        "y1": 0,
        "x2": 26,
        "y2": 0,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXN"
      },
      {
        "x1": -7,
        "y1": -4,
        "x2": 3.5,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_TXD0"
      },
      {
        "x1": -7,
        "y1": -3,
        "x2": 3.5,
        "y2": -3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_TXD1"
      },
      {
        "x1": -7,
        "y1": -2,
        "x2": 3.5,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_RXD0"
      },
      {
        "x1": -7,
        "y1": -1,
        "x2": 3.5,
        "y2": -1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_RXD1"
      },
      {
        "x1": -7,
        "y1": 0,
        "x2": 3.5,
        "y2": 0,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "x1": 26,
        "y1": 5,
        "x2": 19,
        "y2": 5,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VPOE_RAW"
      },
      {
        "x1": 19,
        "y1": 5,
        "x2": 19,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VPOE_RAW"
      },
      {
        "x1": 19,
        "y1": 11,
        "x2": -15.5,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VPOE_RAW"
      },
      {
        "x1": -15.5,
        "y1": 11,
        "x2": -15.5,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VPOE_RAW"
      },
      {
        "x1": -12,
        "y1": 8,
        "x2": -15.5,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VPOE_RAW"
      },
      {
        "x1": -1,
        "y1": 9,
        "x2": 14.5,
        "y2": 9,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VRECT"
      },
      {
        "x1": 17.5,
        "y1": 8,
        "x2": -7,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "3V3"
      },
      {
        "x1": -7,
        "y1": 8,
        "x2": -7,
        "y2": 5.5,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "3V3"
      },
      {
        "x1": -30.5,
        "y1": 0,
        "x2": -29,
        "y2": 0,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VBUS"
      },
      {
        "x1": -29,
        "y1": 0,
        "x2": -29,
        "y2": -6,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VBUS"
      },
      {
        "x1": -37,
        "y1": 0,
        "x2": 37,
        "y2": 0,
        "layer": "In1.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -37,
        "y1": -9,
        "x2": 37,
        "y2": -9,
        "layer": "In2.Cu",
        "width": 0.8,
        "net": "3V3"
      },
      {
        "x1": -37,
        "y1": -13,
        "x2": 37,
        "y2": -13,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -37,
        "y1": 13,
        "x2": 37,
        "y2": 13,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      }
    ],
    "vias": [
      {
        "x": 22,
        "y": -1,
        "net": "ETH_TXP"
      },
      {
        "x": 21,
        "y": -1,
        "net": "ETH_TXN"
      },
      {
        "x": -30,
        "y": -6,
        "net": "VBUS"
      },
      {
        "x": -37,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 37,
        "y": 0,
        "net": "GND"
      },
      {
        "x": -37,
        "y": -13,
        "net": "GND"
      },
      {
        "x": 37,
        "y": 13,
        "net": "GND"
      },
      {
        "x": -7,
        "y": 5.5,
        "net": "3V3"
      },
      {
        "x": 0,
        "y": 2,
        "net": "GND"
      }
    ]
  },
  {
    "id": "a20-lime",
    "name": "Olimex A20-OLinuXino-LIME",
    "soc": "Allwinner A20 (dual A7)",
    "layers": 4,
    "w": 84,
    "h": 60,
    "level": "中階 Linux",
    "github": "https://github.com/OLIMEX/OLINUXINO/tree/master/HARDWARE/A20-OLinuXino-LIME",
    "circuits": [
      "A20 SoC + AXP209 PMIC（多軌 + 電池充電）",
      "DDR3 x2（16-bit 各）",
      "10/100 乙太 PHY (RTL8201) + HDMI + 2×USB + microSD"
    ],
    "note": "中階 Linux 板完整教材：PMIC 電源樹、DDR3 佈線、GbE/HDMI 高速。",
    "components": [
      {
        "ref": "U1",
        "part": "Allwinner A20 (BGA425)",
        "x": 0,
        "y": -2,
        "w": 17,
        "h": 17,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "AXP209 PMIC (QFN)",
        "x": -24,
        "y": 8,
        "w": 5,
        "h": 5,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U3",
        "part": "DDR3 x16 (Bank A)",
        "x": 18,
        "y": -14,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U4",
        "part": "DDR3 x16 (Bank B)",
        "x": 18,
        "y": 10,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U5",
        "part": "RTL8201 10/100 PHY",
        "x": -30,
        "y": -18,
        "w": 5,
        "h": 5,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J1",
        "part": "RJ45 (Ethernet)",
        "x": -35,
        "y": -14,
        "w": 10,
        "h": 10,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J2",
        "part": "HDMI Type A",
        "x": 34,
        "y": -20,
        "w": 11,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J3",
        "part": "USB Host x2",
        "x": 35,
        "y": 14,
        "w": 8,
        "h": 13,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J4",
        "part": "microSD",
        "x": -35,
        "y": 20,
        "w": 11,
        "h": 8,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "Y1",
        "part": "32.768kHz RTC XTAL",
        "x": -16,
        "y": 6,
        "w": 2,
        "h": 1.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "Y2",
        "part": "24MHz XTAL",
        "x": -8,
        "y": 10,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U6",
        "part": "AT24C16 EEPROM",
        "x": -22,
        "y": 20,
        "w": 3,
        "h": 2,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "L1",
        "part": "DCDC1 inductor",
        "x": -30,
        "y": 4,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L2",
        "part": "DCDC2 inductor",
        "x": -30,
        "y": 12,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L3",
        "part": "DCDC3 inductor",
        "x": -24,
        "y": 16,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "J5",
        "part": "LiPo battery conn",
        "x": -38,
        "y": 4,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW1",
        "part": "Power button",
        "x": -38,
        "y": -4,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "LED1",
        "part": "Power LED",
        "x": -14,
        "y": 20,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "LED2",
        "part": "Status LED",
        "x": -10,
        "y": 20,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C1",
        "part": "100nF (A20 decouple)",
        "x": 8,
        "y": 4,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "10uF (DCDC bulk)",
        "x": -27,
        "y": 2,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "4.7k (I2C pull-up)",
        "x": -18,
        "y": 18,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "HDR1",
        "part": "GPIO expansion header",
        "x": 0,
        "y": 27,
        "w": 40,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "MH1",
        "part": "M3 mount",
        "x": -39,
        "y": -27,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH2",
        "part": "M3 mount",
        "x": 39,
        "y": -27,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH3",
        "part": "M3 mount",
        "x": -39,
        "y": 27,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH4",
        "part": "M3 mount",
        "x": 39,
        "y": 27,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": 8.5,
        "y1": -16,
        "x2": 13,
        "y2": -16,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_D0"
      },
      {
        "x1": 8.5,
        "y1": -15,
        "x2": 13,
        "y2": -15,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_D1"
      },
      {
        "x1": 8.5,
        "y1": -14,
        "x2": 13,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_D2"
      },
      {
        "x1": 8.5,
        "y1": -13,
        "x2": 13,
        "y2": -13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_CLK"
      },
      {
        "x1": 8.5,
        "y1": 10,
        "x2": 13,
        "y2": 10,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_D0"
      },
      {
        "x1": 8.5,
        "y1": 11,
        "x2": 13,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_D1"
      },
      {
        "x1": 8.5,
        "y1": 12,
        "x2": 13,
        "y2": 12,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_D2"
      },
      {
        "x1": 8.5,
        "y1": 13,
        "x2": 13,
        "y2": 13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_CLK"
      },
      {
        "x1": -21.5,
        "y1": 6,
        "x2": -16,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "DCDC2_3V3"
      },
      {
        "x1": -16,
        "y1": 6,
        "x2": -16,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "DCDC2_3V3"
      },
      {
        "x1": -16,
        "y1": 2,
        "x2": -8.5,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "DCDC2_3V3"
      },
      {
        "x1": -27,
        "y1": 8,
        "x2": -31,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VBAT"
      },
      {
        "x1": -32.5,
        "y1": -16,
        "x2": -29,
        "y2": -16,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXP"
      },
      {
        "x1": -29,
        "y1": -16,
        "x2": -29,
        "y2": -14.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXP"
      },
      {
        "x1": -32.5,
        "y1": -15,
        "x2": -30,
        "y2": -15,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXN"
      },
      {
        "x1": -30,
        "y1": -15,
        "x2": -30,
        "y2": -14.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "ETH_TXN"
      },
      {
        "x1": 8.5,
        "y1": -6,
        "x2": 28.5,
        "y2": -6,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "HDMI_D2P"
      },
      {
        "x1": 8.5,
        "y1": -5,
        "x2": 28.5,
        "y2": -5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "HDMI_D2N"
      },
      {
        "x1": 8.5,
        "y1": 6,
        "x2": 31,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DP"
      },
      {
        "x1": 8.5,
        "y1": 7,
        "x2": 31,
        "y2": 7,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DM"
      },
      {
        "x1": -39,
        "y1": 0,
        "x2": 39,
        "y2": 0,
        "layer": "In1.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -39,
        "y1": -10,
        "x2": 39,
        "y2": -10,
        "layer": "In2.Cu",
        "width": 0.8,
        "net": "DCDC1_1V2"
      },
      {
        "x1": -40,
        "y1": -28,
        "x2": 40,
        "y2": -28,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -40,
        "y1": 28,
        "x2": 40,
        "y2": 28,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      }
    ],
    "vias": [
      {
        "x": -40,
        "y": -28,
        "net": "GND"
      },
      {
        "x": 40,
        "y": -28,
        "net": "GND"
      },
      {
        "x": -40,
        "y": 28,
        "net": "GND"
      },
      {
        "x": 40,
        "y": 28,
        "net": "GND"
      },
      {
        "x": -16,
        "y": 2,
        "net": "DCDC2_3V3"
      },
      {
        "x": -30,
        "y": -14.5,
        "net": "ETH_TXN"
      },
      {
        "x": -29,
        "y": -14.5,
        "net": "ETH_TXP"
      },
      {
        "x": 0,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 8.5,
        "y": -18,
        "net": "GND"
      },
      {
        "x": 8.5,
        "y": 15,
        "net": "GND"
      }
    ]
  },
  {
    "id": "imx233-maxi",
    "name": "Olimex iMX233-OLinuXino-Maxi",
    "soc": "i.MX233 (ARM926)",
    "layers": 4,
    "w": 100,
    "h": 80,
    "level": "中階 Linux",
    "github": "https://github.com/OLIMEX/OLINUXINO/tree/master/HARDWARE/iMX233-OLinuXino-Maxi",
    "circuits": [
      "i.MX233（整合 PMU，省外部 PMIC）",
      "mDDR 記憶體",
      "USB Host + SD 卡 + 外接乙太"
    ],
    "note": "SoC 內建 PMU 案例：對照有無獨立 PMIC 的電源設計差異。",
    "components": [
      {
        "ref": "U1",
        "part": "i.MX233 (ARM926EJ-S)",
        "x": 0,
        "y": -4,
        "w": 12,
        "h": 12,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "mDDR SDRAM",
        "x": 20,
        "y": -4,
        "w": 9,
        "h": 7,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J1",
        "part": "USB Host A",
        "x": -34,
        "y": -22,
        "w": 8,
        "h": 13,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J2",
        "part": "USB Host B",
        "x": -34,
        "y": -4,
        "w": 8,
        "h": 13,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J3",
        "part": "USB OTG (micro)",
        "x": -38,
        "y": 16,
        "w": 6,
        "h": 4,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J4",
        "part": "Ethernet daughter-card header",
        "x": 34,
        "y": -24,
        "w": 10,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J5",
        "part": "microSD",
        "x": -34,
        "y": 24,
        "w": 11,
        "h": 8,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J6",
        "part": "LCD FPC 40P",
        "x": 0,
        "y": -35,
        "w": 30,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR1",
        "part": "GPIO expansion header A",
        "x": 40,
        "y": 10,
        "w": 2,
        "h": 30,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR2",
        "part": "GPIO expansion header B",
        "x": 44,
        "y": 10,
        "w": 2,
        "h": 30,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J7",
        "part": "DC power jack",
        "x": 40,
        "y": -30,
        "w": 7,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J8",
        "part": "LiPo battery conn",
        "x": -40,
        "y": -30,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "U3",
        "part": "Li-ion charger IC",
        "x": -30,
        "y": -30,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "SW1",
        "part": "Reset button",
        "x": 10,
        "y": -30,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW2",
        "part": "Boot mode DIP switch",
        "x": 17,
        "y": -30,
        "w": 5,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "Y1",
        "part": "24MHz XTAL",
        "x": 10,
        "y": 4,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "Y2",
        "part": "32.768kHz RTC XTAL",
        "x": 16,
        "y": 6,
        "w": 2,
        "h": 1.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U4",
        "part": "AT24C16 EEPROM",
        "x": 24,
        "y": 6,
        "w": 3,
        "h": 2,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "LED1",
        "part": "Power LED",
        "x": 6,
        "y": 10,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "LED2",
        "part": "Status LED",
        "x": 10,
        "y": 10,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C1",
        "part": "100nF (SoC decouple)",
        "x": -6,
        "y": 2,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "10uF (PMU bulk)",
        "x": 30,
        "y": -2,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "10k (boot strap)",
        "x": 4,
        "y": 8,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "MH1",
        "part": "M3 mount",
        "x": -46,
        "y": -36,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH2",
        "part": "M3 mount",
        "x": 46,
        "y": -36,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH3",
        "part": "M3 mount",
        "x": -46,
        "y": 36,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH4",
        "part": "M3 mount",
        "x": 46,
        "y": 36,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": 6,
        "y1": -6,
        "x2": 15.5,
        "y2": -6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "mDDR_D0"
      },
      {
        "x1": 6,
        "y1": -5,
        "x2": 15.5,
        "y2": -5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "mDDR_D1"
      },
      {
        "x1": 6,
        "y1": -4,
        "x2": 15.5,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "mDDR_D2"
      },
      {
        "x1": 6,
        "y1": -3,
        "x2": 15.5,
        "y2": -3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "mDDR_CLK"
      },
      {
        "x1": 6,
        "y1": -2,
        "x2": 15.5,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "mDDR_DQS"
      },
      {
        "x1": -6,
        "y1": -8,
        "x2": -29,
        "y2": -8,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USBH1_DP"
      },
      {
        "x1": -29,
        "y1": -8,
        "x2": -29,
        "y2": -15.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USBH1_DP"
      },
      {
        "x1": -6,
        "y1": -7,
        "x2": -30,
        "y2": -7,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USBH1_DM"
      },
      {
        "x1": -30,
        "y1": -7,
        "x2": -30,
        "y2": -15.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USBH1_DM"
      },
      {
        "x1": -6,
        "y1": 2,
        "x2": -30,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "OTG_DP"
      },
      {
        "x1": -30,
        "y1": 2,
        "x2": -30,
        "y2": 15,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "OTG_DP"
      },
      {
        "x1": 36.5,
        "y1": -30,
        "x2": 36.5,
        "y2": -35.5,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VIN_5V"
      },
      {
        "x1": 36.5,
        "y1": -35.5,
        "x2": -28,
        "y2": -35.5,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VIN_5V"
      },
      {
        "x1": -28,
        "y1": -35.5,
        "x2": -28,
        "y2": -30,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VIN_5V"
      },
      {
        "x1": -32,
        "y1": -30,
        "x2": -40,
        "y2": -30,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VBAT"
      },
      {
        "x1": -30,
        "y1": -28.5,
        "x2": -30,
        "y2": -20,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VBAT"
      },
      {
        "x1": -6,
        "y1": -4,
        "x2": 0,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "3V3"
      },
      {
        "x1": -6,
        "y1": -10,
        "x2": -6,
        "y2": -33.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LCD_D0"
      },
      {
        "x1": 0,
        "y1": -10,
        "x2": 0,
        "y2": -33.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LCD_CLK"
      },
      {
        "x1": 6,
        "y1": -9,
        "x2": 29,
        "y2": -9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "MII_TXD0"
      },
      {
        "x1": 29,
        "y1": -9,
        "x2": 29,
        "y2": -23,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "MII_TXD0"
      },
      {
        "x1": -49,
        "y1": 0,
        "x2": 49,
        "y2": 0,
        "layer": "In1.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -49,
        "y1": -10,
        "x2": 49,
        "y2": -10,
        "layer": "In2.Cu",
        "width": 0.8,
        "net": "3V3"
      },
      {
        "x1": -48,
        "y1": -38,
        "x2": 48,
        "y2": -38,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -48,
        "y1": 38,
        "x2": 48,
        "y2": 38,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      }
    ],
    "vias": [
      {
        "x": -29,
        "y": -15.5,
        "net": "USBH1_DP"
      },
      {
        "x": -30,
        "y": -15.5,
        "net": "USBH1_DM"
      },
      {
        "x": -48,
        "y": -38,
        "net": "GND"
      },
      {
        "x": 48,
        "y": -38,
        "net": "GND"
      },
      {
        "x": -48,
        "y": 38,
        "net": "GND"
      },
      {
        "x": 48,
        "y": 38,
        "net": "GND"
      },
      {
        "x": -30,
        "y": -20,
        "net": "VBAT"
      },
      {
        "x": 0,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 6,
        "y": -7.5,
        "net": "GND"
      }
    ]
  },
  {
    "id": "openrex-imx6",
    "name": "OpenRex i.MX6 (FEDEVEL)",
    "soc": "i.MX6 Quad (Cortex-A9)",
    "layers": 8,
    "w": 100,
    "h": 70,
    "level": "高階",
    "github": "https://www.imx6rex.com/open-rex/",
    "circuits": [
      "i.MX6Q + PF0100 PMIC",
      "DDR3 x4（64-bit）等長佈線示範",
      "PCIe + HDMI + GbE + SATA 全高速"
    ],
    "note": "知名開源高階板，附設計指南：DDR3 fly-by/等長、8 層疊層、高速全家桶。",
    "components": [
      {
        "ref": "U1",
        "part": "i.MX6Q (FCBGA, Cortex-A9 quad)",
        "x": 0,
        "y": 0,
        "w": 17,
        "h": 17,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "PF0100 PMIC (BGA)",
        "x": -24,
        "y": 12,
        "w": 9,
        "h": 9,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U3",
        "part": "DDR3 x16 #1",
        "x": 18,
        "y": -16,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U4",
        "part": "DDR3 x16 #2",
        "x": 30,
        "y": -16,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U5",
        "part": "DDR3 x16 #3",
        "x": 18,
        "y": 16,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U6",
        "part": "DDR3 x16 #4",
        "x": 30,
        "y": 16,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J1",
        "part": "PCIe Mini card slot",
        "x": -30,
        "y": -18,
        "w": 14,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J2",
        "part": "HDMI Type A",
        "x": -34,
        "y": 4,
        "w": 11,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J3",
        "part": "RJ45 GbE w/ magnetics",
        "x": -30,
        "y": 20,
        "w": 12,
        "h": 10,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J4",
        "part": "SATA data+power",
        "x": 34,
        "y": 0,
        "w": 6,
        "h": 13,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "U7",
        "part": "AR8031 GbE PHY",
        "x": -20,
        "y": 20,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U8",
        "part": "SATA series termination",
        "x": 26,
        "y": 0,
        "w": 3,
        "h": 2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "J5",
        "part": "microSD",
        "x": -42,
        "y": -10,
        "w": 11,
        "h": 8,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "U9",
        "part": "eMMC / boot flash",
        "x": -6,
        "y": 10,
        "w": 5,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "Y1",
        "part": "24MHz XTAL",
        "x": 8,
        "y": 8,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "Y2",
        "part": "32.768kHz RTC XTAL",
        "x": 4,
        "y": 10,
        "w": 2,
        "h": 1.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "SW1",
        "part": "Reset button",
        "x": 0,
        "y": -30,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW2",
        "part": "Boot mode DIP switch",
        "x": 7,
        "y": -30,
        "w": 5,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "HDR1",
        "part": "GPIO expansion header",
        "x": 0,
        "y": 32,
        "w": 40,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "LED1",
        "part": "Power LED",
        "x": -2,
        "y": 6,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "LED2",
        "part": "Status LED",
        "x": 2,
        "y": 6,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C1",
        "part": "100nF (SoC decouple)",
        "x": -4,
        "y": 4,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "10uF (PF0100 bulk)",
        "x": -18,
        "y": 8,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "100R (PCIe/SATA term)",
        "x": 30,
        "y": 2,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "MH1",
        "part": "M3 mount",
        "x": -46,
        "y": -31,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH2",
        "part": "M3 mount",
        "x": 46,
        "y": -31,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH3",
        "part": "M3 mount",
        "x": -46,
        "y": 31,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH4",
        "part": "M3 mount",
        "x": 46,
        "y": 31,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": 8.5,
        "y1": -14,
        "x2": 13,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDR_D0"
      },
      {
        "x1": 8.5,
        "y1": -13,
        "x2": 13,
        "y2": -13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDR_D1"
      },
      {
        "x1": 13,
        "y1": -14,
        "x2": 25,
        "y2": -14,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "DDR_D0"
      },
      {
        "x1": 13,
        "y1": -13,
        "x2": 25,
        "y2": -13,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "DDR_D1"
      },
      {
        "x1": 8.5,
        "y1": 14,
        "x2": 13,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDR_D2"
      },
      {
        "x1": 8.5,
        "y1": 13,
        "x2": 13,
        "y2": 13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDR_D3"
      },
      {
        "x1": 13,
        "y1": 14,
        "x2": 25,
        "y2": 14,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "DDR_D2"
      },
      {
        "x1": 13,
        "y1": 13,
        "x2": 25,
        "y2": 13,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "DDR_D3"
      },
      {
        "x1": 8.5,
        "y1": 0,
        "x2": 16,
        "y2": 0,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDR_CLK"
      },
      {
        "x1": -8.5,
        "y1": -4,
        "x2": -22,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "PCIE_TXP"
      },
      {
        "x1": -22,
        "y1": -4,
        "x2": -22,
        "y2": -16,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "PCIE_TXP"
      },
      {
        "x1": -8.5,
        "y1": -3,
        "x2": -23,
        "y2": -3,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "PCIE_TXN"
      },
      {
        "x1": -23,
        "y1": -3,
        "x2": -23,
        "y2": -16,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "PCIE_TXN"
      },
      {
        "x1": -8.5,
        "y1": 2,
        "x2": -28.5,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "HDMI_D0P"
      },
      {
        "x1": -8.5,
        "y1": 3,
        "x2": -28.5,
        "y2": 3,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "HDMI_D0N"
      },
      {
        "x1": -17,
        "y1": 20,
        "x2": -24,
        "y2": 20,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "GBE_TXP"
      },
      {
        "x1": -17,
        "y1": 21,
        "x2": -24,
        "y2": 21,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "GBE_TXN"
      },
      {
        "x1": 8.5,
        "y1": 1,
        "x2": 24.5,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "SATA_TXP"
      },
      {
        "x1": 8.5,
        "y1": 2,
        "x2": 24.5,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "SATA_TXN"
      },
      {
        "x1": -19.5,
        "y1": 12,
        "x2": -8.5,
        "y2": 12,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VDD_ARM"
      },
      {
        "x1": -19.5,
        "y1": 10,
        "x2": -8.5,
        "y2": 10,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VDD_SOC"
      },
      {
        "x1": -8.5,
        "y1": 10,
        "x2": -8.5,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.6,
        "net": "VDD_SOC"
      },
      {
        "x1": -49,
        "y1": 0,
        "x2": 49,
        "y2": 0,
        "layer": "In2.Cu",
        "width": 1.2,
        "net": "GND"
      },
      {
        "x1": -49,
        "y1": -8,
        "x2": 49,
        "y2": -8,
        "layer": "In3.Cu",
        "width": 1,
        "net": "VDD_DDR"
      },
      {
        "x1": -49,
        "y1": 8,
        "x2": 49,
        "y2": 8,
        "layer": "In4.Cu",
        "width": 1,
        "net": "GND"
      }
    ],
    "vias": [
      {
        "x": 13,
        "y": -14,
        "net": "DDR_D0"
      },
      {
        "x": 13,
        "y": -13,
        "net": "DDR_D1"
      },
      {
        "x": 13,
        "y": 14,
        "net": "DDR_D2"
      },
      {
        "x": 13,
        "y": 13,
        "net": "DDR_D3"
      },
      {
        "x": -22,
        "y": -16,
        "net": "PCIE_TXP"
      },
      {
        "x": -23,
        "y": -16,
        "net": "PCIE_TXN"
      },
      {
        "x": -49,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 49,
        "y": 0,
        "net": "GND"
      },
      {
        "x": -49,
        "y": -8,
        "net": "VDD_DDR"
      },
      {
        "x": 49,
        "y": 8,
        "net": "GND"
      },
      {
        "x": 0,
        "y": 0,
        "net": "GND"
      },
      {
        "x": -8.5,
        "y": 6,
        "net": "VDD_SOC"
      }
    ]
  },
  {
    "id": "imx8mp-som",
    "name": "Olimex iMX8MP-SOM",
    "soc": "i.MX8M Plus (quad A53 + NPU)",
    "layers": 8,
    "w": 40,
    "h": 60,
    "level": "高階 SoM",
    "github": "https://github.com/OLIMEX/iMX8MP-SOM/tree/main",
    "circuits": [
      "i.MX8M Plus + PCA9450 PMIC（NXP 專用 SoC 電源）",
      "LPDDR4 + eMMC",
      "SoM 板對板連接器接出（載板負責 IO）"
    ],
    "note": "AI 伺服器縮小版：現代 SoC+專用 PMIC+LPDDR4，SoM/載板分工的高密度電源與時序。",
    "components": [
      {
        "ref": "U1",
        "part": "i.MX8M Plus (quad A53+NPU, BGA)",
        "x": 0,
        "y": -4,
        "w": 14,
        "h": 14,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "PCA9450 PMIC",
        "x": 0,
        "y": 14,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U3",
        "part": "LPDDR4 (multi-die stack)",
        "x": 0,
        "y": -18,
        "w": 12,
        "h": 8,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U4",
        "part": "eMMC",
        "x": -8,
        "y": 8,
        "w": 5,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J1",
        "part": "Board-to-board conn (L)",
        "x": -17,
        "y": -2,
        "w": 3,
        "h": 24,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J2",
        "part": "Board-to-board conn (R)",
        "x": 17,
        "y": -2,
        "w": 3,
        "h": 24,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "Y1",
        "part": "24MHz XTAL",
        "x": 6,
        "y": 10,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "Y2",
        "part": "32.768kHz RTC XTAL",
        "x": 6,
        "y": 6,
        "w": 2,
        "h": 1.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L1",
        "part": "Buck1 inductor",
        "x": -5,
        "y": 17,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L2",
        "part": "Buck2 inductor",
        "x": -1,
        "y": 19,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L3",
        "part": "Buck3 inductor",
        "x": 3,
        "y": 19,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U5",
        "part": "DC-DC 輔助電源",
        "x": 8,
        "y": 16,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "C1",
        "part": "100nF (SoC decouple)",
        "x": -4,
        "y": -4,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "10uF (PMIC bulk)",
        "x": 2,
        "y": 15,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C3",
        "part": "22uF (LPDDR4 VDDQ bulk)",
        "x": -4,
        "y": -16,
        "w": 2,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "4.7k (I2C PMIC cfg pull-up)",
        "x": 8,
        "y": 20,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "TP1",
        "part": "TP SWD",
        "x": -14,
        "y": 26,
        "w": 1.5,
        "h": 1.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "TP2",
        "part": "TP GND",
        "x": -11,
        "y": 26,
        "w": 1.5,
        "h": 1.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH1",
        "part": "M2 mount",
        "x": -16,
        "y": 27,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH2",
        "part": "M2 mount",
        "x": 16,
        "y": 27,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": -3,
        "y1": -11,
        "x2": -3,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_D0"
      },
      {
        "x1": -1,
        "y1": -11,
        "x2": -1,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_D1"
      },
      {
        "x1": 1,
        "y1": -11,
        "x2": 1,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_CLK"
      },
      {
        "x1": 3,
        "y1": -11,
        "x2": 3,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_DQS"
      },
      {
        "x1": -7,
        "y1": 2,
        "x2": -7,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "EMMC_D0"
      },
      {
        "x1": -5,
        "y1": 2,
        "x2": -5,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "x1": 0,
        "y1": 11,
        "x2": 0,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.8,
        "net": "VDD_ARM"
      },
      {
        "x1": -3,
        "y1": 14,
        "x2": -5,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "BUCK1_OUT"
      },
      {
        "x1": -5,
        "y1": 14,
        "x2": -5,
        "y2": 17,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "BUCK1_OUT"
      },
      {
        "x1": 6,
        "y1": 16,
        "x2": 6,
        "y2": 12,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VDD_SNVS"
      },
      {
        "x1": -7,
        "y1": -4,
        "x2": -15.5,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO0"
      },
      {
        "x1": -7,
        "y1": -2,
        "x2": -15.5,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO1"
      },
      {
        "x1": 7,
        "y1": -4,
        "x2": 15.5,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO0"
      },
      {
        "x1": 7,
        "y1": -2,
        "x2": 15.5,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO1"
      },
      {
        "x1": 6,
        "y1": 8.75,
        "x2": 6,
        "y2": 6.75,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "x1": -19,
        "y1": 0,
        "x2": 19,
        "y2": 0,
        "layer": "In2.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -19,
        "y1": -6,
        "x2": 19,
        "y2": -6,
        "layer": "In3.Cu",
        "width": 0.8,
        "net": "VDD_DDR"
      },
      {
        "x1": -19,
        "y1": 6,
        "x2": 19,
        "y2": 6,
        "layer": "In5.Cu",
        "width": 0.8,
        "net": "GND"
      },
      {
        "x1": -18,
        "y1": -28,
        "x2": 18,
        "y2": -28,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -18,
        "y1": 28,
        "x2": 18,
        "y2": 28,
        "layer": "B.Cu",
        "width": 1,
        "net": "GND"
      }
    ],
    "vias": [
      {
        "x": -15.5,
        "y": -4,
        "net": "B2B_L_IO0"
      },
      {
        "x": 15.5,
        "y": -4,
        "net": "B2B_R_IO0"
      },
      {
        "x": -18,
        "y": -28,
        "net": "GND"
      },
      {
        "x": 18,
        "y": -28,
        "net": "GND"
      },
      {
        "x": -18,
        "y": 28,
        "net": "GND"
      },
      {
        "x": 18,
        "y": 28,
        "net": "GND"
      },
      {
        "x": 0,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 0,
        "y": -6,
        "net": "VDD_DDR"
      },
      {
        "x": 0,
        "y": 6,
        "net": "GND"
      }
    ]
  },
  {
    "id": "librevna",
    "name": "LibreVNA (開源向量網路分析儀)",
    "soc": "FPGA + MAX2871 合成器",
    "layers": 4,
    "w": 100,
    "h": 60,
    "level": "儀器",
    "github": "https://github.com/jankae/LibreVNA",
    "circuits": [
      "MAX2871 PLL 合成器 ×2（源 + 本振）+ Si5351 參考時鐘",
      "RF 混頻器 + ADC 做 S 參數量測",
      "FPGA 做 DSP + USB 傳輸"
    ],
    "note": "對應你儀器實驗台的虛擬 VNA——這是它的真實硬體：合成器/混頻/校準的實作。",
    "components": [
      {
        "ref": "U1",
        "part": "FPGA (DSP/USB ctrl)",
        "x": 0,
        "y": 0,
        "w": 14,
        "h": 14,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "MAX2871 Synth #1 (source)",
        "x": -26,
        "y": -14,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U3",
        "part": "MAX2871 Synth #2 (LO)",
        "x": -26,
        "y": 14,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U4",
        "part": "Si5351A clock gen",
        "x": -38,
        "y": 0,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U5",
        "part": "RF 混頻器",
        "x": 20,
        "y": -14,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U6",
        "part": "雙通道取樣 ADC",
        "x": 20,
        "y": 14,
        "w": 8,
        "h": 6,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J1",
        "part": "USB-B",
        "x": 40,
        "y": 0,
        "w": 8,
        "h": 7,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J2",
        "part": "RF Port 1 (SMA)",
        "x": -45,
        "y": -20,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J3",
        "part": "RF Port 2 (SMA)",
        "x": -45,
        "y": 20,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J4",
        "part": "RF Out/Cal (SMA)",
        "x": 45,
        "y": -20,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "U7",
        "part": "RF 開關",
        "x": -14,
        "y": -10,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U8",
        "part": "RF atten/amp stage",
        "x": 6,
        "y": -14,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U9",
        "part": "Directional coupler",
        "x": -6,
        "y": -18,
        "w": 5,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "Y1",
        "part": "26MHz reference XTAL",
        "x": -38,
        "y": 6,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L1",
        "part": "VCO tank inductor (Synth1)",
        "x": -20,
        "y": -14,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L2",
        "part": "VCO tank inductor (Synth2)",
        "x": -20,
        "y": 14,
        "w": 2,
        "h": 2,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U10",
        "part": "3.3V LDO (digital)",
        "x": 10,
        "y": 20,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U11",
        "part": "Low-noise RF LDO",
        "x": 16,
        "y": 20,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "SW1",
        "part": "Cal/mode button",
        "x": 30,
        "y": 20,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "LED1",
        "part": "Power LED",
        "x": 36,
        "y": 20,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "LED2",
        "part": "Status LED",
        "x": 39,
        "y": 20,
        "w": 1.6,
        "h": 1,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C1",
        "part": "100nF (FPGA decouple)",
        "x": 4,
        "y": 4,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "10uF (LDO bulk)",
        "x": 13,
        "y": 17,
        "w": 1.6,
        "h": 0.8,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "R1",
        "part": "50R (RF termination)",
        "x": 0,
        "y": -20,
        "w": 1,
        "h": 0.6,
        "side": "bottom",
        "kind": "passive"
      },
      {
        "ref": "MH1",
        "part": "M3 mount",
        "x": -46,
        "y": -26,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH2",
        "part": "M3 mount",
        "x": 46,
        "y": -26,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH3",
        "part": "M3 mount",
        "x": -46,
        "y": 26,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      },
      {
        "ref": "MH4",
        "part": "M3 mount",
        "x": 46,
        "y": 26,
        "w": 2.5,
        "h": 2.5,
        "side": "top",
        "kind": "mech"
      }
    ],
    "traces": [
      {
        "x1": -36,
        "y1": 2,
        "x2": -29,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "x1": -29,
        "y1": 2,
        "x2": -29,
        "y2": -11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "x1": -29,
        "y1": -11,
        "x2": -26,
        "y2": -11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "x1": -29,
        "y1": 11,
        "x2": -26,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "x1": -23,
        "y1": -14,
        "x2": -15.5,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LO_OUT"
      },
      {
        "x1": -15.5,
        "y1": -14,
        "x2": -15.5,
        "y2": -11,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LO_OUT"
      },
      {
        "x1": -15.5,
        "y1": -11,
        "x2": 4.5,
        "y2": -11,
        "layer": "In1.Cu",
        "width": 0.2,
        "net": "LO_OUT"
      },
      {
        "x1": 4.5,
        "y1": -11,
        "x2": 4.5,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LO_OUT"
      },
      {
        "x1": 7.5,
        "y1": -14,
        "x2": 18,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LO_MIXER"
      },
      {
        "x1": -23,
        "y1": 14,
        "x2": -9,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "SRC_OUT"
      },
      {
        "x1": -9,
        "y1": 14,
        "x2": -9,
        "y2": -18,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "SRC_OUT"
      },
      {
        "x1": -9,
        "y1": -18,
        "x2": -8.5,
        "y2": -18,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "SRC_OUT"
      },
      {
        "x1": -3.5,
        "y1": -18,
        "x2": -3.5,
        "y2": -21,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "RF_PORT1"
      },
      {
        "x1": -3.5,
        "y1": -21,
        "x2": -42,
        "y2": -21,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "RF_PORT1"
      },
      {
        "x1": -42,
        "y1": -21,
        "x2": -42,
        "y2": -20,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "RF_PORT1"
      },
      {
        "x1": 22,
        "y1": -12,
        "x2": 22,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "IF_OUT"
      },
      {
        "x1": 22,
        "y1": -2.5,
        "x2": 5.5,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "IF_OUT"
      },
      {
        "x1": 5.5,
        "y1": -2.5,
        "x2": 5.5,
        "y2": 2.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "IF_OUT"
      },
      {
        "x1": 5.5,
        "y1": 2.5,
        "x2": 22,
        "y2": 2.5,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "IF_OUT"
      },
      {
        "x1": 22,
        "y1": 2.5,
        "x2": 22,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "IF_OUT"
      },
      {
        "x1": 7,
        "y1": 4,
        "x2": 16,
        "y2": 4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ADC_D0"
      },
      {
        "x1": 7,
        "y1": 5,
        "x2": 16,
        "y2": 5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ADC_D1"
      },
      {
        "x1": 7,
        "y1": 6,
        "x2": 16,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ADC_D2"
      },
      {
        "x1": 36,
        "y1": -1,
        "x2": 7,
        "y2": -1,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DP"
      },
      {
        "x1": 36,
        "y1": 1,
        "x2": 7,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "USB_DM"
      },
      {
        "x1": 11.5,
        "y1": 20,
        "x2": 7,
        "y2": 20,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "3V3"
      },
      {
        "x1": 7,
        "y1": 20,
        "x2": 7,
        "y2": 7.5,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "3V3"
      },
      {
        "x1": -46,
        "y1": 0,
        "x2": 46,
        "y2": 0,
        "layer": "In1.Cu",
        "width": 1,
        "net": "GND"
      },
      {
        "x1": -46,
        "y1": 8,
        "x2": 46,
        "y2": 8,
        "layer": "In2.Cu",
        "width": 0.8,
        "net": "3V3"
      }
    ],
    "vias": [
      {
        "x": -29,
        "y": -11,
        "net": "REFCLK"
      },
      {
        "x": -29,
        "y": 11,
        "net": "REFCLK"
      },
      {
        "x": -15.5,
        "y": -11,
        "net": "LO_OUT"
      },
      {
        "x": 4.5,
        "y": -11,
        "net": "LO_OUT"
      },
      {
        "x": -9,
        "y": -18,
        "net": "SRC_OUT"
      },
      {
        "x": -42,
        "y": -20,
        "net": "RF_PORT1"
      },
      {
        "x": -46,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 46,
        "y": 0,
        "net": "GND"
      },
      {
        "x": 7,
        "y": 20,
        "net": "3V3"
      },
      {
        "x": 0,
        "y": 0,
        "net": "GND"
      }
    ]
  }
];
