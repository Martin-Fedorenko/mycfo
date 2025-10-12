import React from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import UploadIcon from "@mui/icons-material/Upload";
import CargaMovimientos from "./CargaMovimientos";
import ExcelHistoryTable from "./components/ExcelHistoryTable";
import axios from "axios";

export default function ExcelManagement() {
  const [activeTab, setActiveTab] = React.useState(0);
  const [historialData, setHistorialData] = React.useState([]);
  const [historialLoading, setHistorialLoading] = React.useState(false);
  const [historialPage, setHistorialPage] = React.useState(0);
  const [historialPageSize, setHistorialPageSize] = React.useState(20);

  const loadHistorial = async () => {
    setHistorialLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_URL_REGISTRO}/api/historial-cargas`,
        {
          headers: {
            "X-User-ID": "00000000-0000-0000-0000-000000000001", // TODO: obtener del contexto de usuario
          },
        }
      );
      setHistorialData(response.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setHistorialLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 1) {
      loadHistorial();
    }
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCargaCompletada = () => {
    // Recargar historial cuando se complete una carga
    if (activeTab === 1) {
      loadHistorial();
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 3, px: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          borderRadius: 2,
          p: 1,
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "background.default"
              : "background.paper",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              icon={<UploadIcon />}
              label="Cargar Excel"
              iconPosition="start"
            />
            <Tab
              icon={<HistoryIcon />}
              label="Historial de Cargas"
              iconPosition="start"
            />
          </Tabs>
        </Box>
      </Paper>

      {activeTab === 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
          <CargaMovimientos onCargaCompletada={handleCargaCompletada} />
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Typography variant="h6">Historial de Cargas Excel</Typography>
              <Button
                variant="outlined"
                onClick={loadHistorial}
                disabled={historialLoading}
              >
                Actualizar
              </Button>
            </Stack>

            {historialData.length === 0 && !historialLoading && (
              <Alert severity="info">
                No hay historial de cargas disponible.
              </Alert>
            )}

            <ExcelHistoryTable
              rows={historialData}
              loading={historialLoading}
              page={historialPage}
              pageSize={historialPageSize}
              total={historialData.length}
              onPageChange={setHistorialPage}
              onPageSizeChange={(newSize) => {
                setHistorialPageSize(newSize);
                setHistorialPage(0);
              }}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
}
