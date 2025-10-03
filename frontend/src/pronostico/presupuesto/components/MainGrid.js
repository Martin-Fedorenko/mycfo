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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

export default function MainGrid() {
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_URL_PRONOSTICO || '';

  const [allPresupuestos, setAllPresupuestos] = React.useState([]);
  const [searchResults, setSearchResults] = React.useState(null);
  const [hasActiveSearch, setHasActiveSearch] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({ year: '', fromMonth: '', toMonth: '' });
  const [searchError, setSearchError] = React.useState('');
  const [listError, setListError] = React.useState('');
  const [loadingSearch, setLoadingSearch] = React.useState(false);
  const [loadingAll, setLoadingAll] = React.useState(false);

  const monthName = React.useCallback((ym) => {
    if (!ym) return '';
    const [anio, mes] = ym.split('-');
    const idx = Number(mes) - 1;
    return idx >= 0 && idx < monthLabels.length ? `${monthLabels[idx]} ${anio}` : ym;
  }, []);

  const fetchAllPresupuestos = React.useCallback(async () => {
    setLoadingAll(true);
    try {
      const res = await axios.get(`${baseURL}/api/presupuestos`);
      setAllPresupuestos(res.data);
      setListError('');
    } catch (e) {
      console.error('Error cargando presupuestos desde el backend:', e);
      setAllPresupuestos([]);
      setListError('No se pudo cargar la lista de presupuestos. Intenta nuevamente.');
    } finally {
      setLoadingAll(false);
    }
  }, [baseURL]);

  const fetchSearchPresupuestos = React.useCallback(async (searchParams, range) => {
    setLoadingSearch(true);
    try {
      const queryString = searchParams && searchParams.toString()
        ? `?${searchParams.toString()}`
        : '';
      const res = await axios.get(`${baseURL}/api/presupuestos${queryString}`);
      const filteredData = filterBudgetsByRange(res.data, range);
      setSearchResults(filteredData);
      setSearchError('');
    } catch (e) {
      console.error('Error cargando presupuestos desde el backend:', e);
      setSearchResults([]);
      setSearchError('No se pudo cargar la lista filtrada. Intenta nuevamente.');
    } finally {
      setLoadingSearch(false);
    }
  }, [baseURL]);

  React.useEffect(() => {
    fetchAllPresupuestos();
  }, [fetchAllPresupuestos]);

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
    items.map((p) => (
      <TableRow key={p.id} sx={tableRowStyle}>
        <TableCell sx={tableCellStyle}>{p.nombre}</TableCell>
        <TableCell sx={tableCellStyle}>{monthName(p.desde)}</TableCell>
        <TableCell sx={tableCellStyle}>{monthName(p.hasta)}</TableCell>
        <TableCell sx={{ ...tableCellStyle }} align="right">
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const nombreUrl = encodeURIComponent(p.nombre.trim().toLowerCase().replace(/\s+/g, '-'));
              navigate(`/presupuestos/${nombreUrl}`);
            }}
          >
            Ver detalle
          </Button>
        </TableCell>
      </TableRow>
    ))
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>Presupuestos</Typography>
      <Typography variant="subtitle1" gutterBottom>
        Visualiza tus presupuestos creados o genera uno nuevo
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
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
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
              <TableCell sx={{ ...tableCellStyle }} align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length > 0 && renderRows(filtered)}
            {filtered.length === 0 && !loadingAll && !listError && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
                  No hay presupuestos para mostrar.
                </TableCell>
              </TableRow>
            )}
            {loadingAll && (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3 }}>
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
    </Box>
  );
}
