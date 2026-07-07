const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { getBotReply, getAppointments } = require('../src/services/whatsappBotService');

function loadStore() {
  delete require.cache[require.resolve(path.resolve(__dirname, '../src/services/crmStore.js'))];
  return require('../src/services/crmStore');
}

test('welcomes the customer and asks for a service', () => {
  const reply = getBotReply('254700000000', 'hi');
  assert.match(reply.reply, /Choose a service/i);
});

test('collects service, stylist, and time in sequence', () => {
  let reply = getBotReply('254700000001', 'hi');
  assert.match(reply.reply, /Choose a service/i);

  reply = getBotReply('254700000001', 'Haircut');
  assert.match(reply.reply, /Choose a stylist/i);

  reply = getBotReply('254700000001', 'Maya');
  assert.match(reply.reply, /Choose an appointment time/i);

  reply = getBotReply('254700000001', '09:00');
  assert.match(reply.reply, /Booking summary/i);
});

test('confirming a WhatsApp booking saves it to the dashboard store', () => {
  const { resetDemoData } = loadStore();
  resetDemoData();

  let reply = getBotReply('254700000002', 'hi');
  reply = getBotReply('254700000002', 'Facial');
  reply = getBotReply('254700000002', 'Amina');
  reply = getBotReply('254700000002', '11:30');
  reply = getBotReply('254700000002', 'YES');

  assert.match(reply.reply, /confirmed/i);
  const appointments = getAppointments();
  const lastAppointment = appointments[appointments.length - 1];
  assert.equal(lastAppointment.status, 'confirmed');
  assert.equal(lastAppointment.service, 'Facial');
  assert.equal(lastAppointment.stylist, 'Amina');
  assert.equal(lastAppointment.time, '11:30');
});
