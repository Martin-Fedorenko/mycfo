// SignIn.js
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./components/ForgotPassword";
import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api-config";

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
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

export default function SignIn(props) {
  const navigate = useNavigate();
  const [formValues, setFormValues] = React.useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [globalMsg, setGlobalMsg] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const URL_ADMINISTRACION = API_CONFIG.ADMINISTRACION;

  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  };
  const userPool = new CognitoUserPool(poolData);

  const validateInputs = () => {
    let errs = {};
    if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errs.email = "Ingresa un correo electrónico válido.";
    }
    if (!formValues.password || formValues.password.length < 6) {
      errs.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setGlobalMsg("");

    const authenticationDetails = new AuthenticationDetails({
      Username: formValues.email,
      Password: formValues.password,
    });

    const cognitoUser = new CognitoUser({
      Username: formValues.email,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: async (result) => {
        console.log("Login success", result);

        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();
        const sub = result.getIdToken().payload.sub;

        // Guardar tokens
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("idToken", idToken);
        sessionStorage.setItem("refreshToken", refreshToken);

        try {
          const perfilResponse = await axios.get(`${URL_ADMINISTRACION}/api/usuarios/perfil`, {
            headers: {
              "X-Usuario-Sub": sub
            }
          });


          // Guardar datos del usuario desde la BD
          const userData = perfilResponse.data;
          sessionStorage.setItem("sub", sub);
          sessionStorage.setItem("email", userData.email);
          sessionStorage.setItem("nombre", userData.nombre);
          sessionStorage.setItem("telefono", userData.telefono || "");
          
          // Guardar datos de la empresa (sin IDs)
          if (userData.empresaId) {
            sessionStorage.setItem("empresaNombre", userData.empresaNombre || "");
            sessionStorage.setItem("empresaCuit", userData.empresaCuit || "");
            sessionStorage.setItem("empresaCondicionIVA", userData.empresaCondicionIVA || "");
            sessionStorage.setItem("empresaDomicilio", userData.empresaDomicilio || "");
          }

          window.dispatchEvent(new Event("userDataUpdated"));

          setGlobalMsg("Inicio de sesión correcto.");
          setLoading(false);

          // Redirigir al home
          window.location.href = "http://localhost:3000/#";
        } catch (err) {
          setLoading(false);
          console.error("Error loading user profile:", err);
          setGlobalMsg("Error al cargar el perfil. Por favor, contacta a soporte.");
        }
      },
      onFailure: (err) => {
        setLoading(false);
        console.error("Login error", err);
        setGlobalMsg(err.message || JSON.stringify(err));
      },
    });
  };

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Iniciar sesión
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Correo electrónico</FormLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                fullWidth
                value={formValues.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Contraseña</FormLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                placeholder="******"
                required
                fullWidth
                value={formValues.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </FormControl>

            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Recordarme"
            />

            {globalMsg && (
              <Typography
                sx={{ textAlign: "center" }}
                color={globalMsg.includes("success") ? "primary" : "error"}
              >
                {globalMsg}
              </Typography>
            )}

            <ForgotPassword open={open} handleClose={handleClose} />

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>

            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/*
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Iniciar sesión con Google")}
              startIcon={<GoogleIcon />}
            >
              Iniciar sesión con Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Iniciar sesión con Facebook")}
              startIcon={<FacebookIcon />}
            >
              Iniciar sesión con Facebook
            </Button>
            */}
            <Typography sx={{ textAlign: "center" }}>
              ¿No tienes una cuenta?{" "}
              <Link href="/#/signup/" variant="body2" sx={{ alignSelf: "center" }}>
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
