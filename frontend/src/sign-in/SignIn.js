// SignIn.js
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
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
import { GoogleIcon, FacebookIcon, SitemarkIcon } from "./components/CustomIcons";

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
  const [formValues, setFormValues] = React.useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [globalMsg, setGlobalMsg] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  };
  const userPool = new CognitoUserPool(poolData);

  const validateInputs = () => {
    let errs = {};
    if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formValues.password || formValues.password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
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
      onSuccess: (result) => {
        setLoading(false);
        console.log("Login success", result);

        const accessToken = result.getAccessToken().getJwtToken();
        const idToken = result.getIdToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();

        // ✅ Guardar tokens en sessionStorage
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("idToken", idToken);
        sessionStorage.setItem("refreshToken", refreshToken);

        // ✅ Obtener atributos del usuario
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.error("Error obteniendo atributos:", err);
          } else {
            const attrMap = {};
            attributes.forEach((attr) => {
              attrMap[attr.Name] = attr.Value;
            });

            // Guardar los atributos si están presentes
            if (attrMap.email) {
              sessionStorage.setItem("email", attrMap.email);
            }
            if (attrMap.name) {
              sessionStorage.setItem("name", attrMap.name);
            }
            if (attrMap.family_name) {
              sessionStorage.setItem("family_name", attrMap.family_name);
            }
            if (attrMap["custom:organizacion"]) {
              sessionStorage.setItem("organizacion", attrMap["custom:organizacion"]);
            }
            if (attrMap.phone_number) {
              sessionStorage.setItem("phone_number", attrMap.phone_number);
            }
            if (attrMap["custom:puesto"]) {
              sessionStorage.setItem("custom:puesto", attrMap["custom:puesto"]);
            }

            window.dispatchEvent(new Event("userDataUpdated"));

            console.log("Atributos del usuario:", attrMap);
          }
        });

        setGlobalMsg("Login successful!");

        // Redirigir al home
        window.location.href = "http://localhost:3000/#";
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
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Sign in
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                fullWidth
                value={formValues.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                id="password"
                name="password"
                type="password"
                placeholder="••••••"
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
              label="Remember me"
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
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "center" }}
            >
              Forgot your password?
            </Link>
          </Box>

          <Divider>or</Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with Google")}
              startIcon={<GoogleIcon />}
            >
              Sign in with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => alert("Sign in with Facebook")}
              startIcon={<FacebookIcon />}
            >
              Sign in with Facebook
            </Button>
            <Typography sx={{ textAlign: "center" }}>
              Don&apos;t have an account?{" "}
              <Link href="/#/signup/" variant="body2" sx={{ alignSelf: "center" }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
