CREATE DATABASE IF NOT EXISTS administracion_db;
CREATE DATABASE IF NOT EXISTS notificacion_db;
CREATE DATABASE IF NOT EXISTS pronostico_db;
CREATE DATABASE IF NOT EXISTS registro_db;

CREATE USER 'administrador'@'%' IDENTIFIED BY 'fedorenko1234';

GRANT ALL PRIVILEGES ON administracion_db.* TO 'administrador'@'%';
GRANT ALL PRIVILEGES ON notificacion_db.* TO 'administrador'@'%';
GRANT ALL PRIVILEGES ON pronostico_db.* TO 'administrador'@'%';
GRANT ALL PRIVILEGES ON registro_db.* TO 'administrador'@'%';