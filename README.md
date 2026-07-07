# WhatsApp Business OS

A production-ready MVP blueprint and starter implementation for a WhatsApp-first CRM platform tailored for beauty salons and barbershops.

## What is included

- a scalable architecture for a salon CRM that can evolve into a multi-tenant SaaS product
- a backend starter with Express, Prisma, and JWT-oriented auth placeholders
- a frontend starter with React, Tailwind, and a polished dashboard shell
- deployment, environment, integration, and testing documentation

## Repository structure

```text
backend/
  src/
    app.js
    controllers/
    routes/
frontend/
  src/
    App.jsx
    main.jsx
    index.css
prisma/
  schema.prisma
  seed.js
docs/
  architecture.md
  api.md
  deployment.md
  whatsapp-integration.md
  mpesa-integration.md
  testing-strategy.md
docker-compose.yml
.env.example
package.json
```

## Quick start

1. Install dependencies at the repo root and inside the frontend/backend folders.
2. Copy .env.example to .env and adjust the values.
3. Start PostgreSQL with Docker:
   docker compose up -d
4. Start the backend:
   npm run dev:backend
5. Start the frontend:
   npm run dev:frontend

## MVP capabilities covered

- WhatsApp-first booking workflow design
- appointment, customer, staff, service, and payment domain models
- salon dashboard shell and upcoming appointments view
- role-based access structure and future SaaS-ready business scoping
- Docker, Prisma, API, deployment, and integration documentation

## Twilio setup

To connect this bot to Twilio WhatsApp:

1. Set your Twilio credentials in .env.
2. Configure your Twilio WhatsApp sandbox webhook to point to:
   https://your-public-domain/api/v1/whatsapp/webhook
3. The webhook accepts Twilio-style `From` and `Body` values and returns a TwiML message reply.
4. For local testing, you can expose your local server with a tunneling tool such as ngrok.

## Next steps

- add authentication and real CRUD routes
- connect Prisma to PostgreSQL and generate the client
- implement WhatsApp and M-Pesa webhooks
- build the full salon dashboard, calendar, and CRM modules
