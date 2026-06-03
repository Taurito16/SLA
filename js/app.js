/**
 * SLA - Comercializadora Global S.A.
 * Lógica de negocio: CRUD + Renderizado
 */

// Referencia al cliente Supabase (usamos "db" para evitar conflicto con global "supabase" del CDN)
const db = window.__supabase;

// ============================================================
// UTILIDADES
// ============================================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':');
  return `${h}:${m}`;
}

// ============================================================
// SERVICIOS CRÍTICOS
// ============================================================
async function fetchServicios() {
  const { data, error } = await db
    .from('servicios_criticos')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching servicios:', error);
    return [];
  }
  return data || [];
}

async function createServicio(departamento, nombre, descripcion, horarioInicio, horarioFin) {
  const { data, error } = await db
    .from('servicios_criticos')
    .insert({
      departamento,
      nombre_servicio: nombre,
      descripcion,
      horario_inicio: horarioInicio,
      horario_fin: horarioFin
    })
    .select();
  if (error) {
    showToast(`Error al crear servicio: ${error.message}`, 'error');
    return null;
  }
  showToast('Servicio crítico agregado correctamente', 'success');
  return data?.[0] || null;
}

async function deleteServicio(id) {
  const { error } = await db
    .from('servicios_criticos')
    .delete()
    .eq('id', id);
  if (error) {
    showToast(`Error al eliminar: ${error.message}`, 'error');
    return false;
  }
  showToast('Servicio eliminado', 'info');
  return true;
}

function renderServicios(servicios) {
  const container = document.getElementById('serviciosContainer');
  const empty = document.getElementById('emptyServicios');

  // Limpiar sin borrar el empty state
  const items = container.querySelectorAll('.servicio-card');
  items.forEach(el => el.remove());

  if (servicios.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  servicios.forEach(svc => {
    const card = document.createElement('div');
    card.className = 'servicio-card';
    card.dataset.id = svc.id;

    const iconStr = svc.departamento === 'Finanzas'
      ? 'account_balance'
      : 'local_shipping';

    card.innerHTML = `
      <div class="card-header">
        <span class="material-symbols-outlined" style="color:var(--md-primary);font-size:28px">${iconStr}</span>
        <span class="departamento-badge">${svc.departamento}</span>
      </div>
      <div class="servicio-name">${svc.nombre_servicio}</div>
      <div class="servicio-horario">
        🕐 ${formatTime(svc.horario_inicio)} — ${formatTime(svc.horario_fin)}
      </div>
      ${svc.descripcion ? `<div class="servicio-desc">${svc.descripcion}</div>` : ''}
      <div class="card-actions">
        <button class="btn btn-danger btn-sm" onclick="handleDeleteServicio(${svc.id})">
          Eliminar
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function handleDeleteServicio(id) {
  await deleteServicio(id);
  await loadAllData();
}

// ============================================================
// KPIs
// ============================================================
async function fetchKPIs() {
  const { data, error } = await db
    .from('kpis')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching KPIs:', error);
    return [];
  }
  return data || [];
}

async function createKPI(servicioId, tipo, nombre, objetivo, unidad) {
  const { data, error } = await db
    .from('kpis')
    .insert({
      servicio_id: servicioId,
      tipo_kpi: tipo,
      nombre_kpi: nombre,
      nivel_objetivo: objetivo,
      unidad
    })
    .select();
  if (error) {
    showToast(`Error al crear KPI: ${error.message}`, 'error');
    return null;
  }
  showToast('KPI agregado correctamente', 'success');
  return data?.[0] || null;
}

async function deleteKPI(id) {
  const { error } = await db
    .from('kpis')
    .delete()
    .eq('id', id);
  if (error) {
    showToast(`Error al eliminar KPI: ${error.message}`, 'error');
    return false;
  }
  showToast('KPI eliminado', 'info');
  return true;
}

function renderKPIs(kpis, servicios) {
  const container = document.getElementById('kpisContainer');
  const empty = document.getElementById('emptyKPIs');

  const items = container.querySelectorAll('.kpi-item');
  items.forEach(el => el.remove());

  if (kpis.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  // Agrupar KPIs por servicio
  kpis.forEach(kpi => {
    const svc = servicios.find(s => s.id === kpi.servicio_id);
    const svcName = svc ? svc.nombre_servicio : `Servicio #${kpi.servicio_id}`;
    const badgeColor = kpi.tipo_kpi === 'disponibilidad' ? 'var(--md-primary)' : 'var(--md-tertiary)';

    const item = document.createElement('div');
    item.className = 'kpi-item';
    item.innerHTML = `
      <span class="kpi-type">${kpi.tipo_kpi === 'disponibilidad' ? 'DISP' : 'DESEMP'}</span>
      <div class="kpi-info">
        <div class="kpi-name">${kpi.nombre_kpi} <small style="color:var(--md-on-surface-variant);font-weight:400;">→ ${svcName}</small></div>
        <div class="kpi-target">Objetivo: ${kpi.nivel_objetivo} ${kpi.unidad}</div>
      </div>
      <div class="kpi-actions">
        <button class="btn btn-danger btn-sm" onclick="handleDeleteKPI(${kpi.id})">Eliminar</button>
      </div>
    `;
    // Color the left border based on type
    item.style.borderLeftColor = badgeColor;
    container.appendChild(item);
  });
}

async function handleDeleteKPI(id) {
  await deleteKPI(id);
  await loadAllData();
}

// ============================================================
// PENALIZACIONES
// ============================================================
async function fetchPenalizaciones() {
  const { data, error } = await db
    .from('penalizaciones')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching penalizaciones:', error);
    return [];
  }
  return data || [];
}

