import * as React from 'react';
import {
  Box, Typography, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export default function PresupuestoList() {
  const navigate = useNavigate();

  const presupuestos = [
    {
      id: 'anual-2025',
      nombre: 'Presupuesto Anual 2025',
      desde: '2025-01-01',
      hasta: '2025-12-31',
    },
    {
      id: 'semestre1-2025',
      nombre: 'Primer semestre 2025',
      desde: '2025-01-01',
      hasta: '2025-06-30',
    },
    {
      id: 'jul2025-mar2026',
      nombre: 'Julio 2025 a Marzo 2026',
      desde: '2025-07-01',
      hasta: '2026-03-31',
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>Presupuestos</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá tus presupuestos creados o generá uno nuevo
      </Typography>

      <Paper sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Nombre</TableCell>
              <TableCell sx={tableCellStyle}>Desde</TableCell>
              <TableCell sx={tableCellStyle}>Hasta</TableCell>
              <TableCell sx={{ ...tableCellStyle }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {presupuestos.map((p) => (
              <TableRow key={p.id} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{p.nombre}</TableCell>
                <TableCell sx={tableCellStyle}>{p.desde}</TableCell>
                <TableCell sx={tableCellStyle}>{p.hasta}</TableCell>
                <TableCell sx={{ ...tableCellStyle }} align="right">
                  <Button variant="outlined" size="small" onClick={() => navigate(`/presupuesto/${p.id}`)}>
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box mt={3}>
        <Button variant="contained" onClick={() => navigate('/presupuesto/nuevo')}>
          Crear nuevo presupuesto
        </Button>
      </Box>
    </Box>
  );
}