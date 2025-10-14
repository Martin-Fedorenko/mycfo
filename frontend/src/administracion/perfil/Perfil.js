import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CampoEditable from "../../shared-components/CampoEditable";
import BotonConsolidar from "../../shared-components/CustomButton";
import axios from "axios";

export default function Perfil() {
  const [perfil, setPerfil] = useState({
    nombre: "",
    telefono: "",
    email: "",
  });
  const [editados, setEditados] = useState({}); // campos editados
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar datos desde la BD al montar el componente
  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const sub = sessionStorage.getItem("sub");
        const response = await axios.get("http://localhost:8081/api/usuarios/perfil", {
          headers: {
            "X-Usuario-Sub": sub
          }
        });

        const userData = response.data;
        setPerfil({
          nombre: userData.nombre || "",
          telefono: userData.telefono || "",
          email: userData.email || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        alert("Error al cargar el perfil");
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  const handleChange = (campo, valor) => {
    setPerfil((prev) => ({ ...prev, [campo]: valor }));
    setEditados((prev) => ({ ...prev, [campo]: true }));
  };

  const handleConsolidar = async () => {
    console.log("Datos enviados:", perfil);

    try {
      const sub = sessionStorage.getItem("sub");
      
      // 🔹 Actualizar en BD y Cognito mediante el backend
      await axios.put("http://localhost:8081/api/usuarios/perfil", {
        nombre: perfil.nombre,
        email: perfil.email,
        telefono: perfil.telefono,
      }, {
        headers: {
          "X-Usuario-Sub": sub
        }
      });

      // 🔹 Actualizar sessionStorage
      sessionStorage.setItem("nombre", perfil.nombre);
      sessionStorage.setItem("email", perfil.email);
      sessionStorage.setItem("telefono", perfil.telefono);

      alert("Cambios guardados con éxito ✅");
      setEditados({});
      window.dispatchEvent(new Event("userDataUpdated"));
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      alert("Hubo un error al actualizar el perfil.");
    }
  };

  const hayCambios = Object.keys(editados).length > 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1000, mx: "auto", mt: 4, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Perfil de Usuario
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3 }}>
        Actualiza tu información personal (los cambios se guardan en la base de datos)
      </Typography>

      <CampoEditable
        label="Nombre Completo"
        value={perfil.nombre}
        onChange={(v) => handleChange("nombre", v)}
      />
      <CampoEditable
        label="Email"
        value={perfil.email}
        onChange={(v) => handleChange("email", v)}
      />
      <CampoEditable
        label="Número de Teléfono"
        value={perfil.telefono}
        onChange={(v) => handleChange("telefono", v)}
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
