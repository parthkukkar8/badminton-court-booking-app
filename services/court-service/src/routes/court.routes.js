const express = require('express');
const adminAuth = require('../middlewares/adminAuth');
const {
  addCourt,
  getAllCourts,
  getNearbyCourts,
  deleteCourt,
  updateSlot,
  getSingleCourt,
} = require('../controllers/court.controller');

const router = express.Router();

// ✅ CORRECT ORDER
// Specific routes FIRST
router.get('/nearby', getNearbyCourts);        // /nearby
router.get('/all', adminAuth, getAllCourts);    // /all

// Dynamic routes LAST
router.get('/:courtId', getSingleCourt);       // /:courtId

// Other routes
router.post('/add', adminAuth, addCourt);
router.delete('/:courtId', adminAuth, deleteCourt);
router.patch('/:courtId/slots/:slotId', updateSlot);

module.exports = router;
