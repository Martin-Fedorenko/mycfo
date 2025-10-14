import * as React from 'react';
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
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import http from '../../../api/http';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const tableRowStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
};

const tableCellStyle = {
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const monthLabels = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const pad2 = (value) => String(value).padStart(2, '0');
const lastDayOfMonth = (year, month) => new Date(year, month, 0).getDate();

const toDate = (value, endOfMonth = false) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parts = trimmed.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1] || 1);
  if (Number.isNaN(year) || Number.isNaN(month)) return null;
  let day = 1;
  if (parts.length >= 3) {
    day = Number(parts[2]);
  } else if (endOfMonth) {
    day = lastDayOfMonth(year, month);
  }
  return new Date(year, month - 1, day);
};

const overlapsRange = (budget, range) => {
  if (!range) return true;
  const from = range.from ? new Date(range.from) : null;
  const to = range.to ? new Date(range.to) : null;
  if (from && Number.isNaN(from.valueOf())) return true;
  if (to && Number.isNaN(to.valueOf())) return true;
  const start = toDate(budget.desde);
  const end = toDate(budget.hasta, true);
  if (!start || !end) return false;
  const effectiveFrom = from || start;
  const effectiveTo = to || end;
  return start <= effectiveTo && end >= effectiveFrom;
};

const filterBudgetsByRange = (items, range) => {
  if (!Array.isArray(items)) return [];
  if (!range) return items;
  return items.filter((item) => overlapsRange(item, range));
};

const parseRetentionDays = () => {
  const raw = process.env.REACT_APP_PRESUPUESTO_RETENTION_DAYS;
  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 90;
  }
  return parsed;
};

const formatDeletedAt = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }
  return date.toLocaleString('es-AR', { hour12: false });
};

