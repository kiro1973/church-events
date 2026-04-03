import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import {
  Container, Box, Typography, TextField,
  Button, Alert, Paper, Divider
} from '@mui/material';

export default function ForgotPassword() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
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
          Forgot Password
        </Typography>

        {success ? (
          // Show this after form is submitted — don't reveal if email exists
          <Box textAlign="center">
            <Alert severity="success" sx={{ mb: 3 }}>
              If this email exists, a reset link has been sent. Check your inbox.
            </Alert>
            <Link to="/login" style={{ color: '#e94560' }}>
              Back to Login
            </Link>
          </Box>
        ) : (
          <>
            <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
              Enter your email and we'll send you a link to reset your password.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
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
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !email}
                sx={{ mt: 3, mb: 2, bgcolor: '#e94560' }}
              >
                {loading ? t('common.loading') : 'Send Reset Link'}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography align="center">
              <Link to="/login" style={{ color: '#e94560' }}>
                Back to Login
              </Link>
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
}