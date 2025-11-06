import * as React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Filtros from './Filtros';
import TablaDetalle from './TablaDetalle';
import ExportadorSimple from '../../../shared-components/ExportadorSimple';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { exportToExcel } from '../../../utils/exportExcelUtils'; // Importando la utilidad de Excel
import API_CONFIG from '../../../config/api-config';

export default function MainGrid() {
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [registros, setRegistros] = React.useState([]);
    const chartRef = React.useRef(null);

    const handleYearChange = (e) => setSelectedYear(e.target.value);

    React.useEffect(() => {
        const baseUrl = API_CONFIG.REPORTE;
        if (!baseUrl || !selectedYear) return;

        const headers = {};
        const sub = sessionStorage.getItem('sub');
        const token = sessionStorage.getItem('accessToken');
        if (sub) headers['X-Usuario-Sub'] = sub;
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch(`${baseUrl}/cashflow?anio=${selectedYear}`, { headers })
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const json = await r.json();
                // El backend ya filtra por año, tipos y medios válidos
                setRegistros(Array.isArray(json) ? json : []);
            })
            .catch((error) => {
                console.error('Error al obtener cashflow:', error);
                setRegistros([]);
            });
    }, [selectedYear]);

    // --- Lógica para el Gráfico y la Tabla (recalculada para exportación) ---
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const ahora = new Date();
    const ultimoMes = (selectedYear === ahora.getFullYear()) ? ahora.getMonth() : 11;
    const mesesVisibles = meses.slice(0, ultimoMes + 1);

    const agruparYOrdenar = (dataArr) => {
        const map = {};
        dataArr.forEach((tx) => {
            const mes = new Date(tx.fechaEmision).getMonth();
            if (!map[tx.categoria]) {
                map[tx.categoria] = Array(12).fill(0);
            }
            map[tx.categoria][mes] += tx.montoTotal;
        });
        return Object.entries(map)
            .map(([categoria, valores]) => ({
                categoria,
                valores,
                total: valores.reduce((a, b) => a + b, 0),
            }))
            .sort((a, b) => b.total - a.total);
    };

    const ingresosFiltrados = registros.filter(r => r.tipo === 'Ingreso');
    const egresosFiltrados = registros.filter(r => r.tipo === 'Egreso');

    const ingresosPorCategoria = agruparYOrdenar(ingresosFiltrados);
    const egresosPorCategoria = agruparYOrdenar(egresosFiltrados);

    const totalIngresosMensual = Array(12).fill(0);
    const totalEgresosMensual = Array(12).fill(0);
    ingresosFiltrados.forEach((tx) => totalIngresosMensual[new Date(tx.fechaEmision).getMonth()] += tx.montoTotal);
    egresosFiltrados.forEach((tx) => totalEgresosMensual[new Date(tx.fechaEmision).getMonth()] += tx.montoTotal);

    const netosMensual = totalIngresosMensual.map((v, i) => v - totalEgresosMensual[i]);
    const saldoInicial = 2000; // Mismo valor que en la tabla
    const saldoFinalMensual = [];
    saldoFinalMensual[0] = saldoInicial + netosMensual[0];
    for (let i = 1; i < 12; i++) saldoFinalMensual[i] = saldoFinalMensual[i - 1] + netosMensual[i];

    const handleExportExcel = () => {
        const excelData = [];
        const numMesesVisibles = mesesVisibles.length;

        // Título
        excelData.push([`Cashflow ${selectedYear}`]);
        excelData.push([]); // Fila vacía

        // Encabezados de la tabla
        const headerRow = ["Concepto", ...mesesVisibles];
        excelData.push(headerRow);

        // Saldo Inicial
        const saldoInicialRow = ["Cash on hand (Inicio)", ...Array(numMesesVisibles - 1).fill(""), saldoInicial];
        excelData.push(saldoInicialRow);

        // Ingresos
        excelData.push(["Ingresos", ...Array(numMesesVisibles).fill("")]);
        ingresosPorCategoria.forEach(({ categoria, valores }) => {
            const row = ["", categoria, ...mesesVisibles.map((_, i) => valores[i] || "")];
            excelData.push(row);
        });

        // Egresos
        excelData.push(["Egresos", ...Array(numMesesVisibles).fill("")]);
        egresosPorCategoria.forEach(({ categoria, valores }) => {
            const row = ["", categoria, ...mesesVisibles.map((_, i) => valores[i] || "")];
            excelData.push(row);
        });

        // Totales
        excelData.push(["Total Ingresos", ...mesesVisibles.map((_, i) => totalIngresosMensual[i] || "")]);
        excelData.push(["Total Egresos", ...mesesVisibles.map((_, i) => totalEgresosMensual[i] || "")]);
        excelData.push(["Net Cash Flow", ...mesesVisibles.map((_, i) => netosMensual[i] || "")]);
        excelData.push(["Cash on hand (Fin)", ...mesesVisibles.map((_, i) => saldoFinalMensual[i] || "")]);

        // Configuración de columnas y merges
        const colsConfig = [
            { wch: 20 }, // Concepto
            { wch: 20 }, // Categoría (si aplica)
            ...Array(numMesesVisibles).fill({ wch: 12, z: '$ #,##0.00' }) // Meses
        ];

        const mergesConfig = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: numMesesVisibles + 1 } }, // Título principal
            { s: { r: 3, c: 0 }, e: { r: 3, c: numMesesVisibles + 1 } }, // Ingresos
            { s: { r: 3 + ingresosPorCategoria.length + 1, c: 0 }, e: { r: 3 + ingresosPorCategoria.length + 1, c: numMesesVisibles + 1 } }, // Egresos
        ];

        // Columnas de moneda (desde la columna C en adelante)
        const currencyColumns = mesesVisibles.map((_, i) => String.fromCharCode(67 + i)); // C, D, E...

        exportToExcel(excelData, `cash-flow-${selectedYear}`, "Cash Flow", colsConfig, mergesConfig, currencyColumns);
    };

    const handleExportPdf = () => {
        // ... (lógica de PDF sin cambios)
    };

    const dataGrafico = meses.map((mes, i) => ({ mes, Ingresos: totalIngresosMensual[i], Egresos: totalEgresosMensual[i] }));

    const ingresosTabla = registros.filter(r => r.tipo === 'Ingreso').map(r => ({ id: r.id, categoria: r.categoria, monto: r.montoTotal, fecha: r.fechaEmision }));
    const egresosTabla = registros.filter(r => r.tipo === 'Egreso').map(r => ({ id: r.id, categoria: r.categoria, monto: r.montoTotal, fecha: r.fechaEmision }));

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6">
                    Cashflow anual
                </Typography>
                <ExportadorSimple onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
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
