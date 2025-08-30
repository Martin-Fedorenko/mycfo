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

  const endpointMap = {
    Factura: {
      formulario: "/facturas/formulario",
      documento: "/facturas/documento",
      foto: "/facturas/foto",
      audio: "/facturas/audio",
    },
    Recibo: {
      formulario: "/recibos/formulario",
      documento: "/recibos/documento",
      foto: "/recibos/foto",
      audio: "/recibos/audio",
    },
    Pagaré: {
      formulario: "/pagares/formulario",
      documento: "/pagares/documento",
      foto: "/pagares/foto",
      audio: "/pagares/audio",
    },
    Ingreso: {
      formulario: "/ingresos/formulario",
      documento: "/ingresos/documento",
      foto: "/ingresos/foto",
      audio: "/ingresos/audio",
    },
    Egreso: {
      formulario: "/egresos/formulario",
      documento: "/egresos/documento",
      foto: "/egresos/foto",
      audio: "/egresos/audio",
    },
  };

  const tipos = Object.keys(endpointMap);

  const renderContenido = () => {
    if (!tipoDoc) return <Typography sx={{ mt: 3 }}>Seleccioná un documento</Typography>;
    const endpoint = endpointMap[tipoDoc][modoCarga];
    switch (modoCarga) {
      case "formulario":
        return <CargaFormulario tipoDoc={tipoDoc} endpoint={endpoint} />;
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
    <Box sx={{ width: "100%", maxWidth: 720, mx: "auto", mt: 4, p: 3 }}>
      {/* Encabezado con botones */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5">Registro de Documentos</Typography>
          <Typography variant="subtitle1">
            Elegí el tipo de documento y cómo cargarlo
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

      <Grid item xs={12} sm={6}>
        <CustomSelect
          label="Tipo"
          name="tipo"
          value={tipoDoc} 
          onChange={(e) => setTipoDoc(e.target.value)}
          options={tipos}
          // error={!tipoDoc ? "Debe seleccionar un tipo" : ""}
          width="100%"
        />
      </Grid>


      {renderContenido()}
    </Box>
  );
}