export default function MainGrid() {
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_URL_PRONOSTICO || '';
  const retentionDays = React.useMemo(() => parseRetentionDays(), []);

  const [statusFilter, setStatusFilter] = React.useState('active');
  const [allPresupuestos, setAllPresupuestos] = React.useState([]);
  const [searchResults, setSearchResults] = React.useState(null);
  const [hasActiveSearch, setHasActiveSearch] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ year: '', fromMonth: '', toMonth: '' });
  const [searchError, setSearchError] = React.useState('');
  const [listError, setListError] = React.useState('');
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [loadingAll, setLoadingAll] = React.useState(false);
  const [confirmDialog, setConfirmDialog] = React.useState({ open: false, presupuesto: null });
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', action: null });
  const [menuState, setMenuState] = React.useState({ anchorEl: null, presupuesto: null });

  const lastDeletedRef = React.useRef(null);

  const monthName = React.useCallback((ym) => {
    if (!ym) return '';
    const [anio, mes] = ym.split('-');
    const idx = Number(mes) - 1;
    return idx >= 0 && idx < monthLabels.length ? `${monthLabels[idx]} ${anio}` : ym;
  }, []);

  const fetchPresupuestos = React.useCallback(async (statusValue = statusFilter) => {
    setLoadingAll(true);
    try {
      const params = new URLSearchParams();
      params.set('status', statusValue);
      const res = await http.get(`${baseURL}/api/presupuestos?${params.toString()}`);
      setAllPresupuestos(Array.isArray(res.data) ? res.data : []);
      setListError('');
    } catch (e) {
      console.error('Error cargando presupuestos desde el backend:', e);
      setAllPresupuestos([]);
      setListError('No se pudo cargar la lista de presupuestos. Intenta nuevamente.');
    } finally {
      setLoadingAll(false);
    }
  }, [baseURL, statusFilter]);

  const fetchSearchPresupuestos = React.useCallback(async (searchParams, range) => {
    setLoadingSearch(true);
    try {
      const params = new URLSearchParams(searchParams || '');
      params.set('status', statusFilter);
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await http.get(`${baseURL}/api/presupuestos${queryString}`);
      const data = Array.isArray(res.data) ? res.data : [];
      const filteredData = filterBudgetsByRange(data, range);
      setSearchResults(filteredData);
      setSearchError('');
    } catch (e) {
      console.error('Error cargando presupuestos desde el backend:', e);
      setSearchResults([]);
      setSearchError('No se pudo cargar la lista filtrada. Intenta nuevamente.');
    } finally {
      setLoadingSearch(false);
    }
  }, [baseURL, statusFilter]);

  React.useEffect(() => {
    fetchPresupuestos(statusFilter);
  }, [fetchPresupuestos, statusFilter]);

  const handleStatusChange = (event, newValue) => {
    if (newValue === statusFilter) return;
    setStatusFilter(newValue);
    setHasActiveSearch(false);
    setSearchResults(null);
    setSearchError('');
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

  const performRestore = React.useCallback(async (presupuesto, successMessage = 'Presupuesto restaurado.') => {
    if (!presupuesto) {
      return;
    }
    try {
      await http.post(`${baseURL}/api/presupuestos/${presupuesto.id}/restore`);
      await fetchPresupuestos(statusFilter);
      if (successMessage) {
        setSnackbar({ open: true, message: successMessage, action: null });
      }
      setListError('');
    } catch (e) {
      console.error('Error restaurando presupuesto:', e);
      setSnackbar({ open: true, message: 'No se pudo restaurar el presupuesto.', action: null });
    }
  }, [baseURL, fetchPresupuestos, statusFilter]);

  const handleRestore = React.useCallback((presupuesto) => {
    performRestore(presupuesto, 'Presupuesto restaurado.');
  }, [performRestore]);

  const handleUndoDelete = React.useCallback(async () => {
    const presupuesto = lastDeletedRef.current;
    if (!presupuesto) {
      setSnackbar((prev) => ({ ...prev, open: false }));
      return;
    }
    lastDeletedRef.current = null;
    await performRestore(presupuesto, 'Presupuesto restaurado.');
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
      await fetchPresupuestos(statusFilter);
      setSnackbar({
        open: true,
        message: 'Presupuesto eliminado.',
        action: (
          <Button color="secondary" size="small" onClick={() => handleUndoDelete()}>
            Deshacer
          </Button>
        ),
      });
      setListError('');
    } catch (e) {
      console.error('Error eliminando presupuesto:', e);
      setSnackbar({ open: true, message: 'No se pudo eliminar el presupuesto.', action: null });
    }
  };

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const yearOptions = React.useMemo(() => {
    const years = new Set();
    allPresupuestos.forEach((p) => {
      const desde = p?.desde?.split('-')[0];
      const hasta = p?.hasta?.split('-')[0];
      if (desde) years.add(Number(desde));
      if (hasta) years.add(Number(hasta));
    });
    const current = new Date().getFullYear();
    years.add(current - 1);
    years.add(current);
    years.add(current + 1);
    return Array.from(years)
      .filter((y) => !Number.isNaN(y))
      .sort((a, b) => a - b);
  }, [allPresupuestos]);

  const monthOptions = React.useMemo(() => (
    monthLabels.map((label, index) => ({
      value: String(index + 1),
      label: label.charAt(0).toUpperCase() + label.slice(1),
    }))
  ), []);

  const columnsCount = statusFilter === 'deleted' ? 5 : 4;

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return allPresupuestos;
    return allPresupuestos.filter((p) => {
      const nombre = (p?.nombre || '').toLowerCase();
      const desde = (p?.desde || '').toLowerCase();
      const hasta = (p?.hasta || '').toLowerCase();
      const desdeMes = monthName(p?.desde || '').toLowerCase();
      const hastaMes = monthName(p?.hasta || '').toLowerCase();
      return (
        nombre.includes(term) ||
        desde.includes(term) ||
        hasta.includes(term) ||
        desdeMes.includes(term) ||
        hastaMes.includes(term)
      );
    });
  }, [allPresupuestos, query, monthName]);

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setSearchError('');
    const params = new URLSearchParams();
    const hasYear = Boolean(filters.year);
    const hasFrom = Boolean(filters.fromMonth);
    const hasTo = Boolean(filters.toMonth);
    let range = null;

    if (hasFrom || hasTo) {
      if (!hasFrom || !hasTo) {
        setSearchError('Debes seleccionar ambos meses para armar el rango.');
        return;
      }
      const baseYear = hasYear ? Number(filters.year) : new Date().getFullYear();
      const fromMonth = Number(filters.fromMonth);
      const toMonth = Number(filters.toMonth);
      if (fromMonth > toMonth) {
        setSearchError('El mes Desde no puede ser posterior al mes Hasta.');
        return;
      }
      const fromDate = `${baseYear}-${pad2(fromMonth)}-01`;
      const toDateValue = `${baseYear}-${pad2(toMonth)}-${pad2(lastDayOfMonth(baseYear, toMonth))}`;
      params.set('from', fromDate);
      params.set('to', toDateValue);
      range = { from: fromDate, to: toDateValue };
    } else if (hasYear) {
      const fromDate = `${filters.year}-01-01`;
      const toDateValue = `${filters.year}-12-31`;
      params.set('year', filters.year);
      range = { from: fromDate, to: toDateValue };
    }

    if (!params.toString()) {
      setHasActiveSearch(false);
      setSearchResults(null);
      return;
    }

    setHasActiveSearch(true);
    fetchSearchPresupuestos(params, range);
  };

  const handleReset = () => {
    setFilters({ year: '', fromMonth: '', toMonth: '' });
    setQuery('');
    setSearchError('');
    setHasActiveSearch(false);
    setSearchResults(null);
  };

  const renderRows = (items) => (
    items.map((p) => {
      const slug = encodeURIComponent((p.nombre || '').trim().toLowerCase().replace(/\s+/g, '-'));
      const isDeleted = statusFilter === 'deleted';
      const isMenuOpenForRow = Boolean(menuState.anchorEl) && menuState.presupuesto && menuState.presupuesto.id === p.id;
      const menuId = isMenuOpenForRow ? 'presupuesto-actions-menu' : undefined;
      const buttonId = `acciones-presupuesto-${p.id}`;
      return (
        <TableRow key={p.id} sx={tableRowStyle}>
          <TableCell sx={tableCellStyle}>{p.nombre}</TableCell>
          <TableCell sx={tableCellStyle}>{monthName(p.desde)}</TableCell>
          <TableCell sx={tableCellStyle}>{monthName(p.hasta)}</TableCell>
          {isDeleted && (
            <TableCell sx={tableCellStyle}>{formatDeletedAt(p.deletedAt)}</TableCell>
          )}
          <TableCell sx={{ ...tableCellStyle }} align="right">
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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
                    aria-expanded={isMenuOpenForRow ? 'true' : undefined}
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
    })
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>Presupuestos</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualiza tus presupuestos creados o genera uno nuevo
      </Typography>

      <Tabs value={statusFilter} onChange={handleStatusChange} sx={{ mt: 1 }}>
        <Tab value="active" label="Activos" />
        <Tab value="deleted" label="Borrados" />
      </Tabs>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        {`Los presupuestos se purgan de forma definitiva a los ${retentionDays} días.`}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="presupuesto-year-label">Anio</InputLabel>
          <Select
            labelId="presupuesto-year-label"
            value={filters.year}
            label="Anio"
            onChange={handleFilterChange('year')}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {yearOptions.map((year) => (
              <MenuItem key={year} value={String(year)}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="presupuesto-from-label">Desde (mes)</InputLabel>
          <Select
            labelId="presupuesto-from-label"
            value={filters.fromMonth}
            label="Desde (mes)"
            onChange={handleFilterChange('fromMonth')}
          >
            <MenuItem value="">
              <em>Sin filtro</em>
            </MenuItem>
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="presupuesto-to-label">Hasta (mes)</InputLabel>
          <Select
            labelId="presupuesto-to-label"
            value={filters.toMonth}
            label="Hasta (mes)"
            onChange={handleFilterChange('toMonth')}
          >
            <MenuItem value="">
              <em>Sin filtro</em>
            </MenuItem>
            {monthOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleSearch} disabled={loadingSearch}>
          Buscar
        </Button>
        <Button variant="text" onClick={handleReset} disabled={loadingSearch}>
          Limpiar
        </Button>
      </Box>

      <TextField
        label="Buscar por nombre, mes o anio"
        variant="outlined"
        size="small"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mt: 1, mb: 2, maxWidth: 360 }}
      />

      {searchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {searchError}
        </Alert>
      )}

      {hasActiveSearch && (
        <Paper sx={{ width: '100%', mb: 3, overflowX: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>Resultado de la busqueda</Typography>
          {loadingSearch ? (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columnsCount} sx={{ textAlign: 'center', py: 3 }}>
                    Cargando presupuestos...
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : searchResults && searchResults.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow sx={tableRowStyle}>
                  <TableCell sx={tableCellStyle}>Nombre</TableCell>
                  <TableCell sx={tableCellStyle}>Desde</TableCell>
                  <TableCell sx={tableCellStyle}>Hasta</TableCell>
                  {statusFilter === 'deleted' && (
                    <TableCell sx={tableCellStyle}>Eliminado</TableCell>
                  )}
                  <TableCell sx={{ ...tableCellStyle }} align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderRows(searchResults)}
              </TableBody>
            </Table>
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

      <Paper sx={{ width: '100%', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={tableRowStyle}>
              <TableCell sx={tableCellStyle}>Nombre</TableCell>
              <TableCell sx={tableCellStyle}>Desde</TableCell>
              <TableCell sx={tableCellStyle}>Hasta</TableCell>
              {statusFilter === 'deleted' && (
                <TableCell sx={tableCellStyle}>Eliminado</TableCell>
              )}
              <TableCell sx={{ ...tableCellStyle }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length > 0 && renderRows(filtered)}
            {filtered.length === 0 && !loadingAll && !listError && (
              <TableRow>
                <TableCell colSpan={columnsCount} sx={{ textAlign: 'center', py: 3 }}>
                  No hay presupuestos para mostrar.
                </TableCell>
              </TableRow>
            )}
            {loadingAll && (
              <TableRow>
                <TableCell colSpan={columnsCount} sx={{ textAlign: 'center', py: 3 }}>
                  Cargando presupuestos...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Box mt={3}>
        <Button variant="contained" onClick={() => navigate('/presupuestos/nuevo')}>
          Crear nuevo presupuesto
        </Button>
      </Box>

      <Menu
        id="presupuesto-actions-menu"
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        MenuListProps={{
          'aria-labelledby': menuState.presupuesto
            ? `acciones-presupuesto-${menuState.presupuesto.id}`
            : undefined,
        }}
      >
        <MenuItem onClick={handleSelectDelete} disabled={!menuState.presupuesto}>
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      <Dialog open={confirmDialog.open} onClose={closeDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar presupuesto</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            {`Vas a eliminar el presupuesto "${confirmDialog.presupuesto?.nombre || ''}". Podrás restaurarlo desde la Papelera durante ${retentionDays} días.`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

