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
  TableBody
} from '@mui/material';
import { useNavigate } from 'react-router-dom';


const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export default function PresupuestoList() {
  const navigate = useNavigate();

  const presupuestos = [
    { id: 1, nombre: 'Presupuesto Julio 2025', fecha: '2025-07-01' },
    { id: 2, nombre: 'Presupuesto Junio 2025', fecha: '2025-06-01' },
  ];

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Presupuestos
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá tus presupuestos creados o generá uno nuevo
      </Typography>

      <Paper sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Nombre</TableCell>
              <TableCell sx={tableCellStyle}>Fecha</TableCell>
              <TableCell sx={{ ...tableCellStyle }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {presupuestos.map((presupuesto) => (
              <TableRow key={presupuesto.id}>
                <TableCell sx={tableCellStyle}>{presupuesto.nombre}</TableCell>
                <TableCell sx={tableCellStyle}>{presupuesto.fecha}</TableCell>
                <TableCell sx={{ ...tableCellStyle }} align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/presupuesto/${presupuesto.id}`)}
                  >
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box mt={3}>
        <Button
          variant="contained"
          onClick={() => navigate('/presupuesto/nuevo')}
        >
          Crear nuevo presupuesto
        </Button>
      </Box>
    </Box>
  );
}
