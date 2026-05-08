// components/stat-card/stat-card.js
Component({
  properties: {
    title: { type: String, value: '' },
    value: { type: [Number, String], value: 0 },
    unit: { type: String, value: '' },
    icon: { type: String, value: '' },
    color: { type: String, value: '#3498db' },
  }
})
