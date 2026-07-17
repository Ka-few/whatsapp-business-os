const CustomerService = require('../services/customerService');
const AppointmentService = require('../services/appointmentService');
const DashboardService = require('../services/dashboardService');
const StaffService = require('../services/staffService');
const ServiceService = require('../services/serviceService');
const PaymentService = require('../services/paymentService');

const resolvers = {
  Query: {
    dashboardSummary: async (_, __, { businessId }) => {
      return DashboardService.getSummary(businessId);
    },
    appointmentCalendar: async (_, { startDate, endDate }, { businessId }) => {
      return AppointmentService.getAppointmentCalendar(businessId, startDate, endDate);
    },
    customerProfile: async (_, { customerId }, { businessId }) => {
      return CustomerService.getCustomerProfile(customerId, businessId);
    },
    staffPerformance: async (_, { period }, { businessId }) => {
      return StaffService.getStaffPerformance(businessId, period);
    },
    servicesAnalytics: async (_, { period }, { businessId }) => {
      return ServiceService.getServicesAnalytics(businessId, period);
    },
    paymentsAnalytics: async (_, { period }, { businessId }) => {
      return PaymentService.getPaymentsAnalytics(businessId, period);
    },

    // Generic list queries
    customers: async (_, __, { businessId }) => {
      return CustomerService.getCustomers(businessId);
    },
    appointments: async (_, __, { businessId }) => {
      return AppointmentService.getAppointments(businessId);
    },
    services: async (_, __, { businessId }) => {
      return ServiceService.getServices(businessId);
    },
    stylists: async (_, __, { businessId }) => {
      return StaffService.getStylists(businessId);
    },
    payments: async (_, __, { businessId }) => {
      return PaymentService.getPayments(businessId);
    }
  },

  Mutation: {
    // Customer
    createCustomer: async (_, args, { businessId }) => {
      return CustomerService.createCustomer(businessId, args);
    },
    updateCustomer: async (_, { id, ...data }, { businessId }) => {
      return CustomerService.updateCustomer(id, businessId, data);
    },
    deleteCustomer: async (_, { id }, { businessId }) => {
      return CustomerService.deleteCustomer(id, businessId);
    },

    // Appointment
    createAppointment: async (_, args, { businessId }) => {
      return AppointmentService.createAppointment(businessId, args);
    },
    confirmAppointment: async (_, { id }, { businessId }) => {
      return AppointmentService.updateAppointmentStatus(id, businessId, 'confirmed');
    },
    rescheduleAppointment: async (_, { id, appointmentDate, startTime }, { businessId }) => {
      return AppointmentService.rescheduleAppointment(id, businessId, appointmentDate, startTime);
    },
    cancelAppointment: async (_, { id }, { businessId }) => {
      return AppointmentService.updateAppointmentStatus(id, businessId, 'cancelled');
    },
    completeAppointment: async (_, { id }, { businessId }) => {
      return AppointmentService.updateAppointmentStatus(id, businessId, 'completed');
    },

    // Service
    createService: async (_, args, { businessId }) => {
      return ServiceService.createService(businessId, args);
    },
    updateService: async (_, { id, ...data }, { businessId }) => {
      return ServiceService.updateService(id, businessId, data);
    },
    deleteService: async (_, { id }, { businessId }) => {
      return ServiceService.deleteService(id, businessId);
    },

    // Stylist
    createStylist: async (_, args, { businessId }) => {
      return StaffService.createStylist(businessId, args);
    },
    updateStylist: async (_, { id, ...data }, { businessId }) => {
      return StaffService.updateStylist(id, businessId, data);
    },
    deleteStylist: async (_, { id }, { businessId }) => {
      return StaffService.deleteStylist(id, businessId);
    },

    // Payment
    markPaymentPaid: async (_, { id }, { businessId }) => {
      return PaymentService.markPaymentPaid(id, businessId);
    },
    refundPayment: async (_, { id }, { businessId }) => {
      return PaymentService.refundPayment(id, businessId);
    }
  }
};

module.exports = resolvers;
