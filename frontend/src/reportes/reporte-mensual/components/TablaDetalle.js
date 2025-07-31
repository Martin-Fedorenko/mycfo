import * as React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';

export default function TablaDetalle() {
  const ingresos = [
    { id: 1, categoria: 'Ventas', monto: 85000, fecha: '2025-07-05' },
    { id: 2, categoria: 'Intereses', monto: 40000, fecha: '2025-07-12' },
  ];

  const egresos = [
    { id: 1, categoria: 'Sueldos', monto: 50000, fecha: '2025-07-10' },
    { id: 2, categoria: 'Servicios', monto: 30000, fecha: '2025-07-15' },
    { id: 3, categoria: 'Impuestos', monto: 18000, fecha: '2025-07-20' },
  ];

  const totalIngresos = ingresos.reduce((acc, item) => acc + item.monto, 0);
  const totalEgresos = egresos.reduce((acc, item) => acc + item.monto, 0);
  const balance = totalIngresos - totalEgresos;

  const tableRowStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
  };

  const tableCellStyle = {
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Resumen general */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Ingresos</Typography>
            <Typography variant="h6" color="green">
              ${totalIngresos.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Egresos</Typography>
            <Typography variant="h6" color="red">
              ${totalEgresos.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Balance</Typography>
            <Typography variant="h6" color={balance >= 0 ? 'green' : 'red'}>
              ${balance.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabla de Ingresos */}
      <Typography variant="h6" gutterBottom>
        Detalle de Ingresos
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellStyle}>N°</TableCell>
              <TableCell sx={tableCellStyle}>Categoría</TableCell>
              <TableCell sx={tableCellStyle}>Fecha</TableCell>
              <TableCell align="right" sx={tableCellStyle}>Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingresos.map((row) => (
              <TableRow key={row.id} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{row.id}</TableCell>
                <TableCell sx={tableCellStyle}>{row.categoria}</TableCell>
                <TableCell sx={tableCellStyle}>{row.fecha}</TableCell>
                <TableCell align="right" sx={tableCellStyle}>${row.monto.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tabla de Egresos */}
      <Typography variant="h6" gutterBottom>
        Detalle de Egresos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={tableCellStyle}>N°</TableCell>
              <TableCell sx={tableCellStyle}>Categoría</TableCell>
              <TableCell sx={tableCellStyle}>Fecha</TableCell>
              <TableCell align="right" sx={tableCellStyle}>Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {egresos.map((row) => (
              <TableRow key={row.id} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{row.id}</TableCell>
                <TableCell sx={tableCellStyle}>{row.categoria}</TableCell>
                <TableCell sx={tableCellStyle}>{row.fecha}</TableCell>
                <TableCell align="right" sx={tableCellStyle}>${row.monto.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
