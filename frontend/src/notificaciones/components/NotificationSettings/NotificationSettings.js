import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
  Button,
  Alert,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

export default function NotificationSettings() {
  const [preferences, setPreferences] = React.useState({
    emailEnabled: true,
    inAppEnabled: true,
    pushEnabled: false,
    dailyDigestEnabled: true,
    weeklyDigestEnabled: false,
    digestTime: "09:00",
    quietStart: "22:00",
    quietEnd: "08:00",
    quietDays: [],
    typeConfigs: {},
  });

  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Cargar preferencias al iniciar
  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch(
          `http://localhost:8084/api/users/1/notification-preferences`
        );
        if (response.ok) {
          const data = await response.json();
          setPreferences(data);
        }
      } catch (error) {
        console.error("Error cargando preferencias:", error);
      }
    };

    loadPreferences();
  }, []);

  const notificationTypes = [
    { value: "MOVEMENT_NEW", label: "Nuevos Movimientos" },
    { value: "MOVEMENT_HIGH", label: "Movimientos Altos" },
    { value: "BUDGET_EXCEEDED", label: "Presupuestos Excedidos" },
    { value: "CASH_FLOW_ALERT", label: "Alertas de Cash Flow" },
    { value: "REPORT_READY", label: "Reportes Listos" },
    { value: "REMINDER_CUSTOM", label: "Recordatorios" },
    { value: "SYSTEM_MAINTENANCE", label: "Mantenimiento del Sistema" },
  ];

  const daysOfWeek = [
    { value: "MONDAY", label: "Lunes" },
    { value: "TUESDAY", label: "Martes" },
    { value: "WEDNESDAY", label: "Miércoles" },
    { value: "THURSDAY", label: "Jueves" },
    { value: "FRIDAY", label: "Viernes" },
    { value: "SATURDAY", label: "Sábado" },
    { value: "SUNDAY", label: "Domingo" },
  ];

  const handlePreferenceChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeConfigChange = (type, field, value) => {
    setPreferences((prev) => ({
      ...prev,
      typeConfigs: {
        ...prev.typeConfigs,
        [type]: {
          ...prev.typeConfigs[type],
          [field]: value,
        },
      },
    }));
  };

  const handleQuietDayToggle = (day) => {
    setPreferences((prev) => ({
      ...prev,
      quietDays: prev.quietDays.includes(day)
        ? prev.quietDays.filter((d) => d !== day)
        : [...prev.quietDays, day],
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Enviar preferencias al backend
      const response = await fetch(
        `http://localhost:8084/api/users/1/notification-preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error("Error guardando preferencias");
      }

      const updatedPreferences = await response.json();
      setPreferences(updatedPreferences);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error guardando preferencias:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuración de Notificaciones
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personaliza cómo y cuándo recibir notificaciones
        </Typography>
      </Box>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Preferencias guardadas exitosamente
        </Alert>
      )}

      {/* Botón de Guardar - Moved to top */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Configuración General */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              avatar={<SettingsIcon />}
              title="Configuración General"
              subheader="Preferencias básicas"
            />
            <CardContent>
              <FormControl component="fieldset" fullWidth>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.emailEnabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "emailEnabled",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Notificaciones por Email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.inAppEnabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "inAppEnabled",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Notificaciones en la Aplicación"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.pushEnabled}
                        onChange={(e) =>
                          handlePreferenceChange(
                            "pushEnabled",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Notificaciones Push"
                  />
                </FormGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración de Digest */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              avatar={<EmailIcon />}
              title="Resúmenes por Email"
              subheader="Digest diario y semanal"
            />
            <CardContent>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.dailyDigestEnabled}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "dailyDigestEnabled",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Resumen Diario"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.weeklyDigestEnabled}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "weeklyDigestEnabled",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Resumen Semanal"
                />
                <TextField
                  label="Hora del Resumen"
                  type="time"
                  value={preferences.digestTime}
                  onChange={(e) =>
                    handlePreferenceChange("digestTime", e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Horarios de Silencio */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardHeader
              avatar={<ScheduleIcon />}
              title="Horarios de Silencio"
              subheader="Cuándo no recibir notificaciones"
            />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Inicio del Silencio"
                  type="time"
                  value={preferences.quietStart}
                  onChange={(e) =>
                    handlePreferenceChange("quietStart", e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                />
                <TextField
                  label="Fin del Silencio"
                  type="time"
                  value={preferences.quietEnd}
                  onChange={(e) =>
                    handlePreferenceChange("quietEnd", e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  size="small"
                />
                <Divider />
                <Typography variant="subtitle2" gutterBottom>
                  Días de Silencio
                </Typography>
                <FormGroup>
                  {daysOfWeek.map((day) => (
                    <FormControlLabel
                      key={day.value}
                      control={
                        <Switch
                          checked={preferences.quietDays.includes(day.value)}
                          onChange={() => handleQuietDayToggle(day.value)}
                          size="small"
                        />
                      }
                      label={day.label}
                    />
                  ))}
                </FormGroup>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Configuración por Tipo */}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={<NotificationsIcon />}
              title="Configuración por Tipo"
              subheader="Personaliza cada tipo de notificación"
            />
            <CardContent>
              <Grid container spacing={2}>
                {notificationTypes.map((type) => (
                  <Grid item xs={12} sm={6} md={4} key={type.value}>
                    <Paper sx={{ p: 2, height: "100%" }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {type.label}
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                preferences.typeConfigs[type.value]?.enabled ??
                                true
                              }
                              onChange={(e) =>
                                handleTypeConfigChange(
                                  type.value,
                                  "enabled",
                                  e.target.checked
                                )
                              }
                              size="small"
                            />
                          }
                          label="Habilitado"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                preferences.typeConfigs[type.value]
                                  ?.emailEnabled ?? true
                              }
                              onChange={(e) =>
                                handleTypeConfigChange(
                                  type.value,
                                  "emailEnabled",
                                  e.target.checked
                                )
                              }
                              size="small"
                            />
                          }
                          label="Email"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={
                                preferences.typeConfigs[type.value]
                                  ?.inAppEnabled ?? true
                              }
                              onChange={(e) =>
                                handleTypeConfigChange(
                                  type.value,
                                  "inAppEnabled",
                                  e.target.checked
                                )
                              }
                              size="small"
                            />
                          }
                          label="En App"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
