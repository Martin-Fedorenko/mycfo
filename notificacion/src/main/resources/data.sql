-- Script de inicialización para la base de datos de notificaciones
-- Este script se ejecuta automáticamente al iniciar la aplicación

-- Crear preferencias por defecto para el usuario 1
INSERT INTO notification_preferences (user_id, email_enabled, in_app_enabled, push_enabled, daily_digest_enabled, weekly_digest_enabled, digest_time, user_email) 
VALUES (1, true, true, false, true, true, '09:00:00', 'mycfoarg@gmail.com')
ON DUPLICATE KEY UPDATE email_enabled = true;

-- Crear notificaciones de ejemplo (sin especificar id - se genera automáticamente)
INSERT INTO notifications (user_id, type, title, body, severity, resource_type, resource_id, is_read, created_at) VALUES
-- Notificaciones de hoy
(1, 'MOVEMENT_NEW', 'Nuevo ingreso detectado', 'Se detectó un nuevo ingreso de $150,000 en tu cuenta bancaria', 'INFO', 'MOVEMENT', 'mov_001', false, NOW()),
(1, 'MOVEMENT_HIGH', 'Movimiento alto detectado', 'Se detectó un movimiento alto de $500,000 - revisar origen', 'WARN', 'MOVEMENT', 'mov_002', false, NOW()),
(1, 'BUDGET_EXCEEDED', 'Presupuesto de Marketing excedido', 'El presupuesto de "Marketing" se ha excedido en $15,000', 'WARN', 'BUDGET', 'budget_001', false, NOW()),
(1, 'BUDGET_WARNING', 'Presupuesto de Ventas al 90%', 'El presupuesto de "Ventas" está al 90% de su límite', 'INFO', 'BUDGET', 'budget_002', false, NOW()),
(1, 'CASH_FLOW_ALERT', 'Alerta crítica de Cash Flow', 'Tu balance proyectado será negativo en 5 días', 'CRIT', 'CASH_FLOW', 'cf_001', false, NOW()),
(1, 'REPORT_READY', 'Reporte mensual listo', 'Tu reporte mensual de enero está disponible para descargar', 'INFO', 'REPORT', 'report_001', true, NOW()),
(1, 'REPORT_ANOMALY', 'Anomalía en reporte detectada', 'Se detectó una anomalía en el reporte de gastos', 'WARN', 'REPORT', 'report_002', false, NOW()),
(1, 'REMINDER_CUSTOM', 'Recordatorio: Vencimiento de monotributo', 'No olvides pagar el monotributo antes del 20 de febrero', 'INFO', 'SYSTEM', 'rem_001', false, NOW()),
(1, 'REMINDER_DEADLINE', 'Vencimiento próximo: Factura 001', 'La factura 001 vence en 3 días', 'WARN', 'SYSTEM', 'rem_002', false, NOW()),
(1, 'SYSTEM_MAINTENANCE', 'Mantenimiento programado', 'El sistema estará en mantenimiento el domingo de 2:00 a 4:00 AM', 'INFO', 'SYSTEM', 'sys_001', true, NOW()),

-- Notificaciones de ayer
(1, 'MOVEMENT_NEW', 'Ingreso de ayer', 'Se detectó un ingreso de $75,000 ayer', 'INFO', 'MOVEMENT', 'mov_003', false, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'BUDGET_CREATED', 'Nuevo presupuesto creado', 'Se creó el presupuesto "Desarrollo" para Q1', 'INFO', 'BUDGET', 'budget_003', false, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'FORECAST_ALERT', 'Alerta de pronóstico', 'El pronóstico indica una tendencia negativa', 'WARN', 'SYSTEM', 'forecast_001', false, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 'DATA_IMPORTED', 'Datos importados exitosamente', 'Se importaron 150 movimientos desde el banco', 'INFO', 'SYSTEM', 'data_001', true, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Notificaciones de hace 2 días
(1, 'MOVEMENT_CATEGORIZED', 'Movimiento categorizado', 'Se categorizó automáticamente un movimiento como "Alimentación"', 'INFO', 'MOVEMENT', 'mov_004', true, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'BUDGET_COMPLETED', 'Presupuesto completado', 'El presupuesto "Marketing" se completó exitosamente', 'INFO', 'BUDGET', 'budget_004', true, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'MONTHLY_SUMMARY', 'Resumen mensual disponible', 'Tu resumen mensual de enero está listo', 'INFO', 'REPORT', 'summary_001', false, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Notificaciones de hace 3 días
(1, 'REMINDER_RECURRING', 'Recordatorio recurrente', 'Recordatorio semanal: Revisar gastos', 'INFO', 'SYSTEM', 'rem_003', true, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'USER_INVITED', 'Usuario invitado', 'Se invitó a juan@empresa.com al proyecto', 'INFO', 'SYSTEM', 'user_001', true, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'ROLE_CHANGED', 'Rol actualizado', 'Tu rol fue actualizado a "Administrador"', 'INFO', 'SYSTEM', 'user_002', true, DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Notificaciones de hace 4 días
(1, 'DATA_EXPORTED', 'Datos exportados', 'Se exportaron los datos del mes de enero', 'INFO', 'SYSTEM', 'data_002', true, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 'REMINDER_BILL_DUE', 'Factura próxima a vencer', 'La factura 002 vence en 2 días', 'WARN', 'BILL', 'rem_004', false, DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Notificaciones de hace 5 días
(1, 'MOVEMENT_NEW', 'Egreso detectado', 'Se detectó un egreso de $25,000 para servicios', 'INFO', 'MOVEMENT', 'mov_005', true, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 'BUDGET_EXCEEDED', 'Presupuesto de Servicios excedido', 'El presupuesto de "Servicios" se excedió en $3,000', 'WARN', 'BUDGET', 'budget_005', true, DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Notificaciones de hace 6 días
(1, 'CASH_FLOW_ALERT', 'Alerta de flujo de caja', 'Tu flujo de caja proyectado es positivo', 'INFO', 'CASH_FLOW', 'cf_002', true, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(1, 'REPORT_READY', 'Reporte semanal listo', 'Tu reporte semanal está disponible', 'INFO', 'REPORT', 'report_003', true, DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- Notificaciones de hace 7 días (para digest semanal)
(1, 'MOVEMENT_NEW', 'Ingreso semanal', 'Se detectó un ingreso de $100,000', 'INFO', 'MOVEMENT', 'mov_006', true, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 'BUDGET_CREATED', 'Presupuesto semanal', 'Se creó el presupuesto "Operaciones"', 'INFO', 'BUDGET', 'budget_006', true, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 'SYSTEM_MAINTENANCE', 'Mantenimiento completado', 'El mantenimiento del sistema se completó exitosamente', 'INFO', 'SYSTEM', 'sys_002', true, DATE_SUB(NOW(), INTERVAL 7 DAY));

-- Crear algunos recordatorios de ejemplo
INSERT INTO custom_reminders (user_id, title, message, scheduled_for, is_recurring, recurrence_pattern, is_active, created_at) VALUES
(1, 'Vencimiento de monotributo', 'Recordatorio para pagar el monotributo mensual', DATE_ADD(NOW(), INTERVAL 1 DAY), true, 'MONTHLY', true, NOW()),
(1, 'Carga de datos semanal', 'No olvides cargar los movimientos de la semana', DATE_ADD(NOW(), INTERVAL 7 DAY), true, 'WEEKLY', true, NOW()),
(1, 'Revisión de presupuestos', 'Revisa y ajusta tus presupuestos mensuales', DATE_ADD(NOW(), INTERVAL 15 DAY), false, NULL, true, NOW());