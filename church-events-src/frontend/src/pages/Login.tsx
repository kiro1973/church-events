import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import {
  Container, Box, Typography, TextField,
  Button, Alert, Paper, Divider
} from '@mui/material';
import { useLocation } from 'react-router-dom';

export default function Login() {
  const location = useLocation();
const successMessage = location.state?.message;

  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);

      // Redirect based on role
      if (res.data.user.role === 'ADMIN' || res.data.user.role === 'RESPONSIBLE') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          {t('auth.login')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      {successMessage && (
  <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
)}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Box textAlign="right">
            <Link to="/forgot-password" style={{ color: '#e94560', fontSize: '0.875rem' }}>
              {t('auth.forgotPassword')}
            </Link>
          </Box>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, bgcolor: '#e94560' }}
          >
            {loading ? t('common.loading') : t('auth.login')}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography align="center">
          {t('auth.noAccount')}{' '}
          <Link to="/register" style={{ color: '#e94560' }}>
            {t('auth.register')}
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}