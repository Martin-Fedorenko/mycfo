import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";

export default function CustomSingleAutoComplete({ options, onChange }) {
  const [value, setValue] = useState(null);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (onChange) onChange(newValue); // callback al padre
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      onChange={handleChange}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Seleccioná o escribí una opción"
          variant="outlined"
         
        />
      )}
    />
  );
}
