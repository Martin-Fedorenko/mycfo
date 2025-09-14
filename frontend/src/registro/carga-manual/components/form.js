import React, { useState } from "react";
import { Box, IconButton, FormLabel, OutlinedInput } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

export default function ComentarioEditable() {
  const [comentario, setComentario] = useState("Observaciones…");
  const [tempComentario, setTempComentario] = useState(comentario);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setTempComentario(comentario); // copia el valor actual para poder cancelar
    setIsEditing(true);
  };

  const handleSave = () => {
    setComentario(tempComentario);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <FormLabel htmlFor="comentario">Comentario (opcional)</FormLabel>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
        }}
      >
        <OutlinedInput
          id="comentario"
          placeholder="Observaciones…"
          value={isEditing ? tempComentario : comentario}
          onChange={(e) => setTempComentario(e.target.value)}
          size="small"
          fullWidth
          disabled={!isEditing} // deshabilita si no está en modo edición
        />
        {!isEditing ? (
          <IconButton size="small" onClick={handleEdit}>
            <EditIcon fontSize="small" />
          </IconButton>
        ) : (
          <>
            <IconButton
              size="small"
              color="success"
              onClick={handleSave}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={handleCancel}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
}
