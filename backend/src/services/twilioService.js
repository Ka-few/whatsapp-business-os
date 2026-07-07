const twilio = require('twilio');

function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return null;
  }

  return twilio(accountSid, authToken);
}

async function sendTwilioMessage(to, body) {
  const client = createTwilioClient();

  if (!client) {
    return { ok: false, message: 'Twilio credentials are not configured' };
  }

  const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  const message = await client.messages.create({
    from,
    to: `whatsapp:${to}`,
    body,
  });

  return { ok: true, sid: message.sid };
}

module.exports = {
  sendTwilioMessage,
};
