# Deployment Guide

## Local Development

1. Install Node.js 20+
2. Install Docker Desktop
3. Copy .env.example to .env and adjust values
4. Run docker compose up -d
5. Start the backend and frontend with npm run dev:backend and npm run dev:frontend

## Production

- Deploy the backend to a Node.js hosting platform such as Render, Railway, or AWS ECS
- Deploy the frontend to Vercel or Netlify
- Provision PostgreSQL and configure DATABASE_URL securely
- Enable HTTPS and set strong secrets for JWT and integration credentials
