import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import type { Sponsor } from '../types';

interface Props {
  sponsors: Sponsor[];
}

export default function SponsorBanner({ sponsors }: Props) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [sliding, setSliding] = useState(false);
  const [direction, setDirection] = useState<'in' | 'out'>('in');

  useEffect(() => {
    if (sponsors.length === 0) return;

    const fullBannerTimer = setTimeout(() => {
      setCurrentIndex(0);
    }, 10000);

    return () => clearTimeout(fullBannerTimer);
  }, [sponsors]);

  useEffect(() => {
    if (currentIndex === null) return;

    const timer = setTimeout(() => {
      // Start slide out
      setDirection('out');
      setSliding(true);

      // After slide out, change index and slide in
      setTimeout(() => {
        setCurrentIndex(prev =>
          prev === null ? 0 : (prev + 1) % sponsors.length
        );
        setDirection('in');
        setSliding(false);
      }, 400); // matches transition duration

    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, sponsors.length]);

  if (sponsors.length === 0) return null;

  return (
    <Box sx={{
      width: '100%',
      overflow: 'hidden',
      py: 2,
    }}>
      {/* Show all sponsors together */}
      {currentIndex === null ? (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
        }}>
          {sponsors.map(sponsor => (
            <Box
              key={sponsor.id}
              component="img"
              src={sponsor.logoUrl}
              alt={sponsor.name}
              sx={{
                height: 70,
                maxWidth: 180,
                width: 'auto',
                objectFit: 'contain',
                filter: 'grayscale(20%)',
                '&:hover': {
                  filter: 'none',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
      ) : (
        // Show single sponsor with slide transition
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 120,
          width: '100%',
        }}>
          <Box
            component="img"
            src={sponsors[currentIndex].logoUrl}
            alt={sponsors[currentIndex].name}
            sx={{
              maxWidth: '100%',
              maxHeight: 120,
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              // Slide animation
              opacity: sliding ? 0 : 1,
              transform: sliding
                ? direction === 'out'
                  ? 'translateX(-60px)'
                  : 'translateX(60px)'
                : 'translateX(0)',
              transition: 'all 0.4s ease',
            }}
          />
        </Box>
      )}
    </Box>
  );
}