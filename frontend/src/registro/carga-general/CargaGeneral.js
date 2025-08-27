import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  IconButton,
  Tooltip,
  Paper,
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/material/styles";
import {
  CameraAlt,
  Mic,
  Description,
  Edit,
  Delete,
  Check,
  Close,
} from "@mui/icons-material";
import axios from "axios";
import CustomButton from "../../shared-components/CustomButton";
import Webcam from "react-webcam";
import DropzoneUploader from "../../shared-components/DropzoneUploader";

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
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunksLocal = [];

    // 🎶 Analizador de ondas
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!isRecording) return;
      requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#4cafef";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    recorder.ondataavailable = (e) => chunksLocal.push(e.data);

    recorder.onstop = () => {
      setIsRecording(false);
      const blob = new Blob(chunksLocal, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      setAudioFile(new File([blob], "grabacion.webm", { type: "audio/webm" }));
      chunksLocal = [];
      stream.getTracks().forEach((t) => t.stop()); // liberamos micro
    };

    setMediaRecorder(recorder);
    recorder.start();
    setGrabando(true);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setGrabando(false);
  };

  // 📷 foto
  const webcamRef = useRef(null);
  const [capturando, setCapturando] = useState(true);
  const [fotoTemporal, setFotoTemporal] = useState(null);
  const [fotos, setFotos] = useState([]);

  const tomarFoto = () => {
    const img = webcamRef.current.getScreenshot();
    setFotoTemporal(img);
    setCapturando(false); // congela la cámara
  };

  const aceptarFoto = () => {
    setFotos((prev) => [...prev, fotoTemporal]);
    setFotoTemporal(null);
    setCapturando(true);
  };

  const rechazarFoto = () => {
    setFotoTemporal(null);
    setCapturando(true);
  };

  const eliminarFoto = (index) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  // 🧹 limpiar estados al cambiar modo/tipo
  useEffect(() => {
    setFormData({ campo1: "", campo2: "" });
    setArchivo(null);
    setFotoTemporal(null);
    setFotos([]);
    setAudioUrl(null);
    setAudioFile(null);
    setGrabando(false);
    setIsRecording(false);
  }, [modoCarga, tipoDoc]);

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

  const handleFileSelected = (archivo) => {
    setArchivo(archivo);
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
        } else if (modoCarga === "foto" && fotos.length > 0) {
          fotos.forEach((f, idx) => {
            fd.append("files", dataURLtoBlob(f), `foto-${idx + 1}.jpg`);
          });
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

  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const renderContenido = () => {
    if (!tipoDoc) {
      return (
        <Typography sx={{ mt: 3 }} color="text.secondary">
          Seleccioná un documento para continuar
        </Typography>
      );
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
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, campo1: e.target.value }))
                  }
                  size="small"
                />
              </FormGrid>
              <FormGrid item xs={12}>
                <OutlinedInput
                  placeholder={`Campo 2 de ${tipoDoc}`}
                  value={formData.campo2}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, campo2: e.target.value }))
                  }
                  size="small"
                />
              </FormGrid>
              <FormGrid item xs={12}>
                <CustomButton
                  label={`Enviar ${tipoDoc}`}
                  width="100%"
                  onClick={handleSubmit}
                />
              </FormGrid>
            </Grid>
          </Box>
        );

      case "documento":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Subir documento para {tipoDoc}</Typography>
            <DropzoneUploader
              onFileSelected={handleFileSelected}
              width="100%"
              height={140}
              accept={{
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [],
                "application/vnd.ms-excel": [],
                "image/*": [],
                "audio/*": [],
              }}
            />
            <CustomButton
              label="Subir documento"
              width="100%"
              sx={{ mt: 2 }}
              onClick={handleSubmit}
            />
          </Box>
        );

      case "foto":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" style={{ marginBottom: 10 }}>
              Sacar foto para {tipoDoc}
            </Typography>

            {/* Webcam o foto congelada */}
            <Box
              sx={{
                position: "relative",
                width: "100%",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {capturando ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  style={{ width: "100%" }}
                />
              ) : (
                <img src={fotoTemporal} alt="captura" style={{ width: "100%" }} />
              )}

              {/* Botones superpuestos */}
              {capturando ? (
                <IconButton
                  onClick={tomarFoto}
                  color="primary"
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 50,
                    height: 50,
                  }}
                >
                  <CameraAlt />
                </IconButton>
              ) : (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: 4,
                  }}
                >
                  <IconButton
                    onClick={rechazarFoto}
                    color="error"
                    sx={{ width: 50, height: 50 }}
                  >
                    <Close />
                  </IconButton>
                  <IconButton
                    onClick={aceptarFoto}
                    color="success"
                    sx={{ width: 50, height: 50 }}
                  >
                    <Check />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Fotos seleccionadas estilo lista */}
            {fotos.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">Fotos seleccionadas:</Typography>
                {fotos.map((f, i) => (
                  <Paper
                    key={i}
                    sx={{
                      mt: 1,
                      p: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid",
                      borderColor: "grey.400",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">{`foto-${i + 1}.jpg`}</Typography>
                    <IconButton
                      onClick={() => eliminarFoto(i)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Paper>
                ))}
              </Box>
            )}

            {fotos.length > 0 && (
              <CustomButton
                label="Subir fotos"
                width="100%"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
              />
            )}
          </Box>
        );

      case "audio":
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Grabar audio para {tipoDoc}</Typography>
            <IconButton
              onClick={grabando ? stopRecording : startRecording}
              color={grabando ? "error" : "primary"}
              sx={{ mb: 2 }}
            >
              {grabando ? <Close /> : <Mic />}
            </IconButton>

            {/* Canvas siempre montado */}
            <canvas
              ref={canvasRef}
              width={600}
              height={100}
              style={{
                display: grabando ? "block" : "none",
                width: "100%",
                border: "1px solid #444",
                borderRadius: 8,
                background: "#000",
              }}
            />

            {/* Player cuando termina */}
            {audioUrl && !grabando && (
              <Paper
                elevation={2}
                sx={{
                  mt: 2,
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2">Grabación lista</Typography>
                <audio controls src={audioUrl} />
              </Paper>
            )}

            {audioUrl && (
              <CustomButton
                label="Enviar audio"
                width="100%"
                sx={{ mt: 2 }}
                onClick={handleSubmit}
              />
            )}
          </Box>
        );

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
      <Grid container spacing={2}>
        <FormGrid item xs={12}>
          <InputLabel id="tipo-doc" required>
            Seleccioná un documento
          </InputLabel>
          <Select
            labelId="tipo-doc"
            id="tipo-doc"
            value={tipoDoc}
            onChange={(e) => setTipoDoc(e.target.value)}
            displayEmpty
            size="small"
            input={<OutlinedInput />}
          >
            <MenuItem value="" disabled>
              Elegí tipo de documento
            </MenuItem>
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
