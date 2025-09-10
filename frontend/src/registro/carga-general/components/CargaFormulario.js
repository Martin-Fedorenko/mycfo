import React from "react";
import { Typography, Grid } from "@mui/material";
import axios from "axios";
import CustomButton from "../../../shared-components/CustomButton";
import FormFactura from "./forms/FormFactura";
import FormRecibo from "./forms/FormRecibo";
import FormPagare from "./forms/FormPagare";
import FormRegistro from "./forms/FormRegistro";

export default function CargaFormulario({ tipoDoc, endpoint, formData, setFormData, errors, setErrors }) {

  const handleSubmit = async () => {
    if (!endpoint) return;

    // Validación de campos obligatorios
    const newErrors = {};
    if (!formData.numeroDocumento) newErrors.numeroDocumento = "Campo obligatorio";
    if (!formData.versionDocumento) newErrors.versionDocumento = "Campo obligatorio";
    if (!formData.tipoFactura) newErrors.tipoFactura = "Campo obligatorio";
    if (!formData.fechaEmision) newErrors.fechaEmision = "Campo obligatorio";
    if (!formData.montoTotal) newErrors.montoTotal = "Campo obligatorio";
    if (!formData.moneda) newErrors.moneda = "Campo obligatorio";
    if (!formData.categoria) newErrors.categoria = "Campo obligatorio";
    if (!formData.vendedorNombre) newErrors.vendedorNombre = "Campo obligatorio";
    if (!formData.compradorNombre) newErrors.compradorNombre = "Campo obligatorio";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return; // 🚫 no enviar si hay errores
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
      case "Factura":
        return <FormFactura formData={formData} setFormData={setFormData} errors={errors} />;
      case "Recibo":
        return <FormRecibo formData={formData} setFormData={setFormData} errors={errors} />;
      case "Pagaré":
      case "Pagare":
        return <FormPagare formData={formData} setFormData={setFormData} errors={errors} />;
      case "Ingreso":
      case "Egreso":
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
      <Typography variant="h6" sx={{ mb: 2 }}>
        Formulario para {tipoDoc}
      </Typography>

      {renderFormulario()}

      <CustomButton
        label={`Enviar ${tipoDoc}`}
        width="100%"
        onClick={handleSubmit}
      />
    </Grid>
  );
}
