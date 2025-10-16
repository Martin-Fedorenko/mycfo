import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Filtros from './Filtros';
import TablaDetalle from './TablaDetalle';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

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
    const [registros, setRegistros] = React.useState([]);

    const handleYearChange = (e) => setSelectedYear(e.target.value);

    React.useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REGISTRO;
        if (!baseUrl || !selectedYear) return;

        fetch(`${baseUrl}/registros`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const json = await r.json();

                const filtrados = json.filter(r =>
                    r.fechaEmision &&
                    new Date(r.fechaEmision).getFullYear() === selectedYear &&
                    (r.tipo === "Ingreso" || r.tipo === "Egreso") &&
                    ["Efectivo", "Transferencia", "MercadoPago"].includes(r.medioPago)
                );

                setRegistros(filtrados);
            })
            .catch((error) => {
                console.error('Error al obtener registros:', error);
                setRegistros([]);
            });
    }, [selectedYear]);

    const handleExportExcel = () => {
        const sortedRegistros = [...registros].sort((a, b) => new Date(a.fechaEmision) - new Date(b.fechaEmision));
        const saldoInicial = 2000;

        let csv = `Reporte de Flujo de Caja - ${selectedYear}\n`;
        csv += `Fecha,Categoría,Ingreso,Egreso,Saldo\n`;
        csv += `${new Date(sortedRegistros[0]?.fechaEmision).toLocaleDateString('es-AR')},Saldo Inicial,,,${saldoInicial.toFixed(2)}\n`;

        let saldoCorriente = saldoInicial;
        sortedRegistros.forEach(r => {
            const fecha = new Date(r.fechaEmision).toLocaleDateString('es-AR');
            const categoria = r.categoria;
            const ingreso = r.tipo === 'Ingreso' ? r.montoTotal : 0;
            const egreso = r.tipo === 'Egreso' ? r.montoTotal : 0;
            saldoCorriente += ingreso - egreso;
            csv += `${fecha},"${categoria}",${ingreso.toFixed(2)},${egreso.toFixed(2)},${saldoCorriente.toFixed(2)}\n`;
        });

        downloadCSV(csv, `cash-flow-${selectedYear}.csv`);
    };

    // Lógica de exportación a PDF eliminada

    // --- Lógica para el Gráfico y la Tabla ---
    const ingresosMensuales = Array(12).fill(0);
    const egresosMensuales = Array(12).fill(0);
    registros.forEach(r => {
        const mes = new Date(r.fechaEmision).getMonth();
        if (r.tipo === 'Ingreso') {
            ingresosMensuales[mes] += r.montoTotal;
        } else if (r.tipo === 'Egreso') {
            egresosMensuales[mes] += r.montoTotal;
        }
    });

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const dataGrafico = meses.map((mes, i) => ({ mes, Ingresos: ingresosMensuales[i], Egresos: egresosMensuales[i] }));

    const ingresosTabla = registros.filter(r => r.tipo === 'Ingreso').map(r => ({ id: r.id, categoria: r.categoria, monto: r.montoTotal, fecha: r.fechaEmision }));
    const egresosTabla = registros.filter(r => r.tipo === 'Egreso').map(r => ({ id: r.id, categoria: r.categoria, monto: r.montoTotal, fecha: r.fechaEmision }));
    const saldoInicial = 2000;

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6">
                    Cashflow anual
                </Typography>
                <ExportadorSimple onExportExcel={handleExportExcel} onExportPdf={() => alert('Exportar a PDF no implementado.')} />
            </Box>

            <Filtros selectedYear={selectedYear} onYearChange={handleYearChange} />

            <TablaDetalle
                year={selectedYear}
                ingresos={ingresosTabla}
                egresos={egresosTabla}
                saldoInicial={saldoInicial}
            />

            <Paper sx={{ mt: 4, p: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Comparativo mensual de Flujo de Caja</Typography>
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

        </Box>
    );
}
