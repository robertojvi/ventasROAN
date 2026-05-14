-- Script de inicialización de la base de datos
-- Ejecutar: mysql -u root -p < init.sql

DROP DATABASE IF EXISTS sistema_ventas;
CREATE DATABASE sistema_ventas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sistema_ventas;

-- Las tablas son creadas automáticamente por JPA (Hibernate) en el primer arranque
-- (ver application.yml: spring.jpa.hibernate.ddl-auto=update).
-- Este script solo crea la base y deja preparado el usuario admin inicial,
-- que el backend inserta automáticamente al arrancar si no existe.

-- Usuario admin por defecto (creado automáticamente por DataInitializer al arrancar):
--   email: admin@ventas.com
--   password: admin123
--   rol: ADMIN
