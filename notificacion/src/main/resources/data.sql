-- Script de inicialización para la base de datos de notificaciones
-- Este script se ejecuta automáticamente al iniciar la aplicación

-- Crear preferencias por defecto para el usuario 1
INSERT INTO notification_preferences (user_id, email_enabled, in_app_enabled, push_enabled, daily_digest_enabled, weekly_digest_enabled, digest_time, user_email) 
VALUES (1, true, true, false, true, false, '09:00:00', 'usuario1@mycfo.com')
ON DUPLICATE KEY UPDATE email_enabled = true;

-- Crear algunas notificaciones de ejemplo
INSERT INTO notifications (id, user_id, type, title, body, severity, resource_type, resource_id, is_read, created_at) VALUES
(UUID(), 1, 'MOVEMENT_NEW', 'Nuevo movimiento detectado', 'Se detectó un nuevo movimiento de $50,000 en tu cuenta bancaria', 'INFO', 'MOVEMENT', 'mov_001', false, NOW()),
(UUID(), 1, 'BUDGET_EXCEEDED', 'Presupuesto excedido', 'El presupuesto de "Marketing" se ha excedido en $5,000', 'WARN', 'BUDGET', 'budget_001', false, NOW()),
(UUID(), 1, 'REPORT_READY', 'Reporte mensual listo', 'Tu reporte mensual de enero está disponible para descargar', 'INFO', 'REPORT', 'report_001', true, NOW()),
(UUID(), 1, 'CASH_FLOW_ALERT', 'Alerta de Cash Flow', 'Tu balance proyectado será negativo en 15 días', 'CRIT', 'CASH_FLOW', 'cf_001', false, NOW()),
(UUID(), 1, 'REMINDER_CUSTOM', 'Recordatorio: Vencimiento de monotributo', 'No olvides pagar el monotributo antes del 20 de febrero', 'INFO', 'REMINDER', 'rem_001', false, NOW());

-- Crear algunos recordatorios de ejemplo
INSERT INTO custom_reminders (id, user_id, title, message, scheduled_for, is_recurring, recurrence_pattern, is_active, created_at) VALUES
(UUID(), 1, 'Vencimiento de monotributo', 'Recordatorio para pagar el monotributo mensual', DATE_ADD(NOW(), INTERVAL 1 DAY), true, 'MONTHLY', true, NOW()),
(UUID(), 1, 'Carga de datos semanal', 'No olvides cargar los movimientos de la semana', DATE_ADD(NOW(), INTERVAL 7 DAY), true, 'WEEKLY', true, NOW()),
(UUID(), 1, 'Revisión de presupuestos', 'Revisa y ajusta tus presupuestos mensuales', DATE_ADD(NOW(), INTERVAL 15 DAY), false, NULL, true, NOW());