async function createPenalizacion(kpiId, descripcion) {
  const { data, error } = await db
    .from('penalizaciones')
    .insert({
      kpi_id: kpiId,
      descripcion_remedio: descripcion
    })
    .select();
  if (error) {
    showToast(`Error al crear penalización: ${error.message}`, 'error');
    return null;
  }
  showToast('Penalización agregada correctamente', 'success');
  return data?.[0] || null;
}

async function deletePenalizacion(id) {
  const { error } = await db
    .from('penalizaciones')
    .delete()
    .eq('id', id);
  if (error) {
    showToast(`Error al eliminar penalización: ${error.message}`, 'error');
    return false;
  }
  showToast('Penalización eliminada', 'info');
  return true;
}

function renderPenalizaciones(penalizaciones, kpis) {
  const container = document.getElementById('penalizacionesContainer');
  const empty = document.getElementById('emptyPenalizaciones');

  const items = container.querySelectorAll('.penalizacion-item');
  items.forEach(el => el.remove());

  if (penalizaciones.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  penalizaciones.forEach(pen => {
    const kpi = kpis.find(k => k.id === pen.kpi_id);
    const kpiName = kpi ? kpi.nombre_kpi : `KPI #${pen.kpi_id}`;

    const item = document.createElement('div');
    item.className = 'penalizacion-item';
    item.innerHTML = `
      <div>
        <strong style="font-size:0.85rem;">${kpiName}</strong>
        <div class="penalizacion-text">${pen.descripcion_remedio}</div>
      </div>
      <button class="btn btn-danger btn-sm" onclick="handleDeletePenalizacion(${pen.id})">Eliminar</button>
    `;
    container.appendChild(item);
  });
}

async function handleDeletePenalizacion(id) {
  await deletePenalizacion(id);
  await loadAllData();
}

// ============================================================
// TABLA RESUMEN
// ============================================================
function renderResumen(servicios, kpis, penalizaciones) {
  const tbody = document.getElementById('resumenBody');
  const empty = document.getElementById('emptyResumen');

  tbody.innerHTML = '';

  if (servicios.length === 0) {
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  servicios.forEach(svc => {
    const kpisSvc = kpis.filter(k => k.servicio_id === svc.id);
    const kpiDisp = kpisSvc.find(k => k.tipo_kpi === 'disponibilidad');
    const kpiDesem = kpisSvc.find(k => k.tipo_kpi === 'desempeno');
    const penas = penalizaciones.filter(p =>
      kpisSvc.some(k => k.id === p.kpi_id)
    );

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${svc.departamento}</strong></td>
      <td>${svc.nombre_servicio}</td>
      <td>${formatTime(svc.horario_inicio)} — ${formatTime(svc.horario_fin)}</td>
      <td>
        ${kpiDisp
          ? `${kpiDisp.nombre_kpi}<br><small>${kpiDisp.nivel_objetivo}${kpiDisp.unidad}</small>`
          : '<small style="color:var(--text-light)">Pendiente</small>'}
      </td>
      <td>
        ${kpiDesem
          ? `${kpiDesem.nombre_kpi}<br><small>${kpiDesem.nivel_objetivo} ${kpiDesem.unidad}</small>`
          : '<small style="color:var(--text-light)">Pendiente</small>'}
      </td>
      <td style="max-width:200px;">
        ${penas.length > 0
          ? penas.map(p => `<small>• ${p.descripcion_remedio}</small>`).join('<br>')
          : '<small style="color:var(--text-light)">Sin penalización</small>'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// DASHBOARD KPIs
// ============================================================
function renderDashboardKPIs(servicios, kpis, penalizaciones) {
  document.getElementById('kpiTotalServicios').textContent = servicios.length;
  document.getElementById('kpiTotalKPIs').textContent = kpis.length;
  document.getElementById('kpiTotalPenalizaciones').textContent = penalizaciones.length;
  // Contar departamentos únicos
  const deptos = new Set(servicios.map(s => s.departamento));
  document.getElementById('kpiDepartamentos').textContent = deptos.size;
}

// ============================================================
// DASHBOARD CARDS (desde datos reales de Supabase)
// ============================================================
function renderDashboardServicios(servicios, kpis) {
  const container = document.getElementById('dashboardServicios');
  if (!container) return;
  container.innerHTML = '';

  if (servicios.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Agregue servicios desde la sección Servicios Críticos.</p></div>';
    return;
  }

  servicios.forEach(svc => {
    const kpisSvc = kpis.filter(k => k.servicio_id === svc.id);
    const kpiDisp = kpisSvc.find(k => k.tipo_kpi === 'disponibilidad');
    const kpiDesem = kpisSvc.find(k => k.tipo_kpi === 'desempeno');

    const card = document.createElement('div');
    card.className = 'db-card';
    card.style.borderLeft = '4px solid var(--md-primary)';

    card.innerHTML = `
      <div class="db-card-label">${svc.departamento}</div>
      <div class="db-card-title">${svc.nombre_servicio}</div>
      <div class="db-card-meta">🕐 ${formatTime(svc.horario_inicio)} — ${formatTime(svc.horario_fin)}</div>
      <div class="db-card-metrics">
        <span class="metric-chip">Disp: ${kpiDisp ? kpiDisp.nivel_objetivo + kpiDisp.unidad : '—'}</span>
        <span class="metric-chip">Desemp: ${kpiDesem ? kpiDesem.nivel_objetivo + ' ' + kpiDesem.unidad : '—'}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================
function initSidebar() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section-content');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.section;

      // Update active nav
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Show target section
      sections.forEach(s => s.classList.remove('active'));
      const targetSection = document.getElementById(`section-${target}`);
      if (targetSection) targetSection.classList.add('active');
    });
  });

  // Menu toggle for responsive sidebar
  const menuBtn = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
        sidebar.classList.remove('collapsed');
      } else {
        sidebar.classList.toggle('collapsed');
        sidebar.classList.remove('open');
      }
    });
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 &&
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

// ============================================================
// CARGA COMPLETA DE DATOS
// ============================================================
async function loadAllData() {
  const [servicios, kpis, penalizaciones] = await Promise.all([
    fetchServicios(),
    fetchKPIs(),
    fetchPenalizaciones()
  ]);

  renderServicios(servicios);
  renderKPIs(kpis, servicios);
  renderPenalizaciones(penalizaciones, kpis);
  renderResumen(servicios, kpis, penalizaciones);
  renderDashboardKPIs(servicios, kpis, penalizaciones);
  renderDashboardServicios(servicios, kpis);
  populateServicioSelect(servicios);
  populateKPISelect(kpis);
}

// ============================================================
// POBLAR SELECTS
// ============================================================
function populateServicioSelect(servicios) {
  const select = document.getElementById('kpiServicio');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '<option value="">Seleccionar servicio...</option>';
  servicios.forEach(svc => {
    const opt = document.createElement('option');
    opt.value = svc.id;
    opt.textContent = '[' + svc.departamento + '] ' + svc.nombre_servicio;
    select.appendChild(opt);
  });
  if (currentVal && [...select.options].some(o => o.value === currentVal)) {
    select.value = currentVal;
  }
}

function populateKPISelect(kpis) {
  const select = document.getElementById('penalizacionKPI');
  if (!select) return;
  const currentVal = select.value;
  select.innerHTML = '<option value="">Seleccionar KPI...</option>';
  kpis.forEach(kpi => {
    const opt = document.createElement('option');
    opt.value = kpi.id;
    opt.textContent = kpi.nombre_kpi + ' (' + kpi.tipo_kpi + ')';
    select.appendChild(opt);
  });
  if (currentVal && [...select.options].some(o => o.value === currentVal)) {
    select.value = currentVal;
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Fecha actual
  const now = new Date();
  const opts = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('fechaActual').textContent = now.toLocaleDateString('es-ES', opts);
  document.getElementById('footerYear').textContent = now.getFullYear();

  // Initialize sidebar navigation
  initSidebar();

  // --- Formulario Servicio ---
  document.getElementById('formServicio').addEventListener('submit', async (e) => {
    e.preventDefault();
    const departamento = document.getElementById('departamento').value;
    const nombre = document.getElementById('nombreServicio').value.trim();
    const descripcion = document.getElementById('descripcionServicio').value.trim();
    const horarioInicio = document.getElementById('horarioInicio').value;
    const horarioFin = document.getElementById('horarioFin').value;

    if (!departamento || !nombre || !horarioInicio || !horarioFin) {
      showToast('Complete todos los campos obligatorios', 'error');
      return;
    }

    const result = await createServicio(departamento, nombre, descripcion, horarioInicio, horarioFin);
    if (result) {
      e.target.reset();
      await loadAllData();
    }
  });

  // --- Formulario KPI ---
  document.getElementById('formKPI').addEventListener('submit', async (e) => {
    e.preventDefault();
    const servicioId = parseInt(document.getElementById('kpiServicio').value);
    const tipo = document.getElementById('kpiTipo').value;
    const nombre = document.getElementById('kpiNombre').value.trim();
    const objetivo = parseFloat(document.getElementById('kpiObjetivo').value);
    const unidad = document.getElementById('kpiUnidad').value;

    if (!servicioId || !tipo || !nombre || isNaN(objetivo) || !unidad) {
      showToast('Complete todos los campos obligatorios', 'error');
      return;
    }

    const result = await createKPI(servicioId, tipo, nombre, objetivo, unidad);
    if (result) {
      e.target.reset();
      await loadAllData();
    }
  });

  // --- Formulario Penalización ---
  document.getElementById('formPenalizacion').addEventListener('submit', async (e) => {
    e.preventDefault();
    const kpiId = parseInt(document.getElementById('penalizacionKPI').value);
    const descripcion = document.getElementById('penalizacionDesc').value.trim();

    if (!kpiId || !descripcion) {
      showToast('Complete todos los campos obligatorios', 'error');
      return;
    }

    const result = await createPenalizacion(kpiId, descripcion);
    if (result) {
      e.target.reset();
      await loadAllData();
    }
  });

  // Cargar datos iniciales
  loadAllData();
});
