const fs = require('node:fs');
const path = require('node:path');

const dataFile = path.resolve(__dirname, '../../data/crm-store.json');
const defaultState = {
  appointments: [],
  customers: [
    { id: 'cust-1', name: 'Sarah', phone: '+254700000001', notes: 'Prefers morning visits' },
    { id: 'cust-2', name: 'Grace', phone: '+254700000002', notes: 'Loyal client' },
  ],
  services: [
    { id: 'svc-1', name: 'Haircut', price: 1500, duration: '45 min' },
    { id: 'svc-2', name: 'Facial', price: 2500, duration: '60 min' },
    { id: 'svc-3', name: 'Pedicure', price: 1800, duration: '50 min' },
    { id: 'svc-4', name: 'Massage', price: 3000, duration: '60 min' },
    { id: 'svc-5', name: 'Hair Coloring', price: 4500, duration: '120 min' },
  ],
  stylists: [
    { id: 'sty-1', name: 'Maya', specialty: 'Haircuts & styling' },
    { id: 'sty-2', name: 'Amina', specialty: 'Facials & skincare' },
    { id: 'sty-3', name: 'Nia', specialty: 'Coloring & treatments' },
  ],
  payments: [
    { id: 'pay-1', customerName: 'Sarah', amount: 1500, method: 'M-Pesa', status: 'paid' },
  ],
};

function ensureFile() {
  if (!fs.existsSync(dataFile)) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(defaultState, null, 2));
  }
}

function readState() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function writeState(state) {
  ensureFile();
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

function resetState() {
  writeState(defaultState);
}

module.exports = {
  dataFile,
  readState,
  writeState,
  resetState,
  defaultState,
};
