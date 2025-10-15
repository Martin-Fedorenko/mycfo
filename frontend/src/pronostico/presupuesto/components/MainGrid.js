import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Menu,
  Tooltip,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import http from "../../../api/http";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import MoreVertIcon from "@mui/icons-material/MoreVert";
const tableRowStyle = {
  backgroundColor: "rgba(255, 255, 255, 0.02)",
  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
};
const tableCellStyle = { border: "1px solid rgba(255, 255, 255, 0.1)" };
const getColumnWidth = (statusFilter) => ({
  nombre: { width: statusFilter === "deleted" ? "20%" : "25%" },
  desde: { width: statusFilter === "deleted" ? "20%" : "25%" },
  hasta: { width: statusFilter === "deleted" ? "20%" : "25%" },
  eliminado: { width: "20%" },
  acciones: { width: statusFilter === "deleted" ? "20%" : "25%" },
});
const monthLabels = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const pad2 = (value) => String(value).padStart(2, "0");
const lastDayOfMonth = (year, month) => new Date(year, month, 0).getDate();
const parseRetentionDays = () => {
  const raw = process.env.REACT_APP_PRESUPUESTO_RETENTION_DAYS;
  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 90;
  }
  return parsed;
};
const formatDeletedAt = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }
  return date.toLocaleString("es-AR", { hour12: false });
};
const PAGE_SIZE = 3;
const DEFAULT_SORT = "createdAt,desc";
const createEmptyPage = () => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: PAGE_SIZE,
});
export default function MainGrid() {
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_URL_PRONOSTICO || "";
  const retentionDays = React.useMemo(() => parseRetentionDays(), []);
  const [statusFilter, setStatusFilter] = React.useState("active");
  const [pageIndex, setPageIndex] = React.useState(0);
  const [presupuestosPage, setPresupuestosPage] =
    React.useState(createEmptyPage);
  const [hasActiveSearch, setHasActiveSearch] = React.useState(false);
  const [searchPage, setSearchPage] = React.useState(null);
  const [searchPageIndex, setSearchPageIndex] = React.useState(0);
  const [query, setQuery] = React.useState("");
  const [filters, setFilters] = React.useState({
    year: "",
    fromMonth: "",
    toMonth: "",
  });
  const [searchError, setSearchError] = React.useState("");
  const [listError, setListError] = React.useState("");
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [loadingAll, setLoadingAll] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState({
    open: false,
    presupuesto: null,
  });
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    action: null,
  });
  const [menuState, setMenuState] = React.useState({
    anchorEl: null,
    presupuesto: null,
  });
  const [yearOptions, setYearOptions] = React.useState(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1];
  });
  const searchParamsRef = React.useRef("");
  const lastDeletedRef = React.useRef(null);
  const monthName = React.useCallback((ym) => {
    if (!ym) return "";
    const [anio, mes] = ym.split("-");
    const idx = Number(mes) - 1;
    return idx >= 0 && idx < monthLabels.length
      ? `${monthLabels[idx]} ${anio}`
      : ym;
  }, []);
  const mergeYearOptions = React.useCallback((items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }
    setYearOptions((prev) => {
      const next = new Set(prev);
      items.forEach((item) => {
        const desdeYear = Number(item?.desde?.split("-")[0]);
        const hastaYear = Number(item?.hasta?.split("-")[0]);
        if (!Number.isNaN(desdeYear)) {
          next.add(desdeYear);
        }
        if (!Number.isNaN(hastaYear)) {
          next.add(hastaYear);
        }
      });
      return Array.from(next).sort((a, b) => a - b);
    });
  }, []);
  const normalizePage = React.useCallback((data) => {
    if (!data || typeof data !== "object") {
      return createEmptyPage();
    }
    const content = Array.isArray(data.content) ? data.content : [];
    const totalElementsRaw = Number(data.totalElements);
    const totalPagesRaw = Number(data.totalPages);
    const numberRaw = Number(data.number);
    const sizeRaw = Number(data.size);
    return {
      content,
      totalElements: Number.isFinite(totalElementsRaw)
        ? totalElementsRaw
        : content.length,
      totalPages: Number.isFinite(totalPagesRaw)
        ? totalPagesRaw
        : content.length > 0
          ? 1
          : 0,
      number: Number.isFinite(numberRaw) ? numberRaw : 0,
      size: Number.isFinite(sizeRaw) && sizeRaw > 0 ? sizeRaw : PAGE_SIZE,
    };
  }, []);
  const fetchPresupuestos = React.useCallback(
    async (statusValue, pageValue) => {
      setLoadingAll(true);
      try {
        const trimmedQuery = query.trim();
        const shouldExpand = trimmedQuery.length >= 2;
        const effectivePage = shouldExpand ? 0 : Math.max(pageValue, 0);
        const effectiveSize = shouldExpand ? 1000 : PAGE_SIZE;
        const params = new URLSearchParams();
        params.set("status", statusValue);
        params.set("page", String(effectivePage));
        params.set("size", String(effectiveSize));
        params.set("sort", DEFAULT_SORT);
        const res = await http.get(
          `${baseURL}/api/presupuestos?${params.toString()}`,
        );
        const pageData = normalizePage(res.data);
        if (
          !shouldExpand &&
          pageValue > 0 &&
          pageData.totalPages > 0 &&
          pageValue >= pageData.totalPages
        ) {
          setPageIndex(pageData.totalPages - 1);
          return;
        }
        setPresupuestosPage(pageData);
        mergeYearOptions(pageData.content);
        setListError("");
        if (shouldExpand && pageValue !== 0) {
          setPageIndex(0);
        }
      } catch (e) {
        console.error("Error cargando presupuestos desde el backend:", e);
        setPresupuestosPage(createEmptyPage());
        setListError(
          "No se pudo cargar la lista de presupuestos. Intenta nuevamente.",
        );
      } finally {
        setLoadingAll(false);
      }
    },
    [baseURL, mergeYearOptions, normalizePage, query],
  );
  const fetchSearchPresupuestos = React.useCallback(
    async (searchParamsString, statusValue, pageValue) => {
      setLoadingSearch(true);
      try {
        const params = new URLSearchParams(searchParamsString || "");
        params.set("status", statusValue);
        params.set("page", String(Math.max(pageValue, 0)));
        params.set("size", String(PAGE_SIZE));
        params.set("sort", DEFAULT_SORT);
        const res = await http.get(
          `${baseURL}/api/presupuestos?${params.toString()}`,
        );
        const pageData = normalizePage(res.data);
        if (
          pageValue > 0 &&
          pageData.totalPages > 0 &&
          pageValue >= pageData.totalPages
        ) {
          setSearchPageIndex(pageData.totalPages - 1);
          return;
        }
        setSearchPage(pageData);
        mergeYearOptions(pageData.content);
        setSearchError("");
      } catch (e) {
        console.error("Error cargando presupuestos desde el backend:", e);
        setSearchPage(createEmptyPage());
        setSearchError(
          "No se pudo cargar la lista filtrada. Intenta nuevamente.",
        );
      } finally {
        setLoadingSearch(false);
      }
    },
    [baseURL, mergeYearOptions, normalizePage],
  );
  React.useEffect(() => {
    fetchPresupuestos(statusFilter, pageIndex);
  }, [fetchPresupuestos, statusFilter, pageIndex]);
  const handleStatusChange = (event, newValue) => {
    if (newValue === statusFilter) return;
    setStatusFilter(newValue);
    setPageIndex(0);
    setHasActiveSearch(false);
    setSearchPage(null);
    setSearchPageIndex(0);
    setSearchError("");
    searchParamsRef.current = "";
  };
  React.useEffect(() => {
    setMenuState({ anchorEl: null, presupuesto: null });
  }, [statusFilter]);
  const openActionsMenu = (event, presupuesto) => {
    setMenuState({ anchorEl: event.currentTarget, presupuesto });
  };
  const closeActionsMenu = () => {
    setMenuState({ anchorEl: null, presupuesto: null });
  };
  const openDeleteDialog = (presupuesto) => {
    setConfirmDialog({ open: true, presupuesto });
  };
  const handleSelectDelete = () => {
    const presupuesto = menuState.presupuesto;
    closeActionsMenu();
    if (presupuesto) {
      openDeleteDialog(presupuesto);
    }
  };
  const closeDeleteDialog = () => {
    setConfirmDialog({ open: false, presupuesto: null });
  };
  const performRestore = React.useCallback(
    async (presupuesto, successMessage = "Presupuesto restaurado.") => {
      if (!presupuesto) {
        return;
      }
      try {
        await http.post(
          `${baseURL}/api/presupuestos/${presupuesto.id}/restore`,
        );
        await fetchPresupuestos(statusFilter, pageIndex);
        if (hasActiveSearch && searchParamsRef.current) {
          await fetchSearchPresupuestos(
            searchParamsRef.current,
            statusFilter,
            searchPageIndex,
          );
        }
        if (successMessage) {
          setSnackbar({ open: true, message: successMessage, action: null });
        }
        setListError("");
      } catch (e) {
        console.error("Error restaurando presupuesto:", e);
        setSnackbar({
          open: true,
          message: "No se pudo restaurar el presupuesto.",
          action: null,
        });
      }
    },
    [
      baseURL,
      fetchPresupuestos,
      fetchSearchPresupuestos,
      hasActiveSearch,
      pageIndex,
      searchPageIndex,
      statusFilter,
    ],
  );
  const handleRestore = React.useCallback(
    (presupuesto) => {
      performRestore(presupuesto, "Presupuesto restaurado.");
    },
    [performRestore],
  );
  const handleUndoDelete = React.useCallback(async () => {
    const presupuesto = lastDeletedRef.current;
    if (!presupuesto) {
      setSnackbar((prev) => ({ ...prev, open: false }));
      return;
    }
    lastDeletedRef.current = null;
    await performRestore(presupuesto, "Presupuesto restaurado.");
  }, [performRestore]);
  const handleConfirmDelete = async () => {
    const presupuesto = confirmDialog.presupuesto;
    if (!presupuesto) {
      closeDeleteDialog();
      return;
    }
    try {
      await http.delete(`${baseURL}/api/presupuestos/${presupuesto.id}`);
      lastDeletedRef.current = presupuesto;
      closeDeleteDialog();
      await fetchPresupuestos(statusFilter, pageIndex);
      if (hasActiveSearch && searchParamsRef.current) {
        await fetchSearchPresupuestos(
          searchParamsRef.current,
          statusFilter,
          searchPageIndex,
        );
      }
      setSnackbar({
        open: true,
        message: "Presupuesto eliminado.",
        action: (
          <Button
            color="secondary"
            size="small"
            onClick={() => handleUndoDelete()}
          >
            Deshacer
          </Button>
        ),
      });
      setListError("");
    } catch (e) {
      console.error("Error eliminando presupuesto:", e);
      setSnackbar({
        open: true,
        message: "No se pudo eliminar el presupuesto.",
        action: null,
      });
    }
  };
  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const monthOptions = React.useMemo(
    () =>
      monthLabels.map((label, index) => ({
        value: String(index + 1),
        label: label.charAt(0).toUpperCase() + label.slice(1),
      })),
    [],
  );
  const columnsCount = statusFilter === "deleted" ? 5 : 4;
  const mainTotalPages = Number(presupuestosPage.totalPages) || 0;
  const mainCurrentPage = mainTotalPages > 0 ? presupuestosPage.number + 1 : 1;
  const searchTotalPages = searchPage ? Number(searchPage.totalPages) || 0 : 0;
  const searchCurrentPage =
    searchTotalPages > 0 && searchPage ? searchPage.number + 1 : 1;
  const visiblePresupuestos = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    const data = Array.isArray(presupuestosPage.content)
      ? presupuestosPage.content
      : [];
    if (!term) return data;
    return data.filter((p) => {
      const nombre = (p?.nombre || "").toLowerCase();
      const desde = (p?.desde || "").toLowerCase();
      const hasta = (p?.hasta || "").toLowerCase();
      const desdeMes = monthName(p?.desde || "").toLowerCase();
      const hastaMes = monthName(p?.hasta || "").toLowerCase();
      return (
        nombre.includes(term) ||
        desde.includes(term) ||
        hasta.includes(term) ||
        desdeMes.includes(term) ||
        hastaMes.includes(term)
      );
    });
  }, [presupuestosPage.content, query, monthName]);
  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters((prev) => ({ ...prev, [field]: value }));
  };
  const handleSearch = () => {
    setSearchError("");
    const params = new URLSearchParams();
    const hasYear = Boolean(filters.year);
    const hasFrom = Boolean(filters.fromMonth);
    const hasTo = Boolean(filters.toMonth);
    if (hasFrom || hasTo) {
      if (!hasFrom || !hasTo) {
        setSearchError("Debes seleccionar ambos meses para armar el rango.");
        return;
      }
      const baseYear = hasYear
        ? Number(filters.year)
        : new Date().getFullYear();
      const fromMonth = Number(filters.fromMonth);
      const toMonth = Number(filters.toMonth);
      if (fromMonth > toMonth) {
        setSearchError("El mes Desde no puede ser posterior al mes Hasta.");
        return;
      }
      const fromDate = `${baseYear}-${pad2(fromMonth)}-01`;
      const toDateValue = `${baseYear}-${pad2(toMonth)}-${pad2(lastDayOfMonth(baseYear, toMonth))}`;
      params.set("from", fromDate);
      params.set("to", toDateValue);
    } else if (hasYear) {
      const fromDate = `${filters.year}-01-01`;
      const toDateValue = `${filters.year}-12-31`;
      params.set("year", filters.year);
    }
    const queryString = params.toString();
    if (!queryString) {
      setHasActiveSearch(false);
      setSearchPage(null);
      setSearchPageIndex(0);
      searchParamsRef.current = "";
      return;
    }
    setHasActiveSearch(true);
    setSearchPageIndex(0);
    searchParamsRef.current = queryString;
    fetchSearchPresupuestos(queryString, statusFilter, 0);
  };
  const handleReset = () => {
    setFilters({ year: "", fromMonth: "", toMonth: "" });
    setQuery("");
    setSearchError("");
    setHasActiveSearch(false);
    setSearchPage(null);
    setSearchPageIndex(0);
    searchParamsRef.current = "";
  };
  const handlePageChange = (_, value) => {
    const newPage = Number(value) - 1;
    if (Number.isNaN(newPage) || newPage < 0) {
      return;
    }
    setPageIndex(newPage);
  };
  const handleSearchPageChange = (_, value) => {
    if (!hasActiveSearch || !searchParamsRef.current) {
      return;
    }
    const newPage = Number(value) - 1;
    if (Number.isNaN(newPage) || newPage < 0) {
      return;
    }
    setSearchPageIndex(newPage);
    fetchSearchPresupuestos(searchParamsRef.current, statusFilter, newPage);
  };
  const renderRows = (items) =>
    items.map((p) => {
      const slug = encodeURIComponent(
        (p.nombre || "").trim().toLowerCase().replace(/\s+/g, "-"),
      );
      const isDeleted = statusFilter === "deleted";
      const isMenuOpenForRow =
        Boolean(menuState.anchorEl) &&
        menuState.presupuesto &&
        menuState.presupuesto.id === p.id;
      const menuId = isMenuOpenForRow ? "presupuesto-actions-menu" : undefined;
      const buttonId = `acciones-presupuesto-${p.id}`;
      return (
        <TableRow key={p.id} sx={tableRowStyle}>
          <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).nombre }}>{p.nombre}</TableCell>
          <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).desde }}>{monthName(p.desde)}</TableCell>
          <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).hasta }}>{monthName(p.hasta)}</TableCell>
          {isDeleted && (
            <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).eliminado }}>
              {formatDeletedAt(p.deletedAt)}
            </TableCell>
          )}
          <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).acciones }} align="right">
            {isDeleted ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<RestoreFromTrashIcon />}
                onClick={() => handleRestore(p)}
              >
                Restaurar
              </Button>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/presupuestos/${slug}`)}
                >
                  Ver detalle
                </Button>
                <Tooltip title="Más acciones">
                  <IconButton
                    size="small"
                    aria-label="Más acciones"
                    aria-controls={menuId}
                    aria-haspopup="true"
                    aria-expanded={isMenuOpenForRow ? "true" : undefined}
                    id={buttonId}
                    onClick={(event) => openActionsMenu(event, p)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </TableCell>
        </TableRow>
      );
    });
  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Presupuestos
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualiza tus presupuestos creados o genera uno nuevo
      </Typography>
      <Tabs value={statusFilter} onChange={handleStatusChange} sx={{ mt: 1 }}>
        <Tab value="active" label="Activos" />
        <Tab value="deleted" label="Borrados" />
      </Tabs>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 2 }}
      >
        {`Los presupuestos se purgan de forma definitiva a los ${retentionDays} días.`}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mt: 2,
          mb: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="presupuesto-year-label">Año</InputLabel>
          <Select
            labelId="presupuesto-year-label"
            value={filters.year}
            label="Año"
            onChange={handleFilterChange("year")}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {yearOptions.map((year) => (
              <MenuItem key={year} value={String(year)}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="presupuesto-from-label">Desde (mes)</InputLabel>
          <Select
            labelId="presupuesto-from-label"
            value={filters.fromMonth}
            label="Desde (mes)"
            onChange={handleFilterChange("fromMonth")}
          >
            <MenuItem value="">
              <em>Sin filtro</em>
            </MenuItem>
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="presupuesto-to-label">Hasta (mes)</InputLabel>
          <Select
            labelId="presupuesto-to-label"
            value={filters.toMonth}
            label="Hasta (mes)"
            onChange={handleFilterChange("toMonth")}
          >
            <MenuItem value="">
              <em>Sin filtro</em>
            </MenuItem>
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loadingSearch}
        >
          Buscar
        </Button>
        <Button variant="text" onClick={handleReset} disabled={loadingSearch}>
          Limpiar
        </Button>
      </Box>
      <TextField
        label="Buscar por nombre, mes o año"
        variant="outlined"
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{
          mt: 1,
          mb: 2,
          width: { xs: '100%', sm: 250 },
        }}
      />
      {searchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {searchError}
        </Alert>
      )}
      {hasActiveSearch && (
        <Paper sx={{ width: "100%", mb: 3, overflowX: "auto", p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Resultado de la busqueda
          </Typography>
          {loadingSearch ? (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={columnsCount}
                    sx={{ textAlign: "center", py: 3 }}
                  >
                    Cargando presupuestos...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : searchPage &&
            Array.isArray(searchPage.content) &&
            searchPage.content.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow sx={tableRowStyle}>
                    <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).nombre }}>Nombre</TableCell>
                    <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).desde }}>Desde</TableCell>
                    <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).hasta }}>Hasta</TableCell>
                    {statusFilter === "deleted" && (
                      <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).eliminado }}>Eliminado</TableCell>
                    )}
                    <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).acciones }} align="right">
                      {/* Wrapper que replica el ancho del bloque de acciones */}
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        {/* Contenido “fantasma” para medir ancho del bloque real */}
                        <Box
                          aria-hidden
                          sx={{
                            visibility: 'hidden',
                            pointerEvents: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Button variant="outlined" size="small">Ver detalle</Button>
                          <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                        </Box>
                        {/* Texto centrado exactamente sobre ese ancho */}
                        <Box sx={{ position:'absolute', inset:0, display:'grid', placeItems:'center', whiteSpace:'nowrap' }}>
                          Acciones
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows(searchPage.content)}</TableBody>
              </Table>
              {searchTotalPages > 1 && (
                <Box mt={2} display="flex" justifyContent="center">
                  <Pagination
                    color="primary"
                    size="small"
                    count={searchTotalPages}
                    page={searchCurrentPage}
                    onChange={handleSearchPageChange}
                    siblingCount={0}
                    boundaryCount={1}
                    aria-label="Paginacion de resultados de presupuestos"
                    getItemAriaLabel={(type, page) => {
                      switch (type) {
                        case "page":
                          return `Ir a la pagina ${page} de resultados`;
                        case "previous":
                          return "Pagina anterior de resultados";
                        case "next":
                          return "Pagina siguiente de resultados";
                        default:
                          return `Ir a la pagina ${page} de resultados`;
                      }
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            !searchError && (
              <Alert severity="info">
                No encontramos presupuestos para el rango seleccionado.
              </Alert>
            )
          )}
        </Paper>
      )}
      {listError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {listError}
        </Alert>
      )}
      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).nombre }}>Nombre</TableCell>
              <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).desde }}>Desde</TableCell>
              <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).hasta }}>Hasta</TableCell>
              {statusFilter === "deleted" && (
                <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).eliminado }}>Eliminado</TableCell>
              )}
              <TableCell sx={{ ...tableCellStyle, ...getColumnWidth(statusFilter).acciones }} align="right">
                {/* Wrapper que replica el ancho del bloque de acciones */}
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  {/* Contenido “fantasma” para medir ancho del bloque real */}
                  <Box
                    aria-hidden
                    sx={{
                      visibility: 'hidden',
                      pointerEvents: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Button variant="outlined" size="small">Ver detalle</Button>
                    <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                  </Box>
                  {/* Texto centrado exactamente sobre ese ancho */}
                  <Box sx={{ position:'absolute', inset:0, display:'grid', placeItems:'center', whiteSpace:'nowrap' }}>
                    Acciones
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visiblePresupuestos.length > 0 && renderRows(visiblePresupuestos)}
            {visiblePresupuestos.length === 0 && !loadingAll && !listError && (
              <TableRow>
                <TableCell
                  colSpan={columnsCount}
                  sx={{ textAlign: "center", py: 3 }}
                >
                  No hay presupuestos para mostrar.
                </TableCell>
              </TableRow>
            )}
            {loadingAll && (
              <TableRow>
                <TableCell
                  colSpan={columnsCount}
                  sx={{ textAlign: "center", py: 3 }}
                >
                  Cargando presupuestos...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
      {mainTotalPages > 1 && (
        <Box mt={2} display="flex" justifyContent="center">
          <Pagination
            color="primary"
            size="small"
            count={mainTotalPages}
            page={mainCurrentPage}
            onChange={handlePageChange}
            siblingCount={0}
            boundaryCount={1}
            aria-label="Paginacion de presupuestos"
            getItemAriaLabel={(type, page) => {
              switch (type) {
                case "page":
                  return `Ir a la pagina ${page} de presupuestos`;
                case "previous":
                  return "Pagina anterior de presupuestos";
                case "next":
                  return "Pagina siguiente de presupuestos";
                default:
                  return `Ir a la pagina ${page} de presupuestos`;
              }
            }}
          />
        </Box>
      )}
      <Box mt={3}>
        <Button
          variant="contained"
          onClick={() => navigate("/presupuestos/nuevo")}
        >
          Crear nuevo presupuesto
        </Button>
      </Box>
      <Menu
        id="presupuesto-actions-menu"
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        keepMounted
        MenuListProps={{
          "aria-labelledby": menuState.presupuesto
            ? `acciones-presupuesto-${menuState.presupuesto.id}`
            : undefined,
        }}
      >
        <MenuItem
          onClick={handleSelectDelete}
          disabled={!menuState.presupuesto}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>
      <Dialog
        open={confirmDialog.open}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar presupuesto</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            {`Vas a eliminar el presupuesto "${confirmDialog.presupuesto?.nombre || ""}". Podrás restaurarlo desde la Papelera durante ${retentionDays} días.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        action={snackbar.action}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
