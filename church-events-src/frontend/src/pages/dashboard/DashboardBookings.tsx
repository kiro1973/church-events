import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  Chip, Button, Select, MenuItem, FormControl,
  InputLabel, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions,
  
} from '@mui/material';

interface Booking {
  id: string;
  status: string;
  paymentMethod: string | null;
  totalPrice: number;
  holdExpiresAt: string;
  guestEmail: string | null;
  guestPhone: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string } | null;
  event: { title: string; date: string };
  seats: { seat: { row: number; col: number } }[];
}

interface Event {
  id: string;
  title: string;
}

export default function DashboardBookings() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    bookingId: string;
    paymentMethod: 'INSTAPAY' | 'CASH';
  }>({ open: false, bookingId: '', paymentMethod: 'CASH' });
  const [paymentSummary, setPaymentSummary] = useState<any>(null);

useEffect(() => {
  fetchEvents(); // once only
  fetchBookings(); // initial load, no filter
}, []);

useEffect(() => {
  if (!selectedEventId) return; // skip on mount
  fetchBookings(selectedEventId);
  fetchPaymentSummary(selectedEventId);
}, [selectedEventId]);

  const fetchEvents = async () => {
    const res = await api.get('/events');
    setEvents(res.data);
  };

  const fetchBookings = async (eventId?: string) => {
    setLoading(true);
    try {
      const url = eventId
        ? `/bookings/dashboard/all?eventId=${eventId}`
        : '/bookings/dashboard/all';
      const res = await api.get(url);
      setBookings(res.data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSummary = async (eventId: string) => {
    const res = await api.get(`/bookings/dashboard/${eventId}/payment-summary`);
    setPaymentSummary(res.data);
  };

  const handleConfirm = async () => {
    try {
      await api.patch(`/bookings/${confirmDialog.bookingId}/confirm`, {
        paymentMethod: confirmDialog.paymentMethod
      });
      setConfirmDialog({ open: false, bookingId: '', paymentMethod: 'CASH' });
      fetchBookings(selectedEventId);
      if (selectedEventId) fetchPaymentSummary(selectedEventId);
    } catch {
      setError(t('common.error'));
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      fetchBookings(selectedEventId);
      if (selectedEventId) fetchPaymentSummary(selectedEventId);
    } catch {
      setError(t('common.error'));
    }
  };

  const statusColors: Record<string, any> = {
    CONFIRMED: 'success',
    PENDING: 'warning',
    CANCELLED: 'error',
    EXPIRED: 'default',
  };

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('dashboard.bookings')}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Filter by event */}
      <FormControl sx={{ mb: 3, minWidth: 300 }}>
        <InputLabel>Filter by Event</InputLabel>
        <Select
          value={selectedEventId}
          label="Filter by Event"
          onChange={e => setSelectedEventId(e.target.value)}
        >
          <MenuItem value="">All Events</MenuItem>
          {events.map(event => (
            <MenuItem key={event.id} value={event.id}>
              {event.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Payment Summary */}
      {paymentSummary && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#1a1a2e', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {t('dashboard.paymentSummary')}
          </Typography>
          <Box display="flex" gap={4} flexWrap="wrap">
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                💳 {t('dashboard.instapay')}
              </Typography>
              <Typography fontWeight="bold">
                {paymentSummary.instapay.count} bookings —
                {paymentSummary.instapay.total} EGP
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                💵 {t('dashboard.cash')}
              </Typography>
              <Typography fontWeight="bold">
                {paymentSummary.cash.count} bookings —
                {paymentSummary.cash.total} EGP
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                ⏳ {t('dashboard.pending')}
              </Typography>
              <Typography fontWeight="bold">
                {paymentSummary.pending.count} bookings —
                {paymentSummary.pending.total} EGP
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                ✅ {t('dashboard.total')}
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {paymentSummary.totalConfirmed} EGP
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Bookings Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#1a1a2e' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Customer</TableCell>
                <TableCell sx={{ color: 'white' }}>Event</TableCell>
                <TableCell sx={{ color: 'white' }}>Seats</TableCell>
                <TableCell sx={{ color: 'white' }}>Total</TableCell>
                <TableCell sx={{ color: 'white' }}>Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Payment</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map(booking => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {booking.user?.name || 'Guest'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.user?.email || booking.guestEmail}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      📞 {booking.user?.phone || booking.guestPhone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {booking.event.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(booking.event.date).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {booking.seats.map(bs =>
                        `R${bs.seat.row}C${bs.seat.col}`
                      ).join(', ')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">
                      {booking.totalPrice} EGP
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={statusColors[booking.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {booking.paymentMethod || '—'}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexDirection="column">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => setConfirmDialog({
                              open: true,
                              bookingId: booking.id,
                              paymentMethod: 'CASH'
                            })}
                          >
                            {t('dashboard.confirm')}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancel(booking.id)}
                          >
                            {t('dashboard.cancel')}
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Confirm Payment Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({
          open: false, bookingId: '', paymentMethod: 'CASH'
        })}
      >
        <DialogTitle>Confirm Payment Received</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={confirmDialog.paymentMethod}
              label="Payment Method"
              onChange={e => setConfirmDialog(prev => ({
                ...prev,
                paymentMethod: e.target.value as 'INSTAPAY' | 'CASH'
              }))}
            >
              <MenuItem value="CASH">💵 Cash</MenuItem>
              <MenuItem value="INSTAPAY">💳 Instapay</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({
            open: false, bookingId: '', paymentMethod: 'CASH'
          })}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}