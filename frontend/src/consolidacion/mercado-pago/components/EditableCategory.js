// /mercado-pago/components/EditableCategory.js
import React from "react";
import { Chip, TextField, Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const CATEGORIAS_PREDEFINIDAS = [
  "MercadoPago",
  "Ventas",
  "Servicios",
  "Productos",
  "Comisiones",
  "Reembolsos",
  "Transferencias",
  "Otros",
];

export default function EditableCategory({
  value = "MercadoPago",
  onChange,
  disabled = false,
}) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onChange?.(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 120 }}
      >
        <TextField
          size="small"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          autoFocus
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 32,
              fontSize: "0.75rem",
            },
          }}
        />
        <Tooltip title="Guardar">
          <IconButton size="small" onClick={handleSave} color="primary">
            <CheckIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Cancelar">
          <IconButton size="small" onClick={handleCancel} color="inherit">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Chip
        size="small"
        label={value}
        color="default"
        variant="outlined"
        sx={{ minWidth: 80 }}
      />
      {!disabled && (
        <Tooltip title="Editar categoría">
          <IconButton
            size="small"
            onClick={() => setIsEditing(true)}
            sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
