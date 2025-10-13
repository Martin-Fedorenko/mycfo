import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import MovimientoCard from "./components/MovimientoCard";
import DocumentoCard from "./components/DocumentoCard";
import conciliacionApi from "./api/conciliacionApi";

export default function ConciliacionPanel() {
  const [movimientos, setMovimientos] = useState([]);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSugerencias, setLoadingSugerencias] = useState(false);
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState("sin-conciliar"); // 'todos', 'sin-conciliar', 'conciliados'
  const [filtroTipo, setFiltroTipo] = useState("todos"); // 'todos', 'Ingreso', 'Egreso'
  const [filtroBusqueda, setFiltroBusqueda] = useState("");

  const cargarMovimientos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (filtroEstado === "sin-conciliar") {
        data = await conciliacionApi.obtenerMovimientosSinConciliar();
      } else {
        data = await conciliacionApi.obtenerTodosLosMovimientos();
      }
      setMovimientos(data);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
      setError("Error al cargar los movimientos");
    } finally {
      setLoading(false);
    }
  }, [filtroEstado]);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const stats = await conciliacionApi.obtenerEstadisticas();
      setEstadisticas(stats);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  }, []);

  const cargarDatos = useCallback(async () => {
    await Promise.all([cargarMovimientos(), cargarEstadisticas()]);
  }, [cargarMovimientos, cargarEstadisticas]);

  // Cargar movimientos y estadísticas al montar el componente
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Recargar cuando cambia el filtro de estado
  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const cargarSugerencias = async (movimientoId) => {
    setLoadingSugerencias(true);
    try {
      const response = await conciliacionApi.obtenerSugerencias(movimientoId);
      setSugerencias(response.sugerencias || []);
    } catch (err) {
      console.error("Error cargando sugerencias:", err);
      setSugerencias([]);
    } finally {
      setLoadingSugerencias(false);
    }
  };

  const handleSeleccionarMovimiento = (movimiento) => {
    setMovimientoSeleccionado(movimiento);
    if (!movimiento.conciliado) {
      cargarSugerencias(movimiento.id);
    } else {
      setSugerencias([]);
    }
  };

  const handleVincular = async (documentoId) => {
    if (!movimientoSeleccionado) return;

    try {
      await conciliacionApi.vincularMovimiento(
        movimientoSeleccionado.id,
        documentoId
      );

      // Recargar datos
      await cargarDatos();

      // Actualizar el movimiento seleccionado
      const movimientoActualizado = movimientos.find(
        (m) => m.id === movimientoSeleccionado.id
      );
      if (movimientoActualizado) {
        setMovimientoSeleccionado({
          ...movimientoActualizado,
          conciliado: true,
        });
      }

      // Limpiar sugerencias
      setSugerencias([]);

      // Deseleccionar movimiento
      setMovimientoSeleccionado(null);
    } catch (err) {
      console.error("Error vinculando movimiento:", err);
      alert("Error al vincular el movimiento");
    }
  };

  const handleDesvincular = async (movimientoId) => {
    try {
      await conciliacionApi.desvincularMovimiento(movimientoId);

      // Recargar datos
      await cargarDatos();

      // Si es el movimiento seleccionado, actualizarlo
      if (movimientoSeleccionado?.id === movimientoId) {
        setMovimientoSeleccionado(null);
        setSugerencias([]);
      }
    } catch (err) {
      console.error("Error desvinculando movimiento:", err);
      alert("Error al desvincular el movimiento");
    }
  };

  // Filtrar movimientos
  const movimientosFiltrados = movimientos.filter((mov) => {
    // Filtro de estado
    if (filtroEstado === "sin-conciliar" && mov.conciliado) return false;
    if (filtroEstado === "conciliados" && !mov.conciliado) return false;

    // Filtro de tipo
    if (filtroTipo !== "todos" && mov.tipo !== filtroTipo) return false;

    // Filtro de búsqueda
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase();
      const descripcion = (mov.descripcion || "").toLowerCase();
      const origen = (mov.origen || "").toLowerCase();
      const destino = (mov.destino || "").toLowerCase();
      const categoria = (mov.categoria || "").toLowerCase();

      if (
        !descripcion.includes(busqueda) &&
        !origen.includes(busqueda) &&
        !destino.includes(busqueda) &&
        !categoria.includes(busqueda)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <Box
      sx={{
        p: 3,
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: "#1976d2" }}
        >
          Conciliación de Movimientos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vincula tus movimientos bancarios con documentos comerciales
        </Typography>
      </Box>

      {/* Estadísticas */}
      {estadisticas && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f5f5f5" }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Total de movimientos
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {estadisticas.total}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Sin conciliar
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#ff9800" }}
              >
                {estadisticas.sinConciliar}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Conciliados
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#4caf50" }}
              >
                {estadisticas.conciliados}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Progreso
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={estadisticas.porcentajeConciliado}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {Math.round(estadisticas.porcentajeConciliado)}%
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ flexWrap: "wrap", gap: 2 }}
        >
          {/* Filtro de estado */}
          <ToggleButtonGroup
            value={filtroEstado}
            exclusive
            onChange={(e, value) => value && setFiltroEstado(value)}
            size="small"
          >
            <ToggleButton value="sin-conciliar">
              <PendingIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Sin conciliar
            </ToggleButton>
            <ToggleButton value="conciliados">
              <CheckCircleIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Conciliados
            </ToggleButton>
            <ToggleButton value="todos">Todos</ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem />

          {/* Filtro de tipo */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="Ingreso">Ingreso</MenuItem>
              <MenuItem value="Egreso">Egreso</MenuItem>
            </Select>
          </FormControl>

          {/* Búsqueda */}
          <TextField
            size="small"
            placeholder="Buscar..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />

          {/* Botón recargar */}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarDatos}
            size="small"
          >
            Recargar
          </Button>
        </Stack>

        {/* Contador de resultados */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Mostrando {movimientosFiltrados.length} de {movimientos.length}{" "}
            movimientos
          </Typography>
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Panel de dos columnas */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          {/* Columna izquierda: Movimientos */}
          <Grid item xs={12} md={6} sx={{ height: "100%" }}>
            <Paper
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Movimientos
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : movimientosFiltrados.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay movimientos que coincidan con los filtros
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
                  {movimientosFiltrados.map((mov) => (
                    <MovimientoCard
                      key={mov.id}
                      movimiento={mov}
                      selected={movimientoSeleccionado?.id === mov.id}
                      onClick={() => handleSeleccionarMovimiento(mov)}
                      onDesvincular={handleDesvincular}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Columna derecha: Sugerencias */}
          <Grid item xs={12} md={6} sx={{ height: "100%" }}>
            <Paper
              sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                💡 Documentos Sugeridos
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {!movimientoSeleccionado ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Selecciona un movimiento de la izquierda para ver
                    sugerencias de documentos
                  </Typography>
                </Box>
              ) : movimientoSeleccionado.conciliado ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 64, color: "#4caf50", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Movimiento ya conciliado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Este movimiento ya está vinculado con{" "}
                    <strong>
                      {movimientoSeleccionado.tipoDocumentoConciliado}{" "}
                      {movimientoSeleccionado.numeroDocumentoConciliado}
                    </strong>
                  </Typography>
                </Box>
              ) : loadingSugerencias ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : sugerencias.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No se encontraron documentos sugeridos para este movimiento
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Puedes buscar manualmente un documento o crear uno nuevo
                  </Typography>
                </Box>
              ) : (
                <>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Se encontraron <strong>{sugerencias.length}</strong>{" "}
                    documento(s) que podrían corresponder a este movimiento
                  </Alert>
                  <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
                    {sugerencias.map((doc) => (
                      <DocumentoCard
                        key={doc.idDocumento}
                        documento={doc}
                        onVincular={handleVincular}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
