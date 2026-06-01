-- =============================================
-- DESPACHO LM — Esquema base de datos Supabase
-- =============================================

-- Tabla pacientes
CREATE TABLE pacientes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  apellidos text,
  dni text,
  fecha_nacimiento date,
  nombre_tutor text,
  apellidos_tutor text,
  dni_tutor text,
  relacion_tutor text,
  telefono_email text,
  notas text,
  created_at timestamptz DEFAULT now()
);

-- Tabla sesiones
CREATE TABLE sesiones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  paciente_nombre text NOT NULL,
  importe numeric(8,2) NOT NULL DEFAULT 60,
  pagado boolean NOT NULL DEFAULT false,
  metodo_pago text CHECK (metodo_pago IN ('Efectivo','Bizum','Transferencia','Tarjeta')),
  observaciones text,
  created_at timestamptz DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX idx_sesiones_fecha ON sesiones(fecha);
CREATE INDEX idx_sesiones_pagado ON sesiones(pagado);
CREATE INDEX idx_sesiones_paciente ON sesiones(paciente_id);

-- Row Level Security (solo usuarios autenticados acceden)
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso autenticado pacientes"
  ON pacientes FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Acceso autenticado sesiones"
  ON sesiones FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- DATOS INICIALES — 26 pacientes de mayo 2026
-- =============================================
INSERT INTO pacientes (nombre, apellidos, notas) VALUES
  ('Alba', 'Calvo', ''),
  ('Alba', 'Martínez', ''),
  ('Alex', '', 'Solo nombre en archivo original'),
  ('Anne Marie', '', 'Solo nombre en archivo original'),
  ('Aran', '', 'Solo nombre en archivo original'),
  ('Berta', 'Martínez', ''),
  ('Carla', 'Kelly', ''),
  ('Cloe', 'Asensio', ''),
  ('Emma', 'Trepat', ''),
  ('Erin', '', 'Solo nombre en archivo original'),
  ('Familia', 'Bianchi Ríos', 'Sesión familiar'),
  ('Helen', '', 'Solo nombre en archivo original'),
  ('Hugo', '', 'Solo nombre en archivo original'),
  ('Julia', 'Llopard', ''),
  ('Julian', 'Swiss', ''),
  ('Maia', '', 'Solo nombre en archivo original'),
  ('Mar', 'Pérez', ''),
  ('Marc', 'Portero', ''),
  ('Martina', 'Bonet', ''),
  ('Nico', 'Muñoz', ''),
  ('Noa', 'Lloret', ''),
  ('Oliver', '', 'Solo nombre en archivo original'),
  ('Pepi', '', 'Solo nombre en archivo original'),
  ('Pietro', 'Michelacci', ''),
  ('Ubai', 'Ziat', ''),
  ('Vladic', 'Anglès', '');

-- =============================================
-- DATOS INICIALES — 61 sesiones mayo 2026
-- =============================================
INSERT INTO sesiones (fecha, paciente_nombre, importe, pagado, metodo_pago) VALUES
  ('2026-05-05','Alba Martínez',60,true,'Efectivo'),
  ('2026-05-05','Hugo',60,true,'Efectivo'),
  ('2026-05-05','Maia',60,false,'Bizum'),
  ('2026-05-05','Nico Muñoz',60,true,'Tarjeta'),
  ('2026-05-06','Alba Calvo',60,false,'Bizum'),
  ('2026-05-06','Vladic Anglès',60,true,'Bizum'),
  ('2026-05-07','Anne Marie',60,true,'Bizum'),
  ('2026-05-07','Emma Trepat',60,true,'Bizum'),
  ('2026-05-07','Familia Bianchi Ríos',60,true,'Efectivo'),
  ('2026-05-07','Mar Pérez',60,false,'Bizum'),
  ('2026-05-08','Julian Swiss',60,true,'Efectivo'),
  ('2026-05-08','Martina Bonet',60,true,'Bizum'),
  ('2026-05-08','Ubai Ziat',60,true,'Efectivo'),
  ('2026-05-11','Oliver',60,true,'Bizum'),
  ('2026-05-12','Alex',60,true,'Efectivo'),
  ('2026-05-12','Hugo',60,true,'Efectivo'),
  ('2026-05-12','Julia Llopard',60,true,'Bizum'),
  ('2026-05-12','Maia',60,false,'Bizum'),
  ('2026-05-12','Marc Portero',60,true,'Bizum'),
  ('2026-05-12','Noa Lloret',60,false,'Efectivo'),
  ('2026-05-12','Pietro Michelacci',60,false,'Bizum'),
  ('2026-05-13','Erin',60,true,'Bizum'),
  ('2026-05-13','Pepi',60,true,'Efectivo'),
  ('2026-05-13','Vladic Anglès',60,true,'Bizum'),
  ('2026-05-14','Berta Martínez',60,true,'Bizum'),
  ('2026-05-14','Carla Kelly',60,false,'Bizum'),
  ('2026-05-14','Cloe Asensio',60,true,'Efectivo'),
  ('2026-05-14','Familia Bianchi Ríos',60,true,'Bizum'),
  ('2026-05-14','Mar Pérez',60,false,'Bizum'),
  ('2026-05-15','Julian Swiss',60,true,'Efectivo'),
  ('2026-05-19','Alba Martínez',60,true,'Efectivo'),
  ('2026-05-19','Alex',60,true,'Efectivo'),
  ('2026-05-19','Helen',60,true,'Efectivo'),
  ('2026-05-19','Hugo',60,true,'Efectivo'),
  ('2026-05-19','Maia',60,false,'Bizum'),
  ('2026-05-19','Noa Lloret',60,true,'Bizum'),
  ('2026-05-20','Alba Calvo',60,false,'Bizum'),
  ('2026-05-20','Erin',60,true,'Bizum'),
  ('2026-05-21','Anne Marie',60,true,'Bizum'),
  ('2026-05-21','Emma Trepat',60,true,'Bizum'),
  ('2026-05-21','Familia Bianchi Ríos',60,true,'Bizum'),
  ('2026-05-21','Mar Pérez',60,false,'Bizum'),
  ('2026-05-22','Julian Swiss',60,true,'Efectivo'),
  ('2026-05-22','Martina Bonet',60,true,'Bizum'),
  ('2026-05-22','Ubai Ziat',60,true,'Bizum'),
  ('2026-05-26','Alex',60,true,'Efectivo'),
  ('2026-05-26','Anne Marie',60,true,'Bizum'),
  ('2026-05-26','Hugo',60,true,'Efectivo'),
  ('2026-05-26','Julia Llopard',60,true,'Bizum'),
  ('2026-05-26','Julian Swiss',60,true,'Efectivo'),
  ('2026-05-27','Aran',60,true,'Bizum'),
  ('2026-05-27','Erin',60,true,'Bizum'),
  ('2026-05-27','Pepi',60,true,'Efectivo'),
  ('2026-05-27','Vladic Anglès',60,true,'Bizum'),
  ('2026-05-28','Berta Martínez',60,true,'Bizum'),
  ('2026-05-28','Carla Kelly',60,true,'Efectivo'),
  ('2026-05-28','Cloe Asensio',60,true,'Efectivo'),
  ('2026-05-28','Familia Bianchi Ríos',60,true,'Efectivo'),
  ('2026-05-28','Mar Pérez',60,true,'Efectivo'),
  ('2026-05-29','Helen',60,true,'Efectivo'),
  ('2026-05-29','Julian Swiss',60,true,'Efectivo');
