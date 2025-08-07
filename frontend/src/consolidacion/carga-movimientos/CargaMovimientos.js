import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import CamposRequeridos from "./components/CamposRequeridos";
import ResumenCarga from "./components/ResumenCarga";
import TablaErrores from "./components/TablaErrores";
import DropzoneUploader from "./../../shared-components/DropzoneUploader";
import CustomButton from "./../../shared-components/CustomButton";

export default function CargaMovimientos(props) {
  const [resumen, setResumen] = React.useState(null);
  const [file, setFile] = React.useState(null);

  const handleFileSelected = (archivo) => {
    setFile(archivo);
    console.log("Archivo recibido:", archivo);
    // No se hace nada todavía, solo se guarda el archivo
  };

  const procesarArchivo = () => {
    if (!file) {
      console.warn("No hay archivo cargado");
      return;
    }

    console.log("Procesando archivo:", file);

    // Simulación de procesamiento
    const resumenSimulado = {
      totalRegistros: 100,
      registrosExitosos: 90,
      errores: [
        { fila: 5, mensaje: "Formato inválido en columna 'Monto'" },
        { fila: 12, mensaje: "Campo obligatorio 'Tipo' vacío" }
      ]
    };

    setResumen(resumenSimulado);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, mx: "auto" }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Carga Excel
      </Typography>

      <CamposRequeridos />

      {/* Área Drag and Drop con ancho completo */}
      <DropzoneUploader
        onFileSelected={handleFileSelected}
        width="100%"
        height={120}
      />

      {/* Botón para procesar el archivo */}
      <CustomButton
        width="100%"
        onClick={procesarArchivo}
      />

      {resumen && (
        <Box mt={4}> {/* margen superior para separar del botón */}
          <ResumenCarga resumen={resumen} />
          {resumen.errores?.length > 0 && (
            <TablaErrores errores={resumen.errores} />
          )}
        </Box>
      )}

    </Box>
  );
}
