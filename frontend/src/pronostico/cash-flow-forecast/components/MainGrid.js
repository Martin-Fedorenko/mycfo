import * as React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  MenuItem
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import Exportador from '../../../shared-components/Exportador'; // Asegurate de ajustar el path si es necesario

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

// Datos simulados
const forecastData = [
  { fecha: '01/08/2025', tipo: 'Ingreso', detalle: 'Sueldo', monto: 25000, saldo: 25000 },
  { fecha: '03/08/2025', tipo: 'Egreso', detalle: 'Alquiler', monto: 10000, saldo: 15000 },
  { fecha: '08/08/2025', tipo: 'Egreso', detalle: 'Comida', monto: 5000, saldo: 10000 },
  { fecha: '10/08/2025', tipo: 'Ingreso', detalle: 'Venta freelance', monto: 15000, saldo: 25000 },
  { fecha: '15/08/2025', tipo: 'Egreso', detalle: 'Transporte', monto: 2000, saldo: 23000 },
];

const periodos = [
  { label: '1 mes', value: '1m' },
  { label: '3 meses', value: '3m' },
  { label: '6 meses', value: '6m' },
  { label: 'Personalizado', value: 'custom' },
];

export default function MainGrid() {
  const [periodo, setPeriodo] = React.useState('1m');

  const handleExportPdf = () => {
    alert('Exportar Cash Flow Forecast como PDF');
  };

  const handleExportExcel = () => {
    alert('Exportar Cash Flow Forecast como Excel');
  };

  return (
    <Box sx={{ width: '100%', p: 3, position: 'relative' }}>
      <Typography variant="h4" gutterBottom>
        Cash Flow Forecast
      </Typography>

      <Typography variant="subtitle1" gutterBottom>
        Visualizá el pronóstico de flujo de caja para anticipar faltantes o excedentes de liquidez
      </Typography>

      {/* Filtro de período */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
        <TextField
          select
          label="Período"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {periodos.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={() => alert('Actualizar forecast')}>
          Actualizar Forecast
        </Button>
      </Box>

      {/* Tabla */}
      <Paper sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Fecha</TableCell>
              <TableCell sx={tableCellStyle}>Movimiento</TableCell>
              <TableCell sx={tableCellStyle}>Detalle</TableCell>
              <TableCell sx={tableCellStyle}>Monto</TableCell>
              <TableCell sx={tableCellStyle}>Saldo estimado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forecastData.map((row, index) => (
              <TableRow key={index}>
                <TableCell sx={tableCellStyle}>{row.fecha}</TableCell>
                <TableCell sx={tableCellStyle}>{row.tipo}</TableCell>
                <TableCell sx={tableCellStyle}>{row.detalle}</TableCell>
                <TableCell sx={tableCellStyle}>
                  {row.tipo === 'Egreso' ? '-' : ''}${row.monto.toLocaleString()}
                </TableCell>
                <TableCell sx={tableCellStyle}>${row.saldo.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Gráfico */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Proyección de Saldo Estimado
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="saldo" stroke="#00bfa5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Ajustes manuales (placeholder) */}
      <Box mt={4}>
        <Typography variant="subtitle1" gutterBottom>
          ¿Querés ajustar valores manualmente?
        </Typography>
        <Button variant="outlined" onClick={() => alert('Agregar ajuste manual')}>
          + Agregar ingreso o egreso manual
        </Button>
      </Box>

      {/* Botón de exportación compartido */}
      <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Exportador
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
          label="Exportar Cash Flow Forecast"
          sx={{ position: 'fixed', bottom: 20, right: 20 }}
        />
      </Box>
    </Box>
  );
}
