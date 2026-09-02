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
    "status": { "unrouted": 7, "zeroLen": 0, "measured": "2026-09-02" },
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
        "x": -4.861,
        "y": -2.025,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C4",
        "part": "100nF",
        "x": -4.861,
        "y": 2.025,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C5",
        "part": "100nF",
        "x": 4.861,
        "y": -2.025,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C6",
        "part": "100nF",
        "x": 4.861,
        "y": 2.025,
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
        "id": "ref-t-0",
        "x1": -21.5,
        "y1": 7.3,
        "x2": -21.3,
        "y2": 7.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-1",
        "x1": -21.3,
        "y1": 7.5,
        "x2": -21.2,
        "y2": 7.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-2",
        "x1": -21.2,
        "y1": 7.5,
        "x2": -21.1,
        "y2": 7.6,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-3",
        "x1": -21.1,
        "y1": 7.6,
        "x2": -20.9,
        "y2": 7.6,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-4",
        "x1": -20.9,
        "y1": 7.6,
        "x2": -20.5,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-5",
        "x1": -20.5,
        "y1": 8,
        "x2": -20.4,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-6",
        "x1": -20.4,
        "y1": 8,
        "x2": -20.3,
        "y2": 8.1,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-7",
        "x1": -20.3,
        "y1": 8.1,
        "x2": 23.6,
        "y2": 8.1,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-8",
        "x1": 23.6,
        "y1": 8.1,
        "x2": 24,
        "y2": 8.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-9",
        "x1": 23.6,
        "y1": -8.1,
        "x2": 24,
        "y2": -8.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-10",
        "x1": 0,
        "y1": -8.5,
        "x2": 0,
        "y2": 8.5,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-11",
        "x1": -22,
        "y1": 6.4,
        "x2": -22,
        "y2": -8,
        "layer": "In2.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-12",
        "x1": -21.5,
        "y1": 7.3,
        "x2": -21.3,
        "y2": 7.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-13",
        "x1": -21.3,
        "y1": 7.5,
        "x2": -21.2,
        "y2": 7.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-14",
        "x1": -21.2,
        "y1": 7.5,
        "x2": -21.1,
        "y2": 7.6,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-15",
        "x1": -21.1,
        "y1": 7.6,
        "x2": -20.9,
        "y2": 7.6,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-16",
        "x1": -20.9,
        "y1": 7.6,
        "x2": -20.5,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-17",
        "x1": -20.5,
        "y1": 8,
        "x2": -20.4,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-18",
        "x1": -20.4,
        "y1": 8,
        "x2": -20.3,
        "y2": 8.1,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-19",
        "x1": -20.3,
        "y1": 8.1,
        "x2": -0.4,
        "y2": 8.1,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-20",
        "x1": -0.4,
        "y1": 8.1,
        "x2": 0,
        "y2": 8.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-21",
        "x1": 20.8,
        "y1": -1.6,
        "x2": 20.5,
        "y2": -1.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-22",
        "x1": 20.1,
        "y1": -1.6,
        "x2": 19.7,
        "y2": -1.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-23",
        "x1": 19.5,
        "y1": -1.6,
        "x2": 19.5,
        "y2": -1.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-24",
        "x1": 19.6,
        "y1": -1.8,
        "x2": 19.6,
        "y2": -2.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-25",
        "x1": 19.6,
        "y1": -2.1,
        "x2": 19.2,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-26",
        "x1": 19.2,
        "y1": -2.5,
        "x2": 18.9,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-27",
        "x1": 18.9,
        "y1": -2.5,
        "x2": 18.8,
        "y2": -2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-28",
        "x1": 18.8,
        "y1": -2.6,
        "x2": 18.3,
        "y2": -2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-29",
        "x1": 18.3,
        "y1": -2.6,
        "x2": 17.9,
        "y2": -2.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-30",
        "x1": 17.9,
        "y1": -2.2,
        "x2": 17.7,
        "y2": -2.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-31",
        "x1": 12.7,
        "y1": -3,
        "x2": 4.7,
        "y2": -2.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-32",
        "x1": 4.7,
        "y1": -2.9,
        "x2": 4,
        "y2": -2.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-33",
        "x1": 4,
        "y1": -2.9,
        "x2": 3.8,
        "y2": -2.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-34",
        "x1": 3.8,
        "y1": -2.7,
        "x2": 3.6,
        "y2": -2.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-35",
        "x1": 3.6,
        "y1": -2.7,
        "x2": 3.5,
        "y2": -2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-36",
        "x1": 3.5,
        "y1": -2.6,
        "x2": 2.2,
        "y2": -2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-37",
        "x1": 2.2,
        "y1": -2.6,
        "x2": 2.1,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-38",
        "x1": 2.1,
        "y1": -2.5,
        "x2": -10.7,
        "y2": -2.5,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-39",
        "x1": -10.7,
        "y1": -2.5,
        "x2": -10.8,
        "y2": -2.6,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-40",
        "x1": -10.8,
        "y1": -2.6,
        "x2": -11,
        "y2": -2.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-41",
        "x1": -11,
        "y1": -2.8,
        "x2": -11,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-42",
        "x1": 17.5,
        "y1": 1,
        "x2": 16.5,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-43",
        "x1": 16.5,
        "y1": 1,
        "x2": 16.4,
        "y2": 0.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-44",
        "x1": 16.4,
        "y1": 0.9,
        "x2": 16.2,
        "y2": 0.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-45",
        "x1": 16.2,
        "y1": 0.9,
        "x2": 16.1,
        "y2": 0.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-46",
        "x1": 16.1,
        "y1": 0.8,
        "x2": 14.2,
        "y2": 0.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-47",
        "x1": 14.2,
        "y1": 0.8,
        "x2": 14.1,
        "y2": 0.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-48",
        "x1": 14.1,
        "y1": 0.7,
        "x2": 14,
        "y2": 0.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-49",
        "x1": 14,
        "y1": 0.7,
        "x2": 13.9,
        "y2": 0.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-50",
        "x1": 13.9,
        "y1": 0.6,
        "x2": 13.8,
        "y2": 0.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-51",
        "x1": 13.8,
        "y1": 0.6,
        "x2": 13.7,
        "y2": 0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-52",
        "x1": 13.7,
        "y1": 0.5,
        "x2": 13.5,
        "y2": 0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-53",
        "x1": 13.5,
        "y1": 0.5,
        "x2": 13.4,
        "y2": 0.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-54",
        "x1": 13.4,
        "y1": 0.4,
        "x2": 4.5,
        "y2": 0.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-55",
        "x1": 4.5,
        "y1": 0.4,
        "x2": 4,
        "y2": 0.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-56",
        "x1": 4,
        "y1": 0.9,
        "x2": 3.9,
        "y2": 0.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-57",
        "x1": 3.9,
        "y1": 0.9,
        "x2": 3.8,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-58",
        "x1": 3.8,
        "y1": 1,
        "x2": 3.5,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-59",
        "x1": 15.2,
        "y1": 2.5,
        "x2": 13.8,
        "y2": 1.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-60",
        "x1": 13.8,
        "y1": 1.1,
        "x2": 13.7,
        "y2": 1.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-61",
        "x1": 13.7,
        "y1": 1.1,
        "x2": 13.6,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-62",
        "x1": 13.6,
        "y1": 1,
        "x2": 13.5,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-63",
        "x1": 13.5,
        "y1": 1,
        "x2": 13.4,
        "y2": 0.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-64",
        "x1": 13.4,
        "y1": 0.9,
        "x2": 13.2,
        "y2": 0.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-65",
        "x1": 13.2,
        "y1": 0.9,
        "x2": 13.1,
        "y2": 0.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-66",
        "x1": 13.1,
        "y1": 0.8,
        "x2": 7.7,
        "y2": 0.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-67",
        "x1": 7.7,
        "y1": 0.8,
        "x2": 5.8,
        "y2": 2.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-68",
        "x1": 5.8,
        "y1": 2.7,
        "x2": 5.6,
        "y2": 2.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-69",
        "x1": 5.6,
        "y1": 2.7,
        "x2": 5.5,
        "y2": 2.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-70",
        "x1": 5.5,
        "y1": 2.8,
        "x2": 3.7,
        "y2": 2.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-71",
        "x1": 3.7,
        "y1": 2.8,
        "x2": 3.5,
        "y2": 2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-72",
        "x1": -9.625,
        "y1": -1.905,
        "x2": -9.625,
        "y2": -1.905,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-73",
        "x1": -9.3,
        "y1": -1.8,
        "x2": -8.6,
        "y2": -1.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-74",
        "x1": -8.6,
        "y1": -1.8,
        "x2": -8.2,
        "y2": -1.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-75",
        "x1": -8.2,
        "y1": -1.4,
        "x2": -6.1,
        "y2": -1.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-76",
        "x1": -6.1,
        "y1": -1.4,
        "x2": -5.7,
        "y2": -1.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-77",
        "x1": -5.7,
        "y1": -1.8,
        "x2": -5.6,
        "y2": -1.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-78",
        "x1": -5.6,
        "y1": -1.8,
        "x2": -5.5,
        "y2": -1.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-79",
        "x1": -5.341,
        "y1": -2.025,
        "x2": -5.341,
        "y2": -2.025,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-80",
        "x1": -5.1,
        "y1": -1.9,
        "x2": -4.4,
        "y2": -1.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-81",
        "x1": -4.4,
        "y1": -1.2,
        "x2": -4.4,
        "y2": -1.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-82",
        "x1": -4.4,
        "y1": -1.1,
        "x2": -4.3,
        "y2": -1.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-83",
        "x1": -4.3,
        "y1": -1.2,
        "x2": -4.1,
        "y2": -1.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-84",
        "x1": -4.1,
        "y1": -1.2,
        "x2": -4,
        "y2": -1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-85",
        "x1": -4,
        "y1": -1.3,
        "x2": -3.9,
        "y2": -1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-86",
        "x1": -3.9,
        "y1": -1.3,
        "x2": -3.8,
        "y2": -1.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-87",
        "x1": -3.8,
        "y1": -1.4,
        "x2": -3.5,
        "y2": -1.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "ref-t-88",
        "x1": -9.3,
        "y1": 0.6,
        "x2": -3.5,
        "y2": 0.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "QSPI_SCLK"
      },
      {
        "id": "ref-t-89",
        "x1": -7.9,
        "y1": 4.7,
        "x2": -7.7,
        "y2": 4.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-90",
        "x1": -7.7,
        "y1": 4.5,
        "x2": -7.7,
        "y2": 4.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-91",
        "x1": -7.7,
        "y1": 4.4,
        "x2": -7,
        "y2": 3.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-92",
        "x1": -7,
        "y1": 3.7,
        "x2": -7,
        "y2": 3.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-93",
        "x1": -7,
        "y1": 3.6,
        "x2": -6.4,
        "y2": 3.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-94",
        "x1": -6.4,
        "y1": 3.6,
        "x2": -5.375,
        "y2": 3.903,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-95",
        "x1": -5.2,
        "y1": 3.6,
        "x2": -5,
        "y2": 3.8,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-96",
        "x1": -5,
        "y1": 3.8,
        "x2": -2.9,
        "y2": 3.8,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-97",
        "x1": -2.9,
        "y1": 3.8,
        "x2": -2.5,
        "y2": 4.2,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-98",
        "x1": -2.5,
        "y1": 4.2,
        "x2": -2.5,
        "y2": 3.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-99",
        "x1": -2.5,
        "y1": 3.9,
        "x2": -2.6,
        "y2": 3.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-100",
        "x1": -2.6,
        "y1": 3.8,
        "x2": -2.6,
        "y2": 3.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "ref-t-101",
        "x1": -5.4,
        "y1": 5,
        "x2": -4.7,
        "y2": 5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-102",
        "x1": -4.7,
        "y1": 5,
        "x2": -4.5,
        "y2": 4.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-103",
        "x1": -4.5,
        "y1": 4.8,
        "x2": -3.1,
        "y2": 4.8,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-104",
        "x1": -3.1,
        "y1": 4.8,
        "x2": -3,
        "y2": 4.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-105",
        "x1": -3,
        "y1": 4.7,
        "x2": -3.2,
        "y2": 4.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-106",
        "x1": -3.2,
        "y1": 4.5,
        "x2": -3.2,
        "y2": 4.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-107",
        "x1": -3.2,
        "y1": 4.4,
        "x2": -3.3,
        "y2": 4.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-108",
        "x1": -3.3,
        "y1": 4.3,
        "x2": -3.3,
        "y2": 3.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-109",
        "x1": -3.3,
        "y1": 3.9,
        "x2": -3.4,
        "y2": 3.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-110",
        "x1": -3.4,
        "y1": 3.8,
        "x2": -3.4,
        "y2": 2.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-111",
        "x1": -3.4,
        "y1": 2.7,
        "x2": -3.5,
        "y2": 2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XOUT"
      },
      {
        "id": "ref-t-112",
        "x1": 3.5,
        "y1": -7,
        "x2": 6.3,
        "y2": -7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "GPIO25"
      },
      {
        "id": "ref-t-113",
        "x1": 7.7,
        "y1": -7,
        "x2": 8.6,
        "y2": -7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LED_A"
      },
      {
        "id": "ref-t-114",
        "x1": -19,
        "y1": -3.5,
        "x2": -19.2,
        "y2": -3.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-115",
        "x1": -19.2,
        "y1": -3.3,
        "x2": -19.2,
        "y2": -3.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-116",
        "x1": -19.2,
        "y1": -3.2,
        "x2": -19.3,
        "y2": -3.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-117",
        "x1": -19.3,
        "y1": -3.1,
        "x2": -19.3,
        "y2": -2.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-118",
        "x1": -19.3,
        "y1": -2.9,
        "x2": -19.4,
        "y2": -2.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-119",
        "x1": -19.4,
        "y1": -2.8,
        "x2": -19.4,
        "y2": 6.3,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-120",
        "x1": -19.4,
        "y1": 6.3,
        "x2": -19.5,
        "y2": 6.4,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-121",
        "x1": -19,
        "y1": 6.7,
        "x2": -18.8,
        "y2": 6.5,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-122",
        "x1": -18.8,
        "y1": 6.5,
        "x2": -18.7,
        "y2": 6.5,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-123",
        "x1": -18.7,
        "y1": 6.5,
        "x2": -18.6,
        "y2": 6.4,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-124",
        "x1": -18.6,
        "y1": 6.4,
        "x2": -18.4,
        "y2": 6.4,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-125",
        "x1": -18.4,
        "y1": 6.4,
        "x2": -18.2,
        "y2": 6.2,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-126",
        "x1": -18.2,
        "y1": 6.2,
        "x2": -17.8,
        "y2": 6.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-127",
        "x1": -17.8,
        "y1": 6.6,
        "x2": -17.6,
        "y2": 6.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-128",
        "x1": -17.6,
        "y1": 6.6,
        "x2": -17.5,
        "y2": 6.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-129",
        "x1": -16.5,
        "y1": 6.7,
        "x2": -16.3,
        "y2": 6.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-130",
        "x1": -16.3,
        "y1": 6.5,
        "x2": -16.2,
        "y2": 6.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-131",
        "x1": -16.2,
        "y1": 6.5,
        "x2": -16.1,
        "y2": 6.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-132",
        "x1": -16.1,
        "y1": 6.4,
        "x2": -15.9,
        "y2": 6.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-133",
        "x1": -15.9,
        "y1": 6.4,
        "x2": -15.7,
        "y2": 6.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-134",
        "x1": -15.7,
        "y1": 6.2,
        "x2": -15.3,
        "y2": 6.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-135",
        "x1": -15.3,
        "y1": 6.2,
        "x2": -15.2,
        "y2": 6.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-136",
        "x1": -15.2,
        "y1": 6.1,
        "x2": -13.1,
        "y2": 6.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-137",
        "x1": -13.1,
        "y1": 6.1,
        "x2": -13,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BOOTSEL"
      },
      {
        "id": "ref-t-138",
        "x1": 21.1,
        "y1": -1.6,
        "x2": 21.1,
        "y2": -1.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-139",
        "x1": 19.5,
        "y1": -1.6,
        "x2": 19.5,
        "y2": -1.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-140",
        "x1": 23.6,
        "y1": 8.1,
        "x2": 23.6,
        "y2": 2.8,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-141",
        "x1": 23.6,
        "y1": 2.8,
        "x2": 23.6,
        "y2": -8.1,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-142",
        "x1": -5.3,
        "y1": 3.6,
        "x2": -5.375,
        "y2": 3.903,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XIN"
      },
      {
        "id": "gap-143",
        "x1": -5.341,
        "y1": -2.025,
        "x2": -5.5,
        "y2": -1.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "gap-144",
        "x1": -5.340999999999999,
        "y1": -2.025,
        "x2": -5.1,
        "y2": -1.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "QSPI_SD0"
      },
      {
        "id": "gap-145",
        "x1": 12.7,
        "y1": -3,
        "x2": 12.7,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      }
    ],
    "vias": [
      {
        "x": 0,
        "y": 8.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": 2.1,
        "y": -2.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -10.8,
        "y": -2.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -6.1,
        "y": -1.4,
        "od": 0.6,
        "drill": 0.3,
        "net": "QSPI_SD0"
      },
      {
        "x": -4.4,
        "y": -1.1,
        "od": 0.6,
        "drill": 0.3,
        "net": "QSPI_SD0"
      },
      {
        "x": -6.4,
        "y": 3.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "XIN"
      },
      {
        "x": -2.5,
        "y": 4.2,
        "od": 0.6,
        "drill": 0.3,
        "net": "XIN"
      },
      {
        "x": -4.5,
        "y": 4.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "XOUT"
      },
      {
        "x": -3.2,
        "y": 4.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "XOUT"
      },
      {
        "x": -19.3,
        "y": -2.9,
        "od": 0.6,
        "drill": 0.3,
        "net": "BOOTSEL"
      },
      {
        "x": -18.2,
        "y": 6.2,
        "od": 0.6,
        "drill": 0.3,
        "net": "BOOTSEL"
      },
      {
        "x": 23.6,
        "y": 2.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": 23.6,
        "y": -8.1,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": -5.375,
        "y": 3.903,
        "od": 0.7,
        "drill": 0.3,
        "net": "XIN"
      },
      {
        "x": -5.341,
        "y": -2.025,
        "od": 0.5,
        "drill": 0.2,
        "net": "QSPI_SD0"
      }
    ],
    "padNets": {
      "U1": {
        "3": "QSPI_SD0",
        "4": "QSPI_SD0",
        "5": "QSPI_SD0",
        "6": "QSPI_SD1",
        "7": "QSPI_SD1",
        "8": "QSPI_SCLK",
        "9": "QSPI_SCLK",
        "10": "QSPI_SCLK",
        "11": "QSPI_CS",
        "12": "QSPI_CS",
        "13": "XOUT",
        "14": "XOUT",
        "15": "XIN",
        "16": "XIN",
        "29": "USB_DM",
        "30": "USB_DM",
        "31": "USB_DM",
        "32": "USB_DP",
        "33": "USB_DP",
        "34": "USB_DP",
        "39": "3V3",
        "41": "3V3",
        "42": "3V3"
      },
      "U2": {
        "6": "QSPI_SCLK",
        "7": "QSPI_SD1",
        "8": "QSPI_SD0"
      },
      "U3": {
        "1": "3V3",
        "2": "3V3",
        "8": "VBUS"
      },
      "L1": {
        "2": "USB_DM"
      },
      "Y1": {
        "3": "XOUT",
        "4": "XIN"
      },
      "C2": {
        "1": "XIN"
      },
      "C3": {
        "1": "QSPI_SD0"
      },
      "R1": {
        "1": "GPIO25",
        "2": "LED_A"
      },
      "LED1": {
        "1": "LED_A"
      },
      "J1": {
        "A4": "VBUS",
        "A5": "VBUS",
        "A6": "VBUS",
        "S1": "VBUS",
        "S3": "USB_DM"
      },
      "TP1": {
        "1": "GND"
      },
      "TP2": {
        "1": "BOOTSEL"
      },
      "TP3": {
        "1": "BOOTSEL"
      }
    }
  },
  {
    "id": "arduino-uno-r3",
    "status": { "unrouted": 8, "zeroLen": 0, "measured": "2026-09-02" },
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
        "x": -11.595,
        "y": -8,
        "w": 1,
        "h": 0.6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "C2",
        "part": "22pF",
        "x": -6.405,
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
        "x": 19.839,
        "y": 15.908,
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
        "x": 27.08,
        "y": 20.046,
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
        "id": "ref-t-0",
        "x1": 23,
        "y1": 19.6,
        "x2": 22.6,
        "y2": 19.2,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-1",
        "x1": 22.6,
        "y1": 19.2,
        "x2": 22.5,
        "y2": 19.2,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-2",
        "x1": 22.139,
        "y1": 18.808,
        "x2": 22.139,
        "y2": 18.808,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-3",
        "x1": 22.139,
        "y1": 18.808,
        "x2": 22.139,
        "y2": 18.808,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-4",
        "x1": 22.139,
        "y1": 18.808,
        "x2": 22.139,
        "y2": 18.808,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-5",
        "x1": 22.139,
        "y1": 18.808,
        "x2": 22.139,
        "y2": 18.808,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-6",
        "x1": 22.139,
        "y1": 18.808,
        "x2": 22.139,
        "y2": 18.808,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-7",
        "x1": 22.139,
        "y1": 18.808,
        "x2": 22.139,
        "y2": 18.808,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-8",
        "x1": 21.6,
        "y1": 18.8,
        "x2": 20.4,
        "y2": 18.8,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-9",
        "x1": 19.6,
        "y1": 18.3,
        "x2": 19.6,
        "y2": 16.1,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-10",
        "x1": 19.6,
        "y1": 16.1,
        "x2": 19.5,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-11",
        "x1": 19.5,
        "y1": 16,
        "x2": 16.7,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-12",
        "x1": 22.139,
        "y1": 18.808,
        "x2": 22.139,
        "y2": 18.808,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN"
      },
      {
        "id": "ref-t-13",
        "x1": 0,
        "y1": -23.2,
        "x2": 0,
        "y2": 25,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-14",
        "x1": 11.2,
        "y1": 16,
        "x2": 5,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-15",
        "x1": 5,
        "y1": 16,
        "x2": 5,
        "y2": 15.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-16",
        "x1": 5,
        "y1": 15.6,
        "x2": 5,
        "y2": 15.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-17",
        "x1": 5,
        "y1": 15.4,
        "x2": 5,
        "y2": 14.4,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-18",
        "x1": 4.95,
        "y1": 14,
        "x2": 4.95,
        "y2": 14,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-19",
        "x1": 4.5,
        "y1": 14,
        "x2": 3.3,
        "y2": 14,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-20",
        "x1": 3,
        "y1": 13.6,
        "x2": 3,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-21",
        "x1": 1.9,
        "y1": 4.1,
        "x2": 3.4,
        "y2": 2.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-22",
        "x1": 3.4,
        "y1": 2.6,
        "x2": 3.4,
        "y2": 2.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-23",
        "x1": 18.5,
        "y1": 17,
        "x2": 17.2,
        "y2": 17,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-24",
        "x1": 17.2,
        "y1": 17,
        "x2": 16.8,
        "y2": 17.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-25",
        "x1": 16.8,
        "y1": 17.4,
        "x2": 16.6,
        "y2": 17.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-26",
        "x1": 16.6,
        "y1": 17.4,
        "x2": 16.5,
        "y2": 17.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-27",
        "x1": 16.5,
        "y1": 17.5,
        "x2": 14.9,
        "y2": 17.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-28",
        "x1": 14.9,
        "y1": 17.5,
        "x2": 14.5,
        "y2": 17.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-29",
        "x1": 14.5,
        "y1": 17.1,
        "x2": 9.4,
        "y2": 17.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-30",
        "x1": 9.4,
        "y1": 17.1,
        "x2": 8.8,
        "y2": 17.1,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-31",
        "x1": 8.8,
        "y1": 17.1,
        "x2": 8.7,
        "y2": 17,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-32",
        "x1": 8.48,
        "y1": 17,
        "x2": 8.48,
        "y2": 17,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-33",
        "x1": 8.3,
        "y1": 17.2,
        "x2": 7.6,
        "y2": 17.2,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-34",
        "x1": 7.6,
        "y1": 17.2,
        "x2": 7.2,
        "y2": 17.6,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-35",
        "x1": 7.2,
        "y1": 17.6,
        "x2": 1.2,
        "y2": 17.6,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-36",
        "x1": 1.2,
        "y1": 17.6,
        "x2": 1,
        "y2": 17.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-37",
        "x1": 1,
        "y1": 17.6,
        "x2": 0.9,
        "y2": 17.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-38",
        "x1": 0.9,
        "y1": 17.7,
        "x2": -13.3,
        "y2": 17.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-39",
        "x1": -13.3,
        "y1": 17.7,
        "x2": -14,
        "y2": 17,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-40",
        "x1": -28.2,
        "y1": 16.5,
        "x2": -25.8,
        "y2": 16.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-41",
        "x1": -25.2,
        "y1": 15.7,
        "x2": -25.25,
        "y2": 12.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-42",
        "x1": -9.9,
        "y1": -6.7,
        "x2": -9.7,
        "y2": -6.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-43",
        "x1": -9.7,
        "y1": -6.5,
        "x2": -9.7,
        "y2": -6.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-44",
        "x1": -9.7,
        "y1": -6.4,
        "x2": -9.6,
        "y2": -6.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-45",
        "x1": -9.6,
        "y1": -6.3,
        "x2": -9.6,
        "y2": -6.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-46",
        "x1": -9.6,
        "y1": -6.1,
        "x2": -9.2,
        "y2": -5.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-47",
        "x1": -9.2,
        "y1": -5.7,
        "x2": -9.2,
        "y2": -5.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-48",
        "x1": -9.2,
        "y1": -5.6,
        "x2": -9.1,
        "y2": -5.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-49",
        "x1": -9.1,
        "y1": -5.5,
        "x2": -9.1,
        "y2": -4.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-50",
        "x1": -9.1,
        "y1": -4.1,
        "x2": -9,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL1"
      },
      {
        "id": "ref-t-51",
        "x1": -6.5,
        "y1": -6.8,
        "x2": -6.5,
        "y2": -5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "XTAL2"
      },
      {
        "id": "ref-t-52",
        "x1": -2,
        "y1": -6.5,
        "x2": -2,
        "y2": -23.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "D2"
      },
      {
        "id": "ref-t-53",
        "x1": -2,
        "y1": -23.2,
        "x2": -2.1,
        "y2": -23.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "D2"
      },
      {
        "id": "ref-t-54",
        "x1": -2.54,
        "y1": -24,
        "x2": -2.54,
        "y2": -24,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "D2"
      },
      {
        "id": "ref-t-55",
        "x1": 3.05,
        "y1": 14,
        "x2": 3.05,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-56",
        "x1": 11.3,
        "y1": 16.3,
        "x2": 11.1,
        "y2": 16.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-57",
        "x1": 11.1,
        "y1": 16.5,
        "x2": 11,
        "y2": 16.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-58",
        "x1": 11,
        "y1": 16.5,
        "x2": 10.9,
        "y2": 16.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-59",
        "x1": 10.9,
        "y1": 16.6,
        "x2": 10.7,
        "y2": 16.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-60",
        "x1": 10.7,
        "y1": 16.6,
        "x2": 9.9,
        "y2": 17.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-61",
        "x1": 9.9,
        "y1": 17.4,
        "x2": 9.7,
        "y2": 17.2,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-62",
        "x1": 9.7,
        "y1": 17.2,
        "x2": 9.6,
        "y2": 17.2,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-63",
        "x1": 9.6,
        "y1": 17.2,
        "x2": 9.5,
        "y2": 17.1,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-64",
        "x1": 9.5,
        "y1": 17.1,
        "x2": 8.7,
        "y2": 17.1,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-65",
        "x1": 8.48,
        "y1": 17,
        "x2": 8.48,
        "y2": 17,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-66",
        "x1": 1.9,
        "y1": 4.1,
        "x2": 1.9,
        "y2": 9.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-67",
        "x1": 1.9,
        "y1": 9.9,
        "x2": 3,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-68",
        "x1": 5,
        "y1": 14,
        "x2": 4.95,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "ref-t-69",
        "x1": 7.5,
        "y1": 17,
        "x2": 7.52,
        "y2": 17,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "gap-70",
        "x1": 4.5,
        "y1": 14,
        "x2": 4.95,
        "y2": 14,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      },
      {
        "id": "gap-71",
        "x1": 5,
        "y1": 14,
        "x2": 5,
        "y2": 14.4,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "5V"
      }
    ],
    "vias": [
      {
        "x": 5,
        "y": 15.4,
        "od": 0.6,
        "drill": 0.3,
        "net": "5V"
      },
      {
        "x": 3.3,
        "y": 14,
        "od": 0.6,
        "drill": 0.3,
        "net": "5V"
      },
      {
        "x": 9.4,
        "y": 17.1,
        "od": 0.6,
        "drill": 0.3,
        "net": "5V"
      },
      {
        "x": 1.2,
        "y": 17.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "5V"
      },
      {
        "x": 9.9,
        "y": 17.4,
        "od": 0.6,
        "drill": 0.3,
        "net": "5V"
      },
      {
        "x": 4.95,
        "y": 14,
        "od": 0.7,
        "drill": 0.3,
        "net": "5V"
      },
      {
        "x": 8.48,
        "y": 17,
        "od": 0.7,
        "drill": 0.3,
        "net": "5V"
      }
    ],
    "padNets": {
      "U1": {
        "1": "XTAL2",
        "2": "XTAL1",
        "3": "XTAL2",
        "4": "XTAL2",
        "13": "5V",
        "14": "5V",
        "15": "5V",
        "28": "D3",
        "29": "D3"
      },
      "Y1": {
        "1": "XTAL1"
      },
      "U2": {
        "9": "USB_DP",
        "10": "USB_DP",
        "11": "USB_DP",
        "22": "TXD",
        "23": "TXD",
        "24": "RXD"
      },
      "U3": {
        "2": "VIN",
        "3": "VIN"
      },
      "D1": {
        "1": "5V",
        "2": "VIN"
      },
      "J1": {
        "2": "USB_DP",
        "3": "USB_DP",
        "4": "USB_DP"
      },
      "J2": {
        "1": "VIN"
      },
      "HDR1": {
        "9": "D2",
        "10": "GND",
        "11": "D3"
      },
      "LED2": {
        "1": "5V",
        "2": "5V"
      },
      "R3": {
        "1": "5V",
        "2": "5V"
      }
    }
  },
  {
    "id": "esp32-poe2",
    "status": { "unrouted": 5, "zeroLen": 0, "measured": "2026-09-02" },
    "name": "Olimex ESP32-POE2",
    "soc": "ESP32 (Wi-Fi/BT)",
    "layers": 4,
    "w": 84,
    "h": 32,
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
        "x": -14.544,
        "y": -2.75,
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
        "x": 31.943,
        "y": 0.457,
        "w": 12,
        "h": 13,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "T1",
        "part": "PoE isolation transformer",
        "x": -7.676,
        "y": 13.096,
        "w": 8,
        "h": 6,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "U3",
        "part": "PoE PD 控制器（隔離 flyback）",
        "x": -23.677,
        "y": 11.074,
        "w": 5,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "Q1",
        "part": "Flyback FET",
        "x": -13.235,
        "y": 13.494,
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
        "x": -1.784,
        "y": 7.356,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "J2",
        "part": "USB-C (prog/power)",
        "x": -34.784,
        "y": 0.379,
        "w": 8,
        "h": 7,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "U5",
        "part": "USB-UART 橋接",
        "x": -29.432,
        "y": -6.758,
        "w": 4,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J3",
        "part": "microSD",
        "x": 33.057,
        "y": -8.457,
        "w": 10,
        "h": 8,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J4",
        "part": "UEXT connector",
        "x": 2.308,
        "y": 12.001,
        "w": 10,
        "h": 2,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J5",
        "part": "Battery JST-PH2",
        "x": -35.677,
        "y": 9.516,
        "w": 4,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW1",
        "part": "Reset button",
        "x": 24.879,
        "y": -9,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "SW2",
        "part": "Boot button",
        "x": 19.121,
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
        "id": "ref-t-0",
        "x1": -37,
        "y1": 0,
        "x2": 37,
        "y2": 0,
        "layer": "In2.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-1",
        "x1": 22,
        "y1": -3.5,
        "x2": 22,
        "y2": -1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-2",
        "x1": 22,
        "y1": -1,
        "x2": 22,
        "y2": -1.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-3",
        "x1": 22,
        "y1": -1.8,
        "x2": 22.1,
        "y2": -1.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-4",
        "x1": 22.1,
        "y1": -1.9,
        "x2": 22.1,
        "y2": -2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-5",
        "x1": 22.1,
        "y1": -2,
        "x2": 22.2,
        "y2": -2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-6",
        "x1": 22.2,
        "y1": -2,
        "x2": 22.3,
        "y2": -2.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-7",
        "x1": 22.3,
        "y1": -2.1,
        "x2": 23,
        "y2": -2.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-8",
        "x1": 23,
        "y1": -2.1,
        "x2": 23.8,
        "y2": -1.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-9",
        "x1": 23.8,
        "y1": -1.3,
        "x2": 25.7,
        "y2": -1.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-10",
        "x1": 25.7,
        "y1": -1.3,
        "x2": 26,
        "y2": -1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-11",
        "x1": 21,
        "y1": -2.5,
        "x2": 21,
        "y2": 0,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-12",
        "x1": 21,
        "y1": 0,
        "x2": 21.3,
        "y2": -0.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-13",
        "x1": 21.3,
        "y1": -0.3,
        "x2": 21.3,
        "y2": -0.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-14",
        "x1": 21.3,
        "y1": -0.6,
        "x2": 21.4,
        "y2": -0.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-15",
        "x1": 21.4,
        "y1": -0.7,
        "x2": 21.8,
        "y2": -0.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-16",
        "x1": 21.8,
        "y1": -0.3,
        "x2": 25.7,
        "y2": -0.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-17",
        "x1": 25.7,
        "y1": -0.3,
        "x2": 26,
        "y2": 0,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-18",
        "x1": -5.894,
        "y1": -1.385,
        "x2": -5.894,
        "y2": -1.385,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-19",
        "x1": -5.894,
        "y1": -1.385,
        "x2": -5.894,
        "y2": -1.385,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-20",
        "x1": -5.5,
        "y1": -1.2,
        "x2": -4.8,
        "y2": -1.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-21",
        "x1": -4.8,
        "y1": -1.2,
        "x2": -4.6,
        "y2": -1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-22",
        "x1": -4.6,
        "y1": -1,
        "x2": -3.2,
        "y2": -1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-23",
        "x1": -3.2,
        "y1": -1,
        "x2": -3,
        "y2": -0.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-24",
        "x1": -3,
        "y1": -0.8,
        "x2": 2.6,
        "y2": -0.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-25",
        "x1": 2.6,
        "y1": -0.8,
        "x2": 2.8,
        "y2": -0.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-26",
        "x1": 2.8,
        "y1": -0.6,
        "x2": 2.9,
        "y2": -0.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-27",
        "x1": 2.9,
        "y1": -0.6,
        "x2": 3,
        "y2": -0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-28",
        "x1": 3,
        "y1": -0.5,
        "x2": 4.25,
        "y2": -0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-29",
        "x1": 4.25,
        "y1": -0.5,
        "x2": 4.25,
        "y2": -0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-30",
        "x1": 26.943,
        "y1": 3.957,
        "x2": 26.943,
        "y2": 3.957,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-31",
        "x1": 26.943,
        "y1": 3.957,
        "x2": 26.943,
        "y2": 3.957,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-32",
        "x1": 25.7,
        "y1": 4.3,
        "x2": 25.5,
        "y2": 4.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-33",
        "x1": 25.5,
        "y1": 4.5,
        "x2": 25.4,
        "y2": 4.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-34",
        "x1": 25.4,
        "y1": 4.5,
        "x2": 25.3,
        "y2": 4.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-35",
        "x1": 25.3,
        "y1": 4.6,
        "x2": 24.4,
        "y2": 4.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-36",
        "x1": 24.4,
        "y1": 4.6,
        "x2": 24.3,
        "y2": 4.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-37",
        "x1": 24.3,
        "y1": 4.7,
        "x2": 20.5,
        "y2": 4.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-38",
        "x1": 20.5,
        "y1": 4.7,
        "x2": 19.1,
        "y2": 4.7,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-39",
        "x1": 19.1,
        "y1": 4.7,
        "x2": 19.3,
        "y2": 4.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-40",
        "x1": 19.3,
        "y1": 4.7,
        "x2": 19,
        "y2": 5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-41",
        "x1": 19,
        "y1": 5,
        "x2": 19,
        "y2": 11,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-42",
        "x1": 19,
        "y1": 11,
        "x2": 18.8,
        "y2": 11.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-43",
        "x1": 18.8,
        "y1": 11.2,
        "x2": 18.7,
        "y2": 11.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-44",
        "x1": 18.7,
        "y1": 11.2,
        "x2": 18.6,
        "y2": 11.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-45",
        "x1": 18.6,
        "y1": 11.3,
        "x2": 18.4,
        "y2": 11.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-46",
        "x1": 18.4,
        "y1": 11.3,
        "x2": 18,
        "y2": 11.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-47",
        "x1": 18,
        "y1": 11.7,
        "x2": 17.9,
        "y2": 11.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-48",
        "x1": 17.9,
        "y1": 11.7,
        "x2": 17.8,
        "y2": 11.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-49",
        "x1": 17.8,
        "y1": 11.8,
        "x2": 17.7,
        "y2": 11.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-50",
        "x1": 17.7,
        "y1": 11.8,
        "x2": 16.5,
        "y2": 13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-51",
        "x1": 16.5,
        "y1": 13,
        "x2": 13.5,
        "y2": 13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-52",
        "x1": 13.5,
        "y1": 13,
        "x2": 13.4,
        "y2": 13.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-53",
        "x1": 13.4,
        "y1": 13.1,
        "x2": 9.8,
        "y2": 13.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-54",
        "x1": -21.002,
        "y1": 14.249,
        "x2": -21.002,
        "y2": 14.249,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-55",
        "x1": -21.002,
        "y1": 14.249,
        "x2": -21.002,
        "y2": 14.249,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-56",
        "x1": -21.002,
        "y1": 14.249,
        "x2": -21.002,
        "y2": 14.249,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-57",
        "x1": -21.002,
        "y1": 14.249,
        "x2": -21.002,
        "y2": 14.249,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-58",
        "x1": -20.7,
        "y1": 14.2,
        "x2": -20.3,
        "y2": 14.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-59",
        "x1": -20.3,
        "y1": 14.2,
        "x2": -21,
        "y2": 13.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-60",
        "x1": -21,
        "y1": 13.5,
        "x2": -21,
        "y2": 13.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-61",
        "x1": -21.002,
        "y1": 12.979,
        "x2": -21.002,
        "y2": 12.979,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-62",
        "x1": -21.002,
        "y1": 12.979,
        "x2": -21.002,
        "y2": 12.979,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-63",
        "x1": -21.002,
        "y1": 12.979,
        "x2": -21.002,
        "y2": 12.979,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-64",
        "x1": -21.002,
        "y1": 12.979,
        "x2": -21.002,
        "y2": 12.979,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-65",
        "x1": -21.002,
        "y1": 12.979,
        "x2": -21.002,
        "y2": 12.979,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-66",
        "x1": -21,
        "y1": 12.6,
        "x2": -21,
        "y2": 11.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-67",
        "x1": -21,
        "y1": 11.6,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-68",
        "x1": -21.002,
        "y1": 11.709,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-69",
        "x1": -21.002,
        "y1": 11.709,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-70",
        "x1": -21.002,
        "y1": 11.709,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-71",
        "x1": -21.002,
        "y1": 11.709,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-72",
        "x1": -21.002,
        "y1": 11.709,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-73",
        "x1": -11.2,
        "y1": 12.4,
        "x2": -12,
        "y2": 12.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-74",
        "x1": -12,
        "y1": 12.4,
        "x2": -12.8,
        "y2": 12.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-75",
        "x1": -13.235,
        "y1": 12.394,
        "x2": -13.235,
        "y2": 12.394,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-76",
        "x1": -13.6,
        "y1": 12.2,
        "x2": -13.8,
        "y2": 12,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-77",
        "x1": -13.8,
        "y1": 12,
        "x2": -13.9,
        "y2": 12,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-78",
        "x1": -13.9,
        "y1": 12,
        "x2": -14,
        "y2": 11.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-79",
        "x1": -14,
        "y1": 11.9,
        "x2": -14.2,
        "y2": 11.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-80",
        "x1": -14.2,
        "y1": 11.9,
        "x2": -14.3,
        "y2": 11.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-81",
        "x1": -14.3,
        "y1": 11.8,
        "x2": -20.6,
        "y2": 11.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-82",
        "x1": -20.6,
        "y1": 11.8,
        "x2": -20.7,
        "y2": 11.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-83",
        "x1": -21.002,
        "y1": 11.709,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-84",
        "x1": -21.002,
        "y1": 11.709,
        "x2": -21.002,
        "y2": 11.709,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-85",
        "x1": -0.284,
        "y1": 7.356,
        "x2": -0.284,
        "y2": 7.356,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-86",
        "x1": -0.284,
        "y1": 7.356,
        "x2": -0.284,
        "y2": 7.356,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-87",
        "x1": -0.284,
        "y1": 7.356,
        "x2": -0.284,
        "y2": 7.356,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-88",
        "x1": -0.284,
        "y1": 7.356,
        "x2": -0.284,
        "y2": 7.356,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-89",
        "x1": -0.284,
        "y1": 7.356,
        "x2": -0.284,
        "y2": 7.356,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-90",
        "x1": -0.284,
        "y1": 7.356,
        "x2": -0.284,
        "y2": 7.356,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-91",
        "x1": -0.284,
        "y1": 7.356,
        "x2": -0.284,
        "y2": 7.356,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-92",
        "x1": 0.2,
        "y1": 7.7,
        "x2": 0.4,
        "y2": 7.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-93",
        "x1": 0.4,
        "y1": 7.9,
        "x2": 0.5,
        "y2": 7.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-94",
        "x1": 0.5,
        "y1": 7.9,
        "x2": 0.6,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-95",
        "x1": 0.6,
        "y1": 8,
        "x2": 0.8,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-96",
        "x1": 0.8,
        "y1": 8,
        "x2": 1.2,
        "y2": 8.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-97",
        "x1": 1.2,
        "y1": 8.4,
        "x2": 1.3,
        "y2": 8.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-98",
        "x1": 1.3,
        "y1": 8.4,
        "x2": 1.4,
        "y2": 8.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-99",
        "x1": 1.4,
        "y1": 8.5,
        "x2": 13.8,
        "y2": 8.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-100",
        "x1": 13.8,
        "y1": 8.5,
        "x2": 14.1,
        "y2": 8.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-101",
        "x1": 14.1,
        "y1": 8.8,
        "x2": 14.2,
        "y2": 8.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-102",
        "x1": 14.2,
        "y1": 8.8,
        "x2": 14.3,
        "y2": 8.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-103",
        "x1": 14.3,
        "y1": 8.9,
        "x2": 14.5,
        "y2": 8.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-104",
        "x1": 14.75,
        "y1": 8.95,
        "x2": 14.75,
        "y2": 8.95,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-105",
        "x1": 14.75,
        "y1": 8.95,
        "x2": 14.75,
        "y2": 8.95,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-106",
        "x1": 14.75,
        "y1": 8.95,
        "x2": 14.75,
        "y2": 8.95,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-107",
        "x1": 14.75,
        "y1": 8.95,
        "x2": 14.75,
        "y2": 8.95,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VRECT"
      },
      {
        "id": "ref-t-108",
        "x1": 17.25,
        "y1": 8,
        "x2": 17.25,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-109",
        "x1": 17,
        "y1": 8,
        "x2": 16.3,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-110",
        "x1": 16.3,
        "y1": 8,
        "x2": 15.8,
        "y2": 7.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-111",
        "x1": 15.8,
        "y1": 7.5,
        "x2": 15.7,
        "y2": 7.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-112",
        "x1": 15.7,
        "y1": 7.5,
        "x2": 15.5,
        "y2": 7.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-113",
        "x1": 15.5,
        "y1": 7.3,
        "x2": 15.3,
        "y2": 7.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-114",
        "x1": 15.3,
        "y1": 7.3,
        "x2": 15.2,
        "y2": 7.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-115",
        "x1": 15.2,
        "y1": 7.2,
        "x2": 15.1,
        "y2": 7.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-116",
        "x1": 15.1,
        "y1": 7.2,
        "x2": 15,
        "y2": 7.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-117",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-118",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-119",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-120",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-121",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-122",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-123",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-124",
        "x1": 14.75,
        "y1": 7.05,
        "x2": 14.75,
        "y2": 7.05,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-125",
        "x1": 14.5,
        "y1": 7,
        "x2": 14.3,
        "y2": 6.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-126",
        "x1": 14.3,
        "y1": 6.8,
        "x2": 14.2,
        "y2": 6.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-127",
        "x1": 14.2,
        "y1": 6.8,
        "x2": 14.1,
        "y2": 6.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-128",
        "x1": 14.1,
        "y1": 6.7,
        "x2": 13.9,
        "y2": 6.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-129",
        "x1": 13.9,
        "y1": 6.7,
        "x2": 13.7,
        "y2": 6.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-130",
        "x1": 13.7,
        "y1": 6.5,
        "x2": 13.6,
        "y2": 6.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-131",
        "x1": 13.6,
        "y1": 6.5,
        "x2": 13.3,
        "y2": 6.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-132",
        "x1": 13.3,
        "y1": 6.2,
        "x2": 1.9,
        "y2": 6.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-133",
        "x1": 1.9,
        "y1": 6.2,
        "x2": 1.8,
        "y2": 6.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-134",
        "x1": 1.8,
        "y1": 6.2,
        "x2": 1.6,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-135",
        "x1": 1.6,
        "y1": 6,
        "x2": 1.2,
        "y2": 5.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-136",
        "x1": 1.2,
        "y1": 5.6,
        "x2": 1.1,
        "y2": 5.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-137",
        "x1": 1.1,
        "y1": 5.6,
        "x2": 0.9,
        "y2": 5.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-138",
        "x1": 0.9,
        "y1": 5.4,
        "x2": 0.8,
        "y2": 5.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-139",
        "x1": 0.8,
        "y1": 5.4,
        "x2": 0.7,
        "y2": 5.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-140",
        "x1": 0.7,
        "y1": 5.3,
        "x2": 0.6,
        "y2": 5.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-141",
        "x1": 0.6,
        "y1": 5.3,
        "x2": 0.5,
        "y2": 5.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-142",
        "x1": 0.5,
        "y1": 5.2,
        "x2": 0.1,
        "y2": 5.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-143",
        "x1": 0.1,
        "y1": 5.2,
        "x2": 0,
        "y2": 5.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-144",
        "x1": 0,
        "y1": 5.1,
        "x2": -4.3,
        "y2": 5.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-145",
        "x1": -4.3,
        "y1": 5.1,
        "x2": -5.3,
        "y2": 6.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-146",
        "x1": -5.3,
        "y1": 6.1,
        "x2": -5.5,
        "y2": 6.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-147",
        "x1": -5.894,
        "y1": 6.235,
        "x2": -5.894,
        "y2": 6.235,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-148",
        "x1": -5.894,
        "y1": 6.235,
        "x2": -5.894,
        "y2": 6.235,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-149",
        "x1": -5.894,
        "y1": 6.235,
        "x2": -5.894,
        "y2": 6.235,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-150",
        "x1": -6.3,
        "y1": 6.2,
        "x2": -6.5,
        "y2": 6.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-151",
        "x1": -6.5,
        "y1": 6.2,
        "x2": -5.9,
        "y2": 5.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-152",
        "x1": -5.9,
        "y1": 5.6,
        "x2": -5.9,
        "y2": 5.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-153",
        "x1": -5.894,
        "y1": 4.965,
        "x2": -5.894,
        "y2": 4.965,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-154",
        "x1": -5.894,
        "y1": 4.965,
        "x2": -5.894,
        "y2": 4.965,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-155",
        "x1": -5.894,
        "y1": 4.965,
        "x2": -5.894,
        "y2": 4.965,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-156",
        "x1": -5.894,
        "y1": 4.965,
        "x2": -5.894,
        "y2": 4.965,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-157",
        "x1": -5.7,
        "y1": 4.6,
        "x2": -5.7,
        "y2": 4.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-158",
        "x1": -5.7,
        "y1": 4.1,
        "x2": -5.3,
        "y2": 3.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-159",
        "x1": -5.3,
        "y1": 3.7,
        "x2": -5.5,
        "y2": 3.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-160",
        "x1": -5.894,
        "y1": 3.695,
        "x2": -5.894,
        "y2": 3.695,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-161",
        "x1": -5.894,
        "y1": 3.695,
        "x2": -5.894,
        "y2": 3.695,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-162",
        "x1": -5.894,
        "y1": 3.695,
        "x2": -5.894,
        "y2": 3.695,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-163",
        "x1": -30.5,
        "y1": 0,
        "x2": -29,
        "y2": 0,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-164",
        "x1": -28.9,
        "y1": -3.1,
        "x2": -29,
        "y2": -3.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-165",
        "x1": -29,
        "y1": -3.2,
        "x2": -29,
        "y2": -6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-166",
        "x1": -37,
        "y1": -9,
        "x2": 37,
        "y2": -9,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-167",
        "x1": -14.1,
        "y1": 9.6,
        "x2": -13.7,
        "y2": 9.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-168",
        "x1": -13.274,
        "y1": 9.65,
        "x2": -13.274,
        "y2": 9.65,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-169",
        "x1": -13.1,
        "y1": 10,
        "x2": -13.1,
        "y2": 10.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-170",
        "x1": -13.1,
        "y1": 10.7,
        "x2": -12.5,
        "y2": 11.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-171",
        "x1": -12.5,
        "y1": 11.3,
        "x2": -12.7,
        "y2": 11.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-172",
        "x1": -12.7,
        "y1": 11.5,
        "x2": -12.7,
        "y2": 11.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-173",
        "x1": -12.7,
        "y1": 11.6,
        "x2": -12.8,
        "y2": 11.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-174",
        "x1": -12.8,
        "y1": 11.7,
        "x2": -12.8,
        "y2": 11.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-175",
        "x1": -12.8,
        "y1": 11.9,
        "x2": -13,
        "y2": 12.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-176",
        "x1": -13.235,
        "y1": 12.394,
        "x2": -13.235,
        "y2": 12.394,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-177",
        "x1": -10.876,
        "y1": 12.382,
        "x2": -10.876,
        "y2": 12.382,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-178",
        "x1": -21,
        "y1": 11.4,
        "x2": -21,
        "y2": 10.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-179",
        "x1": 17.25,
        "y1": 8,
        "x2": 17.25,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-180",
        "x1": 17.5,
        "y1": 8,
        "x2": 17.7,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-181",
        "x1": 17.7,
        "y1": 8,
        "x2": 19.7,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-182",
        "x1": 19.7,
        "y1": 6,
        "x2": 19.7,
        "y2": 5.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-183",
        "x1": 19.7,
        "y1": 5.9,
        "x2": 19.8,
        "y2": 5.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-184",
        "x1": 19.8,
        "y1": 5.8,
        "x2": 19.8,
        "y2": 2.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-185",
        "x1": 19.8,
        "y1": 2.2,
        "x2": 19.9,
        "y2": 2.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-186",
        "x1": 19.9,
        "y1": 2.1,
        "x2": 22.5,
        "y2": -0.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-187",
        "x1": 22.5,
        "y1": -0.5,
        "x2": 22.5,
        "y2": -0.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-188",
        "x1": 22.5,
        "y1": -0.6,
        "x2": 22.6,
        "y2": -0.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-189",
        "x1": 22.6,
        "y1": -0.7,
        "x2": 22.6,
        "y2": -1.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-190",
        "x1": 22.6,
        "y1": -1.5,
        "x2": 22.7,
        "y2": -1.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-191",
        "x1": 22.7,
        "y1": -1.6,
        "x2": 23.1,
        "y2": -1.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-192",
        "x1": 4.25,
        "y1": -0.5,
        "x2": 4.25,
        "y2": -0.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_CLK"
      },
      {
        "id": "ref-t-193",
        "x1": -5.9,
        "y1": -5.6,
        "x2": -5.9,
        "y2": -6.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "RMII_TXD0"
      },
      {
        "id": "ref-t-194",
        "x1": 9.8,
        "y1": 13.1,
        "x2": 9.6,
        "y2": 13.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-195",
        "x1": 9.6,
        "y1": 13.3,
        "x2": 9.5,
        "y2": 13.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-196",
        "x1": 9.5,
        "y1": 13.3,
        "x2": 8.2,
        "y2": 14.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-197",
        "x1": 8.2,
        "y1": 14.6,
        "x2": 8.1,
        "y2": 14.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-198",
        "x1": 8.1,
        "y1": 14.6,
        "x2": 8,
        "y2": 14.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-199",
        "x1": 8,
        "y1": 14.7,
        "x2": 7.3,
        "y2": 14.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-200",
        "x1": 7.3,
        "y1": 14.7,
        "x2": 7.2,
        "y2": 14.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-201",
        "x1": 7.2,
        "y1": 14.8,
        "x2": -2.1,
        "y2": 14.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-202",
        "x1": -2.1,
        "y1": 14.8,
        "x2": -8.3,
        "y2": 14.8,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-203",
        "x1": -8.3,
        "y1": 14.8,
        "x2": -10.3,
        "y2": 12.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-204",
        "x1": -10.3,
        "y1": 12.8,
        "x2": -10.4,
        "y2": 12.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-205",
        "x1": -10.4,
        "y1": 12.8,
        "x2": -10.6,
        "y2": 12.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "ref-t-206",
        "x1": 23.1,
        "y1": -1.6,
        "x2": 23.4,
        "y2": -1.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-207",
        "x1": 23.4,
        "y1": -1.9,
        "x2": 23.4,
        "y2": -2.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-208",
        "x1": 23.4,
        "y1": -2.2,
        "x2": 23.9,
        "y2": -2.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-209",
        "x1": 23.9,
        "y1": -2.7,
        "x2": 23.9,
        "y2": -2.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-210",
        "x1": 23.9,
        "y1": -2.9,
        "x2": 25.1,
        "y2": -4.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-211",
        "x1": 25.1,
        "y1": -4.1,
        "x2": 25.1,
        "y2": -6.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-212",
        "x1": 25.1,
        "y1": -6.8,
        "x2": 25.4,
        "y2": -7.1,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-213",
        "x1": 25.4,
        "y1": -7.1,
        "x2": 35.1,
        "y2": -7.1,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-214",
        "x1": 35.1,
        "y1": -7.1,
        "x2": 37,
        "y2": -9,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-215",
        "x1": -29,
        "y1": 0,
        "x2": -29,
        "y2": -1.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-216",
        "x1": -29,
        "y1": -1.3,
        "x2": -28.9,
        "y2": -1.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "ref-t-217",
        "x1": -28.9,
        "y1": -1.4,
        "x2": -28.9,
        "y2": -3.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VBUS"
      },
      {
        "id": "gap-218",
        "x1": -12.8,
        "y1": 12.4,
        "x2": -13,
        "y2": 12.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "gap-219",
        "x1": -13.235,
        "y1": 12.394,
        "x2": -13.6,
        "y2": 12.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "VPOE_RAW"
      },
      {
        "id": "gap-220",
        "x1": -5.894,
        "y1": 4.965,
        "x2": -5.7,
        "y2": 4.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "gap-221",
        "x1": -5.894,
        "y1": 4.965,
        "x2": -5.9,
        "y2": 5.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      }
    ],
    "vias": [
      {
        "x": 21.4,
        "y": -0.7,
        "od": 0.6,
        "drill": 0.3,
        "net": "ETH_TXN"
      },
      {
        "x": 20.5,
        "y": 4.7,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": 19.1,
        "y": 4.7,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": 19,
        "y": 11,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": -20.3,
        "y": 14.2,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": -21,
        "y": 11.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": -12,
        "y": 12.4,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": 15.8,
        "y": 7.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": 1.9,
        "y": 6.2,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -6.5,
        "y": 6.2,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -5.3,
        "y": 3.7,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -12.5,
        "y": 11.3,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": 19.9,
        "y": 2.1,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": 22.6,
        "y": -1.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -21.002,
        "y": 12.979,
        "od": 0.7,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": -13.235,
        "y": 12.394,
        "od": 0.7,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": -5.894,
        "y": 4.965,
        "od": 0.7,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": 14.75,
        "y": 7.05,
        "od": 0.7,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -2.1,
        "y": 14.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": -8.3,
        "y": 14.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "VPOE_RAW"
      },
      {
        "x": 25.1,
        "y": -6.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -28.9,
        "y": -3.1,
        "od": 0.6,
        "drill": 0.3,
        "net": "VBUS"
      }
    ],
    "padNets": {
      "U1": {
        "19": "VPOE_RAW",
        "20": "VPOE_RAW",
        "25": "3V3",
        "26": "3V3",
        "27": "3V3",
        "31": "RMII_CLK",
        "32": "RMII_RXD1",
        "33": "RMII_TXD1",
        "34": "RMII_TXD0",
        "35": "RMII_TXD0"
      },
      "U2": {
        "2": "RMII_TXD0",
        "3": "RMII_TXD0",
        "4": "RMII_TXD1",
        "5": "RMII_TXD1",
        "6": "RMII_RXD0",
        "7": "RMII_RXD0",
        "8": "RMII_RXD1",
        "9": "RMII_CLK",
        "10": "RMII_CLK",
        "19": "ETH_TXN",
        "20": "ETH_TXN",
        "21": "ETH_TXP",
        "22": "ETH_TXP"
      },
      "J1": {
        "S1": "VPOE_RAW"
      },
      "T1": {
        "2": "VPOE_RAW"
      },
      "U3": {
        "10": "VPOE_RAW",
        "11": "VPOE_RAW",
        "12": "VPOE_RAW",
        "13": "VPOE_RAW"
      },
      "Q1": {
        "3": "VPOE_RAW"
      },
      "U4": {
        "1": "3V3",
        "3": "VRECT",
        "4": "3V3"
      },
      "L1": {
        "2": "VRECT"
      }
    }
  },
  {
    "id": "a20-lime",
    "status": { "unrouted": 3, "zeroLen": 0, "measured": "2026-09-02" },
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
        "x": -28.34,
        "y": -19.328,
        "w": 5,
        "h": 5,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "J1",
        "part": "RJ45 (Ethernet)",
        "x": -35.83,
        "y": -13.336,
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
        "id": "ref-t-0",
        "x1": -39,
        "y1": 0,
        "x2": 39,
        "y2": 0,
        "layer": "In2.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-1",
        "x1": 8.5,
        "y1": -16,
        "x2": 13,
        "y2": -16,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_D0"
      },
      {
        "id": "ref-t-2",
        "x1": 8.5,
        "y1": -15,
        "x2": 13,
        "y2": -15,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_D1"
      },
      {
        "id": "ref-t-3",
        "x1": 8.5,
        "y1": -14,
        "x2": 13,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_D2"
      },
      {
        "id": "ref-t-4",
        "x1": 8.5,
        "y1": -13,
        "x2": 13,
        "y2": -13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRA_CLK"
      },
      {
        "id": "ref-t-5",
        "x1": 8.5,
        "y1": 10,
        "x2": 13,
        "y2": 10,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_D0"
      },
      {
        "id": "ref-t-6",
        "x1": 8.5,
        "y1": 11,
        "x2": 13,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_D1"
      },
      {
        "id": "ref-t-7",
        "x1": 8.5,
        "y1": 12,
        "x2": 13,
        "y2": 12,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_D2"
      },
      {
        "id": "ref-t-8",
        "x1": 8.5,
        "y1": 13,
        "x2": 13,
        "y2": 13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DDRB_CLK"
      },
      {
        "id": "ref-t-9",
        "x1": -21,
        "y1": 5.9,
        "x2": -17.4,
        "y2": 5.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-10",
        "x1": -16.95,
        "y1": 6,
        "x2": -16.95,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-11",
        "x1": -16.95,
        "y1": 6,
        "x2": -16.95,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-12",
        "x1": -16.95,
        "y1": 6,
        "x2": -16.95,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-13",
        "x1": -16.95,
        "y1": 6,
        "x2": -16.95,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-14",
        "x1": -16.7,
        "y1": 5.6,
        "x2": -16.5,
        "y2": 5.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-15",
        "x1": -16.5,
        "y1": 5.4,
        "x2": -16.5,
        "y2": 5.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-16",
        "x1": -16.5,
        "y1": 5.3,
        "x2": -16.4,
        "y2": 5.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-17",
        "x1": -16.4,
        "y1": 5.2,
        "x2": -16.4,
        "y2": 5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-18",
        "x1": -16.4,
        "y1": 5,
        "x2": -16.2,
        "y2": 4.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-19",
        "x1": -16.2,
        "y1": 4.8,
        "x2": -16.2,
        "y2": 4.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-20",
        "x1": -16.2,
        "y1": 4.4,
        "x2": -16.1,
        "y2": 4.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-21",
        "x1": -16.1,
        "y1": 4.3,
        "x2": -16.1,
        "y2": 2.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-22",
        "x1": -16.1,
        "y1": 2.1,
        "x2": -16,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-23",
        "x1": -16,
        "y1": 2,
        "x2": -8.2,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      },
      {
        "id": "ref-t-24",
        "x1": -28.8,
        "y1": -15.7,
        "x2": -28.8,
        "y2": -15.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-25",
        "x1": -28.8,
        "y1": -15.6,
        "x2": -28.9,
        "y2": -15.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-26",
        "x1": -28.9,
        "y1": -15.5,
        "x2": -28.9,
        "y2": -14.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-27",
        "x1": -28.9,
        "y1": -14.6,
        "x2": -29,
        "y2": -14.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ETH_TXP"
      },
      {
        "id": "ref-t-28",
        "x1": -29.8,
        "y1": -15.7,
        "x2": -29.8,
        "y2": -15.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-29",
        "x1": -29.8,
        "y1": -15.6,
        "x2": -29.9,
        "y2": -15.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-30",
        "x1": -29.9,
        "y1": -15.5,
        "x2": -29.9,
        "y2": -14.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-31",
        "x1": -29.9,
        "y1": -14.6,
        "x2": -30,
        "y2": -14.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "ETH_TXN"
      },
      {
        "id": "ref-t-32",
        "x1": 8.2,
        "y1": -6,
        "x2": 28.5,
        "y2": -6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D2P"
      },
      {
        "id": "ref-t-33",
        "x1": 8.2,
        "y1": -5.2,
        "x2": 28.3,
        "y2": -5.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D2N"
      },
      {
        "id": "ref-t-34",
        "x1": 28.3,
        "y1": -5.2,
        "x2": 28.5,
        "y2": -5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D2N"
      },
      {
        "id": "ref-t-35",
        "x1": 8.2,
        "y1": 6,
        "x2": 14,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-36",
        "x1": 14,
        "y1": 6,
        "x2": 31,
        "y2": 6,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "USB_DP"
      },
      {
        "id": "ref-t-37",
        "x1": 8.5,
        "y1": 7,
        "x2": 31,
        "y2": 7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USB_DM"
      },
      {
        "id": "ref-t-38",
        "x1": -16.95,
        "y1": 6,
        "x2": -16.95,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "DCDC2_3V3"
      }
    ],
    "vias": [
      {
        "x": -28.9,
        "y": -14.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "ETH_TXP"
      },
      {
        "x": -29.9,
        "y": -14.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "ETH_TXN"
      },
      {
        "x": 14,
        "y": 6,
        "od": 0.6,
        "drill": 0.3,
        "net": "USB_DP"
      }
    ],
    "padNets": {
      "U1": {
        "F21": "HDMI_D2P",
        "G21": "HDMI_D2N",
        "T1": "DCDC2_3V3",
        "AA21": "USB_DP"
      },
      "U2": {
        "6": "VBAT",
        "7": "VBAT",
        "34": "DCDC2_3V3",
        "35": "DCDC2_3V3",
        "36": "DCDC2_3V3"
      },
      "U5": {
        "8": "ETH_TXP",
        "10": "ETH_TXN",
        "11": "ETH_TXN",
        "12": "ETH_TXP",
        "13": "ETH_TXP"
      },
      "Y1": {
        "1": "DCDC2_3V3"
      }
    }
  },
  {
    "id": "imx233-maxi",
    "status": { "unrouted": 2, "zeroLen": 2, "measured": "2026-09-02" },
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
        "id": "ref-t-0",
        "x1": 37.6,
        "y1": -31.1,
        "x2": 37.4,
        "y2": -31.3,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-1",
        "x1": 37.4,
        "y1": -31.3,
        "x2": 37.4,
        "y2": -31.4,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-2",
        "x1": 37.4,
        "y1": -31.4,
        "x2": 37.3,
        "y2": -31.5,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-3",
        "x1": 37.3,
        "y1": -31.5,
        "x2": 37.3,
        "y2": -31.7,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-4",
        "x1": 37.3,
        "y1": -31.7,
        "x2": 36.5,
        "y2": -32.5,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-5",
        "x1": 36.5,
        "y1": -32.5,
        "x2": 36.5,
        "y2": -35.5,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-6",
        "x1": 36.5,
        "y1": -35.5,
        "x2": 12.8,
        "y2": -35.5,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-7",
        "x1": 12.8,
        "y1": -35.5,
        "x2": -28,
        "y2": -35.5,
        "layer": "B.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-8",
        "x1": -28,
        "y1": -35.5,
        "x2": -28,
        "y2": -34.8,
        "layer": "B.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-9",
        "x1": -28,
        "y1": -34.8,
        "x2": -28.6,
        "y2": -34.2,
        "layer": "B.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-10",
        "x1": -28.6,
        "y1": -34.2,
        "x2": -28.6,
        "y2": -29.7,
        "layer": "B.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-11",
        "x1": -28.6,
        "y1": -29.7,
        "x2": -28.6,
        "y2": -29.8,
        "layer": "F.Cu",
        "width": 0.5,
        "net": "VIN_5V"
      },
      {
        "id": "ref-t-12",
        "x1": -48,
        "y1": -38,
        "x2": 48,
        "y2": -38,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-13",
        "x1": -48,
        "y1": 38,
        "x2": 48,
        "y2": 38,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-14",
        "x1": -48,
        "y1": -38,
        "x2": -48,
        "y2": -11.8,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-15",
        "x1": -48,
        "y1": -11.8,
        "x2": -49.4,
        "y2": -10.4,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-16",
        "x1": -49.4,
        "y1": -10.4,
        "x2": -49.4,
        "y2": -10.3,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-17",
        "x1": -49.4,
        "y1": -10.3,
        "x2": -49.5,
        "y2": -10.2,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-18",
        "x1": -49.5,
        "y1": -10.2,
        "x2": -49.5,
        "y2": 10.5,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-19",
        "x1": -49.5,
        "y1": 10.5,
        "x2": -48,
        "y2": 12,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-20",
        "x1": -48,
        "y1": 12,
        "x2": -48,
        "y2": 38,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-21",
        "x1": 6,
        "y1": -6,
        "x2": 15.5,
        "y2": -6,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "mDDR_D0"
      },
      {
        "id": "ref-t-22",
        "x1": 6,
        "y1": -5,
        "x2": 15.5,
        "y2": -5,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "mDDR_D1"
      },
      {
        "id": "ref-t-23",
        "x1": 6,
        "y1": -4,
        "x2": 15.5,
        "y2": -4,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "mDDR_D2"
      },
      {
        "id": "ref-t-24",
        "x1": 6,
        "y1": -3,
        "x2": 15.5,
        "y2": -3,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "mDDR_CLK"
      },
      {
        "id": "ref-t-25",
        "x1": 6,
        "y1": -2,
        "x2": 15.5,
        "y2": -2,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "mDDR_DQS"
      },
      {
        "id": "ref-t-26",
        "x1": -6,
        "y1": -8,
        "x2": -29,
        "y2": -8,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "USBH1_DP"
      },
      {
        "id": "ref-t-27",
        "x1": -29,
        "y1": -8,
        "x2": -29,
        "y2": -15.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USBH1_DP"
      },
      {
        "id": "ref-t-28",
        "x1": -6,
        "y1": -7,
        "x2": -30,
        "y2": -7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-29",
        "x1": -30,
        "y1": -7,
        "x2": -29.8,
        "y2": -7.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-30",
        "x1": -29.9,
        "y1": -15.4,
        "x2": -30,
        "y2": -15.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-31",
        "x1": -6.7,
        "y1": 2,
        "x2": -30,
        "y2": 2,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "OTG_DP"
      },
      {
        "id": "ref-t-32",
        "x1": -30,
        "y1": 2,
        "x2": -30,
        "y2": 15,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "OTG_DP"
      },
      {
        "id": "ref-t-33",
        "x1": -31.5,
        "y1": -30,
        "x2": -40.2,
        "y2": -30,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBAT"
      },
      {
        "id": "ref-t-34",
        "x1": -6,
        "y1": -4,
        "x2": 0,
        "y2": -4,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-35",
        "x1": -6,
        "y1": -10,
        "x2": -6,
        "y2": -33.5,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "LCD_D0"
      },
      {
        "id": "ref-t-36",
        "x1": 0,
        "y1": -10,
        "x2": 0,
        "y2": -33.5,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "LCD_CLK"
      },
      {
        "id": "ref-t-37",
        "x1": 6,
        "y1": -9,
        "x2": 29,
        "y2": -9,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "MII_TXD0"
      },
      {
        "id": "ref-t-38",
        "x1": -49,
        "y1": -10,
        "x2": -6.7,
        "y2": -10,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-39",
        "x1": -6.7,
        "y1": -10,
        "x2": -6.3,
        "y2": -9.6,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-40",
        "x1": -6.3,
        "y1": -9.6,
        "x2": 1.6,
        "y2": -9.6,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-41",
        "x1": 1.6,
        "y1": -9.6,
        "x2": 2,
        "y2": -10,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-42",
        "x1": 2,
        "y1": -10,
        "x2": 49,
        "y2": -10,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-43",
        "x1": -31.25,
        "y1": -30,
        "x2": -31.25,
        "y2": -30,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "VBAT"
      },
      {
        "id": "ref-t-44",
        "x1": -6,
        "y1": -4,
        "x2": -6.2,
        "y2": -4.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-45",
        "x1": -6.2,
        "y1": -4.2,
        "x2": -6.3,
        "y2": -4.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-46",
        "x1": -6.3,
        "y1": -4.2,
        "x2": -7.6,
        "y2": -4.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-47",
        "x1": -45,
        "y1": -6,
        "x2": -49,
        "y2": -10,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-48",
        "x1": -6.3,
        "y1": -4.2,
        "x2": -6.3,
        "y2": -9.6,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-49",
        "x1": -29.8,
        "y1": -7.2,
        "x2": -29.2,
        "y2": -7.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-50",
        "x1": -29.2,
        "y1": -7.2,
        "x2": -29.1,
        "y2": -7.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-51",
        "x1": -29.1,
        "y1": -7.3,
        "x2": -29,
        "y2": -7.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-52",
        "x1": -29,
        "y1": -7.3,
        "x2": -28.9,
        "y2": -7.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-53",
        "x1": -28.9,
        "y1": -7.4,
        "x2": -28.7,
        "y2": -7.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-54",
        "x1": -28.7,
        "y1": -7.4,
        "x2": -28.6,
        "y2": -7.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-55",
        "x1": -28.6,
        "y1": -7.5,
        "x2": -28.5,
        "y2": -7.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-56",
        "x1": -28.5,
        "y1": -7.5,
        "x2": -28.5,
        "y2": -7.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-57",
        "x1": -28.5,
        "y1": -7.6,
        "x2": -28.4,
        "y2": -7.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-58",
        "x1": -28.4,
        "y1": -7.7,
        "x2": -28.4,
        "y2": -8.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-59",
        "x1": -28.4,
        "y1": -8.4,
        "x2": -28.8,
        "y2": -8.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-60",
        "x1": -28.8,
        "y1": -8.8,
        "x2": -28.8,
        "y2": -14.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-61",
        "x1": -28.8,
        "y1": -14.3,
        "x2": -29.6,
        "y2": -15.1,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      },
      {
        "id": "ref-t-62",
        "x1": -29.6,
        "y1": -15.1,
        "x2": -29.9,
        "y2": -15.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "USBH1_DM"
      }
    ],
    "vias": [
      {
        "x": 12.8,
        "y": -35.5,
        "od": 0.8,
        "drill": 0.3,
        "net": "VIN_5V"
      },
      {
        "x": -28.6,
        "y": -29.7,
        "od": 0.8,
        "drill": 0.3,
        "net": "VIN_5V"
      },
      {
        "x": -29,
        "y": -8,
        "od": 0.6,
        "drill": 0.3,
        "net": "USBH1_DP"
      },
      {
        "x": -30,
        "y": -7,
        "od": 0.6,
        "drill": 0.3,
        "net": "USBH1_DM"
      },
      {
        "x": -30,
        "y": 2,
        "od": 0.6,
        "drill": 0.3,
        "net": "OTG_DP"
      },
      {
        "x": -6.3,
        "y": -4.2,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": -29.6,
        "y": -15.1,
        "od": 0.6,
        "drill": 0.3,
        "net": "USBH1_DM"
      }
    ],
    "padNets": {
      "U1": {
        "16": "3V3"
      },
      "J7": {
        "1": "VIN_5V"
      },
      "J8": {
        "1": "VBAT",
        "2": "VBAT"
      },
      "U3": {
        "2": "VBAT",
        "4": "VIN_5V"
      },
      "C1": {
        "1": "OTG_DP"
      }
    }
  },
  {
    "id": "openrex-imx6",
    "status": { "unrouted": 7, "zeroLen": 1, "measured": "2026-09-02" },
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
        "x": 0.678,
        "y": -1.555,
        "w": 17,
        "h": 17,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U2",
        "part": "PF0100 PMIC (BGA)",
        "x": -23.744,
        "y": 11.644,
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
        "x": -30.152,
        "y": 20.203,
        "w": 12,
        "h": 10,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "J4",
        "part": "SATA data+power",
        "x": 34.609,
        "y": 0,
        "w": 6,
        "h": 13,
        "side": "top",
        "kind": "conn"
      },
      {
        "ref": "U7",
        "part": "AR8031 GbE PHY",
        "x": -19.991,
        "y": 20.018,
        "w": 6,
        "h": 6,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "U8",
        "part": "SATA series termination",
        "x": 23.565,
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
        "x": -6.909,
        "y": 11.555,
        "w": 5,
        "h": 4,
        "side": "top",
        "kind": "ic"
      },
      {
        "ref": "Y1",
        "part": "24MHz XTAL",
        "x": 10.079,
        "y": 10.237,
        "w": 3.2,
        "h": 2.5,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "Y2",
        "part": "32.768kHz RTC XTAL",
        "x": 4.176,
        "y": 10.445,
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
        "id": "ref-t-0",
        "x1": -49,
        "y1": 0,
        "x2": -9.8,
        "y2": -0.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-1",
        "x1": -9.8,
        "y1": -0.05,
        "x2": 49,
        "y2": 0,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-2",
        "x1": -49,
        "y1": -8,
        "x2": 49,
        "y2": -8,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "VDD_DDR"
      },
      {
        "id": "ref-t-3",
        "x1": -49,
        "y1": 8,
        "x2": -44.9,
        "y2": 8.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-4",
        "x1": -44.9,
        "y1": 8.05,
        "x2": -44.3,
        "y2": 8.65,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-5",
        "x1": -44.3,
        "y1": 8.65,
        "x2": -39.65,
        "y2": 8.65,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-6",
        "x1": -39.65,
        "y1": 8.65,
        "x2": -39.5,
        "y2": 8.8,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-7",
        "x1": -39.5,
        "y1": 8.8,
        "x2": -19.55,
        "y2": 8.8,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-8",
        "x1": -19.55,
        "y1": 8.8,
        "x2": -19.4,
        "y2": 8.95,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-9",
        "x1": -19.4,
        "y1": 8.95,
        "x2": -19.25,
        "y2": 8.95,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-10",
        "x1": -19.25,
        "y1": 8.95,
        "x2": -19.1,
        "y2": 9.1,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-11",
        "x1": -19.1,
        "y1": 9.1,
        "x2": 26.35,
        "y2": 9.1,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-12",
        "x1": 26.35,
        "y1": 9.1,
        "x2": 26.65,
        "y2": 8.8,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-13",
        "x1": 26.65,
        "y1": 8.8,
        "x2": 27.4,
        "y2": 8.05,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-14",
        "x1": 27.4,
        "y1": 8.05,
        "x2": 49,
        "y2": 8,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-15",
        "x1": -49,
        "y1": 0,
        "x2": -48.95,
        "y2": 8.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-16",
        "x1": -48.95,
        "y1": 8.05,
        "x2": -49,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-17",
        "x1": 8.5,
        "y1": -14,
        "x2": 13,
        "y2": -14,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D0"
      },
      {
        "id": "ref-t-18",
        "x1": 8.5,
        "y1": -13,
        "x2": 13,
        "y2": -13,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D1"
      },
      {
        "id": "ref-t-19",
        "x1": 13,
        "y1": -14,
        "x2": 25,
        "y2": -14,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D0"
      },
      {
        "id": "ref-t-20",
        "x1": 13,
        "y1": -13,
        "x2": 25,
        "y2": -13,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D1"
      },
      {
        "id": "ref-t-21",
        "x1": 8.5,
        "y1": 14,
        "x2": 13,
        "y2": 14,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D2"
      },
      {
        "id": "ref-t-22",
        "x1": 8.5,
        "y1": 13,
        "x2": 13,
        "y2": 13,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D3"
      },
      {
        "id": "ref-t-23",
        "x1": 13,
        "y1": 14,
        "x2": 25,
        "y2": 14,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D2"
      },
      {
        "id": "ref-t-24",
        "x1": 13,
        "y1": 13,
        "x2": 25,
        "y2": 13,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "DDR_D3"
      },
      {
        "id": "ref-t-25",
        "x1": -22,
        "y1": -4,
        "x2": -22,
        "y2": -16,
        "layer": "In6.Cu",
        "width": 0.15,
        "net": "PCIE_TXP"
      },
      {
        "id": "ref-t-26",
        "x1": -23,
        "y1": -3,
        "x2": -23.3,
        "y2": -3.35,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "PCIE_TXN"
      },
      {
        "id": "ref-t-27",
        "x1": -23.3,
        "y1": -3.35,
        "x2": -23.3,
        "y2": -3.5,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "PCIE_TXN"
      },
      {
        "id": "ref-t-28",
        "x1": -23.3,
        "y1": -3.5,
        "x2": -23.45,
        "y2": -3.65,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "PCIE_TXN"
      },
      {
        "id": "ref-t-29",
        "x1": -23.45,
        "y1": -3.65,
        "x2": -23.45,
        "y2": -3.95,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "PCIE_TXN"
      },
      {
        "id": "ref-t-30",
        "x1": -23.45,
        "y1": -3.95,
        "x2": -23.6,
        "y2": -4.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "PCIE_TXN"
      },
      {
        "id": "ref-t-31",
        "x1": -23.6,
        "y1": -4.1,
        "x2": -23.75,
        "y2": -16.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "PCIE_TXN"
      },
      {
        "id": "ref-t-32",
        "x1": -23.75,
        "y1": -16.8,
        "x2": -23.75,
        "y2": -16.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "PCIE_TXN"
      },
      {
        "id": "ref-t-33",
        "x1": -8.922,
        "y1": 0.045,
        "x2": -8.922,
        "y2": 0.045,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-34",
        "x1": -8.922,
        "y1": 0.045,
        "x2": -9.2,
        "y2": 0.55,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-35",
        "x1": -9.2,
        "y1": 0.55,
        "x2": -9.2,
        "y2": 0.85,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-36",
        "x1": -9.2,
        "y1": 0.85,
        "x2": -8.922,
        "y2": 0.845,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-37",
        "x1": -8.922,
        "y1": 0.845,
        "x2": -8.922,
        "y2": 0.845,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-38",
        "x1": -8.922,
        "y1": 0.845,
        "x2": -9.65,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-39",
        "x1": -9.65,
        "y1": 1,
        "x2": -9.8,
        "y2": 1.15,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-40",
        "x1": -9.8,
        "y1": 1.15,
        "x2": -9.95,
        "y2": 1.15,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-41",
        "x1": -9.95,
        "y1": 1.15,
        "x2": -10.1,
        "y2": 1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-42",
        "x1": -10.1,
        "y1": 1.3,
        "x2": -29,
        "y2": 1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-43",
        "x1": -29,
        "y1": 1.3,
        "x2": -29.5,
        "y2": 1.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-44",
        "x1": -29.5,
        "y1": 1.8,
        "x2": -29.5,
        "y2": 1.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-45",
        "x1": 10.278,
        "y1": 0.845,
        "x2": 10.278,
        "y2": 0.845,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-46",
        "x1": 10.278,
        "y1": 0.845,
        "x2": 10.75,
        "y2": 1.15,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-47",
        "x1": 10.75,
        "y1": 1.15,
        "x2": 10.9,
        "y2": 1.15,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-48",
        "x1": 10.9,
        "y1": 1.15,
        "x2": 11.05,
        "y2": 1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-49",
        "x1": 11.05,
        "y1": 1.3,
        "x2": 11.2,
        "y2": 1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-50",
        "x1": 11.2,
        "y1": 1.3,
        "x2": 11.35,
        "y2": 1.45,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-51",
        "x1": 11.35,
        "y1": 1.45,
        "x2": 12.4,
        "y2": 1.45,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-52",
        "x1": 12.4,
        "y1": 1.45,
        "x2": 13,
        "y2": 0.85,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-53",
        "x1": 13,
        "y1": 0.85,
        "x2": 21.55,
        "y2": 0.85,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-54",
        "x1": 21.55,
        "y1": 0.85,
        "x2": 23.906,
        "y2": 1.2,
        "layer": "In6.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-55",
        "x1": 24.1,
        "y1": 0.85,
        "x2": 24.4,
        "y2": 1.15,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-56",
        "x1": 24.4,
        "y1": 1.15,
        "x2": 24.4,
        "y2": 1.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-57",
        "x1": 24.4,
        "y1": 1.3,
        "x2": 24.55,
        "y2": 1.45,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-58",
        "x1": 24.55,
        "y1": 1.45,
        "x2": 24.5,
        "y2": 2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-59",
        "x1": -8.122,
        "y1": 0.045,
        "x2": -8.122,
        "y2": 0.045,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-60",
        "x1": -8.922,
        "y1": 0.845,
        "x2": -8.922,
        "y2": 0.845,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      },
      {
        "id": "ref-t-61",
        "x1": 9.478,
        "y1": 0.045,
        "x2": 9.478,
        "y2": 0.045,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-62",
        "x1": 10.278,
        "y1": 0.845,
        "x2": 10.278,
        "y2": 0.845,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SATA_TXN"
      },
      {
        "id": "esc-63",
        "x1": 23.906000000000002,
        "y1": 0.7,
        "x2": 23.906,
        "y2": 1.2,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "SATA_TXN"
      },
      {
        "id": "ref-t-64",
        "x1": -8.922,
        "y1": 0.045,
        "x2": -8.122,
        "y2": 0.045,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "HDMI_D0P"
      }
    ],
    "vias": [
      {
        "x": -9.8,
        "y": -0.05,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": -44.9,
        "y": 8.05,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": -23.45,
        "y": -3.95,
        "od": 0.6,
        "drill": 0.3,
        "net": "PCIE_TXN"
      },
      {
        "x": -9.2,
        "y": 0.85,
        "od": 0.6,
        "drill": 0.3,
        "net": "HDMI_D0P"
      },
      {
        "x": 21.55,
        "y": 0.85,
        "od": 0.6,
        "drill": 0.3,
        "net": "SATA_TXN"
      },
      {
        "x": 23.906,
        "y": 1.2,
        "od": 0.7,
        "drill": 0.3,
        "net": "SATA_TXN"
      }
    ],
    "padNets": {
      "U1": {
        "H2": "PCIE_TXP",
        "J2": "PCIE_TXN",
        "N24": "DDR_CLK",
        "P24": "SATA_TXP",
        "R1": "HDMI_D0P",
        "R2": "HDMI_D0P",
        "R24": "SATA_TXN",
        "T1": "HDMI_D0P",
        "T25": "SATA_TXN",
        "U2": "HDMI_D0N"
      },
      "U2": {
        "41": "GND"
      },
      "J1": {
        "49": "PCIE_TXN",
        "51": "PCIE_TXN"
      },
      "J2": {
        "18": "HDMI_D0P",
        "19": "HDMI_D0P"
      },
      "J3": {
        "S2": "GBE_TXN"
      },
      "J4": {
        "P1": "SATA_TXP"
      },
      "U7": {
        "27": "GBE_TXN",
        "28": "GBE_TXN",
        "29": "GBE_TXN",
        "30": "GBE_TXP",
        "31": "GBE_TXP"
      },
      "U8": {
        "3": "SATA_TXN"
      },
      "U9": {
        "G2": "VDD_SOC",
        "L2": "VDD_ARM"
      }
    }
  },
  {
    "id": "imx8mp-som",
    "status": { "unrouted": 4, "zeroLen": 2, "measured": "2026-09-02" },
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
        "x": 0.102,
        "y": 13.82,
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
        "x": -5.605,
        "y": 17.37,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L2",
        "part": "Buck2 inductor",
        "x": -1.062,
        "y": 19.31,
        "w": 3,
        "h": 3,
        "side": "top",
        "kind": "passive"
      },
      {
        "ref": "L3",
        "part": "Buck3 inductor",
        "x": 3.177,
        "y": 19.299,
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
        "id": "ref-t-0",
        "x1": 6.75,
        "y1": 16,
        "x2": 6.75,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-1",
        "x1": 6.8,
        "y1": 15.8,
        "x2": 6.8,
        "y2": 15.3,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-2",
        "x1": 6.75,
        "y1": 15.05,
        "x2": 6.75,
        "y2": 15.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-3",
        "x1": 6.75,
        "y1": 15.05,
        "x2": 6.75,
        "y2": 15.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-4",
        "x1": 6.75,
        "y1": 15.05,
        "x2": 6.75,
        "y2": 15.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-5",
        "x1": 6.75,
        "y1": 15.05,
        "x2": 6.75,
        "y2": 15.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-6",
        "x1": 6.75,
        "y1": 15.05,
        "x2": 6.75,
        "y2": 15.05,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-7",
        "x1": 6.7,
        "y1": 14.8,
        "x2": 6.5,
        "y2": 14.6,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-8",
        "x1": 6.5,
        "y1": 14.6,
        "x2": 6.5,
        "y2": 14.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-9",
        "x1": 6.5,
        "y1": 14.5,
        "x2": 6.4,
        "y2": 14.4,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-10",
        "x1": 6.4,
        "y1": 14.4,
        "x2": 6.4,
        "y2": 14.2,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-11",
        "x1": 6.4,
        "y1": 14.2,
        "x2": 6.2,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-12",
        "x1": 6.2,
        "y1": 14,
        "x2": 6.2,
        "y2": 13.6,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-13",
        "x1": 6.2,
        "y1": 13.6,
        "x2": 6.1,
        "y2": 13.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-14",
        "x1": 6.1,
        "y1": 13.5,
        "x2": 6.1,
        "y2": 12.1,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-15",
        "x1": 6.1,
        "y1": 12.1,
        "x2": 6,
        "y2": 12,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-16",
        "x1": -19,
        "y1": 0,
        "x2": 19,
        "y2": 0,
        "layer": "In2.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-17",
        "x1": -19,
        "y1": -6,
        "x2": 19,
        "y2": -6,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "VDD_DDR"
      },
      {
        "id": "ref-t-18",
        "x1": -19,
        "y1": 6,
        "x2": 19,
        "y2": 6,
        "layer": "In3.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-19",
        "x1": -18,
        "y1": -28,
        "x2": 18,
        "y2": -28,
        "layer": "In4.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-20",
        "x1": -18,
        "y1": 28,
        "x2": -17.2,
        "y2": 28,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-21",
        "x1": -17.2,
        "y1": 28,
        "x2": -16.9,
        "y2": 28.3,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-22",
        "x1": -16.9,
        "y1": 28.3,
        "x2": -16.8,
        "y2": 28.3,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-23",
        "x1": -16.8,
        "y1": 28.3,
        "x2": -16.7,
        "y2": 28.4,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-24",
        "x1": -16.7,
        "y1": 28.4,
        "x2": -16.7,
        "y2": 28.5,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-25",
        "x1": -16.7,
        "y1": 28.5,
        "x2": -16.6,
        "y2": 28.5,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-26",
        "x1": -16.6,
        "y1": 28.5,
        "x2": -16.5,
        "y2": 28.4,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-27",
        "x1": -16.5,
        "y1": 28.4,
        "x2": -16.4,
        "y2": 28.5,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-28",
        "x1": -16.4,
        "y1": 28.5,
        "x2": 17.5,
        "y2": 28.5,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-29",
        "x1": 17.5,
        "y1": 28.5,
        "x2": 18,
        "y2": 28,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-30",
        "x1": 6.75,
        "y1": 16,
        "x2": 6.75,
        "y2": 16,
        "layer": "F.Cu",
        "width": 0.3,
        "net": "VDD_SNVS"
      },
      {
        "id": "ref-t-31",
        "x1": -19,
        "y1": 0,
        "x2": -19,
        "y2": 6,
        "layer": "In2.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-32",
        "x1": -19,
        "y1": 6,
        "x2": -19,
        "y2": 7.1,
        "layer": "In3.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-33",
        "x1": -19,
        "y1": 7.1,
        "x2": -18.3,
        "y2": 7.1,
        "layer": "In3.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-34",
        "x1": -18.3,
        "y1": 7.1,
        "x2": -18,
        "y2": 7.25,
        "layer": "In3.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-35",
        "x1": -18,
        "y1": 7.8,
        "x2": -18,
        "y2": 7.75,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-36",
        "x1": -18,
        "y1": 7.75,
        "x2": -18,
        "y2": 7.75,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-37",
        "x1": -18,
        "y1": 7.75,
        "x2": -18,
        "y2": 27.6,
        "layer": "In1.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-38",
        "x1": -18,
        "y1": 27.6,
        "x2": -18.2,
        "y2": 27.8,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-39",
        "x1": -18.2,
        "y1": 27.8,
        "x2": -18,
        "y2": 28,
        "layer": "B.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-40",
        "x1": -19,
        "y1": 0,
        "x2": -19,
        "y2": -5.3,
        "layer": "In2.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-41",
        "x1": -19,
        "y1": -5.3,
        "x2": -19,
        "y2": -27,
        "layer": "In2.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-42",
        "x1": -19,
        "y1": -27,
        "x2": -18,
        "y2": -28,
        "layer": "In4.Cu",
        "width": 0.3,
        "net": "GND"
      },
      {
        "id": "ref-t-43",
        "x1": -3,
        "y1": -11,
        "x2": -2.925,
        "y2": -11.475,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "LPDDR_D0"
      },
      {
        "id": "ref-t-44",
        "x1": -2.9,
        "y1": -12,
        "x2": -3.275,
        "y2": -13.125,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "LPDDR_D0"
      },
      {
        "id": "ref-t-45",
        "x1": -2.9,
        "y1": -13.3,
        "x2": -3.4,
        "y2": -13.8,
        "layer": "In3.Cu",
        "width": 0.15,
        "net": "LPDDR_D0"
      },
      {
        "id": "ref-t-46",
        "x1": -3.4,
        "y1": -13.8,
        "x2": -3.1,
        "y2": -13.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_D0"
      },
      {
        "id": "ref-t-47",
        "x1": 3,
        "y1": -11,
        "x2": 3.275,
        "y2": -11.825,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LPDDR_DQS"
      },
      {
        "id": "ref-t-48",
        "x1": 2.9,
        "y1": -12,
        "x2": 3.275,
        "y2": -13.125,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LPDDR_DQS"
      },
      {
        "id": "ref-t-49",
        "x1": 2.9,
        "y1": -13.3,
        "x2": 3.4,
        "y2": -13.8,
        "layer": "In4.Cu",
        "width": 0.15,
        "net": "LPDDR_DQS"
      },
      {
        "id": "ref-t-50",
        "x1": 3.4,
        "y1": -13.8,
        "x2": 3.1,
        "y2": -13.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_DQS"
      },
      {
        "id": "ref-t-51",
        "x1": -5,
        "y1": 4,
        "x2": -4.6,
        "y2": 4.4,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-52",
        "x1": -4.6,
        "y1": 4.4,
        "x2": -5,
        "y2": 4.8,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-53",
        "x1": -5,
        "y1": 4.8,
        "x2": -4.909,
        "y2": 4.662,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-54",
        "x1": -5,
        "y1": 5,
        "x2": -4.6,
        "y2": 5.3,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-55",
        "x1": -4.6,
        "y1": 5.3,
        "x2": -4.3,
        "y2": 5.3,
        "layer": "B.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-56",
        "x1": -4.3,
        "y1": 5.3,
        "x2": -4.5,
        "y2": 5.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-57",
        "x1": -4.5,
        "y1": 5.5,
        "x2": -4.5,
        "y2": 5.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-58",
        "x1": -4.5,
        "y1": 5.8,
        "x2": -4.7,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-59",
        "x1": -4.7,
        "y1": 6,
        "x2": -5,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "EMMC_CLK"
      },
      {
        "id": "ref-t-60",
        "x1": -3.398,
        "y1": 14.02,
        "x2": -5,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BUCK1_OUT"
      },
      {
        "id": "ref-t-61",
        "x1": -5,
        "y1": 14,
        "x2": -5,
        "y2": 14.7,
        "layer": "In4.Cu",
        "width": 0.15,
        "net": "BUCK1_OUT"
      },
      {
        "id": "ref-t-62",
        "x1": -5,
        "y1": 14.7,
        "x2": -4.5,
        "y2": 15.2,
        "layer": "In4.Cu",
        "width": 0.15,
        "net": "BUCK1_OUT"
      },
      {
        "id": "ref-t-63",
        "x1": -4.5,
        "y1": 15.2,
        "x2": -4.5,
        "y2": 17.1,
        "layer": "In4.Cu",
        "width": 0.15,
        "net": "BUCK1_OUT"
      },
      {
        "id": "ref-t-64",
        "x1": -7,
        "y1": -4,
        "x2": -15.7,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO0"
      },
      {
        "id": "ref-t-65",
        "x1": -15.7,
        "y1": -4,
        "x2": -16,
        "y2": -4.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO0"
      },
      {
        "id": "ref-t-66",
        "x1": -16,
        "y1": -4.25,
        "x2": -16,
        "y2": -4.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO0"
      },
      {
        "id": "ref-t-67",
        "x1": -6.3,
        "y1": -1.9,
        "x2": -15.8,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO1"
      },
      {
        "id": "ref-t-68",
        "x1": -15.8,
        "y1": -2,
        "x2": -16,
        "y2": -2.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO1"
      },
      {
        "id": "ref-t-69",
        "x1": -16,
        "y1": -2.25,
        "x2": -16,
        "y2": -2.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_L_IO1"
      },
      {
        "id": "ref-t-70",
        "x1": 7,
        "y1": -4,
        "x2": 15.7,
        "y2": -4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO0"
      },
      {
        "id": "ref-t-71",
        "x1": 15.7,
        "y1": -4,
        "x2": 16,
        "y2": -4.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO0"
      },
      {
        "id": "ref-t-72",
        "x1": 16,
        "y1": -4.25,
        "x2": 16,
        "y2": -4.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO0"
      },
      {
        "id": "ref-t-73",
        "x1": 6.3,
        "y1": -1.9,
        "x2": 15.8,
        "y2": -2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO1"
      },
      {
        "id": "ref-t-74",
        "x1": 15.8,
        "y1": -2,
        "x2": 16,
        "y2": -2.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO1"
      },
      {
        "id": "ref-t-75",
        "x1": 16,
        "y1": -2.25,
        "x2": 16,
        "y2": -2.25,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "B2B_R_IO1"
      },
      {
        "id": "ref-t-76",
        "x1": 6.9,
        "y1": 8.7,
        "x2": 6.7,
        "y2": 8.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "ref-t-77",
        "x1": 6.7,
        "y1": 8.5,
        "x2": 6.7,
        "y2": 8.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "ref-t-78",
        "x1": 6.7,
        "y1": 8.4,
        "x2": 6.6,
        "y2": 8.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "ref-t-79",
        "x1": 6.6,
        "y1": 8.3,
        "x2": 6.6,
        "y2": 8.1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "ref-t-80",
        "x1": 6.6,
        "y1": 8.1,
        "x2": 5.2,
        "y2": 6.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "ref-t-81",
        "x1": 5.2,
        "y1": 6.7,
        "x2": 5.2,
        "y2": 6.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "ref-t-82",
        "x1": 5.05,
        "y1": 6,
        "x2": 5.05,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "ref-t-83",
        "x1": -4.9,
        "y1": 17.4,
        "x2": -6.4,
        "y2": 17.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "BUCK1_OUT"
      },
      {
        "id": "ref-t-84",
        "x1": 5.05,
        "y1": 6,
        "x2": 5.05,
        "y2": 6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "CLK32K"
      },
      {
        "id": "esc-85",
        "x1": -5,
        "y1": 5,
        "x2": -4.909,
        "y2": 4.662,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "EMMC_CLK"
      },
      {
        "id": "esc-86",
        "x1": -2.925,
        "y1": -13.125,
        "x2": -3.275,
        "y2": -13.125,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LPDDR_D0"
      },
      {
        "id": "esc-87",
        "x1": -2.925,
        "y1": -11.825,
        "x2": -2.925,
        "y2": -11.475,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LPDDR_D0"
      },
      {
        "id": "esc-88",
        "x1": 2.925,
        "y1": -13.125,
        "x2": 3.275,
        "y2": -13.125,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LPDDR_DQS"
      },
      {
        "id": "esc-89",
        "x1": 2.925,
        "y1": -11.825,
        "x2": 3.275,
        "y2": -11.825,
        "layer": "F.Cu",
        "width": 0.2,
        "net": "LPDDR_DQS"
      },
      {
        "id": "ref-t-90",
        "x1": -2.925,
        "y1": -11.825,
        "x2": -2.9,
        "y2": -12,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_D0"
      },
      {
        "id": "ref-t-91",
        "x1": -2.9,
        "y1": -12,
        "x2": -2.9,
        "y2": -12,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LPDDR_D0"
      }
    ],
    "vias": [
      {
        "x": -16.7,
        "y": 28.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": -19,
        "y": 6,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": -18,
        "y": 27.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": -19,
        "y": -27,
        "od": 0.6,
        "drill": 0.3,
        "net": "GND"
      },
      {
        "x": -3.4,
        "y": -13.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "LPDDR_D0"
      },
      {
        "x": 3.4,
        "y": -13.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "LPDDR_DQS"
      },
      {
        "x": -4.3,
        "y": 5.3,
        "od": 0.6,
        "drill": 0.3,
        "net": "EMMC_CLK"
      },
      {
        "x": -5,
        "y": 14,
        "od": 0.6,
        "drill": 0.3,
        "net": "BUCK1_OUT"
      },
      {
        "x": -4.5,
        "y": 17.1,
        "od": 0.6,
        "drill": 0.3,
        "net": "BUCK1_OUT"
      },
      {
        "x": -4.909,
        "y": 4.662,
        "od": 0.7,
        "drill": 0.3,
        "net": "EMMC_CLK"
      },
      {
        "x": -3.275,
        "y": -13.125,
        "od": 0.7,
        "drill": 0.3,
        "net": "LPDDR_D0"
      },
      {
        "x": -2.925,
        "y": -11.475,
        "od": 0.7,
        "drill": 0.3,
        "net": "LPDDR_D0"
      },
      {
        "x": 3.275,
        "y": -13.125,
        "od": 0.7,
        "drill": 0.3,
        "net": "LPDDR_DQS"
      },
      {
        "x": 3.275,
        "y": -11.825,
        "od": 0.7,
        "drill": 0.3,
        "net": "LPDDR_DQS"
      },
      {
        "x": -18,
        "y": 7.75,
        "od": 0.7,
        "drill": 0.3,
        "net": "GND"
      }
    ],
    "padNets": {
      "U1": {
        "R1": "B2B_L_IO1",
        "R22": "B2B_R_IO1",
        "AA3": "EMMC_CLK"
      },
      "U2": {
        "7": "BUCK1_OUT",
        "8": "BUCK1_OUT",
        "9": "BUCK1_OUT",
        "49": "VDD_ARM",
        "50": "VDD_ARM",
        "51": "VDD_ARM"
      },
      "U3": {
        "U1": "LPDDR_D0",
        "U4": "LPDDR_D1",
        "U7": "LPDDR_CLK",
        "U10": "LPDDR_DQS",
        "V1": "LPDDR_D0",
        "V10": "LPDDR_DQS",
        "Y1": "LPDDR_D0",
        "Y10": "LPDDR_DQS"
      },
      "U4": {
        "A13": "EMMC_CLK",
        "C9": "EMMC_D0",
        "C13": "EMMC_CLK"
      },
      "J1": {
        "30": "B2B_L_IO0",
        "32": "B2B_L_IO0",
        "34": "B2B_L_IO0",
        "38": "B2B_L_IO1",
        "40": "B2B_L_IO1",
        "42": "B2B_L_IO1",
        "77": "GND",
        "79": "GND"
      },
      "J2": {
        "29": "B2B_R_IO0",
        "31": "B2B_R_IO0",
        "33": "B2B_R_IO0",
        "37": "B2B_R_IO1",
        "39": "B2B_R_IO1",
        "41": "B2B_R_IO1"
      },
      "Y1": {
        "3": "CLK32K"
      },
      "Y2": {
        "1": "CLK32K"
      },
      "L1": {
        "1": "BUCK1_OUT",
        "2": "BUCK1_OUT"
      },
      "U5": {
        "1": "VDD_SNVS",
        "2": "VDD_SNVS"
      }
    }
  },
  {
    "id": "librevna",
    "status": { "unrouted": 6, "zeroLen": 0, "measured": "2026-09-02" },
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
        "id": "ref-t-0",
        "x1": -36.05,
        "y1": 1,
        "x2": -36.05,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-1",
        "x1": -36.05,
        "y1": 1,
        "x2": -36.05,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-2",
        "x1": -36.05,
        "y1": 1,
        "x2": -36.05,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-3",
        "x1": -36.05,
        "y1": 1,
        "x2": -36.05,
        "y2": 1,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-4",
        "x1": -36.05,
        "y1": 1,
        "x2": -35.7,
        "y2": 1.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-5",
        "x1": -35.7,
        "y1": 1.2,
        "x2": -35.6,
        "y2": 1.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-6",
        "x1": -35.6,
        "y1": 1.2,
        "x2": -35.5,
        "y2": 1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-7",
        "x1": -35.5,
        "y1": 1.3,
        "x2": -35.3,
        "y2": 1.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-8",
        "x1": -35.3,
        "y1": 1.3,
        "x2": -34.9,
        "y2": 1.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-9",
        "x1": -34.9,
        "y1": 1.7,
        "x2": -34.8,
        "y2": 1.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-10",
        "x1": -34.8,
        "y1": 1.7,
        "x2": -34.7,
        "y2": 1.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-11",
        "x1": -34.7,
        "y1": 1.8,
        "x2": -29.2,
        "y2": 1.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-12",
        "x1": -29.2,
        "y1": 1.8,
        "x2": -29,
        "y2": 2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-13",
        "x1": -29,
        "y1": 2,
        "x2": -29,
        "y2": -11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-14",
        "x1": -29,
        "y1": -11,
        "x2": -28.8,
        "y2": -11.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-15",
        "x1": -28.8,
        "y1": -11.2,
        "x2": -28.7,
        "y2": -11.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-16",
        "x1": -28.7,
        "y1": -11.2,
        "x2": -28.5,
        "y2": -11.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-17",
        "x1": -28.5,
        "y1": -11.4,
        "x2": -28.4,
        "y2": -11.4,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-18",
        "x1": -28.4,
        "y1": -11.4,
        "x2": -28.3,
        "y2": -11.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-19",
        "x1": -28.3,
        "y1": -11.5,
        "x2": -27.75,
        "y2": -11.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-20",
        "x1": -27.75,
        "y1": -11.5,
        "x2": -27.75,
        "y2": -11.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-21",
        "x1": -27.75,
        "y1": -11.5,
        "x2": -27.75,
        "y2": -11.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-22",
        "x1": -27.2,
        "y1": -11.5,
        "x2": -27.25,
        "y2": -11.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-23",
        "x1": -29,
        "y1": 11,
        "x2": -28.8,
        "y2": 11.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-24",
        "x1": -28.8,
        "y1": 11.2,
        "x2": -28.7,
        "y2": 11.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      },
      {
        "id": "ref-t-25",
        "x1": -23.5,
        "y1": -13.75,
        "x2": -22.3,
        "y2": -13.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-26",
        "x1": -22.3,
        "y1": -13.7,
        "x2": -21.6,
        "y2": -13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-27",
        "x1": -21.6,
        "y1": -13,
        "x2": -21.5,
        "y2": -13,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-28",
        "x1": -21.5,
        "y1": -13,
        "x2": -21.4,
        "y2": -12.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-29",
        "x1": -21.4,
        "y1": -12.9,
        "x2": -16.6,
        "y2": -12.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-30",
        "x1": -16.6,
        "y1": -12.9,
        "x2": -15.7,
        "y2": -13.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-31",
        "x1": -15.7,
        "y1": -13.8,
        "x2": -15.5,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-32",
        "x1": -15.5,
        "y1": -14,
        "x2": -15.3,
        "y2": -13.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-33",
        "x1": -15.3,
        "y1": -13.8,
        "x2": -15.3,
        "y2": -13.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-34",
        "x1": -15.3,
        "y1": -13.7,
        "x2": -15.2,
        "y2": -13.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-35",
        "x1": -15.2,
        "y1": -13.6,
        "x2": -15.2,
        "y2": -12.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-36",
        "x1": -15.2,
        "y1": -12.7,
        "x2": -15.1,
        "y2": -12.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-37",
        "x1": -15.1,
        "y1": -12.6,
        "x2": -15.1,
        "y2": -10.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-38",
        "x1": -15.1,
        "y1": -10.9,
        "x2": -15,
        "y2": -10.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-39",
        "x1": -14.8,
        "y1": -10.7,
        "x2": -14,
        "y2": -10.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-40",
        "x1": -14,
        "y1": -10.7,
        "x2": 4.2,
        "y2": -10.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-41",
        "x1": 4.2,
        "y1": -10.7,
        "x2": 4.5,
        "y2": -11,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-42",
        "x1": 4.5,
        "y1": -11,
        "x2": 4.7,
        "y2": -11.2,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-43",
        "x1": 4.7,
        "y1": -11.2,
        "x2": 4.7,
        "y2": -11.3,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-44",
        "x1": 4.7,
        "y1": -11.3,
        "x2": 4.8,
        "y2": -11.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-45",
        "x1": 4.8,
        "y1": -11.4,
        "x2": 4.8,
        "y2": -13.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-46",
        "x1": 4.8,
        "y1": -13.5,
        "x2": 4.9,
        "y2": -13.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-47",
        "x1": 4.85,
        "y1": -14,
        "x2": 4.85,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-48",
        "x1": 4.85,
        "y1": -14,
        "x2": 4.85,
        "y2": -14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "LO_OUT"
      },
      {
        "id": "ref-t-49",
        "x1": -9.2,
        "y1": 13.8,
        "x2": -9,
        "y2": 14,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SRC_OUT"
      },
      {
        "id": "ref-t-50",
        "x1": -9,
        "y1": 14,
        "x2": -9,
        "y2": -18,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SRC_OUT"
      },
      {
        "id": "ref-t-51",
        "x1": -9,
        "y1": -18,
        "x2": -8.5,
        "y2": -18,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "SRC_OUT"
      },
      {
        "id": "ref-t-52",
        "x1": -3.5,
        "y1": -18,
        "x2": -3.5,
        "y2": -21,
        "layer": "In2.Cu",
        "width": 0.15,
        "net": "RF_PORT1"
      },
      {
        "id": "ref-t-53",
        "x1": 21.25,
        "y1": -12,
        "x2": 21.25,
        "y2": -12,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-54",
        "x1": 21.25,
        "y1": -12,
        "x2": 21.5,
        "y2": -11.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-55",
        "x1": 21.5,
        "y1": -11.7,
        "x2": 21.5,
        "y2": -11.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-56",
        "x1": 21.5,
        "y1": -11.6,
        "x2": 21.6,
        "y2": -11.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-57",
        "x1": 21.6,
        "y1": -11.5,
        "x2": 21.6,
        "y2": -10.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-58",
        "x1": 21.6,
        "y1": -10.9,
        "x2": 21.7,
        "y2": -10.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-59",
        "x1": 21.7,
        "y1": -10.8,
        "x2": 21.7,
        "y2": -2.8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-60",
        "x1": 21.7,
        "y1": -2.8,
        "x2": 22,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-61",
        "x1": 22,
        "y1": -2.5,
        "x2": 8.8,
        "y2": -2.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-62",
        "x1": 8.8,
        "y1": -2.5,
        "x2": 5.5,
        "y2": -2.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-63",
        "x1": 5.5,
        "y1": -2.5,
        "x2": 5.5,
        "y2": 2.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-64",
        "x1": 5.5,
        "y1": 2.5,
        "x2": 22,
        "y2": 2.5,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-65",
        "x1": 22,
        "y1": 2.5,
        "x2": 22,
        "y2": 10.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-66",
        "x1": 22,
        "y1": 10.2,
        "x2": 22.25,
        "y2": 10.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-67",
        "x1": 22.25,
        "y1": 10.5,
        "x2": 22.25,
        "y2": 10.5,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "IF_OUT"
      },
      {
        "id": "ref-t-68",
        "x1": 11,
        "y1": 20,
        "x2": 9.9,
        "y2": 20,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-69",
        "x1": 9.9,
        "y1": 20,
        "x2": 7,
        "y2": 20,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-70",
        "x1": 7,
        "y1": 20,
        "x2": 6.8,
        "y2": 19.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-71",
        "x1": 6.8,
        "y1": 19.8,
        "x2": 6.8,
        "y2": 19.7,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-72",
        "x1": 6.8,
        "y1": 19.7,
        "x2": 6.7,
        "y2": 19.6,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-73",
        "x1": 6.7,
        "y1": 19.6,
        "x2": 6.7,
        "y2": 19.4,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-74",
        "x1": 6.7,
        "y1": 19.4,
        "x2": 6.3,
        "y2": 19,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-75",
        "x1": 6.3,
        "y1": 19,
        "x2": 6.3,
        "y2": 18.9,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-76",
        "x1": 6.3,
        "y1": 18.9,
        "x2": 6.2,
        "y2": 18.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-77",
        "x1": 6.2,
        "y1": 18.8,
        "x2": 6.2,
        "y2": 7.8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-78",
        "x1": 6.2,
        "y1": 7.8,
        "x2": 6,
        "y2": 7.6,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-79",
        "x1": -46,
        "y1": 8,
        "x2": 46,
        "y2": 8,
        "layer": "In1.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-80",
        "x1": 11.25,
        "y1": 20,
        "x2": 11.25,
        "y2": 20,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-81",
        "x1": 11.5,
        "y1": 19.9,
        "x2": 12.2,
        "y2": 19.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-82",
        "x1": 12.2,
        "y1": 19.9,
        "x2": 13.8,
        "y2": 18.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-83",
        "x1": 13.8,
        "y1": 18.3,
        "x2": 13.9,
        "y2": 18.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-84",
        "x1": 13.9,
        "y1": 18.3,
        "x2": 14.2,
        "y2": 18.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-85",
        "x1": 14.2,
        "y1": 18.3,
        "x2": 14.3,
        "y2": 18.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-86",
        "x1": 14.3,
        "y1": 18.2,
        "x2": 27,
        "y2": 18.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-87",
        "x1": 27,
        "y1": 18.2,
        "x2": 27.2,
        "y2": 18,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-88",
        "x1": 27.2,
        "y1": 18,
        "x2": 27.3,
        "y2": 18,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-89",
        "x1": 27.3,
        "y1": 18,
        "x2": 27.4,
        "y2": 17.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-90",
        "x1": 27.4,
        "y1": 17.9,
        "x2": 35.3,
        "y2": 17.9,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-91",
        "x1": 35.3,
        "y1": 17.9,
        "x2": 35.7,
        "y2": 18.3,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-92",
        "x1": 35.7,
        "y1": 18.3,
        "x2": 36,
        "y2": 18,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-93",
        "x1": 36,
        "y1": 18,
        "x2": 36,
        "y2": 17.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-94",
        "x1": 36,
        "y1": 17.7,
        "x2": 36.5,
        "y2": 17.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-95",
        "x1": 36.5,
        "y1": 17.2,
        "x2": 36.5,
        "y2": 17,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-96",
        "x1": 36.5,
        "y1": 17,
        "x2": 37.3,
        "y2": 16.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-97",
        "x1": 37.3,
        "y1": 16.2,
        "x2": 37.3,
        "y2": 6.7,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-98",
        "x1": 37.3,
        "y1": 6.7,
        "x2": 37.8,
        "y2": 6.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-99",
        "x1": 37.8,
        "y1": 6.2,
        "x2": 44.2,
        "y2": 6.2,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-100",
        "x1": 44.2,
        "y1": 6.2,
        "x2": 46,
        "y2": 8,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "3V3"
      },
      {
        "id": "ref-t-101",
        "x1": -29,
        "y1": 2,
        "x2": -29,
        "y2": 11,
        "layer": "F.Cu",
        "width": 0.15,
        "net": "REFCLK"
      }
    ],
    "vias": [
      {
        "x": -15.3,
        "y": -13.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "LO_OUT"
      },
      {
        "x": -14,
        "y": -10.7,
        "od": 0.6,
        "drill": 0.3,
        "net": "LO_OUT"
      },
      {
        "x": 4.9,
        "y": -13.6,
        "od": 0.6,
        "drill": 0.3,
        "net": "LO_OUT"
      },
      {
        "x": 8.8,
        "y": -2.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "IF_OUT"
      },
      {
        "x": 22,
        "y": 2.5,
        "od": 0.6,
        "drill": 0.3,
        "net": "IF_OUT"
      },
      {
        "x": 9.9,
        "y": 20,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": 6.2,
        "y": 7.8,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      },
      {
        "x": 46,
        "y": 8,
        "od": 0.6,
        "drill": 0.3,
        "net": "3V3"
      }
    ],
    "padNets": {
      "U1": {
        "49": "3V3",
        "50": "3V3",
        "51": "ADC_D2",
        "53": "ADC_D1",
        "55": "ADC_D0",
        "61": "USB_DM",
        "65": "USB_DP"
      },
      "U2": {
        "9": "REFCLK",
        "10": "REFCLK",
        "11": "REFCLK",
        "19": "LO_OUT",
        "20": "LO_OUT",
        "21": "LO_OUT"
      },
      "U3": {
        "20": "SRC_OUT",
        "21": "SRC_OUT",
        "29": "REFCLK",
        "30": "REFCLK",
        "32": "REFCLK"
      },
      "U4": {
        "6": "REFCLK",
        "7": "REFCLK"
      },
      "U5": {
        "3": "LO_MIXER",
        "4": "LO_MIXER",
        "11": "IF_OUT",
        "12": "IF_OUT"
      },
      "U6": {
        "37": "IF_OUT",
        "38": "IF_OUT",
        "39": "IF_OUT"
      },
      "J1": {
        "1": "USB_DP",
        "S1": "USB_DM"
      },
      "U7": {
        "1": "LO_OUT"
      },
      "U8": {
        "1": "LO_OUT",
        "2": "LO_MIXER"
      },
      "U10": {
        "4": "3V3"
      }
    }
  }
];
