import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Box, Typography, Paper, TextField,
  Button, Alert, CircularProgress, Card, CardMedia
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function DashboardSettings() {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    churchName: '',
    instapayLink: '',
    cashPhone: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setForm({
          churchName: res.data.churchName || '',
          instapayLink: res.data.instapayLink || '',
          cashPhone: res.data.cashPhone || '',
          contactEmail: res.data.contactEmail || '',
          contactPhone: res.data.contactPhone || '',
        });
        setHeroImageUrl(res.data.heroImageUrl || '');
      } catch {
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleHeroImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadHeroImage = async () => {
    if (!heroImageFile) return;
    
    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', heroImageFile);
      
      const res = await api.post('/settings/hero-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setHeroImageUrl(res.data.heroImageUrl);
      setHeroImageFile(null);
      setHeroImagePreview('');
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || 'Error uploading hero image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError('');
    try {
      await api.put('/settings', form);
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      setError(data?.errors?.[0]?.message || data?.message || t('common.error'));
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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('dashboard.settings')}
      </Typography>

      {/* Hero Image Section */}
      <Paper sx={{ p: 4, mb: 4, maxWidth: 600 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Hero Image
        </Typography>
        
        {heroImagePreview ? (
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image={heroImagePreview}
              alt="Hero preview"
            />
          </Card>
        ) : heroImageUrl ? (
          <Card sx={{ mb: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image={heroImageUrl}
              alt="Current hero"
            />
          </Card>
        ) : null}

        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            hidden
            id="hero-image-input"
            type="file"
            onChange={handleHeroImageSelect}
          />
          <label htmlFor="hero-image-input">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 1, bgcolor: '#e94560' }}
            >
              Choose Image
            </Button>
          </label>
        </Box>

        {heroImageFile && (
          <Button
            fullWidth
            variant="contained"
            onClick={handleUploadHeroImage}
            disabled={uploadingImage}
            sx={{ mb: 3, bgcolor: '#e94560' }}
          >
            {uploadingImage ? <CircularProgress size={24} color="inherit" /> : 'Upload Hero Image'}
          </Button>
        )}
      </Paper>

      {/* Settings Section */}
      <Paper sx={{ p: 4, maxWidth: 600 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <TextField
          fullWidth name="churchName"
          label="Church Name"
          value={form.churchName}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth name="instapayLink"
          label="Instapay Link"
          value={form.instapayLink}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth name="cashPhone"
          label="Cash Payment Phone"
          value={form.cashPhone}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth name="contactEmail"
          label="Contact Email"
          type="email"
          value={form.contactEmail}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth name="contactPhone"
          label="Contact Phone"
          value={form.contactPhone}
          onChange={handleChange}
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ mt: 3, bgcolor: '#e94560' }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : t('common.save')}
        </Button>
      </Paper>
    </DashboardLayout>
  );
}