import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Box, Typography, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Switch,
  FormControlLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
  isActive: boolean;
}

export default function DashboardSponsors() {
  const { t } = useTranslation();

  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', order: 0 });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const res = await api.get('/sponsors/admin');
      setSponsors(res.data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!logoFile && !form.name) return;
    setSubmitting(true);

    try {
      // Use FormData because we're sending a file
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('order', String(form.order));
      if (logoFile) formData.append('logo', logoFile);

      await api.post('/sponsors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDialogOpen(false);
      setForm({ name: '', order: 0 });
      setLogoFile(null);
      fetchSponsors();
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      await api.put(`/sponsors/${sponsor.id}`, {
        isActive: !sponsor.isActive
      });
      fetchSponsors();
    } catch {
      setError(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this sponsor?')) return;
    try {
      await api.delete(`/sponsors/${id}`);
      fetchSponsors();
    } catch {
      setError(t('common.error'));
    }
  };

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between"
        alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {t('dashboard.sponsors')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: '#e94560' }}
        >
          {t('common.add')} Sponsor
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
                <TableCell sx={{ color: 'white' }}>Logo</TableCell>
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Order</TableCell>
                <TableCell sx={{ color: 'white' }}>Active</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sponsors.map(sponsor => (
                <TableRow key={sponsor.id} hover>
                  <TableCell>
                    <Box
                      component="img"
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      sx={{ height: 40, objectFit: 'contain' }}
                    />
                  </TableCell>
                  <TableCell>{sponsor.name}</TableCell>
                  <TableCell>{sponsor.order}</TableCell>
                  <TableCell>
                    <Switch
                      checked={sponsor.isActive}
                      onChange={() => handleToggleActive(sponsor)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(sponsor.id)}
                    >
                      {t('common.delete')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Sponsor Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Sponsor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Sponsor Name"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Display Order"
            type="number"
            value={form.order}
            onChange={e => setForm(prev => ({
              ...prev, order: Number(e.target.value)
            }))}
            margin="normal"
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Logo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={e => setLogoFile(e.target.files?.[0] || null)}
            />
          </Button>
          {logoFile && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
              ✅ {logoFile.name} selected
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !form.name || !logoFile}
            sx={{ bgcolor: '#e94560' }}
          >
            {submitting ? <CircularProgress size={20} /> : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}