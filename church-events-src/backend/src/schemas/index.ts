import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  whatsapp: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateStaffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  whatsapp: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['RESPONSIBLE', 'ADMIN']),
});

export const CreateEventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.coerce.date('Invalid date format'),
  location: z.string().min(2, 'Location is required'),
  rows: z.coerce.number().int().min(1).max(50),
  cols: z.coerce.number().int().min(1).max(50),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  image: z.string().url().optional(),
  descriptionContent: z.object({}).passthrough().optional(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const CreateBookingSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  seats: z.array(
    z.object({
      row: z.number().int().min(1),
      col: z.number().int().min(1),
    })
  ).min(1, 'At least one seat is required'),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().min(10).optional(),
}).refine(data => {
  // If no userId (guest), email and phone are required
  // We check this in the controller since we don't have userId here
  return true;
});

export const ConfirmBookingSchema = z.object({
  paymentMethod: z.enum(['INSTAPAY', 'CASH']),
});

export const CreateSponsorSchema = z.object({
  name: z.string().min(2, 'Sponsor name is required'),
  logoUrl: z.string().url().optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const UpdateSettingsSchema = z.object({
  instapayLink: z.string().url().optional(),
  cashPhone: z.string().min(10).optional(),
  churchName: z.string().min(2).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(10).optional(),
});

export const UpdateEventPriceSchema = z.object({
  price: z.coerce.number().min(0, 'Price cannot be negative'),
});
export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});