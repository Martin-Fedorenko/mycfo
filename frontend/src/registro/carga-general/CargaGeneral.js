import React, { useState } from "react";
import { Box, Typography, Grid, Tooltip, IconButton } from "@mui/material";
import { Edit, Description, CameraAlt, Mic } from "@mui/icons-material";
import CustomSelect from "../../shared-components/CustomSelect";

import CargaFormulario from "./components/CargaFormulario";
import CargaDocumento from "./components/CargaDocumento";
import CargaImagen from "./components/CargaImagen";
import CargaAudio from "./components/CargaAudio";

export default function CargaGeneral() {
  const [tipoDoc, setTipoDoc] = useState("");
  const [modoCarga, setModoCarga] = useState("formulario");
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
    Movimiento: {
      formulario: `${API_BASE}/registros/formulario`,
      documento: `${API_BASE}/registros/documento`,
      foto: `${API_BASE}/registros/foto`,
      audio: `${API_BASE}/registros/audio`,
    }
  };

  const tipos = Object.keys(endpointMap);

  const renderContenido = () => {
    if (!tipoDoc) return <Typography sx={{ mt: 3 }}>Seleccioná un documento</Typography>;
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
      {/* Encabezado con botones */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box>
          <Typography variant="h5">Registro de Documentos y movimientos</Typography>
          <Typography variant="subtitle1">
            Elegí el tipo de documento o movimiento y cómo cargarlo
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Formulario">
            <IconButton
              color={modoCarga === "formulario" ? "primary" : "default"}
              onClick={() => setModoCarga("formulario")}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Documento">
            <IconButton
              color={modoCarga === "documento" ? "primary" : "default"}
              onClick={() => setModoCarga("documento")}
            >
              <Description />
            </IconButton>
          </Tooltip>
          <Tooltip title="Foto">
            <IconButton
              color={modoCarga === "foto" ? "primary" : "default"}
              onClick={() => setModoCarga("foto")}
            >
              <CameraAlt />
            </IconButton>
          </Tooltip>
          <Tooltip title="Audio">
            <IconButton
              color={modoCarga === "audio" ? "primary" : "default"}
              onClick={() => setModoCarga("audio")}
            >
              <Mic />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Selector tipo de documento */}
      <CustomSelect
        label="Tipo"
        name="tipo"
        value={tipoDoc}
        onChange={(valor) => {
          setTipoDoc(valor);
          setFormData({});  // resetear form
          setErrors({});    // resetear errores
        }}
        options={tipos}
        width="100%"
      />

      {renderContenido()}
    </Box>
  );
}
