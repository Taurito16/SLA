-- ============================================================
-- SLA — Comercializadora Global S.A.
-- Esquema de Base de Datos (PostgreSQL / Supabase)
-- Archivo de referencia — Ya aplicado via MCP
-- ============================================================

-- 1. Departamentos (datos semilla: Finanzas, Logística)
CREATE TABLE departamentos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  icono TEXT DEFAULT 'business',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Servicios Críticos del ERP
CREATE TABLE servicios_criticos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  departamento_id BIGINT NOT NULL REFERENCES departamentos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  horario_inicio TIME NOT NULL,
  horario_fin TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KPIs (Disponibilidad y Desempeño)
CREATE TABLE kpis (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  servicio_id BIGINT NOT NULL REFERENCES servicios_criticos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('disponibilidad', 'desempeno')),
  nombre TEXT NOT NULL,
  nivel_objetivo NUMERIC(10,2) NOT NULL,
  unidad TEXT NOT NULL CHECK (unidad IN ('%', 'segundos', 'minutos', 'horas')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Penalizaciones / Remedios
CREATE TABLE penalizaciones (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kpi_id BIGINT NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  porcentaje_impacto NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Vista consolidada del SLA
CREATE OR REPLACE VIEW v_resumen_sla AS
SELECT
  s.id AS servicio_id,
  d.nombre AS departamento,
  d.icono AS departamento_icono,
  s.nombre AS servicio,
  s.horario_inicio,
  s.horario_fin,
  kd.nombre AS kpi_disponibilidad_nombre,
  kd.nivel_objetivo AS kpi_disponibilidad_objetivo,
  kd.unidad AS kpi_disponibilidad_unidad,
  kp.nombre AS kpi_desempeno_nombre,
  kp.nivel_objetivo AS kpi_desempeno_objetivo,
  kp.unidad AS kpi_desempeno_unidad,
  (
    SELECT string_agg(p.descripcion, ' | ')
    FROM penalizaciones p
    JOIN kpis k ON k.id = p.kpi_id
    WHERE k.servicio_id = s.id
  ) AS penalizaciones
FROM servicios_criticos s
JOIN departamentos d ON d.id = s.departamento_id
LEFT JOIN kpis kd ON kd.servicio_id = s.id AND kd.tipo = 'disponibilidad'
LEFT JOIN kpis kp ON kp.servicio_id = s.id AND kp.tipo = 'desempeno'
ORDER BY d.nombre, s.nombre;

-- 6. RLS + Permisos (acceso público — ámbito educativo)
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_criticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_access" ON departamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON servicios_criticos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON kpis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_access" ON penalizaciones FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON departamentos TO anon;
GRANT ALL ON servicios_criticos TO anon;
GRANT ALL ON kpis TO anon;
GRANT ALL ON penalizaciones TO anon;
GRANT SELECT ON v_resumen_sla TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 7. Datos semilla
INSERT INTO departamentos (nombre, icono) VALUES
  ('Finanzas', 'account_balance'),
  ('Logística', 'local_shipping')
ON CONFLICT (nombre) DO NOTHING;
