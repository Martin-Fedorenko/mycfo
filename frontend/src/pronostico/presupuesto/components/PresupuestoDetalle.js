import * as React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import axios from 'axios';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

// Helper seguro para números
const safeNumber = (v) =>
  typeof v === 'number' ? v : v != null && !isNaN(Number(v)) ? Number(v) : 0;

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = React.useState({
    nombre: '',
    detalleMensual: [],
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    let isMounted = true; // Evita setState si el componente se desmonta

    const fetchPresupuesto = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${id}`
        );

        if (isMounted) {
          console.log('Presupuesto recibido:', res.data);
          setPresupuesto(res.data);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error al cargar presupuesto:', error);
          setPresupuesto({ nombre: 'Presupuesto desconocido', detalleMensual: [] });
        }
      }
    };

    fetchPresupuesto();

    return () => {
      isMounted = false; // Limpieza
    };
  }, [id]);

  // Validación segura del array
  const datosMensuales = Array.isArray(presupuesto.detalleMensual)
    ? presupuesto.detalleMensual.filter((mes) => mes != null && mes.id != null)
    : [];

  // Totales
  const totalIngresoEst = datosMensuales.reduce(
    (acc, mes) => acc + safeNumber(mes.ingresoEst),
    0
  );
  const totalIngresoReal = datosMensuales.reduce(
    (acc, mes) => acc + safeNumber(mes.ingresoReal),
    0
  );
  const totalEgresoEst = datosMensuales.reduce(
    (acc, mes) => acc + safeNumber(mes.egresoEst),
    0
  );
  const totalEgresoReal = datosMensuales.reduce(
    (acc, mes) => acc + safeNumber(mes.egresoReal),
    0
  );
  const totalReal = totalIngresoReal - totalEgresoReal;

  const goToMes = (mes) => {
    if (!mes?.id) {
      console.error('Intento de abrir mes sin ID:', mes);
      alert('No se puede abrir el mes: falta el identificador.');
      return;
    }
    navigate(`/presupuestos/${id}/mes/${mes.id}`);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalle de {presupuesto.nombre}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá resumen por mes con sus totales
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <ExportadorSimple onExportPdf={() => {}} onExportExcel={() => {}} />
      </Box>

      <Paper sx={{ mt: 2, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Mes</TableCell>
              <TableCell sx={tableCellStyle}>Ingreso Estimado</TableCell>
              <TableCell sx={tableCellStyle}>Ingreso Real</TableCell>
              <TableCell sx={tableCellStyle}>Desvío Ingresos</TableCell>
              <TableCell sx={tableCellStyle}>Egreso Estimado</TableCell>
              <TableCell sx={tableCellStyle}>Egreso Real</TableCell>
              <TableCell sx={tableCellStyle}>Desvío Egresos</TableCell>
              <TableCell sx={tableCellStyle}>Total Estimado</TableCell>
              <TableCell sx={tableCellStyle}>Total Real</TableCell>
              <TableCell sx={tableCellStyle}>Total Desvío</TableCell>
              <TableCell sx={tableCellStyle}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {datosMensuales.length > 0 ? (
              datosMensuales.map((mes) => (
                <TableRow key={mes.id} sx={tableRowStyle}>
                  <TableCell sx={tableCellStyle}>{mes.mes ?? '—'}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.ingresoEst).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.ingresoReal).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.desvioIngreso).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.egresoEst).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.egresoReal).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.desvioEgreso).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.totalEst).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.totalReal).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    ${safeNumber(mes.totalDesvio).toLocaleString()}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Button onClick={() => goToMes(mes)} variant="contained" size="small">
                      Ver mes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  No hay datos mensuales disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Box mt={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Ingresos totales:</Typography>
              <Typography variant="h6" color="green">
                ${totalIngresoReal.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Egresos totales:</Typography>
              <Typography variant="h6" color="red">
                ${totalEgresoReal.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Resultado final:</Typography>
              <Typography variant="h6" color="blue">
                ${totalReal.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}