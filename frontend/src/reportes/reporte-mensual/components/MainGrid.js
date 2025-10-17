import * as React from 'react';
import {
    Box, Typography, Grid, Paper
} from '@mui/material';
import TablaDetalle from './TablaDetalle';
import Filtros from './Filtros';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { exportToExcel } from '../../../utils/exportExcelUtils'; // Importando la utilidad de Excel

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#19C9FF'];

export default function MainGrid() {
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [selectedCategoria, setSelectedCategoria] = React.useState([]);
    const [data, setData] = React.useState({ detalleIngresos: [], detalleEgresos: [] });
    const chartRefIngresos = React.useRef(null);
    const chartRefEgresos = React.useRef(null);

    React.useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REPORTE;
        if (!baseUrl || !(selectedYear && selectedMonth !== '')) return;

        const params = new URLSearchParams();
        params.set('anio', selectedYear);
        params.set('mes', Number(selectedMonth) + 1);

        if (Array.isArray(selectedCategoria) && selectedCategoria.length > 0) {
            selectedCategoria.forEach((c) => params.append('categoria', c));
        }

        fetch(`${baseUrl}/resumen?${params.toString()}`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const json = await r.json();
                setData({ detalleIngresos: json?.detalleIngresos ?? [], detalleEgresos: json?.detalleEgresos ?? [] });
            })
            .catch((error) => {
                console.error('Error al obtener los datos del backend:', error);
                setData({ detalleIngresos: [], detalleEgresos: [] });
            });
    }, [selectedYear, selectedMonth, selectedCategoria]);

    const getNombreMes = (mesIndex) => {
        if (mesIndex === '' || mesIndex === null) return '';
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return meses[mesIndex];
    };

    const handleExportExcel = () => {
        const { detalleIngresos, detalleEgresos } = data;
        const mesNombre = getNombreMes(selectedMonth);

        const excelData = [
            ["Resumen Mensual", `${mesNombre} ${selectedYear}`],
            [], // Fila vacía
        ];

        if (detalleIngresos.length > 0) {
            const totalIngresos = detalleIngresos.reduce((sum, item) => sum + item.total, 0);
            excelData.push(["Ingresos", "", {v: totalIngresos, t: 'n'}]);
            detalleIngresos.forEach(item => {
                excelData.push(["", item.categoria, {v: item.total, t: 'n'}]);
            });
        }

        if (detalleEgresos.length > 0) {
            excelData.push([]); // Fila vacía
            const totalEgresos = detalleEgresos.reduce((sum, item) => sum + item.total, 0);
            excelData.push(["Egresos", "", {v: totalEgresos, t: 'n'}]);
            detalleEgresos.forEach(item => {
                excelData.push(["", item.categoria, {v: item.total, t: 'n'}]);
            });
        }

        const colsConfig = [{ wch: 25 }, { wch: 25 }, { wch: 15 }]; // Ancho para las columnas A, B, C
        const mergesConfig = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Título principal
            { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Encabezado Ingresos
            { s: { r: 2 + detalleIngresos.length + 1, c: 0 }, e: { r: 2 + detalleIngresos.length + 1, c: 1 } }, // Encabezado Egresos
        ];
        const currencyColumns = ['C']; // Columna C para formato de moneda

        exportToExcel(excelData, `reporte-mensual-${mesNombre}-${selectedYear}`, "Resumen Mensual", colsConfig, mergesConfig, currencyColumns);
    };

    const handleExportPdf = async () => {
        const doc = new jsPDF();
        const mesNombre = getNombreMes(selectedMonth);
        doc.text(`Resumen Mensual - ${mesNombre} ${selectedYear}`, 14, 22);

        try {
            const canvasIngresos = await html2canvas(chartRefIngresos.current);
            const canvasEgresos = await html2canvas(chartRefEgresos.current);
            const imgDataIngresos = canvasIngresos.toDataURL('image/png');
            const imgDataEgresos = canvasEgresos.toDataURL('image/png');

            const pdfWidth = doc.internal.pageSize.getWidth();
            const chartWidth = (pdfWidth / 2) - 20;

            doc.addImage(imgDataIngresos, 'PNG', 14, 30, chartWidth, chartWidth * 0.75);
            doc.addImage(imgDataEgresos, 'PNG', pdfWidth / 2, 30, chartWidth, chartWidth * 0.75);

            const { detalleIngresos, detalleEgresos } = data;
            const head = [["Tipo", "Categoría", "Total"]];
            const body = [];

            if (detalleIngresos.length > 0) {
                const totalIngresos = detalleIngresos.reduce((sum, item) => sum + item.total, 0);
                body.push(["Ingresos", "", totalIngresos.toFixed(2)]);
                detalleIngresos.forEach(item => {
                    body.push(["", item.categoria, item.total.toFixed(2)]);
                });
            }
            if (detalleEgresos.length > 0) {
                const totalEgresos = detalleEgresos.reduce((sum, item) => sum + item.total, 0);
                body.push(["Egresos", "", totalEgresos.toFixed(2)]);
                detalleEgresos.forEach(item => {
                    body.push(["", item.categoria, item.total.toFixed(2)]);
                });
            }

            autoTable(doc, { head, body, startY: 30 + chartWidth * 0.75 + 10 });
            doc.save(`reporte-mensual-${mesNombre}-${selectedYear}.pdf`);

        } catch (error) {
            console.error("Error al generar el PDF:", error);
            alert("No se pudo generar el PDF. Intente nuevamente.");
        }
    };
    
    const handleMonthChange = (e) => setSelectedMonth(e.target.value);
    const handleYearChange = (e) => setSelectedYear(e.target.value);
    const handleCategoriaChange = (e) => {
        const v = e.target.value;
        const arr = Array.isArray(v) ? v : (typeof v === 'string' ? (v ? v.split(',') : []) : []);
        setSelectedCategoria(arr);
    };

    const dataIngresosPie = data.detalleIngresos.map(item => ({ name: item.categoria, value: item.total }));
    const dataEgresosPie = data.detalleEgresos.map(item => ({ name: item.categoria, value: item.total }));

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6">
                    Resumen mensual de ingresos y egresos
                </Typography>
                <ExportadorSimple onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
            </Box>

            <Filtros
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
                selectedCategoria={selectedCategoria}
                onCategoriaChange={handleCategoriaChange}
            />

            <Typography component="h3" variant="h6" sx={{ mb: 2, mt: 2 }}>
                {getNombreMes(selectedMonth) && selectedYear ? `Resumen - ${getNombreMes(selectedMonth)} ${selectedYear}` : 'Resumen mensual'}
            </Typography>

            <TablaDetalle
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                ingresos={data.detalleIngresos}
                egresos={data.detalleEgresos}
            />

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <div ref={chartRefIngresos}>
                        <Paper sx={{ p: 2, height: 350 }}>
                            <Typography variant="subtitle1">Desglose de Ingresos</Typography>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={dataIngresosPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                        {dataIngresosPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </div>
                </Grid>
                <Grid item xs={12} md={6}>
                    <div ref={chartRefEgresos}>
                        <Paper sx={{ p: 2, height: 350 }}>
                            <Typography variant="subtitle1">Desglose de Egresos</Typography>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={dataEgresosPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#82ca9d">
                                        {dataEgresosPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </div>
                </Grid>
            </Grid>
        </Box>
    );
}
