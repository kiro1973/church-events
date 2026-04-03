import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Container, Box, Typography, TextField,
  Button, Alert, Paper, Divider
} from '@mui/material';

export default function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If no token in URL — show error immediately
  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            Invalid or missing reset token. Please request a new reset link.
          </Alert>
          <Link to="/forgot-password" style={{ color: '#e94560' }}>
            Request New Link
          </Link>
        </Paper>
      </Container>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      // Redirect to login with a success message via state
      navigate('/login', { state: { message: 'Password reset successfully. Please log in.' } });
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
          Reset Password
        </Typography>

        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          Enter your new password below.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            error={!!confirmPassword && password !== confirmPassword}
            helperText={
              confirmPassword && password !== confirmPassword
                ? 'Passwords do not match'
                : ''
            }
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !password || !confirmPassword}
            sx={{ mt: 3, mb: 2, bgcolor: '#e94560' }}
          >
            {loading ? t('common.loading') : 'Reset Password'}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography align="center">
          <Link to="/login" style={{ color: '#e94560' }}>
            Back to Login
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}