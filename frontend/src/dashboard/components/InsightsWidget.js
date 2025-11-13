import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import API_CONFIG from "../../config/api-config";

const InsightsWidget = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const baseUrl = API_CONFIG.IA;
      const now = new Date();
      const params = new URLSearchParams();
      params.set("anio", now.getFullYear());
      params.set("mes", now.getMonth() + 1);
      const headers = { "Content-Type": "application/json" };
      const sub = sessionStorage.getItem('sub');
      const token = sessionStorage.getItem('accessToken');
      if (sub) headers['X-Usuario-Sub'] = sub;
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${baseUrl}/ia/insights?${params.toString()}`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ height: "100%", display: 'flex', flexDirection: 'column' }}>
      <CardHeader title="Análisis IA" subheader="Diagnóstico automático de tu situación" />
      <CardContent sx={{ flexGrow: 1 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={180} />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : data ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">{data.diagnostico_corto || 'Análisis generado'}</Typography>
            {data.senales ? (
              <>
                {data.senales.liquidez ? (
                  <Typography variant="body2"><b>Liquidez:</b> {data.senales.liquidez}</Typography>
                ) : null}
                {data.senales.rentabilidad ? (
                  <Typography variant="body2"><b>Rentabilidad:</b> {data.senales.rentabilidad}</Typography>
                ) : null}
                {data.senales.tendencias ? (
                  <Typography variant="body2"><b>Tendencias:</b> {data.senales.tendencias}</Typography>
                ) : null}
              </>
            ) : null}
            {Array.isArray(data.tips) && data.tips.length > 0 ? (
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Recomendaciones</Typography>
                {data.tips.slice(0,4).map((t, i) => (
                  <Typography key={i} variant="body2">• {t}</Typography>
                ))}
              </Stack>
            ) : null}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Presiona "Interpretar situación" para obtener un diagnóstico breve y tips.
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="contained" onClick={handleRun} disabled={loading}>
          Interpretar situación
        </Button>
      </CardActions>
    </Card>
  );
};

export default InsightsWidget;

