import type { ReactNode } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import {
  Box, Drawer, List, ListItem, ListItemIcon,
  ListItemText, Typography, Divider, ListItemButton
} from '@mui/material';
import BookingsIcon from '@mui/icons-material/BookOnline';
import SponsorsIcon from '@mui/icons-material/Handshake';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';

const DRAWER_WIDTH = 240;

interface Props {
  children: ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: t('dashboard.bookings'),
      path: '/dashboard/bookings',
      icon: <BookingsIcon />
    },
    {
      label: t('dashboard.sponsors'),
      path: '/dashboard/sponsors',
      icon: <SponsorsIcon />
    },
    {
      label: t('dashboard.settings'),
      path: '/dashboard/settings',
      icon: <SettingsIcon />
    },
{
  label: 'Events',
  path: '/dashboard/events',
  icon: <EventIcon />
},
    // Admin only
    ...(isAdmin ? [{
      label: t('dashboard.users'),
      path: '/dashboard/users',
      icon: <PeopleIcon />
    }] : []),
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#1a1a2e',
            color: 'white',
            top: 64, // below navbar
            height: 'calc(100vh - 64px)', // ← add this
            display: 'flex',
            flexDirection: 'column', // ← add this
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="white">
            Dashboard
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ flexGrow: 1 }}>
        <List>
          {menuItems.map(item => (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                color: 'white',
                '&.Mui-selected': {
                  bgcolor: '#e94560',
                  '&:hover': { bgcolor: '#c73652' }
                },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        </Box>
        <Box>
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <ListItemButton
          onClick={() => navigate('/')}
          sx={{ color: 'white', mt: 1 }}
        >
          <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Back to Site" />
        </ListItemButton>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          width: '100%',
          maxWidth: 'calc(100vw - ' + DRAWER_WIDTH + 'px)',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}