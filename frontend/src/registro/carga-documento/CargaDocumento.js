import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  InputLabel,
  Paper
} from '@mui/material';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

export default function CargaDocumento(props) {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    // Aquí iría la lógica para subir el archivo al servidor
    console.log("Archivo a subir:", file);
  };

  return (
      <Box elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Carga de documento
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <InputLabel htmlFor="upload-file">Seleccionar archivo</InputLabel>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFileRoundedIcon />}
          >
            Elegir archivo
            <input
              hidden
              id="upload-file"
              type="file"
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <Typography variant="body2" color="text.secondary">
              Archivo seleccionado: {file.name}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={!file}
          >
            Subir documento
          </Button>
        </Box>
      </Box>
  );
}
