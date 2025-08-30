import React from "react";
import {
  Box,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";

export default function CustomSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  error = "",
  width = "100%",
}) {
  return (
    <Box sx={{ width }}>
      <InputLabel id={`${name}-label`} required>
        {label}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        displayEmpty
        size="small"
        input={<OutlinedInput />}
        sx={{ width: "100%" }}
      >
        <MenuItem value="" disabled>
          Seleccioná una opción
        </MenuItem>
        {options.map((opt, i) => (
          <MenuItem key={i} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
}
