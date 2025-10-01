import React, { useEffect } from "react";
import { Box, FormLabel, FormHelperText } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import CustomSingleAutoComplete from "../../../../shared-components/CustomSingleAutoComplete";
import CustomDatePicker from "../../../../shared-components/CustomDatePicker";
import CustomSelect from "../../../../shared-components/CustomSelect";
import ConciliacionDialog from "../../../../shared-components/ConciliacionDialog";

export default function FormRegistro({ tipoDoc, formData, setFormData, errors = {} }) {

  useEffect(() => {
    if (tipoDoc === "Movimiento") {
      const tipo = formData.montoTotal >= 0 ? "Ingreso" : "Egreso";
      setFormData((p) => ({
        ...p,
        tipo: tipo,
      }));
    }
  }, [tipoDoc, setFormData, formData.montoTotal]);
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>

      {/* 1️⃣ Monto total + Moneda + Medio de pago */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Monto total *</FormLabel>
          <OutlinedInput
            type="number"
            value={formData.montoTotal || ""}
            onChange={(e) => setFormData((p) => ({ ...p, montoTotal: e.target.value }))}
            size="small"
            fullWidth
            error={!!errors.montoTotal}
          />
          {errors.montoTotal && <FormHelperText error>{errors.montoTotal}</FormHelperText>}
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Moneda *</FormLabel>
          <CustomSelect
            value={formData.moneda || ""}
            onChange={(valor) => setFormData((p) => ({ ...p, moneda: valor }))}
            options={["ARS", "USD", "EUR"]}
            width="100%"
            error={!!errors.moneda}
          />
          {errors.moneda && <FormHelperText error>{errors.moneda}</FormHelperText>}
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Medio de pago</FormLabel>
          <CustomSelect
            value={formData.medioPago || ""}
            onChange={(valor) => setFormData((p) => ({ ...p, medioPago: valor }))}
            options={["Efectivo", "Transferencia", "Cheque", "Tarjeta", "MercadoPago", "Otro"]}
            width="100%"
          />
        </Box>
      </Box>

      {/* 2️⃣ Origen + Destino + Fecha emisión */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Origen</FormLabel>
          <OutlinedInput
            value={formData.origen || ""}
            onChange={(e) => setFormData((p) => ({ ...p, origen: e.target.value }))}
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Destino</FormLabel>
          <OutlinedInput
            value={formData.destino || ""}
            onChange={(e) => setFormData((p) => ({ ...p, destino: e.target.value }))}
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Fecha emisión *</FormLabel>
          <CustomDatePicker
            value={formData.fechaEmision || null}
            onChange={(fecha) => setFormData((p) => ({ ...p, fechaEmision: fecha }))}
            error={!!errors.fechaEmision}
          />
          {errors.fechaEmision && <FormHelperText error>{errors.fechaEmision}</FormHelperText>}
        </Box>
      </Box>

      {/* 4️⃣ Categoría + Botón Conciliar */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Categoría *</FormLabel>
          <CustomSingleAutoComplete
            options={["Productos", "Servicios", "Mantenimiento", "Consultoría"]}
            value={formData.categoria || ""}
            onChange={(valor) => setFormData((p) => ({ ...p, categoria: valor }))}
            error={!!errors.categoria}
          />
          {errors.categoria && (
            <FormHelperText error>{errors.categoria}</FormHelperText>
          )}
        </Box>
        <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
          <ConciliacionDialog tipo="factura" width="100%" />
        </Box>
      </Box>


      {/* 4️⃣ Descripción */}
      <Box>
        <FormLabel>Descripción</FormLabel>
        <OutlinedInput
          multiline
          value={formData.descripcion || ""}
          onChange={(e) => setFormData((p) => ({ ...p, descripcion: e.target.value }))}
          size="small"
          fullWidth
        />
      </Box>
    </Box>
  );
}
