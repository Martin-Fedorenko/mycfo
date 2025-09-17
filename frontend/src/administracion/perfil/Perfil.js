import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import CampoEditable from "../../shared-components/CampoEditable";
import BotonConsolidar from "../../shared-components/CustomButton";
import {
  CognitoUserPool,
  CognitoUser,
} from "amazon-cognito-identity-js";

export default function Perfil() {
  const [perfil, setPerfil] = useState({
    nombre: "",
    apellido: "",
    organizacion: "",
    telefono: "",
    email: "",
    puesto: "",
  });
  const [editados, setEditados] = useState({}); // campos editados

  // ⚙️ Configuración del pool
  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
  };
  const userPool = new CognitoUserPool(poolData);

  // 🔹 Cargar datos desde sessionStorage
  useEffect(() => {
    const nombre = sessionStorage.getItem("name") || "";
    const apellido = sessionStorage.getItem("family_name") || "";
    const organizacion = sessionStorage.getItem("organizacion") || "";
    const telefono = sessionStorage.getItem("phone_number") || "";
    const email = sessionStorage.getItem("email") || "";
    const puesto = sessionStorage.getItem("custom:puesto") || "";

    setPerfil({
      nombre,
      apellido,
      organizacion,
      telefono,
      email,
      puesto,
    });
  }, []);

  const handleChange = (campo, valor) => {
    setPerfil((prev) => ({ ...prev, [campo]: valor }));
    setEditados((prev) => ({ ...prev, [campo]: true }));
  };

  const handleConsolidar = () => {
    console.log("Datos enviados:", perfil);

    // 🔹 Guardar en sessionStorage
    sessionStorage.setItem("name", perfil.nombre);
    sessionStorage.setItem("family_name", perfil.apellido);
    sessionStorage.setItem("organizacion", perfil.organizacion);
    sessionStorage.setItem("phone_number", perfil.telefono);
    sessionStorage.setItem("email", perfil.email);
    sessionStorage.setItem("custom:puesto", perfil.puesto);

    // 🔹 Actualizar en Cognito
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      alert("No hay usuario autenticado en Cognito.");
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session.isValid()) {
        console.error("Error obteniendo sesión:", err);
        alert("La sesión no es válida, vuelve a iniciar sesión.");
        return;
      }

      // Mapeo de atributos a formato de Cognito
      const attributes = [
        { Name: "name", Value: perfil.nombre },
        { Name: "family_name", Value: perfil.apellido },
        { Name: "custom:organizacion", Value: perfil.organizacion },
        { Name: "phone_number", Value: perfil.telefono },
        { Name: "email", Value: perfil.email },
        { Name: "custom:puesto", Value: perfil.puesto },
      ];

      cognitoUser.updateAttributes(attributes, (err, result) => {
        if (err) {
          console.error("Error actualizando atributos:", err);
          alert("Hubo un error al actualizar en Cognito.");
        } else {
          console.log("Atributos actualizados en Cognito:", result);
          alert("Cambios guardados con éxito en Cognito ✅");
          setEditados({});
        }
      });
    });
  };

  const hayCambios = Object.keys(editados).length > 0;

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Perfil de Usuario
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Actualiza tu información personal
      </Typography>

      <CampoEditable
        label="Nombre"
        value={perfil.nombre}
        onChange={(v) => handleChange("nombre", v)}
      />
      <CampoEditable
        label="Apellido"
        value={perfil.apellido}
        onChange={(v) => handleChange("apellido", v)}
      />
      <CampoEditable
        label="Organización"
        value={perfil.organizacion}
        onChange={(v) => handleChange("organizacion", v)}
      />
      <CampoEditable
        label="Número de Teléfono"
        value={perfil.telefono}
        onChange={(v) => handleChange("telefono", v)}
      />
      <CampoEditable
        label="Email"
        value={perfil.email}
        onChange={(v) => handleChange("email", v)}
      />
      <CampoEditable
        label="Puesto en la Organización"
        value={perfil.puesto}
        onChange={(v) => handleChange("puesto", v)}
      />

      {hayCambios && (
        <BotonConsolidar
          label="Guardar Cambios"
          onClick={handleConsolidar}
          width="100%"
        />
      )}
    </Box>
  );
}
