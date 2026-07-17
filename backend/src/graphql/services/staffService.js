const prisma = require('../../db');

class StaffService {
  static async getStylists(businessId) {
    return prisma.staff.findMany({
      where: { businessId },
      include: { appointments: true },
    });
  }

  static async createStylist(businessId, data) {
    return prisma.staff.create({
      data: {
        ...data,
        businessId,
      },
    });
  }

  static async updateStylist(id, businessId, data) {
    return prisma.staff.update({
      where: { id, businessId },
      data,
    });
  }

  static async deleteStylist(id, businessId) {
    await prisma.staff.delete({
      where: { id, businessId },
    });
    return true;
  }

  static async getStaffPerformance(businessId, period) {
    // Basic implementation for performance
    const stylists = await this.getStylists(businessId);
    
    // For MVP, we calculate all-time performance. 
    // In a production app, we would filter by `period` (daily, weekly, monthly).
    const staffPerformance = await Promise.all(stylists.map(async (stylist) => {
      const appointments = await prisma.appointment.findMany({
        where: { staffId: stylist.id, businessId, status: 'completed' },
        include: { payments: true, service: true },
      });

      let revenue = 0;
      const serviceCounts = {};

      appointments.forEach((appt) => {
        appt.payments.forEach(p => {
          if (p.status === 'paid') revenue += p.amountCents;
        });
        if (appt.service) {
          serviceCounts[appt.serviceId] = (serviceCounts[appt.serviceId] || 0) + 1;
        }
      });

      const topServiceIds = Object.keys(serviceCounts)
        .sort((a, b) => serviceCounts[b] - serviceCounts[a])
        .slice(0, 3);
      
      let mostRequestedServices = [];
      if (topServiceIds.length > 0) {
        mostRequestedServices = await prisma.service.findMany({
          where: { id: { in: topServiceIds } }
        });
      }

      return {
        stylist,
        appointmentCount: appointments.length,
        revenueGenerated: revenue / 100,
        averageRating: 5.0, // Mocked rating
        mostRequestedServices,
      };
    }));

    return staffPerformance;
  }
}

module.exports = StaffService;
