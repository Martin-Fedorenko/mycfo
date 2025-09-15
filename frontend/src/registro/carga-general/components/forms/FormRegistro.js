import React, { useEffect } from "react";
import { Box, FormLabel, FormHelperText } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import CustomSingleAutoComplete from "../../../../shared-components/CustomSingleAutoComplete";
import CustomDatePicker from "../../../../shared-components/CustomDatePicker";
import CustomSelect from "../../../../shared-components/CustomSelect";

export default function FormRegistro({ tipoDoc, formData, setFormData, errors = {} }) {

  useEffect(() => {
    if (tipoDoc) {
      setFormData((p) => ({
        ...p,
        tipo: tipoDoc,
      }));
    }
  }, [tipoDoc, setFormData]);

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
            options={["Efectivo", "Transferencia", "Cheque"]}
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

      {/* 3️⃣ Categoría */}
      <Box>
        <FormLabel>Categoría</FormLabel>
        <CustomSingleAutoComplete
          options={["Alimentos", "Transporte", "Educación", "Ocio"]}
          value={formData.categoria || ""}
          onChange={(valor) => setFormData((p) => ({ ...p, categoria: valor }))}
        />
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
