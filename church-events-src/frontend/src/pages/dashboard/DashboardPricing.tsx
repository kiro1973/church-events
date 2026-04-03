import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Box, Typography, Paper, TextField,
  Button, Alert, CircularProgress, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Event {
  id: string;
  title: string;
  price: number;
}

export default function DashboardPricing() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || '');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);

        // Pre-fill price if event already selected
        if (eventId) {
          const event = res.data.find((e: Event) => e.id === eventId);
          if (event) setPrice(String(event.price));
        }
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // When user selects different event, update price field
  useEffect(() => {
    if (!selectedEventId) return;
    const event = events.find(e => e.id === selectedEventId);
    if (event) setPrice(String(event.price));
  }, [selectedEventId, events]);

  const handleSave = async () => {
    if (!selectedEventId || !price) return;
    setSaving(true);
    setSuccess(false);
    setError('');

    try {
      await api.patch(`/events/${selectedEventId}/price`, {
        price: Number(price)
      });
      setSuccess(true);

      // Update local events list with new price
      setEvents(prev => prev.map(e =>
        e.id === selectedEventId
          ? { ...e, price: Number(price) }
          : e
      ));
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Manage Pricing
        </Typography>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 500 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Price updated successfully! New bookings will use this price.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel>Select Event</InputLabel>
          <Select
            value={selectedEventId}
            label="Select Event"
            onChange={e => {
              setSelectedEventId(e.target.value);
              setSuccess(false);
            }}
          >
            {events.map(event => (
              <MenuItem key={event.id} value={event.id}>
                {event.title} — current: {event.price} EGP
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="New Price (EGP)"
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          margin="normal"
          inputProps={{ min: 0 }}
          helperText="This price applies to new bookings only. Existing bookings are not affected."
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving || !selectedEventId || !price}
          sx={{ mt: 3, bgcolor: '#e94560' }}
        >
          {saving
            ? <CircularProgress size={24} color="inherit" />
            : t('common.save')
          }
        </Button>
      </Paper>
    </DashboardLayout>
  );
}