import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Chip
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
import axios from "axios";
import CampoEditable from "../../shared-components/CustomButton";

const API_URL = "http://localhost:8081";

export default function Organizacion() {
  const [empresa, setEmpresa] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editandoEmpleado, setEditandoEmpleado] = useState(null);
  const [empleadoEditado, setEmpleadoEditado] = useState({});
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [usuarioRol, setUsuarioRol] = useState(null);

  const sub = sessionStorage.getItem("sub");
  const organizacionId = sessionStorage.getItem("organizacionId");

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosEmpresaYEmpleados();
  }, []);

  const cargarDatosEmpresaYEmpleados = async () => {
    setLoading(true);
    try {
      // Cargar datos del perfil del usuario para saber su rol
      const perfilResponse = await axios.get(`${API_URL}/api/usuarios/perfil`, {
        headers: { "X-Usuario-Sub": sub }
      });
      setUsuarioRol(perfilResponse.data.rol);

      // Cargar datos de la empresa
      const empresaResponse = await axios.get(`${API_URL}/api/empresas/${organizacionId}`, {
        headers: { "X-Usuario-Sub": sub }
      });
      setEmpresa(empresaResponse.data);

      // Cargar empleados de la empresa
      const empleadosResponse = await axios.get(`${API_URL}/api/usuarios/empresa/${organizacionId}`, {
        headers: { "X-Usuario-Sub": sub }
      });
      setEmpleados(empleadosResponse.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar los datos de la empresa' });
    } finally {
      setLoading(false);
    }
  };

  // Abrir diálogo para editar empleado
  const handleAbrirDialogoEdicion = (empleado) => {
    setEditandoEmpleado(empleado.sub);
    setEmpleadoEditado({ ...empleado });
    setDialogoAbierto(true);
  };

  // Cerrar diálogo de edición
  const handleCerrarDialogo = () => {
    setDialogoAbierto(false);
    setEditandoEmpleado(null);
    setEmpleadoEditado({});
  };

  // Guardar cambios del empleado
  const handleGuardarEmpleado = async () => {
    try {
      await axios.put(
        `${API_URL}/api/usuarios/${editandoEmpleado}`,
        {
          nombre: empleadoEditado.nombre,
          email: empleadoEditado.email,
          telefono: empleadoEditado.telefono,
          rol: empleadoEditado.rol
        },
        {
          headers: { "X-Usuario-Sub": sub }
        }
      );

      setMensaje({ tipo: 'success', texto: 'Cambios del empleado guardados exitosamente' });
      handleCerrarDialogo();
      
      // Recargar lista de empleados
      cargarDatosEmpresaYEmpleados();
      
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      console.error("Error guardando empleado:", error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar los cambios del empleado' });
    }
  };

  // Eliminar empleado
  const handleEliminarEmpleado = async (empleadoSub) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este empleado?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/usuarios/${empleadoSub}`, {
        headers: { "X-Usuario-Sub": sub }
      });

      setMensaje({ tipo: 'success', texto: 'Empleado eliminado exitosamente' });
      
      // Recargar lista de empleados
      cargarDatosEmpresaYEmpleados();
      
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      console.error("Error eliminando empleado:", error);
      setMensaje({ tipo: 'error', texto: 'Error al eliminar el empleado' });
    }
  };

  // Manejar cambios en el formulario de edición
  const handleChangeEmpleado = (campo, valor) => {
    setEmpleadoEditado(prev => ({ ...prev, [campo]: valor }));
  };

  const esAdministrador = usuarioRol === "ADMINISTRADOR";

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 4, p: 3 }}>
      {mensaje.texto && (
        <Alert severity={mensaje.tipo || 'info'} sx={{ mb: 2 }}>
          {mensaje.texto}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BusinessIcon fontSize="large" color="primary" />
        Gestión de Organización
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
        Visualiza la información de tu empresa y empleados
      </Typography>

      {/* Información de la Empresa */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Información de la Empresa
        </Typography>
        
        {empresa && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nombre de la Empresa
              </Typography>
              <Typography variant="h6">
                {empresa.nombre}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Descripción
              </Typography>
              <Typography variant="body1">
                {empresa.descripcion || "Sin descripción"}
              </Typography>
            </Box>


            {!esAdministrador && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Solo los administradores pueden modificar los datos de la empresa
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      {/* Empleados de la Organización */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Empleados de la Organización ({empleados.length})
        </Typography>
        
        {empleados.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
            No hay empleados registrados en la organización.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {empleados.map((empleado, index) => (
              <React.Fragment key={empleado.sub}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6">
                          {empleado.nombre}
                        </Typography>
                        {empleado.rol === "ADMINISTRADOR" && (
                          <Chip 
                            icon={<AdminIcon />} 
                            label="Admin" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" component="div">
                          📧 {empleado.email}
                        </Typography>
                        {empleado.telefono && (
                          <Typography variant="body2" component="div" color="text.secondary">
                            📱 {empleado.telefono}
                          </Typography>
                        )}
                        <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.5 }}>
                          Rol: {empleado.rol}
                        </Typography>
                        <Typography variant="caption" component="div" color="text.disabled" sx={{ mt: 0.5 }}>
                          Estado: {empleado.activo ? "Activo" : "Inactivo"}
                        </Typography>
                      </Box>
                    }
                  />
                  {esAdministrador && (
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="editar"
                        onClick={() => handleAbrirDialogoEdicion(empleado)}
                        sx={{ mr: 1 }}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="eliminar"
                        onClick={() => handleEliminarEmpleado(empleado.sub)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
                {index < empleados.length - 1 && <Divider variant="fullWidth" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {!esAdministrador && empleados.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Solo los administradores pueden modificar o eliminar empleados
          </Alert>
        )}
      </Paper>

      {/* Diálogo para editar empleado */}
      <Dialog open={dialogoAbierto} onClose={handleCerrarDialogo} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Empleado</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre Completo"
            type="text"
            fullWidth
            variant="outlined"
            value={empleadoEditado.nombre || ''}
            onChange={(e) => handleChangeEmpleado('nombre', e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={empleadoEditado.email || ''}
            onChange={(e) => handleChangeEmpleado('email', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Teléfono"
            type="tel"
            fullWidth
            variant="outlined"
            value={empleadoEditado.telefono || ''}
            onChange={(e) => handleChangeEmpleado('telefono', e.target.value)}
            helperText="Formato internacional: +[código país][número] (ej: +541234567890)"
            placeholder="+541234567890"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Rol"
            select
            fullWidth
            variant="outlined"
            value={empleadoEditado.rol || 'NORMAL'}
            onChange={(e) => handleChangeEmpleado('rol', e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="NORMAL">Normal</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarDialogo}>Cancelar</Button>
          <Button 
            onClick={handleGuardarEmpleado} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
