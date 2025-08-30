import React, { useState, useEffect } from "react";
import { Grid, FormLabel, FormControlLabel, Checkbox } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import CustomSingleAutoComplete from "../../../../shared-components/CustomSingleAutoComplete";
import CustomDatePicker from "../../../../shared-components/CustomDatePicker";

const FormGrid = ({ children, size = { xs: 12 } }) => (
  <Grid item {...size} sx={{ display: "flex", flexDirection: "column" }}>
    {children}
  </Grid>
);

export default function FormRegistro({ tipoDoc, formData, setFormData }) {
  const [showExtras, setShowExtras] = useState(false);

  // Cuando entra el componente, setea el tipo automáticamente
  useEffect(() => {
    if (tipoDoc) {
      setFormData((p) => ({
        ...p,
        tipo: tipoDoc.toUpperCase(), // "INGRESO" o "EGRESO"
      }));
    }
  }, [tipoDoc, setFormData]);

  return (
    <Grid container spacing={2}>
      {/* --- OBLIGATORIOS --- */}
      <FormGrid>
        <FormLabel>Monto Total</FormLabel>
        <OutlinedInput
          type="number"
          value={formData.montoTotal || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, montoTotal: e.target.value }))
          }
          size="small"
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Fecha Emisión</FormLabel>
        <CustomDatePicker
          value={formData.fechaEmision || null}
          onChange={(fecha) =>
            setFormData((p) => ({ ...p, fechaEmision: fecha }))
          }
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Moneda</FormLabel>
        <CustomSingleAutoComplete
          options={["ARS", "USD", "EUR"]}
          onChange={(valor) =>
            setFormData((p) => ({ ...p, moneda: valor }))
          }
        />
      </FormGrid>

      {/* --- TOGGLE --- */}
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showExtras}
              onChange={() => setShowExtras(!showExtras)}
            />
          }
          label="Mostrar campos adicionales"
        />
      </Grid>

      {/* --- OPCIONALES --- */}
      {showExtras && (
        <>
          <FormGrid>
            <FormLabel>Categoría</FormLabel>
            <OutlinedInput
              value={formData.categoria || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, categoria: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Origen</FormLabel>
            <OutlinedInput
              value={formData.origen || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, origen: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Destino</FormLabel>
            <OutlinedInput
              value={formData.destino || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, destino: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Descripción</FormLabel>
            <OutlinedInput
              value={formData.descripcion || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, descripcion: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Medio de Pago</FormLabel>
            <CustomSingleAutoComplete
              options={["Efectivo", "Transferencia", "Cheque", "Tarjeta"]}
              onChange={(valor) =>
                setFormData((p) => ({ ...p, medioPago: valor }))
              }
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>ID Documento Comercial Asociado</FormLabel>
            <OutlinedInput
              type="number"
              value={formData.documentoComercial || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, documentoComercial: e.target.value }))
              }
              size="small"
            />
          </FormGrid>
        </>
      )}
    </Grid>
  );
}
