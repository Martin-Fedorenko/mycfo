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
  const { nombre: nombreUrl } = useParams(); // ahora usamos el nombre, no el id
  const [presupuesto, setPresupuesto] = React.useState({
    id: null,
    nombre: '',
    detalleMensual: [],
  });
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchPresupuestos = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`
        );
        const lista = res.data;

        // Normalizar nombre de URL
        const decodedNombre = decodeURIComponent(nombreUrl)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');

        const encontrado = lista.find(
          (p) => p.nombre.trim().toLowerCase().replace(/\s+/g, '-') === decodedNombre
        );

        if (encontrado) {
          // Ahora usamos el ID real para traer los datos
          const resDetalle = await axios.get(
            `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${encontrado.id}`
          );
          setPresupuesto(resDetalle.data);
        } else {
          console.error("Presupuesto no encontrado por nombre:", nombreUrl);
          setPresupuesto({ id: null, nombre: 'No encontrado', detalleMensual: [] });
        }
      } catch (error) {
        console.error('Error al cargar presupuesto:', error);
        setPresupuesto({ id: null, nombre: 'Error', detalleMensual: [] });
      }
    };

    if (nombreUrl) {
      fetchPresupuestos();
    }
  }, [nombreUrl]);

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

    // Normalizar nombre del presupuesto para URL
    const nombreNormalizado = encodeURIComponent(
      presupuesto.nombre.trim().toLowerCase().replace(/\s+/g, '-')
    );

    // Convertir mes.mes (ej: "2025-02") a nombre del mes
    const mesStr = mes.mes; // "2025-02"
    const mesNum = parseInt(mesStr.split('-')[1], 10);
    const mesNombre = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(
      new Date(2025, mesNum - 1)
    ); // → "febrero"

    navigate(`/presupuestos/${nombreNormalizado}/detalle/${mesNombre}`);
  };

  // === EXPORTACIÓN A EXCEL y PDF ===
  // (mantenemos tu lógica original, no cambia)
  const handleExportExcel = () => {
    const { nombre } = presupuesto;
    const data = [
      ['Mes', 'Ingreso Estimado', 'Ingreso Real', 'Desvío Ingresos', 'Egreso Estimado', 'Egreso Real', 'Desvío Egresos', 'Total Estimado', 'Total Real', 'Total Desvío'],
      ...datosMensuales.map(mes => [
        mes.mes ?? '—',
        safeNumber(mes.ingresoEst),
        safeNumber(mes.ingresoReal),
        safeNumber(mes.desvioIngreso),
        safeNumber(mes.egresoEst),
        safeNumber(mes.egresoReal),
        safeNumber(mes.desvioEgreso),
        safeNumber(mes.totalEst),
        safeNumber(mes.totalReal),
        safeNumber(mes.totalDesvio),
      ])
    ];

    data.push(['', '', '', '', '', '', '', '', '', '']);
    data.push(['Totales:', '', '', '', '', '', '', '', '', '']);
    data.push([
      '',
      totalIngresoEst,
      totalIngresoReal,
      totalIngresoReal - totalIngresoEst,
      totalEgresoEst,
      totalEgresoReal,
      totalEgresoReal - totalEgresoEst,
      totalIngresoEst - totalEgresoEst,
      totalReal,
      totalReal - (totalIngresoEst - totalEgresoEst)
    ]);

    import('xlsx').then(({ utils, writeFile }) => {
      const ws = utils.aoa_to_sheet(data, { cellStyles: true });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Detalle Presupuesto');
      writeFile(wb, `Presupuesto_${nombre}_${presupuesto.id}.xlsx`, { cellStyles: true });
    });
  };

  const handleExportPdf = () => {
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('presupuesto-detalle-content');
      const opt = {
        margin: 0.5,
        filename: `Presupuesto_${presupuesto.nombre}_${presupuesto.id}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
      };
      html2pdf.default().from(element).set(opt).save();
    });
  };

  return (
    <Box id="presupuesto-detalle-content" sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalle de {presupuesto.nombre}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá resumen por mes con sus totales
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <ExportadorSimple
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
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