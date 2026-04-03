import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import {
  Container, Box, Typography, TextField,
  Button, Alert, Paper, Divider
} from '@mui/material';

export default function Register() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const res = await api.post('/auth/register', submitData);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      const data = err.response?.data;
      // setError(err.response?.data?.message || t('common.error'));
        setError(data?.errors?.[0]?.message || data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          {t('auth.register')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
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
          <TextField
            fullWidth name="confirmPassword"
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            margin="normal" required
          />
          <Button
            fullWidth type="submit"
            variant="contained" size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, bgcolor: '#e94560' }}
          >
            {loading ? t('common.loading') : t('auth.register')}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography align="center">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" style={{ color: '#e94560' }}>
            {t('auth.login')}
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}