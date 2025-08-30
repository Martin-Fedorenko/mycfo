import React, { useState } from "react";
import { Grid, FormLabel, FormControlLabel, Checkbox } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import CustomSingleAutoComplete from "../../../../shared-components/CustomSingleAutoComplete";
import CustomDatePicker from "../../../../shared-components/CustomDatePicker";
import CustomSelect from "../../../../shared-components/CustomSelect";


const FormGrid = ({ children, size = { xs: 12 } }) => (
  <Grid item {...size} sx={{ display: "flex", flexDirection: "column" }}>
    {children}
  </Grid>
);

export default function FormPagare({ formData, setFormData }) {
  const [showExtras, setShowExtras] = useState(false);

  return (
    <Grid container spacing={2}>
      {/* --- OBLIGATORIOS (DocumentoComercial base) --- */}
      <FormGrid>
        <FormLabel>Número Documento</FormLabel>
        <OutlinedInput
          value={formData.numeroDocumento || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, numeroDocumento: e.target.value }))
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
        <FormLabel>Moneda</FormLabel>
        <CustomSelect
          onChange={(valor) => setFormData((p) => ({ ...p, moneda: valor }))}
          options={["ARS", "USD", "EUR"]}
        />
      </FormGrid>



      <FormGrid>
        <FormLabel>Categoría</FormLabel>
        <CustomSingleAutoComplete
          value={formData.categoria || ""}
          options={["BORRADOR", "PENDIENTE", "CONFIRMADO", "CERRADO"]}
          onChange={(valor) =>
            setFormData((p) => ({ ...p, categoria: valor }))
          }
        />
      </FormGrid>



      <FormGrid>
        <FormLabel>Estado Documento</FormLabel>
        <CustomSelect
          options={["BORRADOR", "PENDIENTE", "CONFIRMADO", "CERRADO"]}
          onChange={(valor) =>
            setFormData((p) => ({ ...p, estadoDocumentoComercial: valor }))
          }
        />
      </FormGrid>
      

      <FormGrid>
        <FormLabel>Versión Documento</FormLabel>
        <CustomSingleAutoComplete
          options={["ORIGINAL", "COPIA", "DUPLICADO"]}
          onChange={(valor) =>
            setFormData((p) => ({ ...p, versionDocumento: valor }))
          }
        />
      </FormGrid>

      {/* --- OBLIGATORIOS ESPECÍFICOS DE PAGARÉ --- */}
      <FormGrid>
        <FormLabel>Fecha Vencimiento</FormLabel>
        <CustomDatePicker
          value={formData.fechaVencimiento || null}
          onChange={(fecha) =>
            setFormData((p) => ({ ...p, fechaVencimiento: fecha }))
          }
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Beneficiario Nombre</FormLabel>
        <OutlinedInput
          value={formData.beneficiarioNombre || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, beneficiarioNombre: e.target.value }))
          }
          size="small"
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Deudor Nombre</FormLabel>
        <OutlinedInput
          value={formData.deudorNombre || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, deudorNombre: e.target.value }))
          }
          size="small"
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
            <FormLabel>Beneficiario CUIT</FormLabel>
            <OutlinedInput
              value={formData.beneficiarioCuit || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, beneficiarioCuit: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Deudor CUIT</FormLabel>
            <OutlinedInput
              value={formData.deudorCuit || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, deudorCuit: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Motivo del Pago</FormLabel>
            <OutlinedInput
              value={formData.motivoPago || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, motivoPago: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Intereses por mora</FormLabel>
            <OutlinedInput
              type="number"
              value={formData.interesesMora || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, interesesMora: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Cláusula</FormLabel>
            <CustomSingleAutoComplete
              options={["A la orden", "No a la orden"]}
              onChange={(valor) =>
                setFormData((p) => ({ ...p, clausula: valor }))
              }
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>CAE</FormLabel>
            <OutlinedInput
              value={formData.cae || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, cae: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Vencimiento CAE</FormLabel>
            <CustomDatePicker
              value={formData.vencimientoCae || null}
              onChange={(fecha) =>
                setFormData((p) => ({ ...p, vencimientoCae: fecha }))
              }
            />
          </FormGrid>
        </>
      )}
    </Grid>
  );
}
