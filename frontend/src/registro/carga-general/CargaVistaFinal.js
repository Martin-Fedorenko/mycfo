import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

import CargaFormulario from "./components/CargaFormulario";
import CargaDocumento from "./components/CargaDocumento";
import CargaImagen from "./components/CargaImagen";
import CargaAudio from "./components/CargaAudio";

export default function CargaVistaFinal() {
  const { tipo, modo } = useParams();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const API_BASE = process.env.REACT_APP_URL_REGISTRO;

  const endpointMap = {
    factura: {
      formulario: `${API_BASE}/facturas/formulario`,
      documento: `${API_BASE}/facturas/documento`,
      foto: `${API_BASE}/facturas/foto`,
      audio: `${API_BASE}/facturas/audio`,
    },
    movimiento: {
      formulario: `${API_BASE}/registros/formulario`,
      documento: `${API_BASE}/registros/documento`,
      foto: `${API_BASE}/registros/foto`,
      audio: `${API_BASE}/registros/audio`,
    },
  };

  const endpoint = endpointMap[tipo]?.[modo];

  const renderContenido = () => {
    switch (modo) {
      case "formulario":
        return (
          <CargaFormulario
            tipoDoc={tipo}
            endpoint={endpoint}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case "documento":
        return <CargaDocumento tipoDoc={tipo} endpoint={endpoint} />;
      case "foto":
        return <CargaImagen tipoDoc={tipo} endpoint={endpoint} />;
      case "audio":
        return <CargaAudio tipoDoc={tipo} endpoint={endpoint} />;
      default:
        return <Typography>No se encontró vista</Typography>;
    }
  };

  return (
    

    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        mt: 8,
        p: 3,

      }}
    >
    <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Carga de {tipo} por {modo}
    </Typography>

    <Typography variant="subtitle1" sx={{ mb: 4, textAlign: "center" }}>
        Elegí cómo querés cargar tu {tipo}
    </Typography>

      {renderContenido()}
    </Box>
  );
}
