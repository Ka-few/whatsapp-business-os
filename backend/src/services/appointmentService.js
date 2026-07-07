exports.createAppointment = async (payload) => ({
  ok: true,
  appointment: {
    id: 'demo-appointment',
    ...payload,
    status: 'pending',
  },
});
