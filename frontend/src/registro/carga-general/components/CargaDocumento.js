import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import DropzoneUploader from "../../../shared-components/DropzoneUploader";
import CustomButton from "../../../shared-components/CustomButton";
import axios from "axios";

export default function CargaDocumento({ tipoDoc, endpointMap }) {
  const [archivo, setArchivo] = useState(null);

  const handleSubmit = async () => {
    if (!archivo) return;
    const endpoint = endpointMap[tipoDoc].documento;
    try {
      const fd = new FormData();
      fd.append("file", archivo);
      await axios.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ Documento enviado!");
    } catch (err) {
      console.error("❌ Error en envío:", err);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6">Subir documento para {tipoDoc}</Typography>
      <DropzoneUploader
        onFileSelected={setArchivo}
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
}
