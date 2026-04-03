// import { useState } from 'react';
// import { useParams, useLocation, useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';

// import { useAuth } from '../context/useAuth';
// import api from '../services/api';
// import type { SeatPosition, Settings } from '../types';
// import {
//   Container, Box, Typography, Button, TextField,
//   Paper, Stepper, Step, StepLabel, Alert,
//   Divider, CircularProgress
// } from '@mui/material';
// import { useEffect } from 'react';

// // Steps in the booking flow
// const STEPS = ['Select Auth', 'Confirm & Pay'];


// export default function BookingFlow() {
//   const { eventId } = useParams<{ eventId: string }>();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const { isAuthenticated, user } = useAuth();

//   // Data passed from EventDetail page
//   const { selectedSeats, event } = location.state as {
//     selectedSeats: SeatPosition[];
//     event: { title: string; price: number; date: string };
//   };
// const GuestSchema = z.object({
//   guestEmail: z.string().email('Invalid email format'),
//   guestPhone: z.string()
//     .min(10, 'Phone must be at least 10 digits')
//     .regex(/^[0-9+\s-]+$/, 'Phone numbers only'),
// });

// type GuestFormData = z.infer<typeof GuestSchema>;
//   const [activeStep, setActiveStep] = useState(0);
//   // const [guestEmail, setGuestEmail] = useState('');
//   // const [guestPhone, setGuestPhone] = useState('');
//   const [settings, setSettings] = useState<Settings | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [bookingMode, setBookingMode] = useState<'guest' | 'user' | null>(
//     isAuthenticated ? 'user' : null
//   );

//   useEffect(() => {
//     api.get('/settings').then(res => setSettings(res.data));
//   }, []);

//   // If no seats selected, redirect back
//   useEffect(() => {
//     if (!selectedSeats || selectedSeats.length === 0) {
//       navigate(`/events/${eventId}`);
//     }
//   }, []);

//   const totalPrice = selectedSeats?.length * event?.price;

//   const handleConfirmBooking = async () => {
//     setError('');
//     setLoading(true);

//     try {
//       const payload: any = {
//         eventId,
//         seats: selectedSeats,
//         ...(bookingMode === 'guest' && {
//           guestEmail,
//           guestPhone,
//         })
//       };

//       const res = await api.post('/bookings', payload);
//       navigate(`/booking/confirmation/${res.data.id}`);
//     } catch (err: any) {
//       setError(err.response?.data?.message || t('common.error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 1 — Auth choice
//   const StepAuth = () => (
//     <Box>
//       <Typography variant="h6" gutterBottom>
//         {t('booking.guestOrLogin')}
//       </Typography>

//       {isAuthenticated ? (
//         // Already logged in — skip choice
//         <Box>
//           <Alert severity="success" sx={{ mb: 2 }}>
//             Booking as <strong>{user?.name}</strong> ({user?.email})
//           </Alert>
//           <Button
//             fullWidth
//             variant="contained"
//             size="large"
//             onClick={() => setActiveStep(1)}
//             sx={{ bgcolor: '#e94560' }}
//           >
//             {t('booking.continueToPayment')}
//           </Button>
//         </Box>
//       ) : (
//         // Not logged in — show options
//         <Box display="flex" flexDirection="column" gap={2}>
//           <Button
//             fullWidth
//             variant="contained"
//             size="large"
//             onClick={() => navigate('/login', {
//               state: { from: `/booking/${eventId}`, selectedSeats, event }
//             })}
//             sx={{ bgcolor: '#1a1a2e' }}
//           >
//             {t('booking.loginToContinue')}
//           </Button>

//           <Divider>OR</Divider>

//           <Button
//             fullWidth
//             variant="outlined"
//             size="large"
//             onClick={() => {
//               setBookingMode('guest');
//               setActiveStep(1);
//             }}
//           >
//             {t('booking.continueAsGuest')}
//           </Button>
//         </Box>
//       )}
//     </Box>
//   );

//   // Step 2 — Payment info + confirm
//   const StepPayment = () => (
//     <Box>
//       {/* Guest details form */}
//       {bookingMode === 'guest' && (
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h6" gutterBottom>
//             Your Contact Details
//           </Typography>
//           <TextField
//             fullWidth
//             label={t('auth.email')}
//             type="email"
//             value={guestEmail}
//             onChange={e => setGuestEmail(e.target.value)}
//             margin="normal"
//             required
//           />
//           <TextField
//             fullWidth
//             label={t('auth.phone')}
//             value={guestPhone}
//             onChange={e => setGuestPhone(e.target.value)}
//             margin="normal"
//             required
//           />
//         </Box>
//       )}

//       {/* Booking summary */}
//       <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
//         <Typography variant="h6" fontWeight="bold" gutterBottom>
//           Booking Summary
//         </Typography>
//         <Typography><strong>Event:</strong> {event?.title}</Typography>
//         <Typography>
//           <strong>Date:</strong> {new Date(event?.date).toLocaleDateString()}
//         </Typography>
//         <Typography>
//           <strong>Seats:</strong> {selectedSeats?.map(s =>
//             `Row ${s.row}, Seat ${s.col}`).join(' | ')}
//         </Typography>
//         <Divider sx={{ my: 1 }} />
//         <Typography variant="h6" color="primary">
//           <strong>Total: {totalPrice} EGP</strong>
//         </Typography>
//       </Paper>

//       {/* Payment instructions — static, both options shown */}
//       <Paper sx={{ p: 3, mb: 3, border: '1px solid #e94560' }}>
//         <Typography variant="h6" fontWeight="bold" gutterBottom>
//           {t('booking.paymentInfo')}
//         </Typography>
//         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//           {t('booking.holdWarning')}
//         </Typography>

