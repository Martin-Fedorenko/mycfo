import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Grid
} from '@mui/material';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const nombrePresupuestos = {
  'anual-2025': 'Presupuesto Anual 2025',
  'semestre1-2025': 'Primer semestre 2025',
  'jul2025-mar2026': 'Julio 2025 a Marzo 2026',
};

const presupuestoData = [
  { categoria: 'Alquiler', tipo: 'Egreso', sugerido: 100000, monto: 100000 },
  { categoria: 'Sueldos', tipo: 'Egreso', sugerido: 150000, monto: 120000 },
  { categoria: 'Ventas esperadas', tipo: 'Ingreso', sugerido: 300000, monto: 300000 },
];

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export default function MesDetalle() {
  const { id, mesId } = useParams();
  const mesIndex = parseInt(mesId, 10) - 1;
  const nombreMes = meses[mesIndex] || 'Mes desconocido';
  const nombrePresupuesto = nombrePresupuestos[id] || 'Presupuesto desconocido';

  const totalIngresos = presupuestoData
    .filter(r => r.tipo === 'Ingreso')
    .reduce((acc, r) => acc + r.monto, 0);

  const totalEgresos = presupuestoData
    .filter(r => r.tipo === 'Egreso')
    .reduce((acc, r) => acc + r.monto, 0);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalle de {nombreMes} - {nombrePresupuesto}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá los ingresos y egresos de este mes
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <ExportadorSimple
          onExportPdf={() => {}}
          onExportExcel={() => {}}
        />
      </Box>

      <Paper sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Categoría</TableCell>
              <TableCell sx={tableCellStyle}>Tipo</TableCell>
              <TableCell sx={tableCellStyle}>Monto estimado</TableCell>
              <TableCell sx={tableCellStyle}>Monto registrado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {presupuestoData.map((item, idx) => (
              <TableRow key={idx} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{item.categoria}</TableCell>
                <TableCell sx={tableCellStyle}>{item.tipo}</TableCell>
                <TableCell sx={tableCellStyle}>${item.sugerido.toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${item.monto.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Ingresos totales:</Typography>
              <Typography variant="h6" color="green">${totalIngresos.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Egresos totales:</Typography>
              <Typography variant="h6" color="red">${totalEgresos.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Resultado final:</Typography>
              <Typography variant="h6" color="blue">${(totalIngresos - totalEgresos).toLocaleString()}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
