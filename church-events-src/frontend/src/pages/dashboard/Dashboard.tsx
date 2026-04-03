import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/useAuth';
import DashboardLayout from '../../components/DashboardLayout';
import {
  Box, Typography, Grid, Card,
  CardContent, CardActionArea
} from '@mui/material';
import BookingsIcon from '@mui/icons-material/BookOnline';
import SponsorsIcon from '@mui/icons-material/Handshake';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      label: t('dashboard.bookings'),
      description: 'View and manage booking requests',
      icon: <BookingsIcon sx={{ fontSize: 40 }} />,
      path: '/dashboard/bookings',
      color: '#e94560',
    },
    {
      label: t('dashboard.sponsors'),
      description: 'Add and manage sponsors',
      icon: <SponsorsIcon sx={{ fontSize: 40 }} />,
      path: '/dashboard/sponsors',
      color: '#0f3460',
    },
    {
      label: t('dashboard.settings'),
      description: 'Update payment info and church details',
      icon: <SettingsIcon sx={{ fontSize: 40 }} />,
      path: '/dashboard/settings',
      color: '#16213e',
    },
    {
  label: 'Events',
  description: 'Add and manage events',
  icon: <EventIcon sx={{ fontSize: 40 }} />,
  path: '/dashboard/events',
  color: '#4caf50',
},
    ...(isAdmin ? [{
      label: t('dashboard.users'),
      description: 'Add responsibles and admins',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/dashboard/users',
      color: '#1a1a2e',
    }] : []),
  ];

  return (
    <DashboardLayout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {user?.name} 👋
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Manage your church events from here
      </Typography>

      <Grid container spacing={3}>
        {cards.map(card => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.path}>
            <Card
              elevation={2}
              sx={{ height: '100%' }}
            >
              <CardActionArea
                onClick={() => navigate(card.path)}
                sx={{ p: 3, height: '100%' }}
              >
                <CardContent>
                  <Box
                    sx={{
                      color: card.color,
                      mb: 2,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {card.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </DashboardLayout>
  );
}