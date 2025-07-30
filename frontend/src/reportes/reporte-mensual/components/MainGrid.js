import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TablaDetalle from './TablaDetalle';

export default function MainGrid() {
  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Resumen mensual de ingresos y egresos
      </Typography>
      <TablaDetalle />
    </Box>
  );
}
