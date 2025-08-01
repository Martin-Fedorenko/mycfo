import Drawer from "@mui/material/Drawer";
import MainGrid from "./components/MainGrid";

export default function NotificationDrawer({ open, onClose, alerts }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <MainGrid alerts={alerts} onClose={onClose} />
    </Drawer>
  );
}
