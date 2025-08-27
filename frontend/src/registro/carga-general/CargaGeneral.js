import React, { useState, useRef } from "react";
import {
  Box, Typography, Grid, MenuItem, Select, InputLabel,
  IconButton, Tooltip
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import { CameraAlt, Mic, Description, Edit } from "@mui/icons-material";
import axios from "axios";
import CustomButton from "../../shared-components/CustomButton";
import Webcam from "react-webcam";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
}));

export default function CargaGeneral() {
  const [tipoDoc, setTipoDoc] = useState("");
  const [modoCarga, setModoCarga] = useState("formulario");
  const [formData, setFormData] = useState({ campo1: "", campo2: "" });
  const [archivo, setArchivo] = useState(null);

  // 🎤 audio
  const [grabando, setGrabando] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    setChunks([]);
    recorder.start();
    recorder.ondataavailable = (e) => setChunks((prev) => [...prev, e.data]);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      setAudioFile(new File([blob], "grabacion.webm", { type: "audio/webm" }));
    };
    setGrabando(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setGrabando(false);
  };

  // 📷 foto
  const webcamRef = useRef(null);
  const [foto, setFoto] = useState(null);

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
    Comprobante: {
      formulario: "/comprobantes/formulario",
      documento: "/comprobantes/documento",
      foto: "/comprobantes/foto",
      audio: "/comprobantes/audio",
    },
  };

  const handleSubmit = async () => {
    if (!tipoDoc || !modoCarga) return;
    const endpoint = endpointMap[tipoDoc][modoCarga];

    try {
      if (modoCarga === "formulario") {
        await axios.post(endpoint, formData);
      } else {
        const fd = new FormData();
        if (archivo) {
          fd.append("file", archivo);
        } else if (modoCarga === "foto" && foto) {
          const blob = await fetch(foto).then((r) => r.blob());
          fd.append("file", blob, "foto.jpg");
        } else if (modoCarga === "audio" && audioFile) {
          fd.append("file", audioFile);
        }
        await axios.post(endpoint, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      alert("✅ Enviado con éxito!");
    } catch (err) {
      console.error("❌ Error en envío:", err);
    }
  };

  const renderContenido = () => {
    if (!tipoDoc) {
      return <Typography sx={{ mt: 3 }} color="text.secondary">
        Seleccioná un documento para continuar
      </Typography>;
    }

    switch (modoCarga) {
      case "formulario":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Formulario para {tipoDoc}</Typography>
            <Grid container spacing={2}>
              <FormGrid item xs={12}>
                <OutlinedInput
                  placeholder={`Campo 1 de ${tipoDoc}`}
                  value={formData.campo1}
                  onChange={(e) => setFormData(p => ({ ...p, campo1: e.target.value }))}
                  size="small"
                />
              </FormGrid>
              <FormGrid item xs={12}>
                <OutlinedInput
                  placeholder={`Campo 2 de ${tipoDoc}`}
                  value={formData.campo2}
                  onChange={(e) => setFormData(p => ({ ...p, campo2: e.target.value }))}
                  size="small"
                />
              </FormGrid>
              <FormGrid item xs={12}>
                <CustomButton label={`Enviar ${tipoDoc}`} width="100%" onClick={handleSubmit} />
              </FormGrid>
            </Grid>
          </Box>
        );

      case "documento":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Subir documento para {tipoDoc}</Typography>
            <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => setArchivo(e.target.files[0])} />
            <CustomButton label="Subir documento" width="100%" sx={{ mt: 2 }} onClick={handleSubmit} />
          </Box>
        );

      case "foto":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Sacar foto para {tipoDoc}</Typography>
            <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" style={{ width: "100%" }} />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <CustomButton label="Capturar foto" onClick={() => {
                const img = webcamRef.current.getScreenshot();
                setFoto(img); setArchivo(null);
              }} />
              <input type="file" accept="image/*" onChange={(e) => setArchivo(e.target.files[0])} />
            </Box>
            {foto && <Box sx={{ mt: 2 }}><img src={foto} alt="captura" style={{ maxWidth: "100%" }} /></Box>}
            <CustomButton label="Enviar foto" width="100%" sx={{ mt: 2 }} onClick={handleSubmit} />
          </Box>
        );

      case "audio":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Grabar audio para {tipoDoc}</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <CustomButton label={grabando ? "Detener" : "Grabar"} onClick={grabando ? stopRecording : startRecording} />
              <input type="file" accept="audio/*" onChange={(e) => setArchivo(e.target.files[0])} />
            </Box>
            {audioUrl && (
              <Box sx={{ mt: 2 }}>
                <audio controls src={audioUrl} />
              </Box>
            )}
            <CustomButton label="Enviar audio" width="100%" sx={{ mt: 2 }} onClick={handleSubmit} />
          </Box>
        );

      default: return null;
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 720, mx: "auto", mt: 4, p: 3 }}>
      {/* Encabezado con botones */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">Registro de Documentos</Typography>
          <Typography variant="subtitle1">Elegí el tipo de documento y cómo cargarlo</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Formulario"><IconButton color={modoCarga==="formulario"?"primary":"default"} onClick={()=>setModoCarga("formulario")}><Edit/></IconButton></Tooltip>
          <Tooltip title="Documento"><IconButton color={modoCarga==="documento"?"primary":"default"} onClick={()=>setModoCarga("documento")}><Description/></IconButton></Tooltip>
          <Tooltip title="Foto"><IconButton color={modoCarga==="foto"?"primary":"default"} onClick={()=>setModoCarga("foto")}><CameraAlt/></IconButton></Tooltip>
          <Tooltip title="Audio"><IconButton color={modoCarga==="audio"?"primary":"default"} onClick={()=>setModoCarga("audio")}><Mic/></IconButton></Tooltip>
        </Box>
      </Box>

      {/* Selector tipo de documento */}
      <Grid container spacing={2}>
        <FormGrid item xs={12}>
          <InputLabel id="tipo-doc" required>Seleccioná un documento</InputLabel>
          <Select labelId="tipo-doc" id="tipo-doc" value={tipoDoc} onChange={(e)=>setTipoDoc(e.target.value)} displayEmpty size="small" input={<OutlinedInput/>}>
            <MenuItem value="" disabled>Elegí tipo de documento</MenuItem>
            <MenuItem value="Factura">Factura</MenuItem>
            <MenuItem value="Recibo">Recibo</MenuItem>
            <MenuItem value="Comprobante">Comprobante de gasto</MenuItem>
          </Select>
        </FormGrid>
      </Grid>

      {renderContenido()}
    </Box>
  );
}
