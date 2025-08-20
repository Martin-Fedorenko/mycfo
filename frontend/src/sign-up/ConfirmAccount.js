// ConfirmAccount.js
import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CssBaseline,
  FormLabel,
  FormControl,
  TextField,
  Typography,
  Divider,
  Link,
  Stack,
} from "@mui/material";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";

import {
  CognitoUserPool,
  CognitoUser,
} from "amazon-cognito-identity-js";

import AppTheme from "../shared-theme/AppTheme";
import ColorModeSelect from "../shared-theme/ColorModeSelect";
import { SitemarkIcon } from "./components/CustomIcons";

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
}));

const ConfirmContainer = styled(Stack)(({ theme }) => ({
  height: "calc((1 - var(--template-frame-height, 0)) * 100dvh)",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
}));

export default function ConfirmAccount(props) {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); // usuario registrado
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  };
  const userPool = new CognitoUserPool(poolData);

  const handleConfirm = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmRegistration(code, true, (err, result) => {
      setLoading(false);
      if (err) {
        console.error("Confirm Error", err);
        setError(err.message || JSON.stringify(err));
        return;
      }
      console.log("Confirm result:", result);
      setSuccessMsg("Account confirmed! Redirecting...");
      setTimeout(() => navigate("/#/"), 1500); // redirige al home
    });
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <ColorModeSelect sx={{ position: "fixed", top: "1rem", right: "1rem" }} />
      <ConfirmContainer direction="column" justifyContent="center">
        <Card variant="outlined">
          <SitemarkIcon />
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            Confirm your account
          </Typography>
          <Typography>
            We have sent a code in an Email message. To confirm your account, enter your code.
          </Typography>

          <Box
            component="form"
            onSubmit={handleConfirm}
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
              />
            </FormControl>

            <FormControl>
              <FormLabel>Code</FormLabel>
              <TextField
                required
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </FormControl>

            {error && <Typography color="error">{error}</Typography>}
            {successMsg && <Typography color="primary">{successMsg}</Typography>}

            <Button type="submit" fullWidth variant="contained" disabled={loading}>
              {loading ? "Confirming..." : "Confirm account"}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography sx={{ textAlign: "center" }}>
            Already confirmed?{" "}
            <Link href="/#/signin" variant="body2">
              Sign in
            </Link>
          </Typography>
        </Card>
      </ConfirmContainer>
    </AppTheme>
  );
}
