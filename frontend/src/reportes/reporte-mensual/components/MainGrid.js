import * as React from 'react';
import { Box, Typography } from '@mui/material';
import TablaDetalle from './TablaDetalle';
import Exportador from './Exportador';
import Filtros from './Filtros';

export default function MainGrid() {
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const getNombreMes = (mesIndex) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return meses[mesIndex];
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3, position: 'relative' }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Resumen mensual de ingresos y egresos
      </Typography>

      {/* Filtros */}
      <Filtros
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
      />

      {/* Título dinámico */}
      <Typography component="h3" variant="h6" sx={{ mb: 2 }}>
        Resumen mensual - {getNombreMes(selectedMonth)} {selectedYear}
      </Typography>

      {/* Tablas */}
      <TablaDetalle />

      {/* Botón fijo abajo a la derecha */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Exportador />
      </Box>
    </Box>
  );
}
