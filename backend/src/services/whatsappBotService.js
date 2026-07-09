const conversations = new Map();
const appointments = [];
const { readState, writeState, defaultState } = require('./storage');
const { createMpesaPaymentRequest } = require('./paymentService');

const appointmentTimes = ['09:00', '11:30', '14:00'];
const paymentMethods = [
  { key: 'cash', label: 'Cash' },
  { key: 'mpesa', label: 'M-Pesa' },
  { key: 'card', label: 'Card' },
];

function getConversation(phoneNumber) {
  if (!conversations.has(phoneNumber)) {
    conversations.set(phoneNumber, createEmptyConversation());
  }

  return conversations.get(phoneNumber);
}

function createEmptyConversation() {
  return {
    state: 'awaiting_service',
    service: null,
    stylist: null,
    time: null,
    appointmentId: null,
    paymentId: null,
  };
}

function resetConversation(phoneNumber) {
  conversations.set(phoneNumber, createEmptyConversation());
  return conversations.get(phoneNumber);
}

function getCatalog(collection) {
  const state = readState();
  const savedItems = state[collection] || [];
  const defaultItems = defaultState[collection] || [];
  const itemsByName = new Map();

  [...savedItems, ...defaultItems].forEach((item) => {
    if (item?.name && !itemsByName.has(item.name.toLowerCase())) {
      itemsByName.set(item.name.toLowerCase(), item);
    }
  });

  return Array.from(itemsByName.values());
}

function formatNumberedOptions(items, formatter = (item) => item.name) {
  return items.map((item, index) => `${index + 1}. ${formatter(item)}`).join('\n');
}

function getNumberedSelection(message, items) {
  const selection = Number(message.trim());

  if (!Number.isInteger(selection) || selection < 1 || selection > items.length) {
    return null;
  }

  return items[selection - 1];
}

function getServicePrompt() {
  const services = getCatalog('services');
  return `Welcome to Glow Beauty Salon. Choose a service by replying with its number:\n${formatNumberedOptions(
    services,
    (service) => `${service.name} - KES ${service.price || 0}`
  )}`;
}

function getStylistPrompt() {
  const stylists = getCatalog('stylists');
  return `Great choice. Choose a stylist by replying with their number:\n${formatNumberedOptions(
    stylists,
    (stylist) => `${stylist.name}${stylist.specialty ? ` (${stylist.specialty})` : ''}`
  )}`;
}

function getTimePrompt() {
  return `Choose an appointment time by replying with its number:\n${formatNumberedOptions(
    appointmentTimes.map((time) => ({ name: time }))
  )}`;
}

function getPaymentPrompt(conversation) {
  return `Booking summary:\nService: ${conversation.service.name}\nStylist: ${conversation.stylist.name}\nTime: ${conversation.time}\nAmount: KES ${conversation.service.price || 0}\n\nChoose payment method:\n${formatNumberedOptions(paymentMethods, (method) => method.label)}`;
}

function createBooking(phoneNumber, conversation, paymentMethod, paymentStatus) {
  const state = readState();
  const amount = Number(conversation.service.price || 0);
  const appointment = {
    id: `apt-${Date.now()}`,
    phoneNumber,
    customerName: phoneNumber,
    service: conversation.service.name,
    stylist: conversation.stylist.name,
    time: conversation.time,
    status: 'confirmed',
    paymentMethod,
    paymentStatus,
    revenue: amount,
    source: 'WhatsApp',
    createdAt: new Date().toISOString(),
  };

  const payment = {
    id: `pay-${Date.now()}`,
    appointmentId: appointment.id,
    customerName: phoneNumber,
    phoneNumber,
    amount,
    method: paymentMethod,
    status: paymentStatus,
    createdAt: appointment.createdAt,
  };

  state.appointments = state.appointments || [];
  state.payments = state.payments || [];
  state.appointments.push(appointment);
  state.payments.push(payment);
  writeState(state);

  appointments.push(appointment);
  conversation.appointmentId = appointment.id;
  conversation.paymentId = payment.id;

  return { appointment, payment };
}

