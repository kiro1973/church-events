import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Box, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Chip, Select,
  MenuItem, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'RESPONSIBLE' | 'ADMIN';
  createdAt: string;
}

export default function DashboardUsers() {
  const { t } = useTranslation();

  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    role: 'RESPONSIBLE' as 'RESPONSIBLE' | 'ADMIN',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all users — we filter staff on frontend
      const res = await api.get('/auth/staff');
      setUsers(res.data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/staff', form);
      setDialogOpen(false);
      setForm({
        name: '', email: '', phone: '',
        whatsapp: '', password: '', role: 'RESPONSIBLE'
      });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const roleColors: Record<string, 'error' | 'warning'> = {
    ADMIN: 'error',
    RESPONSIBLE: 'warning',
  };

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between"
        alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {t('dashboard.users')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#e94560' }}
        >
          Add Staff
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
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Email</TableCell>
                <TableCell sx={{ color: 'white' }}>Phone</TableCell>
                <TableCell sx={{ color: 'white' }}>Role</TableCell>
                <TableCell sx={{ color: 'white' }}>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={roleColors[user.role]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Staff Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Staff Member</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={form.role}
              label="Role"
              onChange={e => setForm(prev => ({
                ...prev,
                role: e.target.value as 'RESPONSIBLE' | 'ADMIN'
              }))}
            >
              <MenuItem value="RESPONSIBLE">Responsible</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth name="name"
            label={t('auth.name')}
            value={form.name}
            onChange={handleChange}
            margin="normal" required
          />
          <TextField
            fullWidth name="email"
            label={t('auth.email')}
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal" required
          />
          <TextField
            fullWidth name="phone"
            label={t('auth.phone')}
            value={form.phone}
            onChange={handleChange}
            margin="normal" required
          />
          <TextField
            fullWidth name="whatsapp"
            label={t('auth.whatsapp')}
            value={form.whatsapp}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth name="password"
            label={t('auth.password')}
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal" required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ bgcolor: '#e94560' }}
          >
            {submitting
              ? <CircularProgress size={20} color="inherit" />
              : 'Add Staff'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}