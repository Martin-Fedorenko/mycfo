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

const formatMonto = (valor) => (valor && valor !== 0) ? `$${valor.toLocaleString()}` : '—';

// Mapeo de nombre del mes a número
const mesANumero = {
  enero: '01', febrero: '02', marzo: '03', abril: '04',
  mayo: '05', junio: '06', julio: '07', agosto: '08',
  septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
};

// Formatear "2025-07" a "Julio 2025"
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
  const { nombre: nombreUrl, mesNombre: mesNombreUrl } = useParams();
  const [categorias, setCategorias] = React.useState([]);
  const [nombreMes, setNombreMes] = React.useState('Mes desconocido');
  const [presupuestoNombre, setPresupuestoNombre] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Paso 1: Buscar presupuesto por nombre
        const resPresupuestos = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos`
        );
        const decodedNombre = decodeURIComponent(nombreUrl)
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-');

        const presupuesto = resPresupuestos.data.find(
          (p) => p.nombre.trim().toLowerCase().replace(/\s+/g, '-') === decodedNombre
        );

        if (!presupuesto) throw new Error("Presupuesto no encontrado");

        const presupuestoId = presupuesto.id;
        setPresupuestoNombre(presupuesto.nombre);

        // Paso 2: Obtener detalles para mapear mesNombre → detalleId
        const resDetalle = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${presupuestoId}`
        );

        const mesNormalizado = mesNombreUrl.toLowerCase().trim();
        const mesNum = mesANumero[mesNormalizado];

        if (!mesNum) throw new Error("Mes no válido");

        const detalleMes = resDetalle.data.detalleMensual.find(mes =>
          mes.mes?.endsWith(`-${mesNum}`)
        );

        if (!detalleMes) throw new Error("Detalle mensual no encontrado");

        const detalleId = detalleMes.id;
        setNombreMes(formatearMes(detalleMes.mes));

        // Paso 3: Llamar al endpoint con IDs reales
        const res = await axios.get(
          `${process.env.REACT_APP_URL_PRONOSTICO}/api/presupuestos/${presupuestoId}/mes/${detalleId}`
        );

        setCategorias(res.data.categorias || []);
      } catch (e) {
        console.error(e);
        setCategorias([]);
        setNombreMes('Mes desconocido');
      }
    };

    if (nombreUrl && mesNombreUrl) {
      fetchData();
    }
  }, [nombreUrl, mesNombreUrl]);

  const totalIngresos = categorias
    .filter(r => r.tipo === 'INGRESO')
    .reduce((acc, r) => acc + (r.montoReal ?? 0), 0);
  const totalEgresos = categorias
    .filter(r => r.tipo === 'EGRESO')
    .reduce((acc, r) => acc + (r.montoReal ?? 0), 0);

  const safeNumber = (v) =>
    typeof v === 'number' ? v : v != null && !isNaN(Number(v)) ? Number(v) : 0;

  // === EXPORTACIÓN A EXCEL y PDF ===
  // (tu lógica original, sin cambios)
  const handleExportExcel = () => {
    const data = [
      ['Categoría', 'Tipo', 'Monto Estimado', 'Monto Registrado'],
      ...categorias.map(item => [
        item.categoria,
        item.tipo,
        safeNumber(item.montoEstimado),
        safeNumber(item.montoReal)
      ])
    ];
    data.push(['', '', '', '']);
    data.push(['Totales:', '', '', '']);
    data.push(['', '', '', totalIngresos - totalEgresos]);

    import('xlsx').then(({ utils, writeFile }) => {
      const ws = utils.aoa_to_sheet(data, { cellStyles: true });
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Detalle Mes');
      writeFile(wb, `Mes_${nombreMes}_${Date.now()}.xlsx`, { cellStyles: true });
    });
  };

  const handleExportPdf = () => {
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('mes-detalle-content');
      const opt = {
        margin: 1,
        filename: `Mes_${nombreMes}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf.default().from(element).set(opt).save();
    });
  };

  return (
    <Box id="mes-detalle-content" sx={{ width: '100%', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Detalle de {nombreMes} - {presupuestoNombre}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualizá los ingresos y egresos de este mes
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
        <ExportadorSimple
          onExportPdf={handleExportPdf}
          onExportExcel={handleExportExcel}
        />
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