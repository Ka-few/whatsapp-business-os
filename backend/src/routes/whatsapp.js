const express = require('express');
const { getBotReply } = require('../services/whatsappBotService');

const router = express.Router();

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/whatsapp/webhook', (_req, res) => {
  res.type('text/plain').send('ok');
});

router.post('/whatsapp/webhook', (req, res) => {
  const body = req.body || {};
  const phoneNumber = body?.From || body?.from || body?.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number || 'unknown';
  const incomingMessage = body?.Body || body?.body || body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || '';

  if (!incomingMessage) {
    return res.type('text/xml').send('<?xml version="1.0" encoding="UTF-8"?><Response />');
  }

  const response = getBotReply(phoneNumber, incomingMessage);
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(response.reply)}</Message></Response>`;

  return res.type('text/xml').send(twiml);
});

module.exports = router;
