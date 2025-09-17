import React, { useState } from "react";
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
  Alert
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon
} from "@mui/icons-material";
import CampoEditable from "../../shared-components/CampoEditable";
import BotonConsolidar from "../../shared-components/CustomButton";
import CustomMultiLine from "../../shared-components/CustomMultiLine";
import CustomButton from "../../shared-components/CustomButton";

// Datos iniciales hardcodeados
const initialOrganizationData = {
  nombre: "MyCFO Solutions",
  descripcion: "Empresa líder en soluciones financieras y contables para PyMEs",
};

// Empleados iniciales hardcodeados
const initialEmployees = [
  {
    id: 1,
    nombre: "Martín",
    apellido: "Fedorenko",
    email: "martin@mycfo.com",
    puesto: "CTO"
  },
  {
    id: 2,
    nombre: "Ana",
    apellido: "Gómez",
    email: "ana.gomez@mycfo.com",
    puesto: "CFO"
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "López",
    email: "carlos.lopez@mycfo.com",
    puesto: "Desarrollador Senior"
  }
];

export default function Organizacion() {
  const [organizacion, setOrganizacion] = useState(initialOrganizationData);
  const [empleados, setEmpleados] = useState(initialEmployees);
  const [editados, setEditados] = useState({});
  const [emailsInvitacion, setEmailsInvitacion] = useState([]);
  const [editandoEmpleado, setEditandoEmpleado] = useState(null);
  const [empleadoEditado, setEmpleadoEditado] = useState({});
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Manejar cambios en los datos de la organización
  const handleChangeOrganizacion = (campo, valor) => {
    setOrganizacion(prev => ({ ...prev, [campo]: valor }));
    setEditados(prev => ({ ...prev, [campo]: true }));
  };

  // Manejar envío de cambios de la organización
  const handleConsolidarOrganizacion = () => {
    console.log("Datos de organización enviados:", organizacion);
    setMensaje({ tipo: 'success', texto: 'Cambios guardados con éxito' });
    setEditados({});
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  // Eliminar empleado
  const handleEliminarEmpleado = (id) => {
    setEmpleados(prev => prev.filter(emp => emp.id !== id));
    setMensaje({ tipo: 'info', texto: 'Empleado eliminado' });
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  // Abrir diálogo para editar empleado
  const handleAbrirDialogoEdicion = (empleado) => {
    setEditandoEmpleado(empleado.id);
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
  const handleGuardarEmpleado = () => {
    setEmpleados(prev => 
      prev.map(emp => 
        emp.id === editandoEmpleado ? { ...empleadoEditado } : emp
      )
    );
    setMensaje({ tipo: 'success', texto: 'Cambios del empleado guardados' });
    handleCerrarDialogo();
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  // Manejar cambios en el formulario de edición
  const handleChangeEmpleado = (campo, valor) => {
    setEmpleadoEditado(prev => ({ ...prev, [campo]: valor }));
  };

  // Manejar envío de invitaciones
  const handleEnviarInvitaciones = () => {
    if (emailsInvitacion.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Debe ingresar al menos un email' });
    } else {
      console.log("Invitaciones enviadas a:", emailsInvitacion);
      setMensaje({ tipo: 'success', texto: `Invitaciones enviadas a ${emailsInvitacion.length} contactos` });
      setEmailsInvitacion([]);
    }
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const hayCambios = Object.keys(editados).length > 0;

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 4, p: 3 }}>
      {mensaje.texto && (
        <Alert severity={mensaje.tipo || 'info'} sx={{ mb: 2 }}>
          {mensaje.texto}
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        Gestión de Organización
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        Administra la información de tu empresa y empleados
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Información de la Empresa
      </Typography>
      
      <CampoEditable
        label="Nombre de la Empresa"
        value={organizacion.nombre}
        onChange={(v) => handleChangeOrganizacion("nombre", v)}
      />
      <CampoEditable
        label="Descripción"
        value={organizacion.descripcion}
        multiline
        rows={3}
        onChange={(v) => handleChangeOrganizacion("descripcion", v)}
      />

      {hayCambios && (
        <BotonConsolidar
          label="Guardar Cambios de Empresa"
          onClick={handleConsolidarOrganizacion}
          width="100%"
        />
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 2 }}>
        Empleados de la Organización
      </Typography>
      
      {empleados.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
          No hay empleados registrados en la organización.
        </Typography>
      ) : (
        <List sx={{ width: '100%',  mb: 3 }}>
          {empleados.map((empleado, index) => (
            <React.Fragment key={empleado.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={`${empleado.nombre} ${empleado.apellido}`}
                  secondary={
                    <Box>
                      <Typography variant="body2" component="span">
                        {empleado.puesto}
                      </Typography>
                      <Typography variant="body2" component="div" color="textSecondary">
                        {empleado.email}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    aria-label="editar"
                    onClick={() => handleAbrirDialogoEdicion(empleado)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    edge="end" 
                    aria-label="eliminar"
                    onClick={() => handleEliminarEmpleado(empleado.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < empleados.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 2 }}>
        Invitar nuevos miembros
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Ingresa las direcciones de correo electrónico de las personas que deseas invitar a tu organización
      </Typography>
      
      <CustomMultiLine
        value={emailsInvitacion}
        onChange={setEmailsInvitacion}
        placeholder="Ingresa emails separados por coma o presiona Enter"
      />

      <CustomButton
        label="Enviar Invitaciones"
        width="100%"
        onClick={handleEnviarInvitaciones}
      />

      {/* Diálogo para editar empleado */}
      <Dialog open={dialogoAbierto} onClose={handleCerrarDialogo} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Empleado</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={empleadoEditado.nombre || ''}
            onChange={(e) => handleChangeEmpleado('nombre', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Apellido"
            type="text"
            fullWidth
            variant="outlined"
            value={empleadoEditado.apellido || ''}
            onChange={(e) => handleChangeEmpleado('apellido', e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={empleadoEditado.email || ''}
            disabled
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Puesto"
            type="text"
            fullWidth
            variant="outlined"
            value={empleadoEditado.puesto || ''}
            onChange={(e) => handleChangeEmpleado('puesto', e.target.value)}
          />
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