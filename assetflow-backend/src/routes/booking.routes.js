const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
  rescheduleBooking,
  getCalendar,
  getBookingsByResource,
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { bookingValidator, rescheduleValidator } = require('../validators/booking.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
// Specific paths before /:id to avoid route shadowing
router.get('/calendar', getCalendar);
router.get('/resource/:id', getBookingsByResource);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', validate(bookingValidator), createBooking);
// Ownership enforced in controller
router.put('/:id', updateBooking);
router.delete('/:id', authorize(ROLES.ADMIN), deleteBooking);
// Ownership enforced in controller
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/reschedule', validate(rescheduleValidator), rescheduleBooking);

module.exports = router;
