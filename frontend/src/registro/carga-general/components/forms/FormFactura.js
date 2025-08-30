import React, { useState } from "react";
import { Grid, FormLabel, FormControlLabel, Checkbox } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import CustomSingleAutoComplete from "../../../../shared-components/CustomSingleAutoComplete";
import CustomDatePicker from "../../../../shared-components/CustomDatePicker";
import CustomSelect from "../../../../shared-components/CustomSelect";

export const FormGrid = ({ children, size = { xs: 12 } }) => (
  <Grid item {...size} sx={{ display: "flex", flexDirection: "column" }}>
    {children}
  </Grid>
);

export default function FormFactura({ formData, setFormData }) {
  const [showExtras, setShowExtras] = useState(false);

  return (
    <Grid container spacing={2}>
      {/* --- OBLIGATORIOS --- */}
      <FormGrid>
        <FormLabel>Número Documento</FormLabel>
        <OutlinedInput
          value={formData.numeroDocumento || ""}
          onChange={(e) => setFormData((p) => ({ ...p, numeroDocumento: e.target.value }))}
          size="small"
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Fecha Emisión</FormLabel>
        <CustomDatePicker
          value={formData.fechaEmision || null}
          onChange={(fecha) => setFormData((p) => ({ ...p, fechaEmision: fecha }))}
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Monto Total</FormLabel>
        <OutlinedInput
          type="number"
          value={formData.montoTotal || ""}
          onChange={(e) => setFormData((p) => ({ ...p, montoTotal: e.target.value }))}
          size="small"
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Moneda</FormLabel>
        <CustomSelect
          onChange={(valor) => setFormData((p) => ({ ...p, moneda: valor }))}
          options={["ARS", "USD", "EUR"]}
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Tipo Factura</FormLabel>
        <CustomSelect
          onChange={(valor) => setFormData((p) => ({ ...p, tipoFactura: valor }))}
          options={["A", "B", "C"]}
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Vendedor Nombre</FormLabel>
        <OutlinedInput
          value={formData.vendedorNombre || ""}
          onChange={(e) => setFormData((p) => ({ ...p, vendedorNombre: e.target.value }))}
          size="small"
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Comprador Nombre</FormLabel>
        <OutlinedInput
          value={formData.compradorNombre || ""}
          onChange={(e) => setFormData((p) => ({ ...p, compradorNombre: e.target.value }))}
          size="small"
        />
      </FormGrid>

      {/* --- TOGGLE --- */}
      <Grid item xs={12}>
        <FormControlLabel
          control={<Checkbox checked={showExtras} onChange={() => setShowExtras(!showExtras)} />}
          label="Mostrar campos adicionales"
        />
      </Grid>

      {/* --- OPCIONALES --- */}
      {showExtras && (
        <>
          <FormGrid>
            <FormLabel>Vendedor CUIT</FormLabel>
            <OutlinedInput
              value={formData.vendedorCuit || ""}
              onChange={(e) => setFormData((p) => ({ ...p, vendedorCuit: e.target.value }))}
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Subtotal Gravado</FormLabel>
            <OutlinedInput
              type="number"
              value={formData.subtotalGravado || ""}
              onChange={(e) => setFormData((p) => ({ ...p, subtotalGravado: e.target.value }))}
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>CAE</FormLabel>
            <OutlinedInput
              value={formData.cae || ""}
              onChange={(e) => setFormData((p) => ({ ...p, cae: e.target.value }))}
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Vencimiento CAE</FormLabel>
            <CustomDatePicker
              value={formData.vencimientoCae || null}
              onChange={(fecha) => setFormData((p) => ({ ...p, vencimientoCae: fecha }))}
            />
          </FormGrid>
        </>
      )}
    </Grid>
  );
}
