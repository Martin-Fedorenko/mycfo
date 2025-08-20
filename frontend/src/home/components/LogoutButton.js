// LogoutButton.js
import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { CognitoUserPool } from "amazon-cognito-identity-js";

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
      cognitoUser.signOut(); // solo borra sesión local
      console.log("✅ Sesión local cerrada.");
    } else {
      console.log("⚠️ No había usuario autenticado en Cognito.");
    }

    // ✅ Limpiar sessionStorage
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("idToken");
    sessionStorage.removeItem("refreshToken");
    console.log("🗑️ Tokens eliminados de sessionStorage.");

    // 🚀 Si querés avisar al servidor de AWS Cognito (logout global):
    const cognitoDomain = process.env.REACT_APP_COGNITO_DOMAIN; // ej: myapp.auth.us-east-1.amazoncognito.com
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
    const logoutRedirectUri = "/#/signin";

    if (cognitoDomain) {
      const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutRedirectUri
      )}`;
      console.log("🌐 Redirigiendo a Cognito Hosted UI logout:", logoutUrl);
      window.location.href = logoutUrl;
    } else {
      // Si no usás Hosted UI, solo redirigís localmente
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
