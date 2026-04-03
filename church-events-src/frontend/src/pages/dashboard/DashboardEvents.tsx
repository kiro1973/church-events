import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Box, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  price: number;
  rows: number;
  cols: number;
  image: string | null;
  _count: { seats: number; bookings: number };
}

const emptyForm = {
  title: '',
  description: '',
  date: '',
  location: '',
  rows: 5,
  cols: 10,
  price: 0,
};

export default function DashboardEvents() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: '',
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location,
      rows: event.rows,
      cols: event.cols,
      price: event.price,
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = ['rows', 'cols', 'price'].includes(e.target.name)
      ? Number(e.target.value)
      : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Use FormData because we might have an image file
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (imageFile) formData.append('image', imageFile);

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/events', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setDialogOpen(false);
      fetchEvents();
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this event? All bookings will be deleted too.')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch {
      setError(t('common.error'));
    }
  };

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between"
        alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ bgcolor: '#e94560' }}
        >
          Add Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#1a1a2e' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Title</TableCell>
                <TableCell sx={{ color: 'white' }}>Date</TableCell>
                <TableCell sx={{ color: 'white' }}>Location</TableCell>
                <TableCell sx={{ color: 'white' }}>Layout</TableCell>
                <TableCell sx={{ color: 'white' }}>Price</TableCell>
                <TableCell sx={{ color: 'white' }}>Bookings</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(event => (
                <TableRow key={event.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {event.image && (
                        <Box
                          component="img"
                          src={event.image}
                          alt={event.title}
                          sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                        />
                      )}
                      <Typography variant="body2" fontWeight="bold">
                        {event.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(event.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${event.rows}×${event.cols}`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{event.price} EGP</TableCell>
                  <TableCell>
                    <Chip
                      label={event._count.bookings}
                      color={event._count.bookings > 0 ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEdit(event)}
                      >
                        {t('common.edit')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<PriceChangeIcon />}
                        onClick={() => navigate(`/dashboard/pricing/${event.id}`)}
                      >
                        Price
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(event.id)}
                      >
                        {t('common.delete')}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEvent ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <TextField
            fullWidth name="title"
            label="Event Title"
            value={form.title}
            onChange={handleChange}
            margin="normal" required
          />
          <TextField
            fullWidth name="description"
            label="Description"
            value={form.description}
            onChange={handleChange}
            margin="normal"
            multiline rows={3}
            required
          />
          <TextField
            fullWidth name="date"
            label="Date & Time"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth name="location"
            label="Location"
            value={form.location}
            onChange={handleChange}
            margin="normal" required
          />
          <Box display="flex" gap={2}>
            <TextField
              fullWidth name="rows"
              label="Rows"
              type="number"
              value={form.rows}
              onChange={handleChange}
              margin="normal"
              inputProps={{ min: 1, max: 50 }}
            />
            <TextField
              fullWidth name="cols"
              label="Seats per Row"
              type="number"
              value={form.cols}
              onChange={handleChange}
              margin="normal"
              inputProps={{ min: 1, max: 50 }}
            />
          </Box>
          <TextField
            fullWidth name="price"
            label="Price (EGP)"
            type="number"
            value={form.price}
            onChange={handleChange}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            {imageFile ? `✅ ${imageFile.name}` : 'Upload Event Image (Optional)'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => setImageFile(e.target.files?.[0] || null)}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !form.title || !form.date || !form.location}
            sx={{ bgcolor: '#e94560' }}
          >
            {submitting
              ? <CircularProgress size={20} color="inherit" />
              : editingEvent ? t('common.save') : 'Add Event'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}