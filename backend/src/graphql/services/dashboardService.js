const prisma = require('../../db');

class DashboardService {
  static async getSummary(businessId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await prisma.appointment.findMany({
      where: {
        businessId,
        appointmentDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: { payments: true },
    });

    const pendingAppointments = todayAppointments.filter((a) => a.status === 'pending').length;
    const completedAppointments = todayAppointments.filter((a) => a.status === 'completed').length;

    let todayRevenue = 0;
    todayAppointments.forEach((appt) => {
      appt.payments.forEach((payment) => {
        if (payment.status === 'paid') {
          todayRevenue += payment.amountCents;
        }
      });
    });

    const allStylists = await prisma.staff.count({ where: { businessId } });
    const busyStylists = new Set(
      todayAppointments.filter((a) => a.status !== 'completed' && a.status !== 'cancelled').map((a) => a.staffId)
    );
    const availableStylists = allStylists - busyStylists.size;

    const newCustomers = await prisma.customer.count({
      where: {
        businessId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      todayRevenue: todayRevenue / 100, // convert cents to float
      todayAppointments: todayAppointments.length,
      pendingAppointments,
      completedAppointments,
      availableStylists,
      newCustomers,
    };
  }
}

module.exports = DashboardService;
