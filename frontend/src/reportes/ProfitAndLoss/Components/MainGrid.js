import * as React from 'react';
import {
    Box, Typography, Paper, Container, CssBaseline
} from '@mui/material';
import Filtros from './Filtros';
import TablaDetalle from './TablaDetalle';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

export default function MainGrid() {
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [data, setData] = React.useState({
        ingresosMensuales: Array(12).fill(0),
        egresosMensuales: Array(12).fill(0),
        detalleIngresos: [],
        detalleEgresos: [],
    });

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

        let csv = `Estado de Resultados (${selectedYear})\n`;
        csv += `Tipo,Categoría,Total\n`;
        csv += `Ingresos,,${totalIngresos.toFixed(2)}\n`;
        detalleIngresos.forEach(item => {
            csv += `,"${item.categoria}",${item.total.toFixed(2)}\n`;
        });
        csv += `Egresos,,${totalEgresos.toFixed(2)}\n`;
        detalleEgresos.forEach(item => {
            csv += `,"${item.categoria}",${item.total.toFixed(2)}\n`;
        });
        csv += `Resultado del Ejercicio,,${resultado.toFixed(2)}\n`;

        downloadCSV(csv, `profit-and-loss-${selectedYear}.csv`);
    };

    // Lógica de exportación a PDF eliminada

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
                    <ExportadorSimple onExportExcel={handleExportExcel} onExportPdf={() => alert('Exportar a PDF no implementado.')} />
                </Box>

                <Filtros selectedYear={selectedYear} onYearChange={handleYearChange} />
                <TablaDetalle year={selectedYear} ingresos={data.detalleIngresos} egresos={data.detalleEgresos} />

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

            </Container>
        </React.Fragment>
    );
}
