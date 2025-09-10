import React, { useState } from "react";
import { Box, Typography, Paper, IconButton } from "@mui/material";
import { Mic, Close, Delete } from "@mui/icons-material";
import CustomButton from "../../../shared-components/CustomButton";
import axios from "axios";
import { styled, keyframes } from "@mui/material/styles";

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 239, 0.6); }
  50% { box-shadow: 0 0 0 20px rgba(76, 175, 239, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 239, 0); }
`;

const BigRecordButton = styled(IconButton)(({ theme, recording }) => ({
  width: 100, height: 100, borderRadius: "50%", color: "#fff",
  backgroundColor: recording ? theme.palette.error.main : theme.palette.primary.main,
  ...(recording && { animation: `${pulse} 1.5s infinite` }),
}));

export default function CargaAudio({ tipoDoc, endpoint }) {
  const [grabando, setGrabando] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      setAudioFile(new File([blob], "grabacion.webm", { type: "audio/webm" }));
      stream.getTracks().forEach((t) => t.stop());
    };

    setMediaRecorder(recorder);
    recorder.start();
    setGrabando(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setGrabando(false);
  };

  const eliminarGrabacion = () => {
    setAudioUrl(null);
    setAudioFile(null);
  };

  const handleSubmit = async () => {
    if (!audioFile) return;
    const fd = new FormData();
    fd.append("file", audioFile);

    try {
      await axios.post(endpoint, fd, { headers: { "Content-Type": "multipart/form-data" } });
      alert("✅ Audio enviado!");
      eliminarGrabacion();
    } catch (err) {
      console.error("❌ Error en envío:", err);
    }
  };

  return (
    <Box sx={{ mt: 3, textAlign: "center" }}>
      <Typography variant="h6">Grabar audio para {tipoDoc}</Typography>
      <BigRecordButton sx={{mt: 5}} recording={grabando ? 1 : 0} onClick={grabando ? stopRecording : startRecording}>
        {grabando ? <Close /> : <Mic />}
      </BigRecordButton>

      {audioUrl && (
        <>
          <Paper sx={{ 
                mt: 1,
                p: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid",
                borderColor: "grey.400",
                borderRadius: 1,
              }}>
            <audio controls src={audioUrl} />
            <IconButton onClick={eliminarGrabacion} color="error"><Delete /></IconButton>
          </Paper>
          <CustomButton label="Enviar audio" width="100%" sx={{ mt: 2 }} onClick={handleSubmit} />
        </>
      )}
    </Box>
  );
}
