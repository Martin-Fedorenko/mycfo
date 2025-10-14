import React from "react";
import { Typography, Grid } from "@mui/material";
import axios from "axios";
import CustomButton from "../../../shared-components/CustomButton";
import FormFactura from "./forms/FormFactura";
import FormRecibo from "./forms/FormRecibo";
import FormPagare from "./forms/FormPagare";
import FormRegistro from "./forms/FormRegistro";
import FormIngreso from "./forms/FormIngreso";
import FormEgreso from "./forms/FormEgreso";
import FormDeuda from "./forms/FormDeuda";
import FormAcreencia from "./forms/FormAcreencia";

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
    if (!endpoint) return;

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
      return; // 🚫 No enviar si hay errores
    }

    try {
      // Obtener datos de sesión
      const usuarioSub = sessionStorage.getItem("sub");
      const organizacionId = sessionStorage.getItem("organizacionId");
      
      // Configurar headers
      const headers = {};
      if (usuarioSub) headers["X-Usuario-Sub"] = usuarioSub;
      if (organizacionId) headers["X-Organizacion-Id"] = organizacionId;

      // Preparar payload para el endpoint unificado
      let payload;
      let tipoMovimiento = null;

      // Determinar tipo y tipoMovimiento
      if (["ingreso", "egreso", "deuda", "acreencia"].includes(tipoDoc.toLowerCase())) {
        // Es un movimiento
        tipoMovimiento = tipoDoc.charAt(0).toUpperCase() + tipoDoc.slice(1); // Ingreso, Egreso, Deuda, Acreencia
        
        payload = {
          tipo: "movimiento",
          metodo: "formulario",
          datos: {
            ...formData,
            tipo: tipoMovimiento
          },
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
      
      await axios.post(endpoint, payload, { headers });

      alert("✅ Enviado con éxito!");
      setFormData({});

    } catch (err) {
      console.error("❌ Error en envío:", err);
      alert("❌ Error al enviar el formulario");
    }
  };

  const renderFormulario = () => {
    switch (tipoDoc) {
      case "factura":
        return (
          <FormFactura
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "movimiento":
        return (
          <FormRegistro
            tipoDoc={tipoDoc}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "ingreso":
        return (
          <FormIngreso
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "egreso":
        return (
          <FormEgreso
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "deuda":
        return (
          <FormDeuda
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        );
      case "acreencia":
        return (
          <FormAcreencia
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
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
