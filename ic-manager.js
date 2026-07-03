// IC Manager Module
const ICManager = {
  ics: [],

  init() {
    this.ics = JSON.parse(localStorage.getItem('voltsketch-ics') || '[]');
  },

  getAll() {
    return this.ics;
  },

  getById(id) {
    return this.ics.find(ic => ic.id === id);
  },

  save(ic) {
    if (!ic.id) ic.id = Date.now().toString(36);
    const idx = this.ics.findIndex(i => i.id === ic.id);
    if (idx >= 0) {
      this.ics[idx] = ic;
    } else {
      this.ics.push(ic);
    }
    localStorage.setItem('voltsketch-ics', JSON.stringify(this.ics));
    return ic;
  },

  delete(id) {
    this.ics = this.ics.filter(ic => ic.id !== id);
    localStorage.setItem('voltsketch-ics', JSON.stringify(this.ics));
  },

  search(query) {
    const q = query.toLowerCase();
    return this.ics.filter(ic =>
      ic.name.toLowerCase().includes(q) ||
      (ic.manufacturer || '').toLowerCase().includes(q) ||
      (ic.category || '').toLowerCase().includes(q)
    );
  },

  renderCatalog(container) {
    container.innerHTML = '';
    if (this.ics.length === 0) {
      container.innerHTML = '<p style="font-size:12px;color:#64748b;padding:8px;">尚無自訂 IC</p>';
      return;
    }
    for (const ic of this.ics) {
      const card = document.createElement('div');
      card.className = 'component-button';
      card.innerHTML = `<span class="schematic-mini chip-mini">IC</span><span>${ic.name}</span>`;
      card.dataset.icId = ic.id;
      container.appendChild(card);
    }
  },

  openModal() {
    document.getElementById('icModal').hidden = false;
  },

  closeModal() {
    document.getElementById('icModal').hidden = true;
    document.getElementById('icForm').reset();
    document.getElementById('pinsList').innerHTML = '';
  },

  populateForm(ic) {
    document.getElementById('icName').value = ic.name || '';
    document.getElementById('icManufacturer').value = ic.manufacturer || '';
    document.getElementById('icCategory').value = ic.category || 'mcu';
    document.getElementById('icPackage').value = ic.package || '';
    document.getElementById('icDescription').value = ic.description || '';
    document.getElementById('icDatasheetUrl').value = ic.datasheetUrl || '';
    const pinsList = document.getElementById('pinsList');
    pinsList.innerHTML = '';
    (ic.pins || []).forEach(pin => this.addPinRow(pin));
  },

  addPinRow(pin = {}) {
    const pinsList = document.getElementById('pinsList');
    const row = document.createElement('div');
    row.className = 'pin-row';
    row.innerHTML = `
      <input type="text" placeholder="1" value="${pin.number || ''}" data-field="number" />
      <input type="text" placeholder="VCC" value="${pin.name || ''}" data-field="name" />
      <select data-field="type">
        <option value="power" ${pin.type === 'power' ? 'selected' : ''}>Power</option>
        <option value="ground" ${pin.type === 'ground' ? 'selected' : ''}>GND</option>
        <option value="input" ${pin.type === 'input' ? 'selected' : ''}>Input</option>
        <option value="output" ${pin.type === 'output' ? 'selected' : ''}>Output</option>
        <option value="io" ${pin.type === 'io' ? 'selected' : ''}>I/O</option>
        <option value="nc" ${pin.type === 'nc' ? 'selected' : ''}>NC</option>
      </select>
    `;
    document.getElementById('pinsList').appendChild(row);
  },

  collectFormData() {
    const pinRows = document.querySelectorAll('#pinsList .pin-row');
    const pins = Array.from(pinRows).map(row => ({
      number: row.querySelector('[data-field="number"]').value,
      name: row.querySelector('[data-field="name"]').value,
      type: row.querySelector('[data-field="type"]').value
    }));
    return {
      name: document.getElementById('icName').value,
      manufacturer: document.getElementById('icManufacturer').value,
      category: document.getElementById('icCategory').value,
      package: document.getElementById('icPackage').value,
      description: document.getElementById('icDescription').value,
      datasheetUrl: document.getElementById('icDatasheetUrl').value,
      pins
    };
  }
};

// Initialize
ICManager.init();
