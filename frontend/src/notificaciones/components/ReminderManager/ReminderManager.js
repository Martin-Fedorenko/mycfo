import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useReminders } from "../../hooks/useReminders";

export default function ReminderManager() {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingReminder, setEditingReminder] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // TODO: Obtener el userId del contexto de autenticación
  const userId = 1;
  const {
    reminders,
    loading: remindersLoading,
    error,
    reload,
    create,
    update,
    remove,
  } = useReminders(userId);

  // Form state
  const [formData, setFormData] = React.useState({
    title: "",
    message: "",
    scheduledFor: "",
    isRecurring: false,
    recurrencePattern: "DAILY",
    reminderType: "CUSTOM",
  });

  const reminderTypes = [
    { value: "CUSTOM", label: "Personalizado" },
    { value: "DEADLINE", label: "Vencimiento" },
    { value: "DATA_LOAD", label: "Carga de datos" },
    { value: "BILL_DUE", label: "Vencimiento de factura" },
  ];

  const recurrencePatterns = [
    { value: "DAILY", label: "Diario" },
    { value: "WEEKLY", label: "Semanal" },
    { value: "MONTHLY", label: "Mensual" },
    { value: "YEARLY", label: "Anual" },
  ];

  const handleOpenDialog = (reminder = null) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        title: reminder.title,
        message: reminder.message,
        scheduledFor: reminder.scheduledFor,
        isRecurring: reminder.isRecurring,
        recurrencePattern: reminder.recurrencePattern,
        reminderType: reminder.reminderType,
      });
    } else {
      setEditingReminder(null);
      setFormData({
        title: "",
        message: "",
        scheduledFor: "",
        isRecurring: false,
        recurrencePattern: "DAILY",
        reminderType: "CUSTOM",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReminder(null);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const reminderData = {
        ...formData,
        scheduledFor: new Date(formData.scheduledFor).toISOString(),
      };

      if (editingReminder) {
        await update(editingReminder.id, reminderData);
      } else {
        await create(reminderData);
      }

      handleCloseDialog();
    } catch (error) {
      console.error("Error guardando recordatorio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reminderId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este recordatorio?")
    ) {
      try {
        setLoading(true);
        await remove(reminderId);
      } catch (error) {
        console.error("Error eliminando recordatorio:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getReminderTypeLabel = (type) => {
    return reminderTypes.find((t) => t.value === type)?.label || type;
  };

  const getRecurrenceLabel = (pattern) => {
    return (
      recurrencePatterns.find((p) => p.value === pattern)?.label || pattern
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Recordatorios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tus recordatorios y alertas personalizadas
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Recordatorio
        </Button>
      </Box>

      {/* Lista de recordatorios */}
      <Grid container spacing={2}>
        {remindersLoading ? (
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Alert severity="error">
              Error al cargar los recordatorios: {error.message}
            </Alert>
          </Grid>
        ) : reminders.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <NotificationsIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tienes recordatorios configurados
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Crea tu primer recordatorio para no perderte nada importante
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Crear Recordatorio
              </Button>
            </Paper>
          </Grid>
        ) : (
          reminders.map((reminder) => (
            <Grid item xs={12} md={6} lg={4} key={reminder.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h3">
                      {reminder.title}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(reminder)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(reminder.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {reminder.message}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      label={getReminderTypeLabel(reminder.reminderType)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {reminder.isRecurring && (
                      <Chip
                        label={getRecurrenceLabel(reminder.recurrencePattern)}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(reminder.scheduledFor)}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleOpenDialog(reminder)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Dialog para crear/editar recordatorio */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingReminder ? "Editar Recordatorio" : "Nuevo Recordatorio"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={formData.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mensaje"
                value={formData.message}
                onChange={(e) => handleFormChange("message", e.target.value)}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Recordatorio</InputLabel>
                <Select
                  value={formData.reminderType}
                  label="Tipo de Recordatorio"
                  onChange={(e) =>
                    handleFormChange("reminderType", e.target.value)
                  }
                >
                  {reminderTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha y Hora"
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) =>
                  handleFormChange("scheduledFor", e.target.value)
                }
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      handleFormChange("isRecurring", e.target.checked)
                    }
                  />
                }
                label="Recordatorio recurrente"
              />
            </Grid>

            {formData.isRecurring && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Frecuencia</InputLabel>
                  <Select
                    value={formData.recurrencePattern}
                    label="Frecuencia"
                    onChange={(e) =>
                      handleFormChange("recurrencePattern", e.target.value)
                    }
                  >
                    {recurrencePatterns.map((pattern) => (
                      <MenuItem key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              loading ||
              !formData.title ||
              !formData.message ||
              !formData.scheduledFor
            }
          >
            {loading
              ? "Guardando..."
              : editingReminder
              ? "Actualizar"
              : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
