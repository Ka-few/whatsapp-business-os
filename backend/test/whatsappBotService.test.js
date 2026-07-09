const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { getBotReply, getAppointments } = require('../src/services/whatsappBotService');
const { dataFile } = require('../src/services/storage');

function loadStore() {
  delete require.cache[require.resolve(path.resolve(__dirname, '../src/services/crmStore.js'))];
  return require('../src/services/crmStore');
}

async function withRestoredStore(testContext, fn) {
  const originalState = fs.existsSync(dataFile) ? fs.readFileSync(dataFile, 'utf8') : null;
  testContext.after(() => {
    if (originalState === null) {
      return;
    }
    fs.writeFileSync(dataFile, originalState);
  });

  await fn();
}

test('welcomes the customer and asks for a service', () => {
  const reply = getBotReply('254700000000', 'hi');
  assert.match(reply.reply, /Choose a service/i);
});

test('collects numbered service, stylist, and time selections in sequence', (testContext) => withRestoredStore(testContext, () => {
  let reply = getBotReply('254700000001', 'hi');
  assert.match(reply.reply, /1\. Haircut/i);

  reply = getBotReply('254700000001', '1');
  assert.match(reply.reply, /1\. Maya/i);

  reply = getBotReply('254700000001', '1');
  assert.match(reply.reply, /1\. 09:00/i);

  reply = getBotReply('254700000001', '1');
  assert.match(reply.reply, /Booking summary/i);
  assert.match(reply.reply, /Choose payment method/i);
}));

test('cash booking saves a confirmed appointment with pending payment', (testContext) => withRestoredStore(testContext, () => {
  const { resetDemoData } = loadStore();
  resetDemoData();

  let reply = getBotReply('254700000002', 'hi');
  reply = getBotReply('254700000002', '2');
  reply = getBotReply('254700000002', '2');
  reply = getBotReply('254700000002', '2');
  reply = getBotReply('254700000002', '1');

  assert.match(reply.reply, /confirmed/i);
  assert.match(reply.reply, /pay when visiting/i);
  const appointments = getAppointments();
  const lastAppointment = appointments[appointments.length - 1];
  assert.equal(lastAppointment.status, 'confirmed');
  assert.equal(lastAppointment.paymentMethod, 'Cash');
  assert.equal(lastAppointment.paymentStatus, 'pending');
  assert.equal(lastAppointment.service, 'Facial');
  assert.equal(lastAppointment.stylist, 'Amina');
  assert.equal(lastAppointment.time, '11:30');
}));

test('mpesa booking prompts for payment and confirms after paid message', (testContext) => withRestoredStore(testContext, () => {
  const { resetDemoData, listItems } = loadStore();
  resetDemoData();

  let reply = getBotReply('254700000003', 'hi');
  reply = getBotReply('254700000003', '1');
  reply = getBotReply('254700000003', '1');
  reply = getBotReply('254700000003', '1');
  reply = getBotReply('254700000003', '2');

  assert.match(reply.reply, /M-Pesa payment request sent/i);

  reply = getBotReply('254700000003', 'PAID');
  assert.match(reply.reply, /Payment received/i);

  const payments = listItems('payments');
  const lastPayment = payments[payments.length - 1];
  assert.equal(lastPayment.method, 'M-Pesa');
  assert.equal(lastPayment.status, 'paid');
}));
