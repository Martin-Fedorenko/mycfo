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
import ExcelPreviewDialog from "./components/ExcelPreviewDialog";
import DropzoneUploader from "./../../shared-components/DropzoneUploader";
import CustomButton from "./../../shared-components/CustomButton";
import axios from "axios";

export default function CargaMovimientos({ onCargaCompletada }) {
  const [resumen, setResumen] = React.useState(null);
  const [file, setFile] = React.useState(null);
  const [tipoOrigen, setTipoOrigen] = React.useState("");
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewData, setPreviewData] = React.useState([]);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState("");

  const handleFileSelected = (archivo) => {
    setFile(archivo);
    setFileName(archivo.name);
    console.log("Archivo recibido:", archivo);
  };

  const procesarArchivo = async () => {
    if (!file || !tipoOrigen) {
      console.warn("Debe seleccionar un tipo de archivo y subir un archivo");
      return;
    }

    setPreviewLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipoOrigen", tipoOrigen);

      const response = await axios.post(
        `${process.env.REACT_APP_URL_REGISTRO}/api/preview-excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPreviewData(response.data.registros || []);
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      alert("Ocurrió un error al procesar el archivo. Revisar consola.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleImportSelected = async (selectedRegistros) => {
    try {
      const requestData = {
        registrosSeleccionados: selectedRegistros,
        fileName: fileName,
        tipoOrigen: tipoOrigen,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_URL_REGISTRO}/api/guardar-seleccionados`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": "00000000-0000-0000-0000-000000000001", // TODO: obtener del contexto de usuario
          },
        }
      );

      setResumen(response.data);
      setPreviewOpen(false);
      setFile(null);
      setFileName("");

      // Notificar que la carga se completó
      onCargaCompletada?.();
    } catch (error) {
      console.error("Error al guardar los registros:", error);
      alert("Ocurrió un error al guardar los registros. Revisar consola.");
    }
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" }, mx: "auto" }}
    >
      <Typography component="h2" variant="h6" sx={{ mb: 3 }}>
        Carga Excel
      </Typography>
      <CamposRequeridos sx={{ mb: 4 }} /> {/* margen debajo del ejemplo */}
      {/* Desplegable para tipo de archivo */}
      <FormControl fullWidth sx={{ mb: 4 }}>
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
            sx={{ mb: 3 }}
          />

          <CustomButton
            width="100%"
            onClick={procesarArchivo}
            sx={{ mt: 1, mb: 4 }}
            disabled={previewLoading}
          >
            {previewLoading ? "Procesando..." : "Vista Previa"}
          </CustomButton>
        </>
      )}
      {resumen && (
        <Box mt={4} mb={4}>
          {" "}
          {/* <-- agrega mb aquí para separar de FormControl */}
          <ResumenCarga resumen={resumen} sx={{ mb: 3 }} />
          {resumen.errores?.length > 0 && (
            <TablaErrores errores={resumen.errores} />
          )}
        </Box>
      )}
      <ExcelPreviewDialog
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewData([]);
        }}
        previewData={previewData}
        loading={previewLoading}
        onImportSelected={handleImportSelected}
        fileName={fileName}
        tipoOrigen={tipoOrigen}
      />
    </Box>
  );
}
