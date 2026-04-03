import cron from 'node-cron';
import prisma from '../prisma';
import * as emailService from '../services/email.service';

export const startHoldExpiryJob = () => {

  // Runs once at 12:01am every day — expires all pending bookings
  cron.schedule('1 0 * * *', async () => {
    console.log('⏰ Running midnight expiry check...');
    try {
      const now = new Date();

      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          holdExpiresAt: { lt: now }
        },
        include: {
          seats: { include: { seat: true } },
          event: { select: { title: true } },
          user: { select: { email: true, name: true } }
        }
      });

      for (const booking of expiredBookings) {
        await prisma.$transaction(async (tx) => {
          await tx.booking.update({
            where: { id: booking.id },
            data: { status: 'EXPIRED' }
          });

          await tx.seat.updateMany({
            where: {
              id: { in: booking.seats.map(bs => bs.seatId) }
            },
            data: { status: 'AVAILABLE' }
          });
        });

        try {
          const email = booking.user?.email || booking.guestEmail!;
          const name = booking.user?.name || 'Guest';
          await emailService.sendBookingExpired(email, name, booking.event.title);
        } catch (emailError) {
          console.error('Failed to send expiry email:', emailError);
        }

        console.log(`✅ Expired booking ${booking.id}`);
      }

    } catch (error) {
      console.error('❌ Expiry job failed:', error);
    }
  });

  // Reminder — runs twice a day 8am and 8pm
  // catches bookings expiring tonight
  cron.schedule('0 8,20 * * *', async () => {
    console.log('📧 Sending reminders...');
    try {
      const now = new Date();
      const windowEnd = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      const bookingsNeedingReminder = await prisma.booking.findMany({
        where: {
          status: 'PENDING',
          holdExpiresAt: {
            gte: now,
            lte: windowEnd,
          },
          reminderSent: false,
        },
        include: {
          event: { select: { title: true } },
          user: { select: { email: true, name: true } }
        }
      });

      for (const booking of bookingsNeedingReminder) {
        try {
          const email = booking.user?.email || booking.guestEmail!;
          const name = booking.user?.name || 'Guest';

          const hoursRemaining = Math.ceil(
            (booking.holdExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)
          );

          await emailService.sendHoldReminder(
            email,
            name,
            booking.id,
            booking.event.title,
            booking.holdExpiresAt,
            hoursRemaining,
          );

          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true }
          });

        } catch (emailError) {
          console.error('Failed to send reminder email:', emailError);
        }
      }

    } catch (error) {
      console.error('❌ Reminder job failed:', error);
    }
  });

  console.log('✅ Cron jobs started');
};