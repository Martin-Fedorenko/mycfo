import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";

import DropzoneUploader from "./../../shared-components/DropzoneUploader";
import CustomButton from "./../../shared-components/CustomButton";

export default function CargaDocumento() {
  const [file, setFile] = React.useState(null);
  const [error, setError] = React.useState(false);

  const handleFileSelected = (archivo) => {
    setFile(archivo);
    setError(false);
    console.log("Archivo recibido:", archivo);
  };

  const handleUpload = () => {
    if (!file) {
      setError(true);
      return;
    }

    console.log("Subiendo archivo:", file);
    // Aquí va la lógica de subida al backend
  };

  return (
    <Box
      sx={{
        p: 4,
        mx: "auto",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
     
      }}
    >
      <Typography variant="h5" gutterBottom>
        Carga de documento
      </Typography>

      {/* Área de dropzone reutilizable */}
      
      <DropzoneUploader
        onFileSelected={handleFileSelected}
        width="100%"
        height={120}
      />
      

      {/* Botón reutilizable */}
      <CustomButton
        text="Subir documento"
        width="100%"
        sx={{ mt: 3 }}
        onClick={handleUpload}
        color={error ? "error" : "primary"}
      />

      {error && (
        <FormHelperText error sx={{ mt: 1, textAlign: "center" }}>
          Por favor seleccioná un archivo válido antes de subir.
        </FormHelperText>
      )}
    </Box>
  );
}
