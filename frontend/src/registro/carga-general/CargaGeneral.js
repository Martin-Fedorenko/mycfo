import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Tooltip,
  IconButton,
  ButtonBase,
} from "@mui/material";
import {
  Edit,
  Description,
  CameraAlt,
  Mic,
  Receipt,
  SwapHoriz,
} from "@mui/icons-material";

import CargaFormulario from "./components/CargaFormulario";
import CargaDocumento from "./components/CargaDocumento";
import CargaImagen from "./components/CargaImagen";
import CargaAudio from "./components/CargaAudio";

export default function CargaGeneral() {
  const [tipoDoc, setTipoDoc] = useState(""); // Factura, Movimiento...
  const [modoCarga, setModoCarga] = useState(""); // formulario, documento, foto, audio
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const API_BASE = process.env.REACT_APP_URL_REGISTRO;

  const endpointMap = {
    Factura: {
      formulario: `${API_BASE}/facturas/formulario`,
      documento: `${API_BASE}/facturas/documento`,
      foto: `${API_BASE}/facturas/foto`,
      audio: `${API_BASE}/facturas/audio`,
    },
    // Todos los movimientos usan el mismo endpoint unificado
    Movimiento: {
      formulario: `${API_BASE}/movimientos`,
      documento: `${API_BASE}/movimientos/documento`,
      foto: `${API_BASE}/movimientos/foto`,
      audio: `${API_BASE}/movimientos/audio`,
    },
    Ingreso: {
      formulario: `${API_BASE}/movimientos`,
      documento: `${API_BASE}/movimientos/documento`,
      foto: `${API_BASE}/movimientos/foto`,
      audio: `${API_BASE}/movimientos/audio`,
    },
    Egreso: {
      formulario: `${API_BASE}/movimientos`,
      documento: `${API_BASE}/movimientos/documento`,
      foto: `${API_BASE}/movimientos/foto`,
      audio: `${API_BASE}/movimientos/audio`,
    },
    Deuda: {
      formulario: `${API_BASE}/movimientos`,
      documento: `${API_BASE}/movimientos/documento`,
      foto: `${API_BASE}/movimientos/foto`,
      audio: `${API_BASE}/movimientos/audio`,
    },
    Acreencia: {
      formulario: `${API_BASE}/movimientos`,
      documento: `${API_BASE}/movimientos/documento`,
      foto: `${API_BASE}/movimientos/foto`,
      audio: `${API_BASE}/movimientos/audio`,
    },
  };

  // Botones disponibles de tipo de documento
  const tipos = [
    { key: "Factura", label: "Factura", icon: <Receipt fontSize="large" /> },
    { key: "Ingreso", label: "Ingreso", icon: <SwapHoriz fontSize="large" /> },
    { key: "Egreso", label: "Egreso", icon: <SwapHoriz fontSize="large" /> },
    { key: "Deuda", label: "Deuda", icon: <SwapHoriz fontSize="large" /> },
    { key: "Acreencia", label: "Acreencia", icon: <SwapHoriz fontSize="large" /> },
  ];

  // Botones disponibles de método de carga
  const modos = [
    { key: "formulario", label: "Formulario", icon: <Edit fontSize="large" /> },
    { key: "documento", label: "Documento", icon: <Description fontSize="large" /> },
    { key: "foto", label: "Foto", icon: <CameraAlt fontSize="large" /> },
    { key: "audio", label: "Audio", icon: <Mic fontSize="large" /> },
  ];

  const renderContenido = () => {
    if (!tipoDoc || !modoCarga)
      return <Typography sx={{ mt: 3 }}>Seleccioná un tipo y un método</Typography>;

    const endpoint = endpointMap[tipoDoc][modoCarga];
    switch (modoCarga) {
      case "formulario":
        return (
          <CargaFormulario
            tipoDoc={tipoDoc}
            endpoint={endpoint}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case "documento":
        return <CargaDocumento tipoDoc={tipoDoc} endpoint={endpoint} />;
      case "foto":
        return <CargaImagen tipoDoc={tipoDoc} endpoint={endpoint} />;
      case "audio":
        return <CargaAudio tipoDoc={tipoDoc} endpoint={endpoint} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 4, p: 3 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">Registro de Documentos y Movimientos</Typography>
        <Typography variant="subtitle1">
          Elegí qué tipo de registro querés cargar
        </Typography>
      </Box>

      {/* Botones de selección de tipo */}
      {!tipoDoc && (
        <Grid container spacing={3} justifyContent="center">
          {tipos.map((t) => (
            <Grid item key={t.key}>
              <ButtonBase
                onClick={() => {
                  setTipoDoc(t.key);
                  setModoCarga(""); // resetear modo al elegir tipo
                  setFormData({});
                  setErrors({});
                }}
                sx={{
                  flexDirection: "column",
                  p: 3,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: "divider",
                  width: 150,
                  height: 150,
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "background.paper",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                {t.icon}
                <Typography sx={{ mt: 1 }} variant="subtitle1">
                  {t.label}
                </Typography>
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Botones de métodos de carga */}
      {tipoDoc && !modoCarga && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Elegí el método de carga para {tipoDoc}
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {modos.map((m) => (
              <Grid item key={m.key}>
                <ButtonBase
                  onClick={() => setModoCarga(m.key)}
                  sx={{
                    flexDirection: "column",
                    p: 3,
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: "divider",
                    width: 150,
                    height: 150,
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {m.icon}
                  <Typography sx={{ mt: 1 }} variant="subtitle1">
                    {m.label}
                  </Typography>
                </ButtonBase>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Vista final de carga */}
      {tipoDoc && modoCarga && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <ButtonBase
              onClick={() => setModoCarga("")}
              sx={{
                p: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2">← Cambiar método</Typography>
            </ButtonBase>
            <ButtonBase
              onClick={() => {
                setTipoDoc("");
                setModoCarga("");
              }}
              sx={{
                p: 1,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2">← Cambiar tipo</Typography>
            </ButtonBase>
          </Box>
          {renderContenido()}
        </Box>
      )}
    </Box>
  );
}
