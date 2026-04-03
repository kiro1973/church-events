import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Tooltip } from '@mui/material';
import type { Seat, SeatPosition } from '../types';

interface Props {
  seats: Seat[];
  rows: number;
  cols: number;
  selectedSeats: SeatPosition[];
  onSeatClick: (seat: SeatPosition, status: string) => void;
}

// Seat colors
const SEAT_COLORS = {
  AVAILABLE: '#4caf50',  // green
  ON_HOLD: '#ff9800',    // orange
  RESERVED: '#f44336',   // red
  SELECTED: '#2196f3',   // blue
};

export default function SeatMap({ seats, rows, cols, selectedSeats, onSeatClick }: Props) {
  const { t } = useTranslation();

  // Build a lookup map for O(1) seat status access
  // instead of seats.find() on every cell = O(n) per cell
  // also for ex when refresh happens and in this time some seats are reserved, we can quickly update the map and reflect changes without re-rendering entire grid
  const seatMap = useMemo(() => {
    const map = new Map<string, Seat>();
    seats.forEach(seat => {
      map.set(`${seat.row}-${seat.col}`, seat);
    });
    return map;
  }, [seats]);

  // Check if a seat is selected
  const isSelected = (row: number, col: number) => {
    return selectedSeats.some(s => s.row === row && s.col === col);
  };

  // Get seat color based on status and selection
  const getSeatColor = (row: number, col: number) => {
    if (isSelected(row, col)) return SEAT_COLORS.SELECTED;
    const seat = seatMap.get(`${row}-${col}`);
    if (!seat) return '#ccc';
    return SEAT_COLORS[seat.status];
  };

  // Get tooltip label
  const getSeatLabel = (row: number, col: number) => {
    if (isSelected(row, col)) return `Row ${row}, Seat ${col} — Selected`;
    const seat = seatMap.get(`${row}-${col}`);
    if (!seat) return '';
    const statusLabel = {
      AVAILABLE: t('booking.legend.available'),
      ON_HOLD: t('booking.legend.onHold'),
      RESERVED: t('booking.legend.reserved'),
    }[seat.status];
    return `Row ${row}, Seat ${col} — ${statusLabel}`;
  };

  return (
    <Box>
      {/* Stage indicator */}
      <Box sx={{
        bgcolor: '#1a1a2e',
        color: 'white',
        textAlign: 'center',
        py: 1.5,
        borderRadius: 2,
        mb: 4,
        width: '60%',
        mx: 'auto',
        letterSpacing: 4,
      }}>
        <Typography variant="body1" fontWeight="bold">
          STAGE
        </Typography>
      </Box>

      {/* Seat Grid */}
      <Box sx={{ overflowX: 'auto', pb: 2 }}>
        <Box sx={{
          display: 'inline-block',
          minWidth: 'fit-content',
          mx: 'auto',
        }}>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              {/* Row label */}
              <Typography
                variant="caption"
                sx={{ width: 24, textAlign: 'center', color: 'text.secondary' }}
              >
                {rowIndex + 1}
              </Typography>

              {/* Seats in this row */}
              {Array.from({ length: cols }, (_, colIndex) => {
                const row = rowIndex + 1;
                const col = colIndex + 1;
                const seat = seatMap.get(`${row}-${col}`);
                const color = getSeatColor(row, col);
                const available = seat?.status === 'AVAILABLE';
                const selected = isSelected(row, col);

                return (
                  <Tooltip
                    key={colIndex}
                    title={getSeatLabel(row, col)}
                    arrow
                  >
                    <Box
                      onClick={() => seat && onSeatClick({ row, col }, seat.status)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '6px 6px 0 0', // seat shape
                        bgcolor: color,
                        cursor: available || selected ? 'pointer' : 'not-allowed',
                        border: selected ? '2px solid #0d47a1' : '2px solid transparent',
                        transform: selected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                        '&:hover': available || selected ? {
                          transform: 'scale(1.15)',
                          opacity: 0.85,
                        } : {},
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{
        display: 'flex',
        gap: 3,
        justifyContent: 'center',
        flexWrap: 'wrap',
        mt: 4,
        p: 2,
        bgcolor: '#f5f5f5',
        borderRadius: 2,
      }}>
        {Object.entries({
          [t('booking.legend.available')]: SEAT_COLORS.AVAILABLE,
          [t('booking.legend.onHold')]: SEAT_COLORS.ON_HOLD,
          [t('booking.legend.reserved')]: SEAT_COLORS.RESERVED,
          [t('booking.legend.selected')]: SEAT_COLORS.SELECTED,
        }).map(([label, color]) => (
          <Box key={label} display="flex" alignItems="center" gap={1}>
            <Box sx={{
              width: 20,
              height: 20,
              bgcolor: color,
              borderRadius: '4px 4px 0 0',
            }} />
            <Typography variant="body2">{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}