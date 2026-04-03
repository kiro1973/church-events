export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string | null;
  rows: number;
  cols: number;
  price: number;
  createdAt: string;
  _count: { seats: number; bookings: number };
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  status: 'AVAILABLE' | 'ON_HOLD' | 'RESERVED';
}

export interface EventDetail extends Event {
  seats: Seat[];
}

export interface Booking {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  totalPrice: number;
  holdExpiresAt: string;
  createdAt: string;
  event: {
    title: string;
    date: string;
    location: string;
    image: string | null;
  };
  seats: { seat: { row: number; col: number } }[];
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
}

export interface Settings {
  churchName: string;
  instapayLink: string | null;
  cashPhone: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  heroImageUrl: string | null;
}

export interface SeatPosition {
  row: number;
  col: number;
}