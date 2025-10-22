import React from "react";
import { Box, Typography, FormLabel, useTheme } from "@mui/material";

export default function VerIngreso({ movimiento }) {
  const theme = useTheme();
  
  if (!movimiento) return null;

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    try {
      if (Array.isArray(fecha)) {
        const [year, month, day] = fecha;
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      }
      const date = new Date(fecha);
      return date.toLocaleDateString("es-AR");
    } catch (e) {
      return "-";
    }
  };

  // Formatear monto
  const formatearMonto = (monto, moneda = "ARS") => {
    if (monto === null || monto === undefined) return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda === "USD" ? "USD" : moneda === "EUR" ? "EUR" : "ARS",
      minimumFractionDigits: 2
    }).format(Math.abs(monto));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      {/* 1️⃣ Monto total + Moneda + Medio de pago */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel sx={{ mb: 1, display: "block" }}>Monto total</FormLabel>
          <Typography variant="body1" sx={{ 
            p: 1, 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.primary
          }}>
            {formatearMonto(movimiento.montoTotal, movimiento.moneda)}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel sx={{ mb: 1, display: "block" }}>Moneda</FormLabel>
          <Typography variant="body1" sx={{ 
            p: 1, 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.primary
          }}>
            {movimiento.moneda || "-"}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel sx={{ mb: 1, display: "block" }}>Medio de pago</FormLabel>
          <Typography variant="body1" sx={{ 
            p: 1, 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.primary
          }}>
            {movimiento.medioPago || "-"}
          </Typography>
        </Box>
      </Box>

      {/* 2️⃣ Fecha emisión */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel sx={{ mb: 1, display: "block" }}>Fecha emisión</FormLabel>
          <Typography variant="body1" sx={{ 
            p: 1, 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.primary
          }}>
            {formatearFecha(movimiento.fechaEmision)}
          </Typography>
        </Box>
      </Box>

      {/* 3️⃣ Datos del cliente (origen) */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel sx={{ mb: 1, display: "block" }}>Nombre del cliente</FormLabel>
          <Typography variant="body1" sx={{ 
            p: 1, 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.primary
          }}>
            {movimiento.origenNombre || "-"}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel sx={{ mb: 1, display: "block" }}>CUIT del cliente</FormLabel>
          <Typography variant="body1" sx={{ 
            p: 1, 
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], 
            borderRadius: 1,
            border: `1px solid ${theme.palette.divider}`,
            minHeight: "32px",
            display: "flex",
            alignItems: "center",
            color: theme.palette.text.primary
          }}>
            {movimiento.origenCuit || "-"}
          </Typography>
        </Box>
      </Box>

      {/* 4️⃣ Categoría */}
      <Box>
        <FormLabel sx={{ mb: 1, display: "block" }}>Categoría</FormLabel>
        <Typography variant="body1" sx={{ 
          p: 1, 
          backgroundColor: "#f5f5f5", 
          borderRadius: 1,
          border: "1px solid #e0e0e0",
          minHeight: "32px",
          display: "flex",
          alignItems: "center"
        }}>
          {movimiento.categoria || "-"}
        </Typography>
      </Box>

      {/* 5️⃣ Descripción */}
      <Box>
        <FormLabel sx={{ mb: 1, display: "block" }}>Descripción</FormLabel>
        <Typography variant="body1" sx={{ 
          p: 1, 
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100], 
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          minHeight: "80px",
          display: "flex",
          alignItems: "flex-start",
          whiteSpace: "pre-wrap",
          color: theme.palette.text.primary
        }}>
          {movimiento.descripcion || "-"}
        </Typography>
      </Box>
    </Box>
  );
}
