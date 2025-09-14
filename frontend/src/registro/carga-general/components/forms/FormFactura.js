import React from "react";
import { Box, FormLabel, FormHelperText } from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import CustomSelect from "../../../../shared-components/CustomSelect";
import CustomDatePicker from "../../../../shared-components/CustomDatePicker";
import CustomSingleAutoComplete from "../../../../shared-components/CustomSingleAutoComplete";

export default function FormFactura({ formData, setFormData, errors = {} }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
      {/* 1️⃣ Número Documento */}
      <Box>
        <FormLabel>Número documento *</FormLabel>
        <OutlinedInput
          value={formData.numeroDocumento || ""}
          onChange={(e) =>
            setFormData((p) => ({ ...p, numeroDocumento: e.target.value }))
          }
          size="small"
          fullWidth
          error={!!errors.numeroDocumento}
        />
        {errors.numeroDocumento && (
          <FormHelperText error>{errors.numeroDocumento}</FormHelperText>
        )}
      </Box>

      {/* 2️⃣ Versión + Tipo factura + Fecha emisión */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Versión *</FormLabel>
          <CustomSelect
            value={formData.versionDocumento || ""}
            onChange={(valor) =>
              setFormData((p) => ({ ...p, versionDocumento: valor }))
            }
            options={["Original", "Duplicado"]}
            width="100%"
            error={!!errors.versionDocumento}
          />
          {errors.versionDocumento && (
            <FormHelperText error>{errors.versionDocumento}</FormHelperText>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Tipo factura *</FormLabel>
          <CustomSelect
            value={formData.tipoFactura || ""}
            onChange={(valor) =>
              setFormData((p) => ({ ...p, tipoFactura: valor }))
            }
            options={["A", "B", "C"]}
            width="100%"
            error={!!errors.tipoFactura}
          />
          {errors.tipoFactura && (
            <FormHelperText error>{errors.tipoFactura}</FormHelperText>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Fecha emisión *</FormLabel>
          <CustomDatePicker
            value={formData.fechaEmision || null}
            onChange={(fecha) =>
              setFormData((p) => ({ ...p, fechaEmision: fecha }))
            }
            error={!!errors.fechaEmision}
          />
          {errors.fechaEmision && (
            <FormHelperText error>{errors.fechaEmision}</FormHelperText>
          )}
        </Box>
      </Box>

      {/* 3️⃣ Monto Total + Moneda */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Monto total *</FormLabel>
          <OutlinedInput
            type="number"
            value={formData.montoTotal || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, montoTotal: e.target.value }))
            }
            size="small"
            fullWidth
            error={!!errors.montoTotal}
          />
          {errors.montoTotal && (
            <FormHelperText error>{errors.montoTotal}</FormHelperText>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Moneda *</FormLabel>
          <CustomSelect
            value={formData.moneda || ""}
            onChange={(valor) =>
              setFormData((p) => ({ ...p, moneda: valor }))
            }
            options={["ARS", "USD", "EUR"]}
            width="100%"
            error={!!errors.moneda}
          />
          {errors.moneda && (
            <FormHelperText error>{errors.moneda}</FormHelperText>
          )}
        </Box>
      </Box>

      {/* 4️⃣ Categoría */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Categoría *</FormLabel>
          <CustomSingleAutoComplete
            options={["Productos", "Servicios", "Mantenimiento", "Consultoría"]}
            value={formData.categoria || ""}
            onChange={(valor) =>
              setFormData((p) => ({ ...p, categoria: valor }))
            }
            error={!!errors.categoria}
          />
          {errors.categoria && (
            <FormHelperText error>{errors.categoria}</FormHelperText>
          )}
        </Box>
      </Box>

      {/* 5️⃣ Datos Vendedor */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Nombre vendedor *</FormLabel>
          <OutlinedInput
            value={formData.vendedorNombre || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, vendedorNombre: e.target.value }))
            }
            size="small"
            fullWidth
            error={!!errors.vendedorNombre}
          />
          {errors.vendedorNombre && (
            <FormHelperText error>{errors.vendedorNombre}</FormHelperText>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>CUIT vendedor</FormLabel>
          <OutlinedInput
            value={formData.vendedorCuit || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, vendedorCuit: e.target.value }))
            }
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Condición IVA vendedor</FormLabel>
          <CustomSelect
            value={formData.vendedorCondicionIVA || ""}
            onChange={(valor) =>
              setFormData((p) => ({ ...p, vendedorCondicionIVA: valor }))
            }
            options={["Responsable Inscripto", "Monotributo", "Exento"]}
            width="100%"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Domicilio vendedor</FormLabel>
          <OutlinedInput
            value={formData.vendedorDomicilio || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, vendedorDomicilio: e.target.value }))
            }
            size="small"
            fullWidth
          />
        </Box>
      </Box>

      {/* 6️⃣ Datos Comprador */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Nombre comprador *</FormLabel>
          <OutlinedInput
            value={formData.compradorNombre || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, compradorNombre: e.target.value }))
            }
            size="small"
            fullWidth
            error={!!errors.compradorNombre}
          />
          {errors.compradorNombre && (
            <FormHelperText error>{errors.compradorNombre}</FormHelperText>
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>CUIT comprador</FormLabel>
          <OutlinedInput
            value={formData.compradorCuit || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, compradorCuit: e.target.value }))
            }
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Condición IVA comprador</FormLabel>
          <CustomSelect
            value={formData.compradorCondicionIVA || ""}
            onChange={(valor) =>
              setFormData((p) => ({ ...p, compradorCondicionIVA: valor }))
            }
            options={["Responsable Inscripto", "Monotributo", "Exento"]}
            width="100%"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Domicilio comprador</FormLabel>
          <OutlinedInput
            value={formData.compradorDomicilio || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, compradorDomicilio: e.target.value }))
            }
            size="small"
            fullWidth
          />
        </Box>
      </Box>

      {/* 7️⃣ Datos fiscales */}
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Box sx={{ flex: 1 }}>
          <FormLabel>CAE</FormLabel>
          <OutlinedInput
            value={formData.cae || ""}
            onChange={(e) =>
              setFormData((p) => ({ ...p, cae: e.target.value }))
            }
            size="small"
            fullWidth
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormLabel>Vencimiento CAE</FormLabel>
          <CustomDatePicker
            value={formData.vencimientoCae || null}
            onChange={(fecha) =>
              setFormData((p) => ({ ...p, vencimientoCae: fecha }))
            }
          />
        </Box>
      </Box>
    </Box>
  );
}
