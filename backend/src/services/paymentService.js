function createMpesaPaymentRequest({ phoneNumber, amount, reference }) {
  const checkoutRequestId = `mpesa-${Date.now()}`;

  return {
    checkoutRequestId,
    provider: 'M-Pesa',
    status: 'pending',
    message: `M-Pesa payment request sent to ${phoneNumber} for KES ${amount}.`,
    reference,
  };
}

module.exports = {
  createMpesaPaymentRequest,
};
