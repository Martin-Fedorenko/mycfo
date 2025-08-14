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
    // === EXPORTACIÓN A EXCEL ===
    const handleExportExcel = () => {
      const { nombre } = presupuesto;

      // Datos principales
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

      // Agregar filas de totales
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

      import('xlsx').then(({ utils, writeFile, WorkBook }) => {
        // Crear libro
        const wb = utils.book_new();

        // Convertir array a hoja con soporte de estilos
        const ws = utils.aoa_to_sheet(data, { cellStyles: true });

        // === DEFINICIÓN DE ESTILOS ===

        // Estilo de encabezado: verde
        const headerStyle = {
          font: { sz: 12, bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "2E7D32" } }, // Verde oscuro profesional
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } },
          }
        };

        // Estilo para celdas de datos
        const dataStyle = {
          font: { sz: 11 },
          fill: { fgColor: { rgb: "FFFFFF" } }, // Fondo blanco
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: 'thin', color: { rgb: "DDDDDD" } },
            bottom: { style: 'thin', color: { rgb: "DDDDDD" } },
            left: { style: 'thin', color: { rgb: "DDDDDD" } },
            right: { style: 'thin', color: { rgb: "DDDDDD" } },
          }
        };

        // Estilo para números (derecha)
        const numberStyle = {
          ...dataStyle,
          alignment: { horizontal: "right", vertical: "center" },
          numFmt: '#,##0'
        };

        // Estilo para "Totales:" (texto)
        const totalLabelStyle = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: "E8F5E8" } }, // Verde muy claro
          alignment: { horizontal: "left" },
          border: { top: { style: 'medium', color: { rgb: "000000" } } }
        };

        // Estilo para valores de totales
        const totalValueStyle = {
          font: { bold: true, sz: 11 },
          fill: { fgColor: { rgb: "E8F5E8" } },
          alignment: { horizontal: "right" },
          numFmt: '#,##0',
          border: { top: { style: 'medium', color: { rgb: "000000" } } }
        };

        // === APLICAR ESTILOS A LAS CELDAS ===

        // Encabezados (fila 1)
        const headers = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'];
        headers.forEach(cell => {
          ws[cell].s = headerStyle;
        });

        // Celdas de datos (filas 2 hasta antes de totales)
        const startRow = 2;
        const endRow = datosMensuales.length + 1;
        const numberCols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        for (let row = startRow; row <= endRow; row++) {
          // Columna A: texto (mes)
          const cellA = 'A' + row;
          if (ws[cellA]) ws[cellA].s = dataStyle;

          // Columnas B-J: números
          numberCols.forEach(col => {
            const cell = col + row;
            if (ws[cell] && typeof ws[cell].v === 'number') {
              ws[cell].s = numberStyle;
              ws[cell].z = '#,##0'; // formato visual
            } else if (ws[cell]) {
              ws[cell].s = dataStyle; // texto o vacío
            }
          });
        }

        // Fila de "Totales:"
        const totalLabelRow = datosMensuales.length + 3; // fila con "Totales:"
        ws['A' + totalLabelRow].s = totalLabelStyle;

        // Fila de valores de totales
        const totalValueRow = datosMensuales.length + 4;
        numberCols.forEach(col => {
          const cell = col + totalValueRow;
          if (ws[cell] && typeof ws[cell].v === 'number') {
            ws[cell].s = totalValueStyle;
            ws[cell].z = '#,##0';
          }
        });

        // === AJUSTAR ANCHO DE COLUMNAS ===
        ws['!cols'] = [
          { wch: 12 }, // Mes
          { wch: 14 }, // Ingreso Est
          { wch: 14 }, // Ingreso Real
          { wch: 16 }, // Desvío Ingresos
          { wch: 14 }, // Egreso Est
          { wch: 14 }, // Egreso Real
          { wch: 16 }, // Desvío Egresos
          { wch: 14 }, // Total Est
          { wch: 14 }, // Total Real
          { wch: 14 }, // Total Desvío
        ];

        // === ALTURA DE FILAS (opcional) ===
        ws['!rows'] = [];
        ws['!rows'][0] = { hpt: 20 }; // Encabezado más alto

        // Agregar hoja al libro
        utils.book_append_sheet(wb, ws, 'Detalle Presupuesto');

        // ✅ Exportar con estilos
        writeFile(wb, `Presupuesto_${nombre}_${id}.xlsx`, { cellStyles: true });
      });
    };

    // === EXPORTACIÓN A PDF ===
    const handleExportPdf = () => {
      import('html2pdf.js').then((html2pdf) => {
        const element = document.getElementById('presupuesto-detalle-content');
        const opt = {
          margin: 0.5,
          filename: `Presupuesto_${presupuesto.nombre}_${id}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true, // Permite imágenes de otros dominios
            scrollY: -window.scrollY, // Alinea el scroll
            width: element.offsetWidth,
            height: element.offsetHeight,
          },
          jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'landscape',
            putOnlyUsedFonts: true,
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }, // Evita saltos de página automáticos
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