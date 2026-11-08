-- ============================================================
-- Base de datos MySQL · Fondos VIE 2027 (prototipo SIGECI-VIE)
-- Ejecutar una vez:  mysql -u root -p < servidor/schema.sql  y luego  mysql -u root -p fondos_vie < servidor/seed.sql
-- Cinco mantenimientos con CRUD completo: instancias, usuarios, comités técnicos, catálogos e informes pendientes.
-- ============================================================
CREATE DATABASE IF NOT EXISTS fondos_vie CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
USE fondos_vie;

DROP TABLE IF EXISTS comites;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS instancias;
DROP TABLE IF EXISTS catalogos;
DROP TABLE IF EXISTS informes_pendientes;

-- 1) Instancias (escuelas y centros) · RF-USR-10
CREATE TABLE instancias (
  id VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  tipo ENUM('Escuela','Centro','Departamento') NOT NULL DEFAULT 'Escuela',
  horas_vie INT NOT NULL DEFAULT 0 CHECK (horas_vie >= 0),
  horas_vie_centros INT NOT NULL DEFAULT 0 CHECK (horas_vie_centros >= 0)
) ENGINE=InnoDB;

-- 2) Usuarios y roles · RF-USR-06 a RF-USR-10
CREATE TABLE usuarios (
  id VARCHAR(30) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  cedula VARCHAR(20) NULL,
  orcid VARCHAR(25) NULL,
  plaza VARCHAR(30) NOT NULL DEFAULT 'Propiedad',
  rol VARCHAR(40) NOT NULL,
  instancia_id VARCHAR(10) NULL,
  estado ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  FOREIGN KEY (instancia_id) REFERENCES instancias(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3) Comités técnicos por instancia · RF-USR-11, RF-ADM-01
CREATE TABLE comites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instancia_id VARCHAR(10) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  coordinador_id VARCHAR(30) NOT NULL,
  tamano INT NOT NULL DEFAULT 5 CHECK (tamano >= 1),
  FOREIGN KEY (instancia_id) REFERENCES instancias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (coordinador_id) REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4) Catálogos del formulario · RF-CON-07
CREATE TABLE catalogos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  catalogo VARCHAR(60) NOT NULL,
  valor VARCHAR(300) NOT NULL,
  puntos INT NULL,
  UNIQUE KEY uq_catalogo_valor (catalogo, valor(150))
) ENGINE=InnoDB;

-- 5) Personas con informes pendientes · RF-MOR-01 a RF-MOR-06
CREATE TABLE informes_pendientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cedula VARCHAR(20) NULL,
  proyecto VARCHAR(40) NULL,
  detalle VARCHAR(300) NOT NULL,
  estado ENUM('Pendiente','Regularizado') NOT NULL DEFAULT 'Pendiente',
  registrado_por VARCHAR(120) NULL,
  fecha DATE NOT NULL
) ENGINE=InnoDB;
