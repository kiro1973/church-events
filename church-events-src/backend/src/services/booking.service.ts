import prisma from '../prisma';
import { CreateBookingInput } from '../types';
import * as emailService from './email.service';

export const createBooking = async (
  input: CreateBookingInput,
  userId?: string
) => {
  const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1); // next day
tomorrow.setHours(23, 59, 59, 999);       // end of that day
const holdExpiresAt = tomorrow;

  return prisma.$transaction(async (tx) => {

    // Step 1 — find seats by eventId + row + col
    // uses @@unique([eventId, row, col]) composite index → fast
    const seats = await tx.seat.findMany({
      where: {
        eventId: input.eventId,
        OR: input.seats.map(s => ({ row: s.row, col: s.col }))
      },
      select: { id: true, status: true, row: true, col: true }
    });

    // Step 2 — verify we found all requested seats
    if (seats.length !== input.seats.length) {
      throw new Error('Some seats do not exist');
    }

    // Step 3 — verify all are AVAILABLE
    const unavailable = seats.filter(s => s.status !== 'AVAILABLE');
    if (unavailable.length > 0) {
      throw new Error('Some seats are no longer available');
    }

    const seatIds = seats.map(s => s.id);

    // Step 4 — atomic update using primary key index (fastest)
    const updatedSeats = await tx.seat.updateMany({
      where: {
        id: { in: seatIds },
        status: 'AVAILABLE', // double check — race condition guard
      },
      data: { status: 'ON_HOLD' }
    });

    // Step 5 — race condition check
    if (updatedSeats.count !== seatIds.length) {
      throw new Error('Some seats are no longer available');
    }

    // Step 6 — get event price
    const event = await tx.event.findUnique({
      where: { id: input.eventId },
      select: { price: true, title: true, date: true }
    });

    if (!event) throw new Error('Event not found');

    const totalPrice = event.price * input.seats.length;

    // Step 7 — create booking
    const booking = await tx.booking.create({
      data: {
        eventId: input.eventId,
        userId: userId || null,
        guestEmail: input.guestEmail || null,
        guestPhone: input.guestPhone || null,
        totalPrice,
        holdExpiresAt,
        seats: {
          create: seatIds.map(seatId => ({ seatId }))
        }
      },
      include: {
        seats: {
          include: {
            seat: {
              select: { row: true, col: true }
            }
          }
        }
      }
    });

    return { booking, event, totalPrice };
  }).then(async ({ booking, event, totalPrice }) => {
    try {
      let recipientEmail: string;
      let recipientName: string;

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true }
        });
        recipientEmail = user!.email;
        recipientName = user!.name;
      } else {
        recipientEmail = input.guestEmail!;
        recipientName = 'Guest';
      }

      await emailService.sendBookingConfirmation(
        recipientEmail,
        recipientName,
        booking.id,
        event.title,
        event.date,
        input.seats.length,
        totalPrice,
        booking.holdExpiresAt,
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return booking;
  });
};

export const getMyBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      totalPrice: true,
      holdExpiresAt: true,
      createdAt: true,
      event: {
        select: {
          title: true,
          date: true,
          location: true,
          image: true,
        }
      },
      seats: {
        select: {
          seat: {
            select: { row: true, col: true }
          }
        }
      }
    }
  });
};

export const getBookingById = async (id: string, userId?: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalPrice: true,
      holdExpiresAt: true,
      guestEmail: true,
      guestPhone: true,
      createdAt: true,
      user: {
        select: { name: true, email: true, phone: true }
      },
      event: {
        select: {
          title: true,
          date: true,
          location: true,
          image: true,
        }
      },
      seats: {
        select: {
          seat: {
            select: { row: true, col: true }
          }
        }
      }
    }
  });

  if (!booking) throw new Error('Booking not found');

  // Registered users can only see their own bookings
  if (userId && booking.user && booking.user.email) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email !== booking.user.email) {
      throw new Error('Unauthorized');
    }
  }

  return booking;
};

// Called by Responsible to confirm payment received
export const confirmBooking = async (
  bookingId: string,
  paymentMethod: 'INSTAPAY' | 'CASH',
  responsibleId: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      seats: { include: { seat: true } },
      event: { select: { title: true, date: true } },
      user: { select: { email: true, name: true } }
    }
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.status !== 'PENDING') {
    throw new Error('Booking is not in pending state');
  }

  // Update booking status and mark seats as RESERVED
  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paymentMethod,
      }
    });

    await tx.seat.updateMany({
      where: {
        id: { in: booking.seats.map(bs => bs.seatId) }
      },
      data: { status: 'RESERVED' }
    });
  });

  // Send confirmation email
  try {
    const email = booking.user?.email || booking.guestEmail!;
    const name = booking.user?.name || 'Guest';

    await emailService.sendBookingApproved(
      email,
      name,
      bookingId,
      booking.event.title,
      booking.event.date,
      booking.seats.length,
      booking.totalPrice,
    );
  } catch (emailError) {
    console.error('Failed to send approval email:', emailError);
  }

  return booking;
};

export const cancelBooking = async (
  bookingId: string,
  responsible: { name: string; phone: string; whatsapp: string | null }
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      seats: { include: { seat: true } },
      event: { select: { title: true } },
      user: { select: { email: true, name: true } }
    }
  });

  if (!booking) throw new Error('Booking not found');

  await prisma.$transaction(async (tx) => {
    // Cancel booking
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' }
    });

    // Release seats back to AVAILABLE
    await tx.seat.updateMany({
      where: {
        id: { in: booking.seats.map(bs => bs.seatId) }
      },
      data: { status: 'AVAILABLE' }
    });
  });

  // Send cancellation email
  try {
    const email = booking.user?.email || booking.guestEmail!;
    const name = booking.user?.name || 'Guest';

    await emailService.sendBookingCancelled(
      email,
      name,
      booking.event.title,
      responsible.name,
      responsible.whatsapp || responsible.phone,
    );
  } catch (emailError) {
    console.error('Failed to send cancellation email:', emailError);
  }

  return booking;
};

// Get all bookings for dashboard
export const getAllBookings = async (eventId?: string) => {
  return prisma.booking.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      paymentMethod: true,
      totalPrice: true,
      holdExpiresAt: true,
      guestEmail: true,
      guestPhone: true,
      createdAt: true,
      user: {
        select: { name: true, email: true, phone: true }
      },
      event: {
        select: { title: true, date: true }
      },
      seats: {
        select: {
          seat: { select: { row: true, col: true } }
        }
      }
    }
  });
};

// Payment summary per event for dashboard
export const getEventPaymentSummary = async (eventId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { eventId, status: 'CONFIRMED' },
    select: { paymentMethod: true, totalPrice: true }
  });

  const instapay = bookings.filter(b => b.paymentMethod === 'INSTAPAY');
  const cash = bookings.filter(b => b.paymentMethod === 'CASH');

  const pendingBookings = await prisma.booking.findMany({
    where: { eventId, status: 'PENDING' },
    select: { totalPrice: true }
  });

  return {
    instapay: {
      count: instapay.length,
      total: instapay.reduce((sum, b) => sum + b.totalPrice, 0)
    },
    cash: {
      count: cash.length,
      total: cash.reduce((sum, b) => sum + b.totalPrice, 0)
    },
    pending: {
      count: pendingBookings.length,
      total: pendingBookings.reduce((sum, b) => sum + b.totalPrice, 0)
    },
    totalConfirmed:
      instapay.reduce((sum, b) => sum + b.totalPrice, 0) +
      cash.reduce((sum, b) => sum + b.totalPrice, 0)
  };
};