import * as React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography
} from '@mui/material';

// Función de utilidad para formatear moneda
const formatCurrency = (value) => {
    if (typeof value !== 'number') return '-';
    return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function TablaDetalle({ year, ingresos, egresos }) {
    const totalIngresos = ingresos.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalEgresos = egresos.reduce((sum, item) => sum + (item.total || 0), 0);
    const resultado = totalIngresos - totalEgresos;

    const headerCellStyle = { fontWeight: 'bold', color: 'white' };

    return (
        <Paper sx={{ width: '100%', mt: 2 }}>
            <TableContainer>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Estado de Resultados ({year})</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* --- INGRESOS --- */}
                        <TableRow sx={{ backgroundColor: '#4caf50' }}>
                            <TableCell component="th" scope="row" sx={headerCellStyle}>
                                Ingresos
                            </TableCell>
                            <TableCell align="right" sx={headerCellStyle}>{formatCurrency(totalIngresos)}</TableCell>
                        </TableRow>
                        {ingresos.map((item) => (
                            <TableRow hover key={item.categoria}>
                                <TableCell sx={{ pl: 4 }}>{item.categoria}</TableCell>
                                <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                        ))}

                        {/* --- EGRESOS --- */}
                        <TableRow sx={{ backgroundColor: '#f44336' }}>
                            <TableCell component="th" scope="row" sx={headerCellStyle}>
                                Egresos
                            </TableCell>
                            <TableCell align="right" sx={headerCellStyle}>{formatCurrency(totalEgresos)}</TableCell>
                        </TableRow>
                        {egresos.map((item) => (
                            <TableRow hover key={item.categoria}>
                                <TableCell sx={{ pl: 4 }}>{item.categoria}</TableCell>
                                <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                            </TableRow>
                        ))}

                        {/* --- RESULTADO --- */}
                        <TableRow sx={{ backgroundColor: resultado >= 0 ? '#4caf50' : '#f44336' }}>
                            <TableCell component="th" scope="row" sx={headerCellStyle}>
                                Resultado del Ejercicio
                            </TableCell>
                            <TableCell align="right" sx={headerCellStyle}>{formatCurrency(resultado)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
