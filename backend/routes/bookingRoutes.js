import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/all', protect, admin, getAllBookings);
router.put('/:id/cancel', protect, cancelBooking);

export default router;
