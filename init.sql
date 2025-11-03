CREATE DATABASE IF NOT EXISTS administracion_db;
CREATE DATABASE IF NOT EXISTS consolidacion_db;
CREATE DATABASE IF NOT EXISTS ia_db;
CREATE DATABASE IF NOT EXISTS notificacion_db;
CREATE DATABASE IF NOT EXISTS pronostico_db;
CREATE DATABASE IF NOT EXISTS registro_db;
CREATE DATABASE IF NOT EXISTS reporte_db;

GRANT ALL PRIVILEGES ON administracion_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON consolidacion_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON ia_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON notificacion_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON pronostico_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON registro_db.* TO 'user'@'%';
GRANT ALL PRIVILEGES ON reporte_db.* TO 'user'@'%';

FLUSH PRIVILEGES;
