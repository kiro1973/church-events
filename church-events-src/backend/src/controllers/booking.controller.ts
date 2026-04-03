import { Request, Response } from 'express';
import * as bookingService from '../services/booking.service';

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    // userId is undefined if guest booking
    const userId = req.user?.userId;
    const booking = await bookingService.createBooking(req.body, userId);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookings = await bookingService.getMyBookings(req.user!.userId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;
    const booking = await bookingService.getBookingById(id, userId);
    res.json(booking);
  } catch (error: any) {
    const status = 
      error.message === 'Booking not found' ? 404 :
      error.message === 'Unauthorized' ? 403 : 500;
    res.status(status).json({ message: error.message });
  }
};

export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { paymentMethod } = req.body;

    if (!['INSTAPAY', 'CASH'].includes(paymentMethod)) {
      res.status(400).json({ message: 'Invalid payment method' });
      return;
    }

    const booking = await bookingService.confirmBooking(
      id,
      paymentMethod,
      req.user!.userId
    );
    res.json(booking);
  } catch (error: any) {
    const status = error.message === 'Booking not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Get responsible info to include in cancellation email
    const responsible = await import('../services/auth.service')
      .then(m => m.getResponsibleInfo(req.user!.userId));

    const booking = await bookingService.cancelBooking(id, responsible);
    res.json(booking);
  } catch (error: any) {
    const status = error.message === 'Booking not found' ? 404 : 400;
    res.status(status).json({ message: error.message });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.query.eventId as string | undefined;
    const bookings = await bookingService.getAllBookings(eventId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventPaymentSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.eventId as string;
    const summary = await bookingService.getEventPaymentSummary(eventId);
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};