const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');

const router = express.Router();

router.get('/dashboard/summary', getDashboardSummary);

module.exports = router;
