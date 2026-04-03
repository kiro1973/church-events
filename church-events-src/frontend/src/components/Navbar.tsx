import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import ChurchIcon from '@mui/icons-material/Church';
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemText, Box, Divider,
  ListItemButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated, isResponsible, user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.events'), path: '/#events' },
    ...(isAuthenticated ? [
      { label: t('nav.myBookings'), path: '/my-bookings' }
    ] : []),
    ...(isResponsible ? [
      { label: t('nav.dashboard'), path: '/dashboard' }
    ] : []),
  ];

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: '#1a1a2e' ,
      width: '100%',        // ← always full viewport width
      left: 0,              // ← anchor to left edge
      right: 0,             // ← anchor to right edge
      }}>
        <Toolbar>
          {/* Logo / Church Name */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
              fontSize: { xs: '0.9rem', md: '1.2rem' }
            }}
          >
            
            St. George Events
          </Typography>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {navLinks.map(link => (
              <Button
                key={link.path}
                color="inherit"
                component={Link}
                to={link.path}
              >
                {link.label}
              </Button>
            ))}

            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  startIcon={<AccountCircleIcon />}
                >
                  {user?.name}
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  variant="outlined"
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                >
                  {t('nav.login')}
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/register"
                  sx={{ bgcolor: '#e94560' }}
                >
                  {t('nav.register')}
                </Button>
              </>
            )}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            color="inherit"
            sx={{ display: { xs: 'flex', md: 'none' } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {navLinks.map(link => (
              <ListItem
                key={link.path}
                component={Link}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {isAuthenticated ? (
              <>
                {isResponsible && (
                  <ListItem
                    component={Link}
                    to="/dashboard"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <DashboardIcon sx={{ mr: 1 }} />
                    <ListItemText primary={t('nav.dashboard')} />
                  </ListItem>
                )}
                <ListItemButton onClick={() => { handleLogout(); setDrawerOpen(false); }}>
                  <ListItemText primary={t('nav.logout')} />
                </ListItemButton>
              </>
            ) : (
              <>
                <ListItem
                  component={Link}
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={t('nav.login')} />
                </ListItem>
                <ListItem
                  component={Link}
                  to="/register"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={t('nav.register')} />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}