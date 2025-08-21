import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { mpApi } from "../..//mercado-pago/mpApi";
import catalogs from "../..//mercado-pago/catalogs";

export default function MpLinkCard({ onLinked }) {
  const onLink = async () => {
    const { url } = await mpApi.getOauthUrl();
    window.location.href = url; // redirección a OAuth de MP
  };

  React.useEffect(() => {
    // Si volvés de OAuth con ?linked=1 podés refrescar estado
    const params = new URLSearchParams(window.location.search);
    if (params.get("linked") === "1" && onLinked) onLinked();
  }, [onLinked]);

  return (
    <Card sx={{ maxWidth: 720, mx: "auto", mt: 6, textAlign: "center", p: 2 }}>
      <CardContent>
        <Stack spacing={2} alignItems="center">
          {/* Poné tu logo en /public/assets/mp-logo.svg si querés */}
          <img
            src="/assets/mp-logo.svg"
            alt="Mercado Pago"
            style={{ height: 40 }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <Typography variant="h6">{catalogs.labels.vincularTitle}</Typography>
          <Typography color="text.secondary">
            {catalogs.labels.vincularDesc}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button variant="contained" color="success" onClick={onLink}>
          {catalogs.labels.iniciarVinculacion}
        </Button>
      </CardActions>
    </Card>
  );
}
