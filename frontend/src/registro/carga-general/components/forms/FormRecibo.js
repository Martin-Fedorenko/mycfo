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

export default function FormRecibo({ formData, setFormData }) {
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
        <OutlinedInput
          value={formData.categoria || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, categoria: e.target.value }))
          }
          size="small"
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Estado Documento</FormLabel>
        <CustomSingleAutoComplete
          options={["BORRADOR", "PENDIENTE", "CONFIRMADO", "CERRADO"]}
          onChange={(valor) =>
            setFormData((p) => ({ ...p, estadoDocumentoComercial: valor }))
          }
        />
      </FormGrid>
      
      <FormGrid>
        <FormLabel>Versión Documento</FormLabel>
        <CustomSelect
          onChange={(valor) => setFormData((p) => ({ ...p, versionDocumento: valor }))}
          options={["ORIGINAL", "COPIA", "DUPLICADO"]}
        />
      </FormGrid>

      {/* --- OBLIGATORIOS ESPECÍFICOS DE RECIBO --- */}
      <FormGrid>
        <FormLabel>Emisor Nombre</FormLabel>
        <OutlinedInput
          value={formData.emisorNombre || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, emisorNombre: e.target.value }))
          }
          size="small"
        />
      </FormGrid>

      <FormGrid>
        <FormLabel>Comprador Nombre</FormLabel>
        <OutlinedInput
          value={formData.compradorNombre || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, compradorNombre: e.target.value }))
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
            <FormLabel>Emisor CUIT</FormLabel>
            <OutlinedInput
              value={formData.emisorCuit || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, emisorCuit: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Emisor Domicilio</FormLabel>
            <OutlinedInput
              value={formData.emisorDomicilio || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, emisorDomicilio: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Emisor Ingresos Brutos</FormLabel>
            <OutlinedInput
              value={formData.emisorIngresosBrutos || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, emisorIngresosBrutos: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Emisor Condición IVA</FormLabel>
            <OutlinedInput
              value={formData.emisorCondicionIVA || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, emisorCondicionIVA: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Comprador CUIT</FormLabel>
            <OutlinedInput
              value={formData.compradorCuit || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, compradorCuit: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Comprador Domicilio</FormLabel>
            <OutlinedInput
              value={formData.compradorDomicilio || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, compradorDomicilio: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Condición de Pago</FormLabel>
            <OutlinedInput
              value={formData.condicionPago || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, condicionPago: e.target.value }))
              }
              size="small"
            />
          </FormGrid>

          <FormGrid>
            <FormLabel>Saldo Pendiente</FormLabel>
            <OutlinedInput
              type="number"
              value={formData.saldoPendiente || ""}
              onChange={(e) =>
                setFormData((p) => ({ ...p, saldoPendiente: e.target.value }))
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