function updatePaymentStatus(paymentId, appointmentId, status) {
  const state = readState();
  const payment = (state.payments || []).find((item) => item.id === paymentId);
  const appointment = (state.appointments || []).find((item) => item.id === appointmentId);

  if (payment) {
    payment.status = status;
    payment.paidAt = new Date().toISOString();
  }

  if (appointment) {
    appointment.paymentStatus = status;
  }

  writeState(state);
}

function getBotReply(phoneNumber, message) {
  const normalized = message.trim().toLowerCase();
  const conversation = getConversation(phoneNumber);

  if (['hi', 'hello', 'start', 'menu'].includes(normalized)) {
    resetConversation(phoneNumber);
    return {
      reply: getServicePrompt(),
      state: 'awaiting_service',
    };
  }

  if (conversation.state === 'awaiting_service') {
    const service = getNumberedSelection(message, getCatalog('services'));

    if (!service) {
      return {
        reply: `Please reply with a valid service number.\n${getServicePrompt()}`,
        state: conversation.state,
      };
    }

    conversation.service = service;
    conversation.state = 'awaiting_stylist';
    return {
      reply: getStylistPrompt(),
      state: conversation.state,
    };
  }

  if (conversation.state === 'awaiting_stylist') {
    const stylist = getNumberedSelection(message, getCatalog('stylists'));

    if (!stylist) {
      return {
        reply: `Please reply with a valid stylist number.\n${getStylistPrompt()}`,
        state: conversation.state,
      };
    }

    conversation.stylist = stylist;
    conversation.state = 'awaiting_time';
    return {
      reply: getTimePrompt(),
      state: conversation.state,
    };
  }

  if (conversation.state === 'awaiting_time') {
    const selectedTime = getNumberedSelection(
      message,
      appointmentTimes.map((time) => ({ name: time }))
    );

    if (!selectedTime) {
      return {
        reply: `Please reply with a valid time number.\n${getTimePrompt()}`,
        state: conversation.state,
      };
    }

    conversation.time = selectedTime.name;
    conversation.state = 'awaiting_payment_method';
    return {
      reply: getPaymentPrompt(conversation),
      state: conversation.state,
    };
  }

  if (conversation.state === 'awaiting_payment_method') {
    const paymentMethod = getNumberedSelection(message, paymentMethods);

    if (!paymentMethod) {
      return {
        reply: `Please reply with a valid payment method number.\n${getPaymentPrompt(conversation)}`,
        state: conversation.state,
      };
    }

    if (paymentMethod.key === 'cash') {
      createBooking(phoneNumber, conversation, 'Cash', 'pending');
      conversation.state = 'confirmed';
      return {
        reply:
          'Your booking is confirmed. Payment is pending and marked as pay when visiting. See you at the salon.',
        state: conversation.state,
      };
    }

    if (paymentMethod.key === 'mpesa') {
      const { appointment, payment } = createBooking(phoneNumber, conversation, 'M-Pesa', 'pending');
      const mpesaRequest = createMpesaPaymentRequest({
        phoneNumber,
        amount: payment.amount,
        reference: appointment.id,
      });
      conversation.state = 'awaiting_mpesa_confirmation';
      return {
        reply: `${mpesaRequest.message} Complete the prompt on your phone, then reply PAID after the payment succeeds.`,
        state: conversation.state,
      };
    }

    createBooking(phoneNumber, conversation, 'Card', 'pending');
    conversation.state = 'awaiting_card_payment';
    return {
      reply:
        'Your booking is reserved. Card payment is pending. Reply PAID after the card payment is completed.',
      state: conversation.state,
    };
  }

  if (normalized === 'paid' && ['awaiting_mpesa_confirmation', 'awaiting_card_payment'].includes(conversation.state)) {
    updatePaymentStatus(conversation.paymentId, conversation.appointmentId, 'paid');
    conversation.state = 'confirmed';
    return {
      reply: 'Payment received. Your booking is confirmed. Thank you for choosing Glow Beauty Salon.',
      state: conversation.state,
    };
  }

  return {
    reply: 'I did not understand that. Reply MENU to start again or choose one of the numbered options.',
    state: conversation.state,
  };
}

function getAppointments() {
  return appointments;
}

module.exports = {
  getBotReply,
  getAppointments,
};
