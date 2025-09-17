import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Box, TextField, Typography, InputAdornment
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CustomSingleAutoComplete from "../../shared-components/CustomSingleAutoComplete";
import CustomDatePicker from "../../shared-components/CustomDatePicker";
import dayjs from "dayjs";

export default function TablaRegistros() {
  const [registros, setRegistros] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [valoresEditados, setValoresEditados] = useState({});
  const [filtros, setFiltros] = useState({
    tipo: "",
    monto: "",
    fechaEmision: "",
    categoria: "",
    origen: "",
    destino: "",
    medioPago: ""
  });
  
  // Opciones de categorías (pueden venir de backend o estar hardcodeadas)
  const categorias = ["Transporte", "Educación", "Ocio", "Salud", "Alimentación"];
  const tipos = ["Ingreso", "Gasto"];
  const mediosPago = ["Efectivo", "Tarjeta", "Transferencia"];

  useEffect(() => {
    fetch("http://localhost:8086/registros")
      .then((res) => res.json())
      .then((data) => setRegistros(data))
      .catch((err) => console.error("Error cargando registros:", err));
  }, []);

  const handleEdit = (row) => {
    setEditandoId(row.id);
    setValoresEditados(row); // copia inicial de la fila
  };

  const handleCancel = () => {
    setEditandoId(null);
    setValoresEditados({});
  };

  const handleSave = async () => {
    try {
      // PUT o PATCH al backend
      const resp = await fetch(`http://localhost:8086/registros/${valoresEditados.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valoresEditados),
      });

      if (!resp.ok) throw new Error("Error guardando cambios");

      // actualizo la tabla en memoria
      setRegistros((prev) =>
        prev.map((r) => (r.id === valoresEditados.id ? valoresEditados : r))
      );
      setEditandoId(null);
      setValoresEditados({});
    } catch (err) {
      console.error(err);
      alert("Error al guardar el registro");
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Filtrar registros según los filtros aplicados
  const registrosFiltrados = registros.filter(registro => {
    return Object.entries(filtros).every(([campo, valor]) => {
      if (!valor) return true;
      
      const valorRegistro = String(registro[campo] || "").toLowerCase();
      return valorRegistro.includes(valor.toLowerCase());
    });
  });

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Registros Financieros
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            
            
            {/* Fila de encabezados */}
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha Emisión</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Medio Pago</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrosFiltrados.map((row) => (
              <TableRow key={row.id}>
                {/* Tipo */}
                <TableCell>
                  {editandoId === row.id ? (
                    <CustomSingleAutoComplete
                      options={tipos}
                      value={valoresEditados.tipo}
                      onChange={(v) =>
                        setValoresEditados((prev) => ({
                          ...prev,
                          tipo: v,
                        }))
                      }
                    />
                  ) : (
                    row.tipo
                  )}
                </TableCell>
                
                {/* Monto */}
                <TableCell>
                  {editandoId === row.id ? (
                    <TextField
                      size="small"
                      type="number"
                      value={valoresEditados.montoTotal || ""}
                      onChange={(e) =>
                        setValoresEditados((prev) => ({
                          ...prev,
                          montoTotal: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    row.montoTotal
                  )}
                </TableCell>
                
                {/* Fecha Emisión */}
                <TableCell>
                  {editandoId === row.id ? (
                    <CustomDatePicker
                      value={dayjs(valoresEditados.fechaEmision)}
                      onChange={(newValue) =>
                        setValoresEditados((prev) => ({
                          ...prev,
                          fechaEmision: newValue.format('YYYY-MM-DD'),
                        }))
                      }
                    />
                  ) : (
                    row.fechaEmision
                  )}
                </TableCell>
                
                {/* Categoría */}
                <TableCell>
                  {editandoId === row.id ? (
                    <CustomSingleAutoComplete
                      options={categorias}
                      value={valoresEditados.categoria}
                      onChange={(v) =>
                        setValoresEditados((prev) => ({
                          ...prev,
                          categoria: v,
                        }))
                      }
                    />
                  ) : (
                    row.categoria
                  )}
                </TableCell>
                
                {/* Origen */}
                <TableCell>
                  {editandoId === row.id ? (
                    <TextField
                      size="small"
                      value={valoresEditados.origen || ""}
                      onChange={(e) =>
                        setValoresEditados((prev) => ({
                          ...prev,
                          origen: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    row.origen
                  )}
                </TableCell>
                
                {/* Destino */}
                <TableCell>
                  {editandoId === row.id ? (
                    <TextField
                      size="small"
                      value={valoresEditados.destino || ""}
                      onChange={(e) =>
                        setValoresEditados((prev) => ({
                          ...prev,
                          destino: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    row.destino
                  )}
                </TableCell>
                
                {/* Medio Pago */}
                <TableCell>
                  {editandoId === row.id ? (
                    <CustomSingleAutoComplete
                      options={mediosPago}
                      value={valoresEditados.medioPago}
                      onChange={(v) =>
                        setValoresEditados((prev) => ({
                          ...prev,
                          medioPago: v,
                        }))
                      }
                    />
                  ) : (
                    row.medioPago
                  )}
                </TableCell>
                
                {/* Acciones */}
                <TableCell align="right">
                  {editandoId === row.id ? (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <IconButton color="success" onClick={handleSave}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton color="error" onClick={handleCancel}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton onClick={() => handleEdit(row)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}