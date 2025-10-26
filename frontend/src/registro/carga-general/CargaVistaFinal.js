import React, { useState, Suspense } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";

// Lazy loading para componentes pesados
const CargaFormulario = React.lazy(() => import("./components/CargaFormulario"));
const CargaDocumento = React.lazy(() => import("./components/CargaDocumento"));
const CargaImagen = React.lazy(() => import("./components/CargaImagen"));
const CargaAudio = React.lazy(() => import("./components/CargaAudio"));

export default function CargaVistaFinal() {
  const { tipo, modo } = useParams();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const API_BASE = process.env.REACT_APP_URL_REGISTRO;

  // Endpoint unificado para todos los tipos
  const ENDPOINT_UNIFICADO = `${API_BASE}/api/carga-datos`;

  const endpointMap = {
    factura: {
      formulario: ENDPOINT_UNIFICADO,
      documento: `${API_BASE}/api/carga-datos`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/audio`,
    },
    movimiento: {
      formulario: ENDPOINT_UNIFICADO,
      documento: `${API_BASE}/api/carga-datos`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/audio`,
    },
    ingreso: {
      formulario: ENDPOINT_UNIFICADO,
      documento: `${API_BASE}/api/carga-datos`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/audio`,
    },
    egreso: {
      formulario: ENDPOINT_UNIFICADO,
      documento: `${API_BASE}/api/carga-datos`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/audio`,
    },
    deuda: {
      formulario: ENDPOINT_UNIFICADO,
      documento: `${API_BASE}/api/carga-datos`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/audio`,
    },
    acreencia: {
      formulario: ENDPOINT_UNIFICADO,
      documento: `${API_BASE}/api/carga-datos`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/audio`,
    },
  };

  const endpoint = endpointMap[tipo]?.[modo];

  const renderContenido = () => {
    const LoadingFallback = () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );

    switch (modo) {
      case "formulario":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaFormulario
              tipoDoc={tipo}
              endpoint={endpoint}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
          </Suspense>
        );
      case "documento":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaDocumento tipoDoc={tipo} endpoint={endpoint} />
          </Suspense>
        );
      case "foto":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaImagen tipoDoc={tipo} endpoint={endpoint} />
          </Suspense>
        );
      case "audio":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaAudio tipoDoc={tipo} endpoint={endpoint} />
          </Suspense>
        );
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