//         <Box sx={{ mb: 2 }}>
//           <Typography fontWeight="bold">💳 {t('booking.instapay')}:</Typography>
//           <Typography
//             component="a"
//             href={settings?.instapayLink || '#'}
//             target="_blank"
//             color="primary"
//           >
//             {settings?.instapayLink || 'Loading...'}
//           </Typography>
//         </Box>

//         <Box>
//           <Typography fontWeight="bold">💵 {t('booking.cash')}:</Typography>
//           <Typography>{settings?.cashPhone}</Typography>
//         </Box>
//       </Paper>

//       {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

//       <Button
//         fullWidth
//         variant="contained"
//         size="large"
//         onClick={handleConfirmBooking}
//         disabled={loading || (bookingMode === 'guest' && (!guestEmail || !guestPhone))}
//         sx={{ bgcolor: '#e94560' }}
//       >
//         {loading ? <CircularProgress size={24} color="inherit" /> : t('booking.confirmBooking')}
//       </Button>
//     </Box>
//   );

//   return (
//     <Container maxWidth="sm" sx={{ py: 6 }}>
//       <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
//         {t('events.bookNow')}
//       </Typography>

//       {/* Progress stepper */}
//       <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
//         {STEPS.map(label => (
//           <Step key={label}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       <Paper elevation={3} sx={{ p: 4 }}>
//         {activeStep === 0 ? <StepAuth /> : <StepPayment />}
//       </Paper>
//     </Container>
//   );
// }


import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import type { SeatPosition, Settings } from '../types';
import {
  Container, Box, Typography, Button, TextField,
  Paper, Stepper, Step, StepLabel, Alert,
  Divider, CircularProgress
} from '@mui/material';

const STEPS = ['Select Auth', 'Confirm & Pay'];

const GuestSchema = z.object({
  guestEmail: z.string().email('Invalid email format'),
  guestPhone: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .regex(/^[0-9+\s-]+$/, 'Phone numbers only'),
});

type GuestFormData = z.infer<typeof GuestSchema>;

export default function BookingFlow() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const { selectedSeats, event } = location.state as {
    selectedSeats: SeatPosition[];
    event: { title: string; price: number; date: string };
  };

  const [activeStep, setActiveStep] = useState(0);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingMode, setBookingMode] = useState<'guest' | 'user' | null>(
    isAuthenticated ? 'user' : null
  );

  const {
    register,
    getValues,
    formState: { errors: guestErrors, isValid: isGuestValid },
  } = useForm<GuestFormData>({
    resolver: zodResolver(GuestSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    api.get('/settings').then(res => setSettings(res.data));
  }, []);

  useEffect(() => {
    if (!selectedSeats || selectedSeats.length === 0) {
      navigate(`/events/${eventId}`);
    }
  }, []);

  const totalPrice = selectedSeats?.length * event?.price;

  const handleConfirmBooking = async () => {
    setError('');
    setLoading(true);
    try {
      const guestValues = bookingMode === 'guest' ? getValues() : null;
      const payload: any = {
        eventId,
        seats: selectedSeats,
        ...(bookingMode === 'guest' && {
          guestEmail: guestValues?.guestEmail,
          guestPhone: guestValues?.guestPhone,
        })
      };
      const res = await api.post('/bookings', payload);
      navigate(`/booking/confirmation/${res.data.id}`);
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
        {t('events.bookNow')}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={3} sx={{ p: 4 }}>
        {activeStep === 0 ? (
          // Step 1 — Auth choice
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
                  fullWidth variant="contained" size="large"
                  onClick={() => setActiveStep(1)}
                  sx={{ bgcolor: '#e94560' }}
                >
                  {t('booking.continueToPayment')}
                </Button>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  fullWidth variant="contained" size="large"
                  onClick={() => navigate('/login', {
                    state: { from: `/booking/${eventId}`, selectedSeats, event }
                  })}
                  sx={{ bgcolor: '#1a1a2e' }}
                >
                  {t('booking.loginToContinue')}
                </Button>

                <Divider>OR</Divider>

                <Button
                  fullWidth variant="outlined" size="large"
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
        ) : (
          // Step 2 — Payment info + confirm
          <Box>
            {bookingMode === 'guest' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Contact Details
                </Typography>
                <TextField
                  fullWidth
                  label={t('auth.email')}
                  type="email"
                  margin="normal"
                  required
                  {...register('guestEmail')}
                  error={!!guestErrors.guestEmail}
                  helperText={guestErrors.guestEmail?.message}
                />
                <TextField
                  fullWidth
                  label={t('auth.phone')}
                  margin="normal"
                  required
                  {...register('guestPhone')}
                  error={!!guestErrors.guestPhone}
                  helperText={guestErrors.guestPhone?.message}
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Box>
            )}

            <Paper sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5' }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Booking Summary
              </Typography>
              <Typography><strong>Event:</strong> {event?.title}</Typography>
              <Typography>
                <strong>Date:</strong> {new Date(event?.date).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Seats:</strong> {selectedSeats?.map(s =>
                  `Row ${s.row}, Seat ${s.col}`).join(' | ')}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" color="primary">
                <strong>Total: {totalPrice} EGP</strong>
              </Typography>
            </Paper>

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
                  sx={{wordBreak: 'break-all'}}
                >
                  {settings?.instapayLink || 'Loading...'}
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">💵 {t('booking.cash')}:</Typography>
                <Typography>{settings?.cashPhone}</Typography>
              </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Button
              fullWidth variant="contained" size="large"
              onClick={handleConfirmBooking}
              disabled={
                loading ||
                (bookingMode === 'guest' && !isGuestValid)
              }
              sx={{ bgcolor: '#e94560' }}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : t('booking.confirmBooking')
              }
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}