import React, { useState } from "react";
import { Box, Typography, Grid } from "@mui/material";
import axios from "axios";
import CustomButton from "../../../shared-components/CustomButton";
import FormFactura from "./forms/FormFactura";
import FormRecibo from "./forms/FormRecibo";
import FormPagare from "./forms/FormPagare";
import FormRegistro from "./forms/FormRegistro";

export default function CargaFormulario({ tipoDoc, endpointMap }) {
    const [formData, setFormData] = useState({});

    const handleSubmit = async () => {
    const endpoint = endpointMap[tipoDoc]?.formulario;
    if (!endpoint) {
        alert("❌ No se encontró endpoint para este documento");
        return;
    }

    try {
        await axios.post(endpoint, formData);
        alert("✅ Enviado con éxito!");
    } catch (err) {
        console.error("❌ Error en envío:", err);
    }
    };

    const renderFormulario = () => {
    switch (tipoDoc) {
        case "Factura":
        return <FormFactura formData={formData} setFormData={setFormData} />;
        case "Recibo":
        return <FormRecibo formData={formData} setFormData={setFormData} />;
        case "Pagaré":
        case "Pagare":
        return <FormPagare formData={formData} setFormData={setFormData} />;
        case "Ingreso":
        case "Egreso":
        return (
            <FormRegistro
            tipoDoc={tipoDoc} // se pasa "Ingreso" o "Egreso"
            formData={formData}
            setFormData={setFormData}
            />
        );
        default:
        return <Typography>No hay formulario definido para {tipoDoc}</Typography>;
    }
    };

    return (
        <Box sx={{ mt: 3 }}>
        <Typography variant="h6">Formulario para {tipoDoc}</Typography>
        {renderFormulario()}
        <Grid container sx={{ mt: 2 }}>
            <CustomButton
            label={`Enviar ${tipoDoc}`}
            width="100%"
            onClick={handleSubmit}
            />
        </Grid>
        </Box>
    );
}
