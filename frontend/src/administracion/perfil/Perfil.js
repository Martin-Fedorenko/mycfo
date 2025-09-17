import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import CampoEditable from "../../shared-components/CampoEditable";
import BotonConsolidar from "../../shared-components/CustomButton";

export default function Perfil() {
  // Datos iniciales hardcodeados
  const initialData = {
    nombre: "Martín",
    apellido: "Fedorenko",
    organizacion: "MyCFO",
    telefono: "+54 11 5555-1234",
    email: "martin@example.com",
    puesto: "CTO",
  };

  const [perfil, setPerfil] = useState(initialData);
  const [editados, setEditados] = useState({}); // campos editados

  const handleChange = (campo, valor) => {
    setPerfil((prev) => ({ ...prev, [campo]: valor }));
    setEditados((prev) => ({ ...prev, [campo]: true }));
  };

  const handleConsolidar = () => {
    console.log("Datos enviados:", perfil);
    alert("Cambios guardados con éxito");
    setEditados({});
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
