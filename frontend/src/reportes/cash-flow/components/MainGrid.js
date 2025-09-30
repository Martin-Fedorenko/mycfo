import * as React from 'react';
import { Box, Typography } from '@mui/material';
import Filtros from './Filtros';
import TablaDetalle from './TablaDetalle';
import Exportador from '../../reporte-mensual/components/Exportador';

export default function MainGrid() {
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
    const [registros, setRegistros] = React.useState([]);

    const handleYearChange = (e) => setSelectedYear(e.target.value);

    React.useEffect(() => {
        const baseUrl = process.env.REACT_APP_URL_REGISTRO; // 🔥 usamos el microservicio de registro directamente
        if (!baseUrl || !selectedYear) return;

        fetch(`${baseUrl}/registros`)
            .then(async (r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const json = await r.json();

                console.log("📦 Registros traídos del backend:", json);

                // Filtrar solo los del año seleccionado
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

    // Transformar registros para la tabla
    const ingresos = registros
        .filter(r => r.tipo === 'Ingreso')
        .map(r => ({
            id: r.id,
            categoria: r.categoria,
            monto: r.montoTotal,
            fecha: r.fechaEmision // ✅ ahora usamos el campo correcto
        }));

    const egresos = registros
        .filter(r => r.tipo === 'Egreso')
        .map(r => ({
            id: r.id,
            categoria: r.categoria,
            monto: r.montoTotal,
            fecha: r.fechaEmision // ✅ igual acá
        }));

    const saldoInicial = 2000; // ejemplo fijo, se puede calcular después

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' }, p: 3 }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                Cashflow anual
            </Typography>

            <Filtros
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
            />

            <TablaDetalle
                year={selectedYear}
                ingresos={ingresos}
                egresos={egresos}
                saldoInicial={saldoInicial}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Exportador />
            </Box>
        </Box>
    );
}
