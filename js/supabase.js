/**
 * SLA — Comercializadora Global S.A.
 * Capa de datos: CRUD con Supabase
 * 
 * Cada función retorna { data, error }.
 * Las funciones fetch* obtienen datos.
 * Las funciones create* insertan registros.
 * Las funciones delete* eliminan registros (cascada configurada en DB).
 */

const db = window.__supabase;

// ============================================================
// DEPARTAMENTOS
// ============================================================

async function fetchDepartamentos() {
  const { data, error } = await db
    .from('departamentos')
    .select('*')
    .order('nombre');
  if (error) console.error('Error fetchDepartamentos:', error);
  return data || [];
}

// ============================================================
// SERVICIOS CRÍTICOS
// ============================================================

async function fetchServicios() {
  const { data, error } = await db
    .from('servicios_criticos')
    .select('*, departamentos(id, nombre, icono)')
    .order('created_at', { ascending: true });
  if (error) console.error('Error fetchServicios:', error);
  return data || [];
}

async function createServicio({ departamento_id, nombre, descripcion, horario_inicio, horario_fin }) {
  const { data, error } = await db
    .from('servicios_criticos')
    .insert({ departamento_id, nombre, descripcion, horario_inicio, horario_fin })
    .select('*, departamentos(id, nombre, icono)');
  if (error) {
    console.error('Error createServicio:', error);
    return { data: null, error };
  }
  return { data: data?.[0] || null, error: null };
}

async function deleteServicio(id) {
  const { error } = await db
    .from('servicios_criticos')
    .delete()
    .eq('id', id);
  if (error) console.error('Error deleteServicio:', error);
  return { error };
}

// ============================================================
// KPIs
// ============================================================

async function fetchKPIs() {
  const { data, error } = await db
    .from('kpis')
    .select('*, servicios_criticos(id, nombre, departamento_id)')
    .order('created_at', { ascending: true });
  if (error) console.error('Error fetchKPIs:', error);
  return data || [];
}

async function createKPI({ servicio_id, tipo, nombre, nivel_objetivo, unidad }) {
  const { data, error } = await db
    .from('kpis')
    .insert({ servicio_id, tipo, nombre, nivel_objetivo, unidad })
    .select('*, servicios_criticos(id, nombre, departamento_id)');
  if (error) {
    console.error('Error createKPI:', error);
    return { data: null, error };
  }
  return { data: data?.[0] || null, error: null };
}

async function deleteKPI(id) {
  const { error } = await db
    .from('kpis')
    .delete()
    .eq('id', id);
  if (error) console.error('Error deleteKPI:', error);
  return { error };
}

// ============================================================
// PENALIZACIONES
// ============================================================

async function fetchPenalizaciones() {
  const { data, error } = await db
    .from('penalizaciones')
    .select('*, kpis(id, nombre, tipo)')
    .order('created_at', { ascending: true });
  if (error) console.error('Error fetchPenalizaciones:', error);
  return data || [];
}

async function createPenalizacion({ kpi_id, descripcion, porcentaje_impacto }) {
  const payload = { kpi_id, descripcion };
  if (porcentaje_impacto !== null && porcentaje_impacto !== undefined && porcentaje_impacto !== '') {
    payload.porcentaje_impacto = porcentaje_impacto;
  }
  const { data, error } = await db
    .from('penalizaciones')
    .insert(payload)
    .select('*, kpis(id, nombre, tipo)');
  if (error) {
    console.error('Error createPenalizacion:', error);
    return { data: null, error };
  }
  return { data: data?.[0] || null, error: null };
}

async function deletePenalizacion(id) {
  const { error } = await db
    .from('penalizaciones')
    .delete()
    .eq('id', id);
  if (error) console.error('Error deletePenalizacion:', error);
  return { error };
}

// ============================================================
// VISTA RESUMEN SLA
// ============================================================

async function fetchResumenSLA() {
  const { data, error } = await db
    .from('v_resumen_sla')
    .select('*');
  if (error) console.error('Error fetchResumenSLA:', error);
  return data || [];
}
