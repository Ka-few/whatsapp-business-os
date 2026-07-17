const typeDefs = `
  type DashboardSummary {
    todayRevenue: Float!
    todayAppointments: Int!
    pendingAppointments: Int!
    completedAppointments: Int!
    availableStylists: Int!
    newCustomers: Int!
  }

  type Appointment {
    id: ID!
    customer: Customer!
    service: Service!
    staff: Stylist!
    appointmentDate: String!
    startTime: String!
    durationMin: Int!
    status: String!
    payments: [Payment!]!
  }

  type Customer {
    id: ID!
    fullName: String!
    phoneNumber: String!
    gender: String
    birthday: String
    notes: String
    loyaltyPoints: Int!
    preferredStylistId: ID
    preferredStylist: Stylist
    appointments: [Appointment!]!
    payments: [Payment!]!
    createdAt: String!
  }

  type CustomerProfile {
    customer: Customer!
    appointmentHistory: [Appointment!]!
    paymentHistory: [Payment!]!
    favoriteStylist: Stylist
    favoriteServices: [Service!]!
    totalSpending: Float!
    visitCount: Int!
    loyaltyPoints: Int!
  }

  type Stylist {
    id: ID!
    name: String!
    specialization: String
    appointments: [Appointment!]!
  }

  type StaffPerformance {
    stylist: Stylist!
    appointmentCount: Int!
    revenueGenerated: Float!
    averageRating: Float
    mostRequestedServices: [Service!]!
  }

  type Service {
    id: ID!
    name: String!
    description: String
    category: String!
    durationMin: Int!
    priceCents: Int!
    status: String!
  }

  type ServiceAnalytics {
    service: Service!
    popularity: Int!
    revenueGenerated: Float!
    averageDuration: Float!
    numberOfBookings: Int!
  }

  type Payment {
    id: ID!
    appointment: Appointment!
    method: String!
    status: String!
    amountCents: Int!
    createdAt: String!
  }

  type PaymentAnalytics {
    pendingPayments: Float!
    paidPayments: Float!
    failedPayments: Float!
    dailyRevenue: Float!
    monthlyRevenue: Float!
  }

  type Query {
    dashboardSummary: DashboardSummary!
    appointmentCalendar(startDate: String!, endDate: String!): [Appointment!]!
    customerProfile(customerId: ID!): CustomerProfile!
    staffPerformance(period: String!): [StaffPerformance!]!
    servicesAnalytics(period: String!): [ServiceAnalytics!]!
    paymentsAnalytics(period: String!): PaymentAnalytics!
    
    # Generic queries for listing
    customers: [Customer!]!
    appointments: [Appointment!]!
    services: [Service!]!
    stylists: [Stylist!]!
    payments: [Payment!]!
  }

  type Mutation {
    # Customer
    createCustomer(fullName: String!, phoneNumber: String!, gender: String, birthday: String, notes: String, preferredStylistId: ID): Customer!
    updateCustomer(id: ID!, fullName: String, phoneNumber: String, gender: String, birthday: String, notes: String, preferredStylistId: ID): Customer!
    deleteCustomer(id: ID!): Boolean!

    # Appointments
    createAppointment(customerId: ID!, serviceId: ID!, staffId: ID!, appointmentDate: String!, startTime: String!): Appointment!
    confirmAppointment(id: ID!): Appointment!
    rescheduleAppointment(id: ID!, appointmentDate: String!, startTime: String!): Appointment!
    cancelAppointment(id: ID!): Appointment!
    completeAppointment(id: ID!): Appointment!

    # Services
    createService(name: String!, description: String, category: String!, durationMin: Int!, priceCents: Int!): Service!
    updateService(id: ID!, name: String, description: String, category: String, durationMin: Int, priceCents: Int, status: String): Service!
    deleteService(id: ID!): Boolean!

    # Stylists (Staff)
    createStylist(name: String!, specialization: String): Stylist!
    updateStylist(id: ID!, name: String, specialization: String): Stylist!
    deleteStylist(id: ID!): Boolean!

    # Payments
    markPaymentPaid(id: ID!): Payment!
    refundPayment(id: ID!): Payment!
  }
`;

module.exports = typeDefs;
