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
import { useNavigate } from "react-router-dom";
import { GoogleIcon, FacebookIcon, SitemarkIcon } from "./components/CustomIcons";

import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
} from "amazon-cognito-identity-js";

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

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");
  const [isConfirmStep, setIsConfirmStep] = React.useState(false);

  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  };
  const userPool = new CognitoUserPool(poolData);

  const validateInputs = () => {
    let errs = {};
    if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!isConfirmStep && (!password || password.length < 6)) {
      errs.password = "Password must be at least 6 characters long.";
    }
    if (isConfirmStep && !code) {
      errs.code = "Please enter the code you received by email.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    setSuccessMsg("");

    if (!isConfirmStep) {
      // Paso 1: Registro
      const attributeList = [new CognitoUserAttribute({ Name: "email", Value: email })];

      userPool.signUp(email, password, attributeList, null, (err, result) => {
        setLoading(false);
        if (err) {
          console.error("SignUp Error", err);
          setErrors({ global: err.message || JSON.stringify(err) });
          return;
        }
        console.log("User created:", result);
        setSuccessMsg("Account created! Please check your email for the confirmation code.");
        setIsConfirmStep(true);
      });
    } else {
      // Paso 2: Confirmación
      const userData = { Username: email, Pool: userPool };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        setLoading(false);
        if (err) {
          console.error("Confirm Error", err);
          setErrors({ global: err.message || JSON.stringify(err) });
          return;
        }
        console.log("Confirm result:", result);
        setSuccessMsg("Account confirmed! Redirecting to Sign in...");
        setTimeout(() => navigate("/signin"), 1500);
      });
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
            {isConfirmStep ? "Confirm your account" : "Sign up"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <FormControl>
              <FormLabel>Email</FormLabel>
              <TextField
                required
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isConfirmStep} // no editable en confirmación
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormControl>

            {!isConfirmStep && (
              <FormControl>
                <FormLabel>Password</FormLabel>
                <TextField
                  required
                  fullWidth
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </FormControl>
            )}

            {isConfirmStep && (
              <>
                <FormControl>
                  <FormLabel>Confirmation Code</FormLabel>
                  <TextField
                    required
                    fullWidth
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    error={!!errors.code}
                    helperText={errors.code}
                  />
                </FormControl>
                <Typography variant="body2" color="text.secondary">
                  Please enter the code we sent to your email to confirm your account.
                </Typography>
              </>
            )}

            {errors.global && <Typography color="error">{errors.global}</Typography>}
            {successMsg && <Typography color="primary">{successMsg}</Typography>}

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading
                ? isConfirmStep
                  ? "Confirming..."
                  : "Creating..."
                : isConfirmStep
                ? "Confirm account"
                : "Sign up"}
            </Button>
          </Box>

          {!isConfirmStep && (
            <>
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
            </>
          )}
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}
