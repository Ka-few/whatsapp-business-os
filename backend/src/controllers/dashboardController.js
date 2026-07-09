const { listItems } = require('../services/crmStore');

exports.getDashboardSummary = (_req, res) => {
  const appointments = listItems('appointments');
  const payments = listItems('payments');
  const confirmedAppointments = appointments.filter((appointment) => appointment.status === 'confirmed');
  const revenueToday = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  res.json({
    todayAppointments: confirmedAppointments.length,
    revenueToday,
    pendingBookings: appointments.filter(
      (appointment) => appointment.status === 'pending' || appointment.paymentStatus === 'pending'
    ).length,
    completedServices: confirmedAppointments.length,
    availableStaff: listItems('stylists').length,
    newCustomers: listItems('customers').length,
  });
};
