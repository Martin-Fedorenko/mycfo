import React from 'react';
import {
  Box, Typography, Grid, Paper,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';

const TablaDetalle = ({ ingresos, egresos, topRightActions }) => {
  const totalIngresos = ingresos.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const totalEgresos = egresos.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const balance = totalIngresos - totalEgresos;

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      {/* Totales arriba */}
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

      {/* Acciones arriba de la tabla */}
      <Typography variant="h6" gutterBottom>
        Detalle de Ingresos
      </Typography>

      {topRightActions && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          {topRightActions}
        </Box>
      )}

      {/* Tabla de ingresos */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingresos.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                  },
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.categoria}</TableCell>
                <TableCell align="right">${row.total?.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Tabla de egresos */}
      <Typography variant="h6" gutterBottom>
        Detalle de Egresos
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N°</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Monto</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {egresos.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                  },
                }}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>{row.categoria}</TableCell>
                <TableCell align="right">${row.total?.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TablaDetalle;
