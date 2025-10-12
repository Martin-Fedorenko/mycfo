import React from "react";
import { Typography, Grid } from "@mui/material";
import axios from "axios";
import CustomButton from "../../../shared-components/CustomButton";
import FormFactura from "./forms/FormFactura";
import FormRecibo from "./forms/FormRecibo";
import FormPagare from "./forms/FormPagare";
import FormRegistro from "./forms/FormRegistro";

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
      const payload = { ...formData, tipoDocumento: tipoDoc };
      await axios.post(endpoint, payload);



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
