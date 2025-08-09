import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import CamposRequeridos from "./components/CamposRequeridos";
import ResumenCarga from "./components/ResumenCarga";
import TablaErrores from "./components/TablaErrores";
import DropzoneUploader from "./../../shared-components/DropzoneUploader";
import CustomButton from "./../../shared-components/CustomButton";
import axios from "axios";

export default function CargaMovimientos(props) {
  const [resumen, setResumen] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [tipoOrigen, setTipoOrigen] = React.useState("");

  const handleFileSelected = (archivo) => {
    setFile(archivo);
    console.log("Archivo recibido:", archivo);
  };

  const procesarArchivo = async () => {
    if (!file || !tipoOrigen) {
      console.warn("Debe seleccionar un tipo de archivo y subir un archivo");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file); // nombre del campo que espera el backend
      formData.append("tipoOrigen", tipoOrigen);

      const response = await axios.post(
        `${process.env.REACT_APP_URL_CONSOLIDACION}/api/importar-excel`, // <-- endpoint del back
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      //Suponiendo que el back devuelve { totalRegistros, registrosExitosos, errores }
      setResumen(response.data);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      alert("Ocurrió un error al procesar el archivo. Revisar consola.");
    }
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, mx: "auto" }}
    >
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Carga Excel
      </Typography>

      <CamposRequeridos />

      {/* Desplegable para tipo de archivo */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="tipo-origen-label">Tipo de archivo</InputLabel>
        <Select
          labelId="tipo-origen-label"
          id="tipo-origen"
          value={tipoOrigen}
          label="Tipo de archivo"
          onChange={(e) => setTipoOrigen(e.target.value)}
        >
          <MenuItem value="">Seleccione una opción</MenuItem>
          <MenuItem value="mycfo">MyCFO (plantilla genérica)</MenuItem>
          <MenuItem value="mercado-pago">Mercado Pago</MenuItem>
          <MenuItem value="santander">Banco Santander</MenuItem>
        </Select>
      </FormControl>

      {/* Área Drag and Drop solo si hay tipo seleccionado */}
      {tipoOrigen && (
        <>
          <DropzoneUploader
            onFileSelected={handleFileSelected}
            width="100%"
            height={120}
          />

          <CustomButton width="100%" onClick={procesarArchivo} sx={{ mt: 2 }} />
        </>
      )}

      {resumen && (
        <Box mt={4}>
          <ResumenCarga resumen={resumen} />
          {resumen.errores?.length > 0 && (
            <TablaErrores errores={resumen.errores} />
          )}
        </Box>
      )}
    </Box>
  );
}
