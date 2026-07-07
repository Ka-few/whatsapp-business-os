# WhatsApp Integration Architecture

## Overview

The MVP uses a provider-agnostic integration layer so the WhatsApp workflow can be swapped later.

## Workflow

1. Customer sends a message to the business number.
2. Webhook receives the inbound event.
3. The bot service resolves the conversation state.
4. The appointment service creates or updates bookings.
5. Notifications are sent back through the provider.

## Suggested Interfaces

- WhatsAppProvider interface
- MessageDispatcher service
- ConversationStateStore
- BookingWorkflow service

## Security

- Validate webhook signatures
- Rate limit inbound traffic
- Store secrets in environment variables
