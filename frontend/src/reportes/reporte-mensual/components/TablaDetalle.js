import React from 'react';
import {
  Box, Typography, Grid, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';

const TablaDetalle = ({ ingresos, egresos }) => {
  const totalIngresos = ingresos.reduce((acc, curr) => acc + curr.monto, 0);
  const totalEgresos = egresos.reduce((acc, curr) => acc + curr.monto, 0);
  const balance = totalIngresos - totalEgresos;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
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

      <Typography variant="h6" gutterBottom>
        Detalle de Ingresos
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingresos.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                  },
                }}
              >
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.categoria}</TableCell>
                <TableCell>{row.fecha}</TableCell>
                <TableCell align="right">${row.monto.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom>
        Detalle de Egresos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {egresos.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                  },
                }}
              >
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.categoria}</TableCell>
                <TableCell>{row.fecha}</TableCell>
                <TableCell align="right">${row.monto.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TablaDetalle;
