const prisma = require('../../db');

class ServiceService {
  static async getServices(businessId) {
    return prisma.service.findMany({
      where: { businessId },
    });
  }

  static async createService(businessId, data) {
    return prisma.service.create({
      data: {
        ...data,
        businessId,
      },
    });
  }

  static async updateService(id, businessId, data) {
    return prisma.service.update({
      where: { id, businessId },
      data,
    });
  }

  static async deleteService(id, businessId) {
    await prisma.service.delete({
      where: { id, businessId },
    });
    return true;
  }

  static async getServicesAnalytics(businessId, period) {
    const services = await this.getServices(businessId);
    
    return Promise.all(services.map(async (service) => {
      const appointments = await prisma.appointment.findMany({
        where: { serviceId: service.id, businessId, status: 'completed' },
        include: { payments: true }
      });

      let revenue = 0;
      appointments.forEach(appt => {
        appt.payments.forEach(p => {
          if (p.status === 'paid') revenue += p.amountCents;
        });
      });

      return {
        service,
        popularity: appointments.length, // simple booking count for popularity
        revenueGenerated: revenue / 100,
        averageDuration: service.durationMin,
        numberOfBookings: appointments.length,
      };
    }));
  }
}

module.exports = ServiceService;
