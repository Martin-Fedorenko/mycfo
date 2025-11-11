import React, { useState, Suspense } from "react";
import { Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import VerIngreso from "../movimientos-cargados/components/VerIngreso";
import VerEgreso from "../movimientos-cargados/components/VerEgreso";
import VerDeuda from "../movimientos-cargados/components/VerDeuda";
import VerAcreencia from "../movimientos-cargados/components/VerAcreencia";

// Lazy loading para componentes pesados
const CargaFormulario = React.lazy(() => import("./components/CargaFormulario"));
const CargaDocumento = React.lazy(() => import("./components/CargaDocumento"));
const CargaImagen = React.lazy(() => import("./components/CargaImagen"));
const CargaAudio = React.lazy(() => import("./components/CargaAudio"));

export default function CargaVistaFinal() {
  const { tipo, modo } = useParams();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);
  const [dialogEndpoint, setDialogEndpoint] = useState("");

  const API_BASE = process.env.REACT_APP_URL_REGISTRO;

  const endpointMap = {
    factura: {
      formulario: `${API_BASE}/api/carga-datos`,
      documento: `${API_BASE}/facturas/documento`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/facturas/audio`,
    },
    movimiento: {
      formulario: `${API_BASE}/api/carga-datos`,
      documento: `${API_BASE}/movimientos/documento`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/movimientos/audio`,
    },
    ingreso: {
      formulario: `${API_BASE}/api/carga-datos`,
      documento: `${API_BASE}/movimientos/ingreso/documento`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/movimientos/audio`,
    },
    egreso: {
      formulario: `${API_BASE}/api/carga-datos`,
      documento: `${API_BASE}/movimientos/egreso/documento`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/movimientos/audio`,
    },
    deuda: {
      formulario: `${API_BASE}/api/carga-datos`,
      documento: `${API_BASE}/movimientos/deuda/documento`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/movimientos/audio`,
    },
    acreencia: {
      formulario: `${API_BASE}/api/carga-datos`,
      documento: `${API_BASE}/movimientos/acreencia/documento`,
      foto: `${API_BASE}/api/carga-datos`,
      audio: `${API_BASE}/api/carga-datos/movimientos/audio`,
    },
  };

  const endpoint = endpointMap[tipo]?.[modo];

  const prepararVistaPrevia = (datos) => {
    if (!datos) return null;
    const normalizarMonto = (valor) => {
      if (valor === null || valor === undefined || valor === "") return "";
      const numero = Number(String(valor).replace(",", "."));
      return Number.isNaN(numero) ? valor : numero;
    };
    const fecha = datos.fechaEmision
      ? dayjs(datos.fechaEmision).format("YYYY-MM-DD")
      : "";
    return {
      ...datos,
      montoTotal: normalizarMonto(datos.montoTotal),
      fechaEmision: fecha,
    };
  };

  const renderVistaPrevia = () => {
    if (!dialogData) return null;
    switch (tipo) {
      case "ingreso":
        return <VerIngreso movimiento={dialogData} />;
      case "egreso":
        return <VerEgreso movimiento={dialogData} />;
      case "deuda":
        return <VerDeuda movimiento={dialogData} />;
      case "acreencia":
        return <VerAcreencia movimiento={dialogData} />;
      default:
        return null;
    }
  };

  const handleResultadoAudio = (respuesta) => {
    if (!respuesta) return;
    console.group("Resultado de audio");
    console.log("Payload recibido:", respuesta);
    const campos = respuesta.campos || {};
    const normalizados = {};
    Object.entries(campos).forEach(([clave, valor]) => {
      if (!valor) return;
      if (clave === "fechaEmision") {
        const fecha = dayjs(valor);
        if (fecha.isValid()) {
          normalizados[clave] = fecha;
        }
      } else {
        normalizados[clave] = valor;
      }
    });
    normalizados.moneda = "ARS";
    const merged = { ...formData, ...normalizados };
    setFormData(merged);
    setErrors({});

    const transcript =
      respuesta.transcript ||
      respuesta.texto ||
      respuesta.text ||
      respuesta.rawTranscript ||
      "";
    if (transcript) {
      console.info("Transcripción de audio:", transcript);
    } else {
      console.warn("No se recibió texto transcripto en la respuesta.");
    }

    const camposLog = Object.keys(normalizados).length ? normalizados : campos;
    const camposDetectados =
      camposLog &&
      Object.entries(camposLog).some(([campo, valor]) => {
        if (!campo) return false;
        if (campo.toLowerCase() === "moneda") return false;
        if (valor === null || valor === undefined) return false;
        return String(valor).trim() !== "";
      });

    if (!camposDetectados) {
      console.warn("Autocompletado por audio: no se detectaron campos para completar.");
      alert("No se detectaron datos válidos en el audio. Grabá un nuevo audio con más detalle.");
      setDialogData(null);
      setFormDialogOpen(false);
      console.groupEnd();
      return;
    }

    console.table(
      Object.entries(camposLog).map(([campo, valor]) => ({
        campo,
        valor,
      }))
    );
    console.groupEnd();

    const vistaPrevia = prepararVistaPrevia(merged);
    setDialogData(vistaPrevia);
    setDialogEndpoint(endpointMap[tipo]?.formulario || "");
    setFormDialogOpen(true);
  };

  const renderContenido = () => {
    const LoadingFallback = () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );

    switch (modo) {
      case "formulario":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaFormulario
              tipoDoc={tipo}
              endpoint={endpoint}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              setErrors={setErrors}
            />
          </Suspense>
        );
      case "documento":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaDocumento tipoDoc={tipo} endpoint={endpoint} />
          </Suspense>
        );
      case "foto":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaImagen tipoDoc={tipo} endpoint={endpoint} />
          </Suspense>
        );
      case "audio":
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CargaAudio
              tipoDoc={tipo}
              endpoint={endpoint}
              onResultado={handleResultadoAudio}
            />
          </Suspense>
        );
      default:
        return <Typography>No se encontró vista</Typography>;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        mt: 8,
        p: 3,

      }}
    >
    <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Carga de {tipo} por {modo}
    </Typography>

    <Typography variant="subtitle1" sx={{ mb: 4, textAlign: "center" }}>
        Elegí cómo querés cargar tu {tipo}
    </Typography>

      {renderContenido()}
      <Dialog
        open={formDialogOpen && !!dialogData}
        onClose={() => {
          setFormDialogOpen(false);
          setDialogData(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Revisá y completá la información detectada
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {dialogData && (
            <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}>
              <CargaFormulario
                tipoDoc={tipo}
                endpoint={dialogEndpoint}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                setErrors={setErrors}
              />
            </Suspense>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setFormDialogOpen(false);
              setDialogData(null);
            }}
            variant="outlined"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
