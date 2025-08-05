import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
  useTheme,
  FormHelperText,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function CargaDocumento() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(false);
  const theme = useTheme();

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(false);
      }
    },
    [setFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
      "application/vnd.ms-excel": [],
    },
  });

  const handleRemove = () => {
    setFile(null);
    setError(false);
  };

  const handleUpload = () => {
    if (!file) {
      setError(true);
      return;
    }
    console.log("Archivo a subir:", file);
    // Aquí agregar lógica de subida
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError(false);
    } else {
      setFile(null);
      setError(true);
    }
  };

  return (
    <Box
      sx={{
        p: 4,
        mx: "auto",
        mt: 8,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "900px",
      }}
    >
      <Typography variant="h5" gutterBottom>
        Carga de documento
      </Typography>

      <Paper
        variant="outlined"
        {...getRootProps()}
        sx={{
          width: "100%",
          height: 450,
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.400",
          bgcolor: isDragActive ? "grey.100" : "inherit",
          cursor: "pointer",
          ...(theme.palette.mode === "dark" && {
            borderColor: isDragActive ? "primary.light" : "grey.700",
            bgcolor: isDragActive ? "grey.900" : "inherit",
          }),
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 60, mb: 1 }} color="action" />
        {isDragActive ? (
          <Typography variant="body1">Suelta el archivo aquí...</Typography>
        ) : (
          <Typography variant="body1">
            Arrastra y suelta un archivo aquí o haz clic para seleccionarlo
          </Typography>
        )}
      </Paper>

      {file && (
        <Box
          sx={{
            mt: 2,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.5,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 1,
            ...(theme.palette.mode === "dark" && {
              borderColor: "grey.700",
            }),
          }}
        >
          <Typography variant="body2">{file.name}</Typography>
          <IconButton onClick={handleRemove} size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      )}

      <Button
        component="label"
        variant="contained"
        startIcon={<CloudUploadIcon />}
        color={error ? "error" : "primary"}
        sx={{
          mt: 3,
          width: "100%",
          height: 60,
          fontSize: "1rem",
          textTransform: "none",
          color: theme.palette.mode === "dark" ? "#fff" : "#000",
          "&.Mui-disabled": {
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
            opacity: 0.5,
            backgroundColor:
              (theme.vars || theme).palette.action.disabledBackground || "inherit",
          },
        }}
        disabled={!file}
        onClick={(e) => {
          e.preventDefault();
          handleUpload();
        }}
      >
        Subir documento
        <VisuallyHiddenInput
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />
      </Button>

      {error && (
        <FormHelperText error sx={{ mt: 1, width: "100%", textAlign: "center" }}>
          Por favor seleccioná un archivo válido antes de subir.
        </FormHelperText>
      )}
    </Box>
  );
}
