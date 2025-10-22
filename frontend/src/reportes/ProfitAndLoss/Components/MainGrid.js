import * as React from 'react';
import {
    Box, Typography, Paper, Container, CssBaseline
} from '@mui/material';
import Filtros from './Filtros';
import TablaDetalle from './TablaDetalle';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { exportToExcel } from '../../../utils/exportExcelUtils'; // Importando la utilidad de Excel

export default function MainGrid() {
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [data, setData] = React.useState({
        ingresosMensuales: Array(12).fill(0),
        egresosMensuales: Array(12).fill(0),
        detalleIngresos: [],
        detalleEgresos: [],
    });
    const chartRef = React.useRef(null);

    const handleYearChange = (e) => setSelectedYear(e.target.value);

    React.useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REPORTE;
        if (!baseUrl || !selectedYear) return;

        const params = new URLSearchParams();
        params.set('anio', selectedYear);

        fetch(`${baseUrl}/pyl?${params.toString()}`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const json = await r.json();
                setData({
                    ingresosMensuales: json.ingresosMensuales ?? Array(12).fill(0),
                    egresosMensuales: json.egresosMensuales ?? Array(12).fill(0),
                    detalleIngresos: json.detalleIngresos ?? [],
                    detalleEgresos: json.detalleEgresos ?? [],
                });
            })
            .catch((error) => {
                console.error('Error al obtener los datos del backend P&L:', error);
                setData({ ingresosMensuales: Array(12).fill(0), egresosMensuales: Array(12).fill(0), detalleIngresos: [], detalleEgresos: [] });
            });
    }, [selectedYear]);

    const handleExportExcel = () => {
        const { detalleIngresos, detalleEgresos } = data;
        const totalIngresos = detalleIngresos.reduce((sum, item) => sum + item.total, 0);
        const totalEgresos = detalleEgresos.reduce((sum, item) => sum + item.total, 0);
        const resultado = totalIngresos - totalEgresos;

        const excelData = [
            ["Estado de Resultados", `(${selectedYear})`],
            [], // Fila vacía
            ["Ingresos", "", {v: totalIngresos, t: 'n'}],
            ...detalleIngresos.map(item => ["", item.categoria, {v: item.total, t: 'n'}]),
            [], // Fila vacía
            ["Egresos", "", {v: totalEgresos, t: 'n'}],
            ...detalleEgresos.map(item => ["", item.categoria, {v: item.total, t: 'n'}]),
            [], // Fila vacía
            ["Resultado del Ejercicio", "", {v: resultado, t: 'n'}]
        ];

        const colsConfig = [{ wch: 25 }, { wch: 25 }, { wch: 15 }]; // Ancho para las columnas A, B, C
        const mergesConfig = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Título principal
            { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Encabezado Ingresos
            { s: { r: 2 + detalleIngresos.length + 1, c: 0 }, e: { r: 2 + detalleIngresos.length + 1, c: 1 } }, // Encabezado Egresos
            { s: { r: 2 + detalleIngresos.length + 1 + detalleEgresos.length + 2, c: 0 }, e: { r: 2 + detalleIngresos.length + 1 + detalleEgresos.length + 2, c: 1 } }, // Encabezado Resultado
        ];
        const currencyColumns = ['C']; // Columna C para formato de moneda

        exportToExcel(excelData, `profit-and-loss-${selectedYear}`, "Profit & Loss", colsConfig, mergesConfig, currencyColumns);
    };

    const handleExportPdf = () => {
        const chartElement = chartRef.current;
        if (!chartElement) {
            alert("No se pudo encontrar el gráfico para exportar.");
            return;
        }

        html2canvas(chartElement).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const doc = new jsPDF();

            doc.text(`Estado de Resultados (${selectedYear})`, 14, 22);

            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            doc.addImage(imgData, 'PNG', 14, 30, pdfWidth - 28, pdfHeight);

            const { detalleIngresos, detalleEgresos } = data;
            const totalIngresos = detalleIngresos.reduce((sum, item) => sum + item.total, 0);
            const totalEgresos = detalleEgresos.reduce((sum, item) => sum + item.total, 0);
            const resultado = totalIngresos - totalEgresos;

            const head = [["Tipo", "Categoría", "Total"]];
            const body = [];

            body.push(["Ingresos", "", totalIngresos.toFixed(2)]);
            detalleIngresos.forEach(item => {
                body.push(["", item.categoria, item.total.toFixed(2)]);
            });

            body.push(["Egresos", "", totalEgresos.toFixed(2)]);
            detalleEgresos.forEach(item => {
                body.push(["", item.categoria, item.total.toFixed(2)]);
            });

            body.push(["Resultado del Ejercicio", "", resultado.toFixed(2)]);

            doc.autoTable({ head: head, body: body, startY: pdfHeight + 40 });
            doc.save(`profit-and-loss-${selectedYear}.pdf`);
        });
    };

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const dataGrafico = meses.map((mes, i) => ({ mes, Ingresos: data.ingresosMensuales[i], Egresos: data.egresosMensuales[i] }));

    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography component="h2" variant="h6">
                        Profit & Loss (Estado de Resultados)
                    </Typography>
                    <ExportadorSimple onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
                </Box>

                <Filtros selectedYear={selectedYear} onYearChange={handleYearChange} />
                <TablaDetalle year={selectedYear} ingresos={data.detalleIngresos} egresos={data.detalleEgresos} />

                <div ref={chartRef}>
                    <Paper sx={{ mt: 4, p: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Comparativo mensual de Ingresos vs Egresos</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dataGrafico}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Ingresos" fill="#4caf50" />
                                <Bar dataKey="Egresos" fill="#f44336" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </div>

            </Container>
        </React.Fragment>
    );
}
