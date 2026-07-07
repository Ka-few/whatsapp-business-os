# Architecture Overview

## 1. System Architecture

The MVP follows a layered architecture that separates:
- presentation: React dashboard and future WhatsApp client shell
- application: Express REST API and service layer
- data: PostgreSQL with Prisma ORM
- integrations: WhatsApp Cloud API, M-Pesa Daraja, and future email provider

## 2. Core Domains

- Authentication and authorization
- Customer management
- Service and staff management
- Appointment lifecycle
- Payments and notifications
- Business configuration for future SaaS multi-tenancy

## 3. SaaS Readiness

Each domain model includes a business_id field. The current implementation supports one salon, but the code is structured so the business context can be injected later without changing core domain logic.

## 4. Recommended Folder Structure

```text
backend/
  src/
    controllers/
    services/
    routes/
    middleware/
    utils/
frontend/
  src/
    components/
    pages/
    services/
prisma/
  schema.prisma
```

## 5. Component Hierarchy

- AppShell
  - Sidebar
  - TopBar
  - DashboardPage
    - StatCards
    - AppointmentList
    - RevenueChart
  - CalendarPage
  - CustomersPage
  - ServicesPage
  - StaffPage
  - PaymentsPage
  - SettingsPage
