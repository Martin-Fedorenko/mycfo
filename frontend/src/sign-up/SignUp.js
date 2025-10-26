// SignUp.js
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleIcon, FacebookIcon, SitemarkIcon } from "./components/CustomIcons";

import axios from "axios";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function SignUp(props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Verificar si viene de una invitación
  const empresaInvitacion = searchParams.get('empresa');
  const esInvitacion = !!empresaInvitacion;

  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    nombreEmpresa: empresaInvitacion || "",
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  // No hay validación de token, solo pre-llenar empresa

  const validateInputs = () => {
    let errs = {};
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
    }
    if (!formData.nombre || formData.nombre.trim() === "") {
      errs.nombre = "Name is required.";
    }
    if (!formData.apellido || formData.apellido.trim() === "") {
      errs.apellido = "Last name is required.";
    }
    if (!formData.nombreEmpresa || formData.nombreEmpresa.trim() === "") {
      errs.nombreEmpresa = "Company name is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setSuccessMsg("");

    try {
      // Registrar usuario completo en backend
      const response = await axios.post("http://localhost:8081/api/auth/registro", {
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        apellido: formData.apellido,
        nombreEmpresa: formData.nombreEmpresa,
        esInvitacion: esInvitacion
      });

      console.log("Usuario registrado:", response.data);
      
      // Guardar email temporalmente para la confirmación
      sessionStorage.setItem("tempEmail", formData.email);
      
      setSuccessMsg(response.data.mensaje || "Account created successfully!");
      setTimeout(() => navigate("/confirm-account"), 1500);
    } catch (err) {
      console.error("SignUp Error", err);
      setErrors({ global: err.response?.data?.error || "Error creating account" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            {esInvitacion ? "Unirse a la Empresa" : "Sign up"}
          </Typography>
          
          {esInvitacion && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Has sido invitado a unirte a <strong>{formData.nombreEmpresa}</strong>
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Nombre</FormLabel>
                <TextField
                  required
                  fullWidth
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
              </FormControl>

              <FormControl sx={{ flex: 1 }}>
                <FormLabel>Apellido</FormLabel>
                <TextField
                  required
                  fullWidth
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  error={!!errors.apellido}
                  helperText={errors.apellido}
                />
              </FormControl>
            </Box>

            <FormControl>
              <FormLabel>Nombre de Empresa</FormLabel>
              <TextField
                required
                fullWidth
                value={formData.nombreEmpresa}
                onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                error={!!errors.nombreEmpresa}
                helperText={errors.nombreEmpresa}
                disabled={esInvitacion}
                InputProps={{
                  readOnly: esInvitacion,
                }}
              />
              {esInvitacion && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Empresa predefinida por invitación
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                required
                fullWidth
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <TextField
                required
                fullWidth
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={!!errors.password}
                helperText={errors.password}
              />
            </FormControl>

            {errors.global && <Typography color="error">{errors.global}</Typography>}
            {successMsg && <Typography color="primary">{successMsg}</Typography>}

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </Box>

          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() =>
                alert("Sign up with Google (configure Cognito Hosted UI)")
              }
              startIcon={<GoogleIcon />}
            >
              Sign up with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() =>
                alert("Sign up with Facebook (configure Cognito Hosted UI)")
              }
              startIcon={<FacebookIcon />}
            >
              Sign up with Facebook
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/#/signin" variant="body2" sx={{ alignSelf: "center" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
