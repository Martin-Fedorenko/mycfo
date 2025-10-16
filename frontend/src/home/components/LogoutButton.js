// LogoutButton.js
import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import { sessionService } from "../../shared-services/sessionService";

export default function LogoutButton() {
  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  };
  const userPool = new CognitoUserPool(poolData);

  const handleLogout = () => {
    const cognitoUser = userPool.getCurrentUser();

    if (cognitoUser) {
      console.log("👉 Cerrando sesión local de Cognito...");
      cognitoUser.signOut(); // cierra la sesión local de Cognito
      console.log("✅ Sesión local cerrada.");
    } else {
      console.log("⚠️ No había usuario autenticado en Cognito.");
    }

    // 🗑️ Limpiar todos los datos de sessionStorage
    sessionStorage.clear();
    sessionService.limpiarSesion();
    console.log("🗑️ Todos los datos eliminados de sessionStorage.");

    // 🚀 Si querés logout global en Cognito Hosted UI
    const cognitoDomain = process.env.REACT_APP_COGNITO_DOMAIN; 
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
    const logoutRedirectUri = `${window.location.origin}/#/signin`; // vuelve a la página de login

    if (cognitoDomain) {
      const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutRedirectUri
      )}`;
      console.log("🌐 Redirigiendo a Cognito Hosted UI logout:", logoutUrl);
      window.location.href = logoutUrl;
    } else {
      // Si no usás Hosted UI
      console.log("➡️ Redirigiendo a /#/signin");
      window.location.href = "/#/signin";
    }
  };

  return (
    <Tooltip title="Cerrar sesión">
      <IconButton size="small" color="primary" onClick={handleLogout}>
        <LogoutRoundedIcon />
      </IconButton>
    </Tooltip>
  );
}
