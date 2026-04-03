import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import type { Booking } from '../types';
import {
  Container, Box, Typography, Button,
  Paper, CircularProgress, Alert, Divider, Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function BookingConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${id}`);
        setBooking(res.data);
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={10}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="error">{error}</Alert>
    </Container>
  );

  if (!booking) return null;

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    CONFIRMED: 'success',
    PENDING: 'warning',
    CANCELLED: 'error',
    EXPIRED: 'default',
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>

        {/* Success Icon */}
        <CheckCircleIcon
          sx={{ fontSize: 80, color: '#4caf50', mb: 2 }}
        />

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('booking.confirmation')}
        </Typography>

        <Chip
          label={booking.status}
          color={statusColors[booking.status]}
          sx={{ mb: 3, fontSize: '1rem', px: 2 }}
        />

        {/* Booking ID */}
        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('booking.bookingId')}
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            fontFamily="monospace"
            sx={{ wordBreak: 'break-all' }}
          >
            {booking.id}
          </Typography>
        </Paper>

        <Divider sx={{ mb: 3 }} />

        {/* Event Details */}
        <Box textAlign="left" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {booking.event.title}
          </Typography>
          <Typography color="text.secondary">
            📅 {new Date(booking.event.date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </Typography>
          <Typography color="text.secondary">
            📍 {booking.event.location}
          </Typography>
        </Box>

        {/* Seats */}
        <Box textAlign="left" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <EventSeatIcon color="action" />
            <Typography fontWeight="bold">Your Seats:</Typography>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            {booking.seats.map((bs, i) => (
              <Chip
                key={i}
                label={`Row ${bs.seat.row}, Seat ${bs.seat.col}`}
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>

        {/* Total */}
        <Paper sx={{ p: 2, bgcolor: '#1a1a2e', color: 'white', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Total: {booking.totalPrice} EGP
          </Typography>
        </Paper>

        {/* Hold warning */}
        {booking.status === 'PENDING' && (
          <Alert
            severity="warning"
            icon={<AccessTimeIcon />}
            sx={{ mb: 3, textAlign: 'left' }}
          >
            <Typography variant="body2">
              {t('booking.holdWarning')}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              Expires: {new Date(booking.holdExpiresAt).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
            </Typography>
          </Alert>
        )}

        {/* Actions */}
        <Box display="flex" gap={2} flexDirection="column">
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#1a1a2e' }}
          >
            Back to Home
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}