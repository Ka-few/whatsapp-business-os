# WhatsApp Business OS

A **WhatsApp-first CRM platform** for beauty salons and barbershops — enabling appointment booking, customer management, staff scheduling, and M-Pesa payments through WhatsApp, backed by a REST API and a React dashboard.

---

## ✨ Features

| Module | Description |
|---|---|
| **WhatsApp Bot** | Twilio-powered webhook handles inbound messages, booking flows, and appointment confirmations |
| **Appointments** | Full CRUD for bookings with status tracking (`pending`, `confirmed`, `cancelled`, `completed`) |
| **Customers** | Customer profiles with phone, gender, birthday, loyalty points, and preferred stylist |
| **Staff** | Staff management with specialisations linked to appointments |
| **Services** | Service catalogue with category, duration, and price |
| **Payments** | Payment records per appointment with M-Pesa and cash support |
| **Notifications** | Outbound WhatsApp reminders and confirmations linked to appointments |
| **Working Hours** | Per-business configurable open/close times per day of week |
| **Business Settings** | Key-value store for per-tenant configuration |
| **Dashboard** | Salon overview — today's appointments, revenue, and quick stats |
| **Auth** | JWT-based login with role-based access scoped to a business |
| **Multi-tenant** | Every model is scoped to a `Business`, making it SaaS-ready |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **TailwindCSS v3** for styling
- Plain JS (no TypeScript) — fast, lightweight MVP shell

### Backend
- **Node.js** + **Express** (CommonJS)
- **Prisma ORM** + **PostgreSQL 16** for data persistence
- **Twilio** SDK for WhatsApp messaging
- **Helmet** + **express-rate-limit** + **CORS** for security
- **dotenv** for environment configuration

### Infrastructure
- **PostgreSQL 16 Alpine** (Docker Compose)
- **ngrok** (recommended for local Twilio webhook tunnelling)

---

## 📁 Project Structure

```
whatsapp-business-os/
├── backend/
│   └── src/
│       ├── app.js                  # Express entry point & middleware
│       ├── controllers/            # Route handler logic
│       ├── middleware/             # Auth & error middleware
│       ├── routes/
│       │   ├── health.js
│       │   ├── auth.js
│       │   ├── appointments.js
│       │   ├── dashboard.js
│       │   └── whatsapp.js         # Twilio webhook handler
│       └── services/               # Business logic & external integrations
├── frontend/
│   └── src/
│       ├── App.jsx                 # Salon dashboard UI
│       ├── main.jsx
│       ├── index.css
│       └── services/               # API client helpers
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.js                     # Seed data
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── deployment.md
│   ├── whatsapp-integration.md
│   ├── mpesa-integration.md
│   └── testing-strategy.md
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Docker](https://www.docker.com/) (for PostgreSQL)
- A [Twilio](https://www.twilio.com/) account with a WhatsApp sandbox number

### 1. Clone the repository

```bash
git clone https://github.com/Ka-few/whatsapp-business-os.git
cd whatsapp-business-os
```

### 2. Start the database

```bash
docker compose up -d
```

Starts **PostgreSQL 16** on port **5432** with database `whatsapp_business_os`.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsapp_business_os
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# M-Pesa (Daraja API)
MPESA_CONSUMER_KEY=change-me
MPESA_CONSUMER_SECRET=change-me
MPESA_SHORTCODE=change-me
MPESA_PASSKEY=change-me

PORT=4000
NODE_ENV=development
```

### 4. Install dependencies

```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 5. Run Prisma migrations & seed

```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 6. Start the dev servers

```bash
# From the project root:
npm run dev:backend    # → http://localhost:4000
npm run dev:frontend   # → http://localhost:5173
```

---

## 📲 WhatsApp Webhook Setup (Twilio)

1. Start your backend and expose it publicly with [ngrok](https://ngrok.com/):
   ```bash
   ngrok http 4000
   ```
2. In the [Twilio Console](https://console.twilio.com/), set your WhatsApp sandbox **"When a message comes in"** webhook to:
   ```
   https://<your-ngrok-id>.ngrok-free.app/api/v1/whatsapp/webhook
   ```
3. Set `TWILIO_WEBHOOK_PATH` in `.env` to the same URL.
4. Send a message to your Twilio sandbox number to trigger the bot.

---

## 🗄️ Database Schema

Key models and their relationships:

```
Business ──< User
         ──< Customer ──< Appointment ──< Payment
         ──< Staff                    ──< Notification
         ──< Service
         ──< WorkingHour
         ──< BusinessSetting
```

Every model is scoped to a `Business` for full multi-tenancy.

---

## 🔌 API Endpoints

All routes are prefixed with `/api/v1`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | ✗ | Health check |
| `POST` | `/auth/login` | ✗ | Login, returns JWT |
| `GET` | `/dashboard` | ✓ | Salon overview stats |
| `GET` | `/appointments` | ✓ | List appointments |
| `POST` | `/appointments` | ✓ | Create appointment |
| `PUT` | `/appointments/:id` | ✓ | Update appointment |
| `DELETE` | `/appointments/:id` | ✓ | Cancel appointment |
| `POST` | `/whatsapp/webhook` | ✗ | Twilio inbound message handler |

---

## 📚 Documentation

Extended documentation lives in the [`docs/`](./docs) folder:

- [`architecture.md`](./docs/architecture.md) — system design and component overview
- [`api.md`](./docs/api.md) — full API reference
- [`whatsapp-integration.md`](./docs/whatsapp-integration.md) — Twilio bot flow details
- [`mpesa-integration.md`](./docs/mpesa-integration.md) — M-Pesa Daraja API integration
- [`deployment.md`](./docs/deployment.md) — production deployment guide
- [`testing-strategy.md`](./docs/testing-strategy.md) — test approach and coverage

---

## 📜 License

[MIT](./LICENSE)
