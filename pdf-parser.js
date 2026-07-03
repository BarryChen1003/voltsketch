// PDF Parser Module
const PDFParser = {
  pdfjsLib: null,

  init() {
    this.pdfjsLib = window['pdfjs-dist/build/pdf'];
  },

  async extractText(file) {
    if (!this.pdfjsLib) {
      console.warn('pdf.js not loaded');
      return '';
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }
    return fullText;
  },

  async extractPinInfo(file) {
    const text = await this.extractText(file);
    const pins = [];
    const pinPatterns = [
      /(?:pin|腳位)\s*(\d+)\s*[:\-–]\s*(\S+)/gi,
      /(\d+)\s+(\w+)\s+(VCC|GND|VDD|VSS|IN|OUT|CLK|DATA|CS|SDA|SCL|TX|RX|NC)/gi
    ];
    for (const pattern of pinPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        pins.push({ number: match[1], name: match[2], type: match[3] });
      }
    }
    return { text, pins };
  }
};

// Initialize
PDFParser.init();
