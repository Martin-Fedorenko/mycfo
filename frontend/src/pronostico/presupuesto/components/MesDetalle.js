import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Grid
} from '@mui/material';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import axios from 'axios';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

// Formatear valores mostrando "—" si es null
const formatMonto = (valor) => (valor && valor !== 0) ? `$${valor.toLocaleString()}` : '—';

// Función para formatear "2025-07" a "Julio 2025"
const formatearMes = (mesString) => {
  if (!mesString) return 'Mes desconocido';
  const [anio, mes] = mesString.split('-');
  const mesesNombre = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const mesNum = parseInt(mes, 10);
  if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) return mesString;
  return `${mesesNombre[mesNum - 1]} ${anio}`;
};

export default function MesDetalle() {
  const { id, detalleId} = useParams();

  const [presupuestoNombre, setPresupuestoNombre] = React.useState('');
  const [categorias, setCategorias] = React.useState([]);
  const [nombreMes, setNombreMes] = React.useState('Mes desconocido');

  React.useEffect(() => {
    axios.get(`${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${id}/mes/${detalleId}`)
      .then(r => {
        setPresupuestoNombre(r.data.presupuestoNombre || 'Presupuesto desconocido');
        setCategorias(r.data.categorias || []);
        setNombreMes(formatearMes(r.data.mes));
      })
      .catch(e => {
        console.error(e);
        setCategorias([]);
        setNombreMes('Mes desconocido');
      });
  }, [id, detalleId]);

  const totalIngresos = categorias
    .filter(r => r.tipo === 'INGRESO')
    .reduce((acc, r) => acc + (r.montoReal ?? 0), 0);

  const totalEgresos = categorias
    .filter(r => r.tipo === 'EGRESO')
    .reduce((acc, r) => acc + (r.montoReal ?? 0), 0);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalle de {nombreMes} - {presupuestoNombre}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá los ingresos y egresos de este mes
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <ExportadorSimple onExportPdf={() => {}} onExportExcel={() => {}} />
      </Box>

      <Paper sx={{ mt: 2, width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Categoría</TableCell>
              <TableCell sx={tableCellStyle}>Tipo</TableCell>
              <TableCell sx={tableCellStyle}>Monto Estimado</TableCell>
              <TableCell sx={tableCellStyle}>Monto Registrado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categorias.map((item, idx) => (
              <TableRow key={idx} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{item.categoria}</TableCell>
                <TableCell sx={tableCellStyle}>{item.tipo}</TableCell>
                <TableCell sx={tableCellStyle}>{formatMonto(item.montoEstimado)}</TableCell>
                <TableCell sx={tableCellStyle}>{formatMonto(item.montoReal)}</TableCell>
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
              <Typography variant="h6" color="green">{formatMonto(totalIngresos)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Egresos totales:</Typography>
              <Typography variant="h6" color="red">{formatMonto(totalEgresos)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Resultado final:</Typography>
              <Typography variant="h6" color="blue">{formatMonto(totalIngresos - totalEgresos)}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
