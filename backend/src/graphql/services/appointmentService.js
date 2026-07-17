const prisma = require('../../db');

class AppointmentService {
  static async getAppointments(businessId) {
    return prisma.appointment.findMany({
      where: { businessId },
      include: { customer: true, service: true, staff: true, payments: true },
    });
  }

  static async getAppointmentCalendar(businessId, startDate, endDate) {
    return prisma.appointment.findMany({
      where: {
        businessId,
        appointmentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: { customer: true, service: true, staff: true, payments: true },
      orderBy: { appointmentDate: 'asc' },
    });
  }

  static async createAppointment(businessId, data) {
    const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
    if (!service) throw new Error('Service not found');

    return prisma.appointment.create({
      data: {
        customerId: data.customerId,
        serviceId: data.serviceId,
        staffId: data.staffId,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        durationMin: service.durationMin,
        businessId,
      },
      include: { customer: true, service: true, staff: true, payments: true },
    });
  }

  static async updateAppointmentStatus(id, businessId, status) {
    return prisma.appointment.update({
      where: { id, businessId },
      data: { status },
      include: { customer: true, service: true, staff: true, payments: true },
    });
  }

  static async rescheduleAppointment(id, businessId, appointmentDate, startTime) {
    return prisma.appointment.update({
      where: { id, businessId },
      data: {
        appointmentDate: new Date(appointmentDate),
        startTime,
      },
      include: { customer: true, service: true, staff: true, payments: true },
    });
  }
}

module.exports = AppointmentService;
