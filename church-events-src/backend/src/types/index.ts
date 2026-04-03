import { Role, BookingStatus, PaymentMethod, SeatStatus } from '@prisma/client';

// Re-export Prisma enums so we import from one place
export { Role, BookingStatus, PaymentMethod, SeatStatus };

// JWT payload — what we store inside the token
export interface JwtPayload {
  userId: string;
  role: Role;
}

// Auth
export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Events
export interface CreateEventInput {
  title: string;
  description: string;
  descriptionContent?: object;
  date: string|Date;
  location: string;
  image?: string;
  rows: number;
  cols: number;
  price: number;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {}

export interface SeatPosition {
  row: number;
  col: number;
}

export interface CreateBookingInput {
  eventId: string;
  seats: SeatPosition[];
  guestEmail?: string;
  guestPhone?: string;
}

export interface ConfirmBookingInput {
  bookingId: string;
  paymentMethod: PaymentMethod;
}

// Sponsors
export interface CreateSponsorInput {
  name: string;
  logoUrl: string;
  order?: number;
}

// Settings
export interface UpdateSettingsInput {
  instapayLink?: string;
  cashPhone?: string;
  churchName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// Express request extension — adds user info after JWT middleware
export interface AuthRequest extends Express.Request {
  user?: JwtPayload;
}