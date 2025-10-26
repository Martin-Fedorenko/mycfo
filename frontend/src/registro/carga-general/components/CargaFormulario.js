import React from "react";
import { Typography, Grid } from "@mui/material";
import axios from "axios";
import CustomButton from "../../../shared-components/CustomButton";
import LazyFormWrapper from "./LazyFormWrapper";
import API_CONFIG from "../../../config/api-config";

// Lazy loading para formularios específicos
const FormFactura = React.lazy(() => import("./forms/FormFactura"));
const FormRegistro = React.lazy(() => import("./forms/FormRegistro"));
const FormIngreso = React.lazy(() => import("./forms/FormIngreso"));
const FormEgreso = React.lazy(() => import("./forms/FormEgreso"));
const FormDeuda = React.lazy(() => import("./forms/FormDeuda"));
const FormAcreencia = React.lazy(() => import("./forms/FormAcreencia"));

// 📌 Campos obligatorios por tipo de documento
const requiredFieldsMap = {
  Factura: [
    "numeroDocumento",
    "versionDocumento",
    "tipoFactura",
    "fechaEmision",
    "montoTotal",
    "moneda",
    "categoria",
    "vendedorNombre",
    "compradorNombre",
  ],
  Movimiento: ["montoTotal", "moneda", "medioPago", "fechaEmision"],
  Ingreso: ["montoTotal", "moneda", "fechaEmision"],
  Egreso: ["montoTotal", "moneda", "fechaEmision"],
  Deuda: ["montoTotal", "moneda", "fechaEmision"],
  Acreencia: ["montoTotal", "moneda", "fechaEmision"],
};

export default function CargaFormulario({
  tipoDoc,
  endpoint,
  formData,
  setFormData,
  errors,
  setErrors,
}) {
  const handleSubmit = async () => {
    // ✅ Validación dinámica
    const newErrors = {};
    const requiredFields = requiredFieldsMap[tipoDoc] || [];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "Campo obligatorio";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      alert("⚠️ Por favor completa todos los campos obligatorios");
      return; // 🚫 No enviar si hay errores
    }

    try {
      // Obtener sub del usuario (REQUERIDO)
      const usuarioSub = sessionStorage.getItem("sub");
      
      if (!usuarioSub) {
        alert("❌ Error: No se encontró el usuario en la sesión. Por favor, inicia sesión nuevamente.");
        return;
      }
      
      // Configurar headers - SOLO necesitamos X-Usuario-Sub
      const headers = {
        "X-Usuario-Sub": usuarioSub
      };

      // Preparar payload para el endpoint unificado /api/carga-datos
      let payload;
      let tipoMovimiento = null;

      // Determinar tipo y tipoMovimiento
      if (["ingreso", "egreso", "deuda", "acreencia"].includes(tipoDoc.toLowerCase())) {
        // Es un movimiento
        tipoMovimiento = tipoDoc.charAt(0).toUpperCase() + tipoDoc.slice(1); // Ingreso, Egreso, Deuda, Acreencia
        
        payload = {
          tipo: "movimiento",
          metodo: "formulario",
          datos: formData,
          tipoMovimiento: tipoMovimiento
        };
      } else if (tipoDoc.toLowerCase() === "factura") {
        // Es una factura
        payload = {
          tipo: "factura",
          metodo: "formulario",
          datos: formData
        };
      } else {
        // Movimiento genérico
        payload = {
          tipo: "movimiento",
          metodo: "formulario",
          datos: formData
        };
      }
      
      console.log("📤 Enviando datos:", payload);
      console.log("🔐 Headers:", headers);
      
      // Usar endpoint unificado
      const ENDPOINT_UNIFICADO = `${API_CONFIG.REGISTRO}/api/carga-datos`;
      const response = await axios.post(ENDPOINT_UNIFICADO, payload, { headers });

      console.log("✅ Respuesta del servidor:", response.data);
      alert(`✅ ${response.data.mensaje || 'Datos guardados exitosamente'}`);
      setFormData({});
      setErrors({});

    } catch (err) {
      console.error("❌ Error en envío:", err);
      const mensaje = err.response?.data?.mensaje || err.message || "Error desconocido";
      alert(`❌ Error al enviar el formulario: ${mensaje}`);
    }
  };

  const renderFormulario = () => {
    switch (tipoDoc) {
      case "factura":
        return (
          <LazyFormWrapper>
            <FormFactura
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </LazyFormWrapper>
        );
      case "movimiento":
        return (
          <LazyFormWrapper>
            <FormRegistro
              tipoDoc={tipoDoc}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </LazyFormWrapper>
        );
      case "ingreso":
        return (
          <LazyFormWrapper>
            <FormIngreso
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </LazyFormWrapper>
        );
      case "egreso":
        return (
          <LazyFormWrapper>
            <FormEgreso
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </LazyFormWrapper>
        );
      case "deuda":
        return (
          <LazyFormWrapper>
            <FormDeuda
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </LazyFormWrapper>
        );
      case "acreencia":
        return (
          <LazyFormWrapper>
            <FormAcreencia
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </LazyFormWrapper>
        );
      default:
        return <Typography>No hay formulario definido para {tipoDoc}</Typography>;
    }
  };

  return (
    <Grid sx={{ mt: 3, width: "100%" }}>
      

      {renderFormulario()}

      <CustomButton
        label={`Enviar ${tipoDoc}`}
        width="100%"
        onClick={handleSubmit}
      />
    </Grid>
  );
}
