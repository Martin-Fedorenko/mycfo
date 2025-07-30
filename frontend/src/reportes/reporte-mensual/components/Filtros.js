import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const Filtros = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const años = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <FormControl variant="outlined" size="small">
        <InputLabel>Mes</InputLabel>
        <Select
          value={selectedMonth}
          onChange={onMonthChange}
          label="Mes"
        >
          {meses.map((mes, index) => (
            <MenuItem key={index} value={index}>{mes}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined" size="small">
        <InputLabel>Año</InputLabel>
        <Select
          value={selectedYear}
          onChange={onYearChange}
          label="Año"
        >
          {años.map((año) => (
            <MenuItem key={año} value={año}>{año}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default Filtros;
