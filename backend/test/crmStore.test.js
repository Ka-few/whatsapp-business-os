const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const storeModulePath = path.resolve(__dirname, '../src/services/crmStore.js');

function loadStore() {
  delete require.cache[require.resolve(storeModulePath)];
  return require(storeModulePath);
}

test('appointments CRUD round trip works', () => {
  const { resetDemoData, createItem, listItems, updateItem, deleteItem } = loadStore();
  resetDemoData();

  const created = createItem('appointments', {
    customerName: 'Jane',
    service: 'Haircut',
    stylist: 'Maya',
    time: '10:00',
    status: 'pending',
    revenue: 1500,
  });

  assert.equal(created.customerName, 'Jane');
  assert.equal(listItems('appointments').length, 1);

  const updated = updateItem('appointments', created.id, { status: 'confirmed' });
  assert.equal(updated.status, 'confirmed');

  const removed = deleteItem('appointments', created.id);
  assert.equal(removed.id, created.id);
  assert.equal(listItems('appointments').some((item) => item.id === created.id), false);
});

test('created items are still available after reloading the store module', () => {
  const { resetDemoData, createItem, listItems } = loadStore();
  resetDemoData();
  const created = createItem('customers', { name: 'Alicia', phone: '+254700111222', notes: 'VIP' });

  const reloadedStore = loadStore();
  const saved = reloadedStore.listItems('customers').find((item) => item.id === created.id);

  assert.ok(saved);
  assert.equal(saved.name, 'Alicia');
  assert.equal(saved.phone, '+254700111222');

  const dataFile = path.resolve(__dirname, '../data/crm-store.json');
  assert.ok(fs.existsSync(dataFile));
});
