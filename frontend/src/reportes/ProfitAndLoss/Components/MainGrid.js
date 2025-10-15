import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Filtros from './Filtros';
import TablaDetalle from './TablaDetalle';
import Exportador from '../../reporte-mensual/components/Exportador';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function MainGrid() {
    const [selectedYear, setSelectedYear] = React.useState('');
    const [data, setData] = React.useState({
        ingresosMensuales: Array(12).fill(0),
        egresosMensuales: Array(12).fill(0),
        documentos: [],
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
                console.log("📊 Datos P&L recibidos:", json);
                setData({
                    ingresosMensuales: json.ingresosMensuales ?? Array(12).fill(0),
                    egresosMensuales: json.egresosMensuales ?? Array(12).fill(0),
                    documentos: json.documentos ?? [],
                });
            })
            .catch((error) => {
                console.error('Error al obtener los datos del backend P&L:', error);
                setData({
                    ingresosMensuales: Array(12).fill(0),
                    egresosMensuales: Array(12).fill(0),
                    documentos: [],
                });
            });
    }, [selectedYear]);

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    // Datos para el gráfico (siempre renderiza)
    const dataGrafico = meses.map((mes, i) => ({
        mes,
        Ingresos: data.ingresosMensuales[i],
        Egresos: data.egresosMensuales[i],
    }));

    // Filtrar documentos por tipo
    const ingresos = data.documentos.filter(d => d.tipoDocumento?.toLowerCase().includes("venta"));
    const egresos = data.documentos.filter(d => d.tipoDocumento?.toLowerCase().includes("compra"));

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Profit & Loss (Estado de Resultados)
            </Typography>

            {/* 🔹 Filtros */}
            <Filtros selectedYear={selectedYear} onYearChange={handleYearChange} />

            {/* 🔹 Tabla vacía o con datos */}
            <TablaDetalle year={selectedYear || new Date().getFullYear()} ingresos={ingresos} egresos={egresos} />

            {/* 🔹 Gráfico comparativo (aunque esté vacío) */}
            <Paper sx={{ mt: 4, p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Comparativo mensual de Ingresos vs Egresos
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dataGrafico}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Ingresos" fill="#2e7d32" />
                        <Bar dataKey="Egresos" fill="#c62828" />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            {/* 🔹 Exportar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Exportador />
            </Box>
        </Box>
    );
}
