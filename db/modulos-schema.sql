-- Base de datos de "Módulos de aprendizaje" (Cloudflare D1)
-- Crear:  npx wrangler d1 execute leaf-modulos --remote --file=db/schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  edad INTEGER NOT NULL,
  escuela TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  estado TEXT NOT NULL,
  rol TEXT NOT NULL,             -- alumno | docente | otro (lo que eligió al registrarse)
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  staff INTEGER NOT NULL DEFAULT 0,  -- 1 = puede ver el panel docente
  admin INTEGER NOT NULL DEFAULT 0,  -- 1 = puede dar permisos (correos en ADMIN_EMAILS)
  creado TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tokens (
  token TEXT PRIMARY KEY,
  usuario TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creado TEXT NOT NULL,
  expira TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS progreso_sesion (
  usuario TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  sesion INTEGER NOT NULL,
  terminada INTEGER NOT NULL DEFAULT 0,
  respuestas TEXT NOT NULL DEFAULT '{}',   -- respuestas de la ficha en línea (JSON)
  simuladores TEXT NOT NULL DEFAULT '[]',  -- simuladores usados (JSON)
  actualizado TEXT NOT NULL,
  PRIMARY KEY (usuario, modulo, sesion)
);

CREATE TABLE IF NOT EXISTS repasos (
  usuario TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  fase INTEGER NOT NULL,
  mejor REAL NOT NULL,       -- mejor resultado (0 a 1); se aprueba con 0.8
  intentos INTEGER NOT NULL,
  actualizado TEXT NOT NULL,
  PRIMARY KEY (usuario, modulo, fase)
);

CREATE TABLE IF NOT EXISTS entregas (
  id TEXT PRIMARY KEY,
  usuario TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  sesion INTEGER NOT NULL,
  r2_key TEXT NOT NULL,      -- id de la foto en la tabla archivos
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  tamano INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | revisada | corregir
  comentario TEXT,
  revisado_por TEXT,
  fecha TEXT NOT NULL,
  url TEXT                  -- enlace externo (video)
);

CREATE TABLE IF NOT EXISTS certificados (
  folio TEXT PRIMARY KEY,
  usuario TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  modulo TEXT NOT NULL,
  fecha TEXT NOT NULL,
  UNIQUE (usuario, modulo)
);

CREATE INDEX IF NOT EXISTS idx_entregas_usuario ON entregas (usuario, modulo);
CREATE INDEX IF NOT EXISTS idx_tokens_usuario ON tokens (usuario);

-- Fotos de los alumnos
CREATE TABLE IF NOT EXISTS archivos (
  id TEXT PRIMARY KEY,
  tipo TEXT NOT NULL,
  data BLOB NOT NULL
);

-- PDFs privados del docente, partidos en pedazos de 1.5 MB
CREATE TABLE IF NOT EXISTS docente_archivos (
  modulo TEXT NOT NULL,
  archivo TEXT NOT NULL,
  parte INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (modulo, archivo, parte)
);
