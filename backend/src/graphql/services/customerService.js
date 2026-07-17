const prisma = require('../../db');

class CustomerService {
  static async getCustomers(businessId) {
    return prisma.customer.findMany({
      where: { businessId },
    });
  }

  static async getCustomerById(id, businessId) {
    return prisma.customer.findFirst({
      where: { id, businessId },
    });
  }

  static async createCustomer(businessId, data) {
    return prisma.customer.create({
      data: {
        ...data,
        businessId,
      },
    });
  }

  static async updateCustomer(id, businessId, data) {
    return prisma.customer.update({
      where: { id, businessId },
      data,
    });
  }

  static async deleteCustomer(id, businessId) {
    await prisma.customer.delete({
      where: { id, businessId },
    });
    return true;
  }

  static async getCustomerProfile(id, businessId) {
    const customer = await this.getCustomerById(id, businessId);
    if (!customer) throw new Error('Customer not found');

    const appointmentHistory = await prisma.appointment.findMany({
      where: { customerId: id, businessId },
      include: { service: true, staff: true, payments: true },
      orderBy: { appointmentDate: 'desc' },
    });

    const paymentHistory = await prisma.payment.findMany({
      where: { appointment: { customerId: id }, businessId },
      include: { appointment: true },
      orderBy: { createdAt: 'desc' },
    });

    const visitCount = appointmentHistory.filter((a) => a.status === 'completed').length;
    const totalSpending = paymentHistory
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amountCents, 0) / 100; // Convert to float revenue

    let favoriteStylist = null;
    let favoriteServices = [];

    // Basic logic for favorite stylist and services based on appointment history
    if (appointmentHistory.length > 0) {
      const stylistCounts = {};
      const serviceCounts = {};

      appointmentHistory.forEach((appt) => {
        if (appt.staffId) {
          stylistCounts[appt.staffId] = (stylistCounts[appt.staffId] || 0) + 1;
        }
        if (appt.serviceId) {
          serviceCounts[appt.serviceId] = (serviceCounts[appt.serviceId] || 0) + 1;
        }
      });

      const topStylistId = Object.keys(stylistCounts).sort((a, b) => stylistCounts[b] - stylistCounts[a])[0];
      if (topStylistId) {
        favoriteStylist = await prisma.staff.findUnique({ where: { id: topStylistId } });
      }

      const topServiceIds = Object.keys(serviceCounts)
        .sort((a, b) => serviceCounts[b] - serviceCounts[a])
        .slice(0, 3);
      if (topServiceIds.length > 0) {
        favoriteServices = await prisma.service.findMany({
          where: { id: { in: topServiceIds } },
        });
      }
    }

    return {
      customer,
      appointmentHistory,
      paymentHistory,
      favoriteStylist,
      favoriteServices,
      totalSpending,
      visitCount,
      loyaltyPoints: customer.loyaltyPoints,
    };
  }
}

module.exports = CustomerService;
