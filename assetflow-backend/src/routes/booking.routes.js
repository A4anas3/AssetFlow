const express = require('express');
const router = express.Router();
const { getBookings, getBookingById, createBooking, updateBooking, deleteBooking, cancelBooking, rescheduleBooking, getCalendar, getBookingsByResource } = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { bookingValidator, rescheduleValidator } = require('../validators/booking.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/calendar', getCalendar);
router.get('/resource/:id', getBookingsByResource);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', validate(bookingValidator), createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', authorize(ROLES.ADMIN), deleteBooking);
router.patch('/:id/cancel', cancelBooking);
router.patch('/:id/reschedule', validate(rescheduleValidator), rescheduleBooking);

module.exports = router;
