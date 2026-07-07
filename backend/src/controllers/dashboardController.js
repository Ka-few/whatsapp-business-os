const { listItems } = require('../services/crmStore');

exports.getDashboardSummary = (_req, res) => {
  const appointments = listItems('appointments');
  const confirmedAppointments = appointments.filter((appointment) => appointment.status === 'confirmed');
  const revenueToday = confirmedAppointments.reduce((sum, appointment) => sum + Number(appointment.revenue || 0), 0);

  res.json({
    todayAppointments: confirmedAppointments.length,
    revenueToday,
    pendingBookings: appointments.filter((appointment) => appointment.status === 'pending').length,
    completedServices: confirmedAppointments.length,
    availableStaff: listItems('stylists').length,
    newCustomers: listItems('customers').length,
  });
};
