import { Card, CardContent, Typography, Chip, Stack } from "@mui/material";

export default function NotificacionCard({ titulo, fecha, tipo }) {
  return (
    <Card variant="outlined" sx={{ mb: 2, boxShadow: 1 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{titulo}</Typography>
          <Chip label={tipo} color="primary" size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {fecha}
        </Typography>
      </CardContent>
    </Card>
  );
}
