import React from 'react';
import {
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Typography, Box
} from '@mui/material';

/**
 * TablaDetalle - Muestra el estado de resultados (Profit & Loss)
 * Cumple el principio de devengado → agrupa ingresos y egresos según la fecha de emisión de la factura.
 *
 * Props:
 *  - year: año seleccionado
 *  - ingresos: array de documentos con tipo "FacturaVenta" (o similar)
 *  - egresos: array de documentos con tipo "FacturaCompra" (o similar)
 */
const TablaDetalle = ({ year, ingresos, egresos }) => {
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    // Si el año actual es el mismo que el seleccionado, mostrar hasta el mes actual
    const ahora = new Date();
    const ultimoMes = (year === ahora.getFullYear()) ? ahora.getMonth() : 11;
    const mesesVisibles = meses.slice(0, ultimoMes + 1);

    /**
     * Agrupa los documentos por categoría y mes
     * Retorna un array de objetos con { categoria, valoresMensuales[], total }
     */
    const agruparPorCategoria = (data) => {
        const map = {};
        data.forEach((doc) => {
            const mes = new Date(doc.fechaEmision).getMonth();
            const categoria = doc.categoria || "Sin categoría";
            if (!map[categoria]) {
                map[categoria] = Array(12).fill(0);
            }
            map[categoria][mes] += doc.montoTotal || 0;
        });

        return Object.entries(map)
            .map(([categoria, valores]) => ({
                categoria,
                valores,
                total: valores.reduce((a, b) => a + b, 0)
            }))
            .sort((a, b) => b.total - a.total);
    };

    // Agrupar ingresos y egresos
    const ingresosPorCategoria = agruparPorCategoria(ingresos);
    const egresosPorCategoria = agruparPorCategoria(egresos);

    // Totales mensuales
    const totalIngresos = Array(12).fill(0);
    const totalEgresos = Array(12).fill(0);

    ingresos.forEach((doc) => {
        const mes = new Date(doc.fechaEmision).getMonth();
        totalIngresos[mes] += doc.montoTotal || 0;
    });

    egresos.forEach((doc) => {
        const mes = new Date(doc.fechaEmision).getMonth();
        totalEgresos[mes] += doc.montoTotal || 0;
    });

    const resultadoNeto = totalIngresos.map((v, i) => v - totalEgresos[i]);
    const resultadoAnual = resultadoNeto.reduce((a, b) => a + b, 0);

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Estado de Resultados (P&L) {year}
            </Typography>

            <TableContainer component={Paper}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>Concepto</b></TableCell>
                            {mesesVisibles.map((m) => (
                                <TableCell key={m} align="right"><b>{m}</b></TableCell>
                            ))}
                            <TableCell align="right"><b>Total</b></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {/* INGRESOS */}
                        <TableRow>
                            <TableCell colSpan={mesesVisibles.length + 2}>
                                <b>Ingresos</b>
                            </TableCell>
                        </TableRow>
                        {ingresosPorCategoria.map(({ categoria, valores, total }) => (
                            <TableRow key={categoria}>
                                <TableCell sx={{ pl: 4 }}>{categoria}</TableCell>
                                {mesesVisibles.map((_, i) => (
                                    <TableCell key={i} align="right" sx={{ color: 'green' }}>
                                        {valores[i] ? `$${valores[i].toLocaleString()}` : '-'}
                                    </TableCell>
                                ))}
                                <TableCell align="right" sx={{ color: 'green' }}>
                                    {total ? `$${total.toLocaleString()}` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* EGRESOS */}
                        <TableRow>
                            <TableCell colSpan={mesesVisibles.length + 2}>
                                <b>Egresos</b>
                            </TableCell>
                        </TableRow>
                        {egresosPorCategoria.map(({ categoria, valores, total }) => (
                            <TableRow key={categoria}>
                                <TableCell sx={{ pl: 4 }}>{categoria}</TableCell>
                                {mesesVisibles.map((_, i) => (
                                    <TableCell key={i} align="right" sx={{ color: 'red' }}>
                                        {valores[i] ? `-$${valores[i].toLocaleString()}` : '-'}
                                    </TableCell>
                                ))}
                                <TableCell align="right" sx={{ color: 'red' }}>
                                    {total ? `-$${total.toLocaleString()}` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* TOTALES */}
                        <TableRow>
                            <TableCell><b>Total Ingresos</b></TableCell>
                            {mesesVisibles.map((_, i) => (
                                <TableCell key={i} align="right" sx={{ color: 'green' }}>
                                    {totalIngresos[i] ? `$${totalIngresos[i].toLocaleString()}` : '-'}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ color: 'green' }}>
                                ${totalIngresos.reduce((a, b) => a + b, 0).toLocaleString()}
                            </TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell><b>Total Egresos</b></TableCell>
                            {mesesVisibles.map((_, i) => (
                                <TableCell key={i} align="right" sx={{ color: 'red' }}>
                                    {totalEgresos[i] ? `-$${totalEgresos[i].toLocaleString()}` : '-'}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ color: 'red' }}>
                                -${totalEgresos.reduce((a, b) => a + b, 0).toLocaleString()}
                            </TableCell>
                        </TableRow>

                        {/* RESULTADO NETO */}
                        <TableRow>
                            <TableCell><b>Resultado Neto</b></TableCell>
                            {mesesVisibles.map((_, i) => (
                                <TableCell key={i} align="right" sx={{ color: resultadoNeto[i] >= 0 ? 'green' : 'red' }}>
                                    {resultadoNeto[i] >= 0
                                        ? `$${resultadoNeto[i].toLocaleString()}`
                                        : `-$${Math.abs(resultadoNeto[i]).toLocaleString()}`}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ color: resultadoAnual >= 0 ? 'green' : 'red' }}>
                                {resultadoAnual >= 0
                                    ? `$${resultadoAnual.toLocaleString()}`
                                    : `-$${Math.abs(resultadoAnual).toLocaleString()}`}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TablaDetalle;
