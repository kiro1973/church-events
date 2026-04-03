import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate,optionalAuthenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { CreateBookingSchema, ConfirmBookingSchema } from '../schemas';
const router = Router();

// Public + optional auth — guests can book without login
// authenticate is optional here — we use it but don't require it
router.post('/',
  optionalAuthenticate,
  validate(CreateBookingSchema),
  bookingController.createBooking
);

// Protected — registered users only
router.get(
  '/my',
  authenticate,
  bookingController.getMyBookings
);

// Public — anyone with booking id can see it (guests need this)
router.get('/:id', bookingController.getBookingById);

// Protected — Responsible + Admin only
router.patch('/:id/confirm',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  validate(ConfirmBookingSchema),
  bookingController.confirmBooking
);

router.patch(
  '/:id/cancel',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  bookingController.cancelBooking
);

// Dashboard routes
router.get(
  '/dashboard/all',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  bookingController.getAllBookings
);

router.get(
  '/dashboard/:eventId/payment-summary',
  authenticate,
  requireRole('RESPONSIBLE', 'ADMIN'),
  bookingController.getEventPaymentSummary
);

export default router;