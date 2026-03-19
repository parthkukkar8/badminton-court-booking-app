const express = require('express');
const adminAuth = require('../middlewares/adminAuth');
const {
  addCourt,
  getAllCourts,
  getNearbyCourts,
  deleteCourt,
} = require('../controllers/court.controller');

const router = express.Router();

// PUBLIC routes — no auth needed
// Users call this to see courts near them
router.get('/nearby', getNearbyCourts);

// ADMIN routes — protected by adminAuth middleware
// adminAuth runs BEFORE the controller
// If adminAuth fails → returns 401/403, controller never runs
// If adminAuth passes → controller runs
router.get('/all', adminAuth, getAllCourts);
router.post('/add', adminAuth, addCourt);
router.delete('/:courtId', adminAuth, deleteCourt);

module.exports = router;