import { Resend } from 'resend';
import prisma from '../prisma';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Helper — get settings from DB once
const getSettings = async () => {
  const settings = await prisma.settings.findFirst();
  if (!settings) throw new Error('Settings not configured');
  return settings;
};

export const sendBookingConfirmation = async (
  email: string,
  name: string,
  bookingId: string,
  eventTitle: string,
  eventDate: Date,
  seatsCount: number,
  totalPrice: number,
  holdExpiresAt: Date,
) => {
  const settings = await getSettings();

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `Booking Confirmation - ${eventTitle}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your booking request has been received!</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Date:</strong> ${eventDate.toLocaleDateString()}</li>
        <li><strong>Seats:</strong> ${seatsCount}</li>
        <li><strong>Total Price:</strong> ${totalPrice} EGP</li>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
      </ul>

      <h3>⚠️ Your seats are on hold until ${holdExpiresAt.toLocaleString()}</h3>
      <p>To confirm your booking, please complete payment:</p>
      
      <p><strong>Instapay:</strong> <a href="${settings.instapayLink}">${settings.instapayLink}</a></p>
      <p><strong>Cash Payment:</strong> Contact us on ${settings.cashPhone}</p>
      
      <p>If payment is not received before the deadline, your seats will be released.</p>
      
      <p>Thank you, ${settings.churchName}</p>
    `
  });
};

export const sendHoldReminder = async (
  email: string,
  name: string,
  bookingId: string,
  eventTitle: string,
  holdExpiresAt: Date,
  hoursRemaining: number,
) => {
  const settings = await getSettings();

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `⚠️ Your seats expire soon - ${eventTitle}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your seats for <strong>${eventTitle}</strong> will be released in <strong>${hoursRemaining} hours</strong>!</p>      
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Expires at:</strong> ${holdExpiresAt.toLocaleString()}</p>
      
      <p>Complete payment now to keep your seats:</p>
      <p><strong>Instapay:</strong> <a href="${settings.instapayLink}">${settings.instapayLink}</a></p>
      <p><strong>Cash Payment:</strong> Contact us on ${settings.cashPhone}</p>
      
      <p>Thank you, ${settings.churchName}</p>
    `
  });
};

export const sendBookingApproved = async (
  email: string,
  name: string,
  bookingId: string,
  eventTitle: string,
  eventDate: Date,
  seatsCount: number,
  totalPrice: number,
) => {
  const settings = await getSettings();

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `✅ Booking Confirmed - ${eventTitle}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your booking has been <strong>confirmed</strong>! 🎉</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Event:</strong> ${eventTitle}</li>
        <li><strong>Date:</strong> ${eventDate.toLocaleDateString()}</li>
        <li><strong>Seats:</strong> ${seatsCount}</li>
        <li><strong>Total Price:</strong> ${totalPrice} EGP</li>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
      </ul>
      
      <p>We look forward to seeing you!</p>
      <p>Thank you, ${settings.churchName}</p>
    `
  });
};

export const sendBookingCancelled = async (
  email: string,
  name: string,
  eventTitle: string,
  responsibleName: string,
  responsiblePhone: string,
) => {
  const settings = await getSettings();

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `❌ Booking Cancelled - ${eventTitle}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Sorry, your booking for <strong>${eventTitle}</strong> has been cancelled.</p>
      
      <p>Please contact <strong>${responsibleName}</strong> for more information:</p>
      <p>📞 Call or WhatsApp: <strong>${responsiblePhone}</strong></p>
      
      <p>Thank you, ${settings.churchName}</p>
    `
  });
};

export const sendBookingExpired = async (
  email: string,
  name: string,
  eventTitle: string,
) => {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: `⏰ Booking Expired - ${eventTitle}`,
    html: `
      <h2>Hello ${name},</h2>
      <p>Your booking for <strong>${eventTitle}</strong> has expired because payment was not received in time.</p>
      <p>Your seats have been released. You are welcome to book again.</p>
    `
  });
};

export const sendPasswordReset = async (email: string, token: string) => {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>
      <p>If you didn't request this, ignore this email.</p>
    `
  });
};