const prisma = require('../../db');

class PaymentService {
  static async getPayments(businessId) {
    return prisma.payment.findMany({
      where: { businessId },
      include: { appointment: true },
    });
  }

  static async markPaymentPaid(id, businessId) {
    return prisma.payment.update({
      where: { id, businessId },
      data: { status: 'paid' },
      include: { appointment: true },
    });
  }

  static async refundPayment(id, businessId) {
    return prisma.payment.update({
      where: { id, businessId },
      data: { status: 'refunded' },
      include: { appointment: true },
    });
  }

  static async getPaymentsAnalytics(businessId, period) {
    const payments = await prisma.payment.findMany({
      where: { businessId }
    });

    let pending = 0;
    let paid = 0;
    let failed = 0; // Or refunded

    payments.forEach(p => {
      if (p.status === 'pending') pending += p.amountCents;
      else if (p.status === 'paid') paid += p.amountCents;
      else if (p.status === 'failed' || p.status === 'refunded') failed += p.amountCents;
    });

    return {
      pendingPayments: pending / 100,
      paidPayments: paid / 100,
      failedPayments: failed / 100,
      dailyRevenue: paid / 100, // simplified for MVP
      monthlyRevenue: paid / 100, // simplified for MVP
    };
  }
}

module.exports = PaymentService;
