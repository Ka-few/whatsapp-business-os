# REST API Documentation

## Authentication

- POST /api/v1/auth/login
- POST /api/v1/auth/register
- POST /api/v1/auth/logout
- POST /api/v1/auth/forgot-password

## Customers

- GET /api/v1/customers
- POST /api/v1/customers
- GET /api/v1/customers/:id
- PATCH /api/v1/customers/:id

## Services

- GET /api/v1/services
- POST /api/v1/services
- PATCH /api/v1/services/:id

## Appointments

- GET /api/v1/appointments
- POST /api/v1/appointments
- PATCH /api/v1/appointments/:id
- DELETE /api/v1/appointments/:id

## Payments

- POST /api/v1/payments/stk-push
- GET /api/v1/payments
- PATCH /api/v1/payments/:id

## Dashboard

- GET /api/v1/dashboard/summary
