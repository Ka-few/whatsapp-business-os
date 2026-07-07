const conversations = new Map();
const appointments = [];
const { readState, writeState } = require('./storage');

function getConversation(phoneNumber) {
  if (!conversations.has(phoneNumber)) {
    conversations.set(phoneNumber, {
      state: 'awaiting_service',
      service: null,
      stylist: null,
      time: null,
    });
  }

  return conversations.get(phoneNumber);
}

function getBotReply(phoneNumber, message) {
  const normalized = message.trim().toLowerCase();
  const conversation = getConversation(phoneNumber);

  if (normalized === 'hi' || normalized === 'hello') {
    conversation.state = 'awaiting_service';
    return {
      reply: 'Welcome to Glow Beauty Salon. Choose a service: Haircut, Facial, Pedicure, Massage, Hair Coloring.',
      state: conversation.state,
    };
  }

  if (conversation.state === 'awaiting_service') {
    conversation.service = message.trim();
    conversation.state = 'awaiting_stylist';
    return {
      reply: 'Great choice. Choose a stylist: Maya, Amina, Nia.',
      state: conversation.state,
    };
  }

  if (conversation.state === 'awaiting_stylist') {
    conversation.stylist = message.trim();
    conversation.state = 'awaiting_time';
    return {
      reply: 'Choose an appointment time: 09:00, 11:30, 14:00.',
      state: conversation.state,
    };
  }

  if (conversation.state === 'awaiting_time') {
    conversation.time = message.trim();
    conversation.state = 'booking_summary';
    return {
      reply: `Booking summary: Service: ${conversation.service}, Stylist: ${conversation.stylist}, Time: ${conversation.time}. Reply YES to confirm your booking.`,
      state: conversation.state,
    };
  }

  if (normalized === 'yes' && conversation.state === 'booking_summary') {
    conversation.state = 'confirmed';
    const appointment = {
      id: `apt-${appointments.length + 1}`,
      phoneNumber,
      customerName: phoneNumber,
      service: conversation.service,
      stylist: conversation.stylist,
      time: conversation.time,
      status: 'confirmed',
      revenue: 1500,
      source: 'WhatsApp',
      createdAt: new Date().toISOString(),
    };
    appointments.push(appointment);
    const state = readState();
    state.appointments = state.appointments || [];
    state.appointments.push(appointment);
    writeState(state);

    return {
      reply: 'Your booking has been confirmed. A confirmation message will be sent shortly.',
      state: conversation.state,
    };
  }

  return {
    reply: 'I did not understand that. Please reply with a valid option.',
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
