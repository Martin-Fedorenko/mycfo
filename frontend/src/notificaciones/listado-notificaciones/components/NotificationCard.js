import { Card, CardContent, Typography, Chip, Stack } from "@mui/material";

export default function NotificationCard({
  titulo,
  fecha,
  tipo,
  isRead,
  onClick,
}) {
  return (
    <Card
      variant="outlined"
      sx={{ mb: 2, boxShadow: 1, opacity: isRead ? 0.6 : 1, cursor: "pointer" }}
      onClick={onClick}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">{titulo}</Typography>
          <Chip label={tipo} size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {fecha}
        </Typography>
      </CardContent>
    </Card>
  );
}
