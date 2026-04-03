import { Card, CardContent, CardMedia, CardActionArea, 
         Typography, Box, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import type { Event } from '../types';

interface Props {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: Props) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
      }}
    >
      <CardActionArea onClick={onClick} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="200"
          image={event.image || '/placeholder.jpg'}
          alt={event.title}
        />
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {event.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {event.description}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CalendarMonthIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {new Date(event.date).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {event.location}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              label={`${event.price} EGP`}
              color="primary"
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {event._count.seats} seats
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}