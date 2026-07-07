const express = require('express');
const { createAppointment } = require('../services/appointmentService');
const { requireAuth } = require('../middleware/auth');
const { listItems, createItem, updateItem, deleteItem } = require('../services/crmStore');

const router = express.Router();

router.get('/appointments', requireAuth, (_req, res) => {
  res.json(listItems('appointments'));
});

router.post('/appointments', requireAuth, async (req, res) => {
  const appointment = await createAppointment(req.body);
  const saved = createItem('appointments', {
    ...appointment.appointment,
    ...req.body,
    status: req.body.status || 'pending',
  });
  res.status(201).json(saved);
});

router.put('/appointments/:id', requireAuth, (req, res) => {
  const updated = updateItem('appointments', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.json(updated);
});

router.delete('/appointments/:id', requireAuth, (req, res) => {
  const removed = deleteItem('appointments', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.json(removed);
});

router.get('/customers', requireAuth, (_req, res) => {
  res.json(listItems('customers'));
});

router.post('/customers', requireAuth, (req, res) => {
  res.status(201).json(createItem('customers', req.body));
});

router.put('/customers/:id', requireAuth, (req, res) => {
  const updated = updateItem('customers', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(updated);
});

router.delete('/customers/:id', requireAuth, (req, res) => {
  const removed = deleteItem('customers', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(removed);
});

router.get('/services', requireAuth, (_req, res) => {
  res.json(listItems('services'));
});

router.post('/services', requireAuth, (req, res) => {
  res.status(201).json(createItem('services', req.body));
});

router.put('/services/:id', requireAuth, (req, res) => {
  const updated = updateItem('services', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json(updated);
});

router.delete('/services/:id', requireAuth, (req, res) => {
  const removed = deleteItem('services', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json(removed);
});

router.get('/stylists', requireAuth, (_req, res) => {
  res.json(listItems('stylists'));
});

router.post('/stylists', requireAuth, (req, res) => {
  res.status(201).json(createItem('stylists', req.body));
});

router.put('/stylists/:id', requireAuth, (req, res) => {
  const updated = updateItem('stylists', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Stylist not found' });
  }
  res.json(updated);
});

router.delete('/stylists/:id', requireAuth, (req, res) => {
  const removed = deleteItem('stylists', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Stylist not found' });
  }
  res.json(removed);
});

router.get('/payments', requireAuth, (_req, res) => {
  res.json(listItems('payments'));
});

router.post('/payments', requireAuth, (req, res) => {
  res.status(201).json(createItem('payments', req.body));
});

router.put('/payments/:id', requireAuth, (req, res) => {
  const updated = updateItem('payments', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  res.json(updated);
});

router.delete('/payments/:id', requireAuth, (req, res) => {
  const removed = deleteItem('payments', req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  res.json(removed);
});

module.exports = router;
