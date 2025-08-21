import React from "react";
import { CircularProgress, Box } from "@mui/material";
import MpLinkCard from "./components/MpLinkCard";
import MainGrid from "./components/MainGrid";
import { mpApi } from "./mpApi";

export default function MercadoPagoPage() {
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState(null);

  const loadStatus = async () => {
    try {
      const s = await mpApi.getStatus();
      setStatus(s);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadStatus();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!status?.linked) {
    return <MpLinkCard onLinked={loadStatus} />;
  }

  // Si hay más de una cuenta, podrías pasarla por props. Hoy status alcanza.
  return <MainGrid status={status} />;
}
