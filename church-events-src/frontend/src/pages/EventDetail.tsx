import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import type { EventDetail as EventDetailType } from '../types';
import SeatMap from '../components/SeatMap';
import type { SeatPosition } from '../types';
import {
  Container, Box, Typography, Button,
  CircularProgress, Alert, Chip, Divider, Paper
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventSeatIcon from '@mui/icons-material/EventSeat';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<SeatPosition[]>([]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch {
        setError(t('common.eventNotFound'));
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSeatClick = (seat: SeatPosition, status: string) => {
    if (status !== 'AVAILABLE') return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.row === seat.row && s.col === seat.col);
      if (isSelected) {
        // Deselect
        return prev.filter(s => !(s.row === seat.row && s.col === seat.col));
      } else {
        // Select
        return [...prev, seat];
      }
    });
  };

  const handleBook = () => {
    if (selectedSeats.length === 0) return;
    // Pass selected seats via navigation state
    navigate(`/booking/${id}`, { state: { selectedSeats, event } });
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

  if (!event) return null;

  const availableSeats = event.seats.filter(s => s.status === 'AVAILABLE').length;
  const totalPrice = selectedSeats.length * event.price;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Event Image */}
      {event.image && (
        <Box
          component="img"
          src={event.image}
          alt={event.title}
          sx={{
            width: '100%',
            height: { xs: 200, md: 400 },
            objectFit: 'cover',
            borderRadius: 2,
            mb: 4,
          }}
        />
      )}

      {/* Event Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {event.title}
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarMonthIcon color="action" />
            <Typography color="text.secondary">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric'
              })}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <LocationOnIcon color="action" />
            <Typography color="text.secondary">{event.location}</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <EventSeatIcon color="action" />
            <Typography color="text.secondary">
              {availableSeats} {t('events.seats')}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`${event.price} EGP ${t('events.price')}`}
          color="primary"
          size="medium"
          sx={{ mb: 2 }}
        />

        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          {event.description}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Seat Map */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {t('booking.selectSeats')}
      </Typography>

      <SeatMap
        seats={event.seats}
        rows={event.rows}
        cols={event.cols}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
      />

      {/* Booking Summary */}
      {selectedSeats.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            position: 'sticky',
            bottom: 16,
            p: 3,
            mt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: '#1a1a2e',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="h6">
              {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              Total: {totalPrice} EGP
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={handleBook}
            sx={{ bgcolor: '#e94560', px: 4 }}
          >
            {t('events.bookNow')}
          </Button>
        </Paper>
      )}
    </Container>
  );
}