# M-Pesa Integration Architecture

## Overview

The MVP uses Daraja-style STK Push for appointment deposits and payment confirmation.

## Flow

1. Appointment is confirmed by the salon.
2. Backend creates an STK push request.
3. Customer completes payment on their phone.
4. Callback updates the payment status.
5. Appointment confirmation is released once the payment is successful.

## Notes

- Keep the payment provider behind a service interface.
- Record payment attempts and status transitions in audit logs.
- Support cash and card methods later through the same domain model.
