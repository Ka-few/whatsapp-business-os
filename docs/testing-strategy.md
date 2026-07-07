# Testing Strategy

## Backend

- Unit tests for auth, appointment, and payment services
- Integration tests for REST endpoints
- Contract tests for WhatsApp and M-Pesa outbound callbacks

## Frontend

- Component tests for dashboard cards, appointment list, and forms
- End-to-end smoke tests for booking and login flows

## Quality Gates

- Run linting and tests on every pull request
- Verify that environment variables are loaded correctly
- Test the deployment path in a staging environment before production
