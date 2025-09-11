// src/components/Logo.js
import React from "react";
import { Box } from "@mui/material";

export default function Logo({ size = 32, mobile = false }) {
  const logoSrc = mobile
    ? `${process.env.PUBLIC_URL}/logo-mobile.png` // tu logo para móvil
    : `${process.env.PUBLIC_URL}/logo192.png`;    // logo para desktop

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: "none",
        boxShadow: "none",
      }}
    >
      <img
        src={logoSrc}
        alt="Logo MyCFO"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        onError={(e) => {
          console.error("Error al cargar logo:", e.target.src);
          e.target.style.backgroundColor = "lightcoral";
          e.target.style.opacity = 0.5;
        }}
      />
    </Box>
  );
}
