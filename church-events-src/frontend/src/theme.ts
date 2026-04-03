import { createTheme } from '@mui/material';

const theme = createTheme({
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl', // wider than default 'lg'
      },
    },
  },
});

export default theme;