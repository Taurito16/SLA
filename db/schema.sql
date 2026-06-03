-- ============================================================
-- SLA - Comercializadora Global S.A.
-- Esquema de Base de Datos para Supabase (PostgreSQL)
-- ============================================================

-- 1. Tabla: servicios_criticos
CREATE TABLE IF NOT EXISTS servicios_criticos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  departamento TEXT NOT NULL CHECK (departamento IN ('Finanzas', 'Logistica')),
  nombre_servicio TEXT NOT NULL,
  descripcion TEXT,
  horario_inicio TIME NOT NULL,
  horario_fin TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla: kpis
CREATE TABLE IF NOT EXISTS kpis (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  servicio_id BIGINT NOT NULL REFERENCES servicios_criticos(id) ON DELETE CASCADE,
  tipo_kpi TEXT NOT NULL CHECK (tipo_kpi IN ('disponibilidad', 'desempeno')),
  nombre_kpi TEXT NOT NULL,
  nivel_objetivo NUMERIC NOT NULL,
  unidad TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla: penalizaciones
CREATE TABLE IF NOT EXISTS penalizaciones (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kpi_id BIGINT NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  descripcion_remedio TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Políticas de Seguridad (RLS) — Acceso público (ámbito educativo)
-- ============================================================
ALTER TABLE servicios_criticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalizaciones ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "Acceso público total servicios" ON servicios_criticos;
DROP POLICY IF EXISTS "Acceso público total kpis" ON kpis;
DROP POLICY IF EXISTS "Acceso público total penalizaciones" ON penalizaciones;

-- Crear políticas de acceso público
CREATE POLICY "Acceso público total servicios" 
  ON servicios_criticos FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público total kpis" 
  ON kpis FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Acceso público total penalizaciones" 
  ON penalizaciones FOR ALL 
  USING (true) WITH CHECK (true);

-- Otorgar permisos al rol anónimo
GRANT ALL ON servicios_criticos TO anon;
GRANT ALL ON kpis TO anon;
GRANT ALL ON penalizaciones TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
