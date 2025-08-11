import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Grid, Button
} from '@mui/material';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import axios from 'axios';

const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const presupuestosConDatos = {
  'anual-2025': {
    nombre: 'Presupuesto Anual 2025',
    meses: meses.slice(0, 12),
  },
  'semestre1-2025': {
    nombre: 'Primer semestre 2025',
    meses: meses.slice(0, 6),
  },
  'jul2025-mar2026': {
    nombre: 'Julio 2025 a Marzo 2026',
    meses: [...meses.slice(6, 12), ...meses.slice(0, 3)],
  },
};

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

export default function PresupuestoDetalle() {
  const { id } = useParams();
  const [presupuesto, setPresupuesto] = React.useState({ meses: [] });
  const navigate = useNavigate();

  React.useEffect(() => {
    axios.get(`${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${id}`)
      .then(r => {
        // Aseguramos que el objeto tiene meses definido como array
        setPresupuesto({
          ...r.data,
          meses: r.data.detalleMensual ? r.data.detalleMensual.map(m => m.mes) : []
        });
      })
      .catch(e => {
        console.error(e);
        // fallback si error
        setPresupuesto(presupuestosConDatos[id] || { nombre: 'Presupuesto desconocido', meses: [] });
      });
  }, [id]);

  // Usamos el presupuesto del backend o fallback
  const presupuestoData = presupuesto.nombre ? presupuesto : (presupuestosConDatos[id] || { nombre: 'Presupuesto desconocido', meses: [] });

  const datosMensuales = presupuestoData.meses?.map((mes, idx) => {
    const ingresoEst = 90000 + idx * 15000 + (id === 'semestre1-2025' ? 5000 : 0);
    const ingresoReal = ingresoEst - (idx % 2 === 0 ? 4000 : 0);
    const egresoEst = 60000 + idx * 10000;
    const egresoReal = egresoEst + (idx % 3 === 0 ? 6000 : 0);
    return { mes, ingresoEst, ingresoReal, egresoEst, egresoReal };
  }) || [];

  const totalIngresoEst = datosMensuales.reduce((acc, m) => acc + m.ingresoEst, 0);
  const totalIngresoReal = datosMensuales.reduce((acc, m) => acc + m.ingresoReal, 0);
  const totalEgresoEst = datosMensuales.reduce((acc, m) => acc + m.egresoEst, 0);
  const totalEgresoReal = datosMensuales.reduce((acc, m) => acc + m.egresoReal, 0);

  const totalReal = totalIngresoReal - totalEgresoReal;

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>Detalle de {presupuestoData.nombre}</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá resumen por mes con sus totales
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <ExportadorSimple
          onExportPdf={() => {}}
          onExportExcel={() => {}}
        />
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
            {datosMensuales.map((mes, idx) => (
              <TableRow key={idx} sx={tableRowStyle}>
                <TableCell sx={tableCellStyle}>{mes.mes}</TableCell>
                <TableCell sx={tableCellStyle}>${mes.ingresoEst.toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${mes.ingresoReal.toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${(mes.ingresoReal - mes.ingresoEst).toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${mes.egresoEst.toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${mes.egresoReal.toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${(mes.egresoReal - mes.egresoEst).toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${(mes.ingresoEst - mes.egresoEst).toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>${(mes.ingresoReal - mes.egresoReal).toLocaleString()}</TableCell>
                <TableCell sx={tableCellStyle}>
                  ${(mes.ingresoReal - mes.egresoReal - (mes.ingresoEst - mes.egresoEst)).toLocaleString()}
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/presupuesto/${id}/mes/${idx + 1}`)}
                  >
                    Ver mes
                  </Button>
                </TableCell>
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
              <Typography variant="h6" color="green">${totalIngresoReal.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Egresos totales:</Typography>
              <Typography variant="h6" color="red">${totalEgresoReal.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle2">Resultado final:</Typography>
              <Typography variant="h6" color="blue">${totalReal.toLocaleString()}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
