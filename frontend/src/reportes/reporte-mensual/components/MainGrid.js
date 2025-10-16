import * as React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import TablaDetalle from './TablaDetalle';
import Filtros from './Filtros';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Función genérica para descargar CSV
const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919', '#19C9FF'];

export default function MainGrid() {
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [selectedCategoria, setSelectedCategoria] = React.useState([]);

    const [data, setData] = React.useState({ detalleIngresos: [], detalleEgresos: [] });

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

        let csv = `Resumen Mensual - ${mesNombre} ${selectedYear}\n`;
        csv += `Tipo,Categoría,Total\n`;

        if (detalleIngresos.length > 0) {
            const totalIngresos = detalleIngresos.reduce((sum, item) => sum + item.total, 0);
            csv += `Ingresos,,${totalIngresos.toFixed(2)}\n`;
            detalleIngresos.forEach(item => {
                csv += `,"${item.categoria}",${item.total.toFixed(2)}\n`;
            });
        }

        if (detalleEgresos.length > 0) {
            const totalEgresos = detalleEgresos.reduce((sum, item) => sum + item.total, 0);
            csv += `Egresos,,${totalEgresos.toFixed(2)}\n`;
            detalleEgresos.forEach(item => {
                csv += `,"${item.categoria}",${item.total.toFixed(2)}\n`;
            });
        }

        downloadCSV(csv, `reporte-mensual-${mesNombre}-${selectedYear}.csv`);
    };

    // Lógica de exportación a PDF eliminada

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
                <ExportadorSimple onExportExcel={handleExportExcel} onExportPdf={() => alert('Exportar a PDF no implementado.')} />
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
                </Grid>
                <Grid item xs={12} md={6}>
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
                </Grid>
            </Grid>
        </Box>
    );
}
