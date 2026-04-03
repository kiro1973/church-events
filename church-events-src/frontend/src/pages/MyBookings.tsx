import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import type { Booking } from '../types';
import {
  Container, Typography, Box, CircularProgress,
  Alert, Card, CardContent, Chip, Divider, Button
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function MyBookings() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data);
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    CONFIRMED: 'success',
    PENDING: 'warning',
    CANCELLED: 'error',
    EXPIRED: 'default',
  };

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

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('nav.myBookings')}
      </Typography>

      {bookings.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings yet
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#e94560', mt: 2 }}
          >
            Browse Events
          </Button>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          {bookings.map(booking => (
            <Card key={booking.id} elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between"
                  alignItems="flex-start" flexWrap="wrap" gap={1}>
                  <Typography variant="h6" fontWeight="bold">
                    {booking.event.title}
                  </Typography>
                  <Chip
                    label={booking.status}
                    color={statusColors[booking.status]}
                    size="small"
                  />
                </Box>

                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <CalendarMonthIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(booking.event.date).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <EventSeatIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {booking.seats.map(bs =>
                      `Row ${bs.seat.row}, Seat ${bs.seat.col}`
                    ).join(' | ')}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight="bold" color="primary">
                    {booking.totalPrice} EGP
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/booking/confirmation/${booking.id}`)}
                  >
                    View Details
                  </Button>
                </Box>

                {booking.status === 'PENDING' && (
                  <Alert severity="warning" sx={{ mt: 1.5 }} >
                    Expires: {new Date(booking.holdExpiresAt).toLocaleDateString()}
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}