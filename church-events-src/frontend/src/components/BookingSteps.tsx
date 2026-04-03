import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Button, TextField,
  Paper, Alert, Divider, CircularProgress
} from '@mui/material';
import type { SeatPosition, Settings } from '../types';


type User = {
  name: string;
  email: string;
};

type Event = {
  title: string;
  price: number;
  date: string;
};

export type StepAuthProps = {
  isAuthenticated: boolean;
  user: User | null;
  eventId: string | undefined;
  selectedSeats: SeatPosition[];
  event: Event;
  navigate: (path: string, options?: object) => void;
  setBookingMode: (mode: 'guest' | 'user') => void;
  setActiveStep: (step: number) => void;
};

export type StepPaymentProps = {
  bookingMode: 'guest' | 'user' | null;
  guestEmail: string;
  setGuestEmail: (val: string) => void;
  guestPhone: string;
  setGuestPhone: (val: string) => void;
  emailTouched: boolean;
  setEmailTouched: (val: boolean) => void;
  phoneTouched: boolean;
  setPhoneTouched: (val: boolean) => void;
  emailError: string;
  phoneError: string;
  guestFormValid: boolean;
  event: Event;
  selectedSeats: SeatPosition[];
  totalPrice: number;
  settings: Settings | null;
  error: string;
  loading: boolean;
  handleConfirmBooking: () => void;
};

// ─── StepAuth ────────────────────────────────────────────

export const StepAuth = ({
  isAuthenticated,
  user,
  eventId,
  selectedSeats,
  event,
  navigate,
  setBookingMode,
  setActiveStep,
}: StepAuthProps) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('booking.guestOrLogin')}
      </Typography>

      {isAuthenticated ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Booking as <strong>{user?.name}</strong> ({user?.email})
          </Alert>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => setActiveStep(1)}
            sx={{ bgcolor: '#e94560' }}
          >
            {t('booking.continueToPayment')}
          </Button>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() =>
              navigate('/login', {
                state: { from: `/booking/${eventId}`, selectedSeats, event },
              })
            }
            sx={{ bgcolor: '#1a1a2e' }}
          >
            {t('booking.loginToContinue')}
          </Button>

          <Divider>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => {
              setBookingMode('guest');
              setActiveStep(1);
            }}
          >
            {t('booking.continueAsGuest')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

// ─── StepPayment ─────────────────────────────────────────

export const StepPayment = ({
  bookingMode,
  guestEmail,
  setGuestEmail,
  guestPhone,
  setGuestPhone,
  emailTouched,
  setEmailTouched,
  phoneTouched,
  setPhoneTouched,
  emailError,
  phoneError,
  guestFormValid,
  event,
  selectedSeats,
  totalPrice,
  settings,
  error,
  loading,
  handleConfirmBooking,
}: StepPaymentProps) => {
  const { t } = useTranslation();

  return (
    <Box>
      {/* Guest contact details */}
      {bookingMode === 'guest' && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Contact Details
          </Typography>

          <TextField
            fullWidth
            label={t('auth.email')}
            type="email"
            value={guestEmail}
            onChange={e => setGuestEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            margin="normal"
            required
            error={!!emailError}
            helperText={emailError}
          />

          <TextField
            fullWidth
            label={t('auth.phone')}
            value={guestPhone}
            onChange={e => {
              const cleaned = e.target.value.replace(/[^0-9+\-\s()]/g, '');
              setGuestPhone(cleaned);
            }}
            onBlur={() => setPhoneTouched(true)}
            margin="normal"
            required
            inputProps={{ inputMode: 'tel' }}
            error={!!phoneError}
            helperText={phoneError}
          />
        </Box>
      )}

      {/* Booking summary */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Booking Summary
        </Typography>
        <Typography><strong>Event:</strong> {event?.title}</Typography>
        <Typography>
          <strong>Date:</strong> {new Date(event?.date).toLocaleDateString()}
        </Typography>
        <Typography>
          <strong>Seats:</strong>{' '}
          {selectedSeats?.map(s => `Row ${s.row}, Seat ${s.col}`).join(' | ')}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="h6" color="primary">
          <strong>Total: {totalPrice} EGP</strong>
        </Typography>
      </Paper>

      {/* Payment instructions */}
      <Paper sx={{ p: 3, mb: 3, border: '1px solid #e94560' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {t('booking.paymentInfo')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('booking.holdWarning')}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography fontWeight="bold">💳 {t('booking.instapay')}:</Typography>
          <Typography
            component="a"
            href={settings?.instapayLink || '#'}
            target="_blank"
            color="primary"
          >
            {settings?.instapayLink || 'Loading...'}
          </Typography>
        </Box>

        <Box>
          <Typography fontWeight="bold">💵 {t('booking.cash')}:</Typography>
          <Typography>{settings?.cashPhone}</Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleConfirmBooking}
        disabled={loading || (bookingMode === 'guest' && !guestFormValid)}
        sx={{ bgcolor: '#e94560' }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          t('booking.confirmBooking')
        )}
      </Button>
    </Box>
  );
};