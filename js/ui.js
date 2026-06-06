/**
 * SLA — Comercializadora Global S.A.
 * Capa de UI: Renderizado de componentes DOM
 *
 * Cada función render* recibe datos y actualiza el DOM.
 * Cada función populate* rellena un <select>.
 */

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Muestra un toast de notificación.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:20px">${icons[type] || 'info'}</span>
    ${message}
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/**
 * Formatea un string de hora "HH:MM:SS" a "HH:MM".
 */
function fmtTime(t) {
  if (!t) return '—';
  return t.substring(0, 5);
}

// ============================================================
// POPULATE SELECTS
// ============================================================

/**
 * Rellena el select de departamentos en el formulario de servicios.
 */
function populateDeptSelect(departamentos) {
  const sel = document.getElementById('svcDepartamento');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">Seleccionar departamento...</option>';
  departamentos.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.nombre;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some(o => o.value === prev)) sel.value = prev;
}

/**
 * Rellena el select de servicios en el formulario de KPIs.
 */
function populateServicioSelect(servicios) {
  const sel = document.getElementById('kpiServicio');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">Seleccionar servicio...</option>';
  servicios.forEach(s => {
    const deptName = s.departamentos ? s.departamentos.nombre : '';
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `[${deptName}] ${s.nombre}`;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some(o => o.value === prev)) sel.value = prev;
}

/**
 * Rellena el select de KPIs en el formulario de penalizaciones.
 */
function populateKPISelect(kpis) {
  const sel = document.getElementById('penKPI');
  if (!sel) return;
  const prev = sel.value;
  sel.innerHTML = '<option value="">Seleccionar KPI...</option>';
  kpis.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k.id;
    const tipoLabel = k.tipo === 'disponibilidad' ? 'Disp.' : 'Desemp.';
    opt.textContent = `${k.nombre} (${tipoLabel})`;
    sel.appendChild(opt);
  });
  if (prev && [...sel.options].some(o => o.value === prev)) sel.value = prev;
}

// ============================================================
// RENDER: STAT CARDS (Dashboard)
// ============================================================

function renderStats(servicios, kpis, penalizaciones, departamentos) {
  document.getElementById('statServicios').textContent = servicios.length;
  document.getElementById('statKPIs').textContent = kpis.length;
  document.getElementById('statPenalizaciones').textContent = penalizaciones.length;
  document.getElementById('statDepartamentos').textContent = departamentos.length;
}

// ============================================================
// RENDER: DASHBOARD SERVICE CARDS
// ============================================================

function renderDashboardServices(servicios, kpis) {
  const grid = document.getElementById('dashboardServicesGrid');
  const empty = document.getElementById('emptyDashServices');
  grid.innerHTML = '';

  if (servicios.length === 0) {
    grid.appendChild(empty);
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  servicios.forEach(s => {
    const deptName = s.departamentos?.nombre || '—';
    const deptIcon = s.departamentos?.icono || 'business';
    const svcKpis = kpis.filter(k => k.servicio_id === s.id);
    const kpiD = svcKpis.find(k => k.tipo === 'disponibilidad');
    const kpiP = svcKpis.find(k => k.tipo === 'desempeno');

    const card = document.createElement('div');
    card.className = 'dash-svc-card';
    card.innerHTML = `
      <div class="dash-svc-card__dept">${deptName}</div>
      <div class="dash-svc-card__name">${s.nombre}</div>
      <div class="dash-svc-card__time">
        <span class="material-symbols-outlined">schedule</span>
        ${fmtTime(s.horario_inicio)} — ${fmtTime(s.horario_fin)}
      </div>
      <div class="dash-svc-card__chips">
        <span class="metric-chip">Disp: ${kpiD ? kpiD.nivel_objetivo + kpiD.unidad : '—'}</span>
        <span class="metric-chip metric-chip--perf">Desemp: ${kpiP ? kpiP.nivel_objetivo + ' ' + kpiP.unidad : '—'}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ============================================================
// RENDER: SERVICIOS CRÍTICOS
// ============================================================

function renderServicios(servicios) {
  const grid = document.getElementById('serviciosGrid');
  const empty = document.getElementById('emptyServicios');
  grid.innerHTML = '';

  if (servicios.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  servicios.forEach(s => {
    const deptName = s.departamentos?.nombre || '—';
    const deptIcon = s.departamentos?.icono || 'business';

    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
      <div class="service-card__top">
        <span class="service-card__dept">
          <span class="material-symbols-outlined">${deptIcon}</span>
          ${deptName}
        </span>
      </div>
      <div class="service-card__name">${s.nombre}</div>
      <div class="service-card__schedule">
        <span class="material-symbols-outlined">schedule</span>
        ${fmtTime(s.horario_inicio)} — ${fmtTime(s.horario_fin)}
      </div>
      ${s.descripcion ? `<div class="service-card__desc">${s.descripcion}</div>` : ''}
      <div class="service-card__actions">
        <button class="btn btn--danger" onclick="handleDeleteServicio(${s.id})">
          <span class="material-symbols-outlined" style="font-size:16px">delete</span>
          Eliminar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ============================================================
// RENDER: KPIs
// ============================================================

function renderKPIs(kpis, servicios) {
  const list = document.getElementById('kpisList');
  const empty = document.getElementById('emptyKPIs');
  list.innerHTML = '';

  if (kpis.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  kpis.forEach(k => {
    const svc = servicios.find(s => s.id === k.servicio_id);
    const svcName = svc ? svc.nombre : `Servicio #${k.servicio_id}`;
    const isDesemp = k.tipo === 'desempeno';

    const row = document.createElement('div');
    row.className = `kpi-row${isDesemp ? ' kpi-row--desempeno' : ''}`;
    row.innerHTML = `
      <span class="kpi-row__badge">${isDesemp ? 'DESEMP' : 'DISP'}</span>
      <div class="kpi-row__info">
        <div class="kpi-row__name">${k.nombre} <small>→ ${svcName}</small></div>
        <div class="kpi-row__target">Objetivo: ${k.nivel_objetivo} ${k.unidad}</div>
      </div>
      <div class="kpi-row__actions">
        <button class="btn btn--danger" onclick="handleDeleteKPI(${k.id})">
          <span class="material-symbols-outlined" style="font-size:16px">delete</span>
          Eliminar
        </button>
      </div>
    `;
    list.appendChild(row);
  });
}

// ============================================================
// RENDER: PENALIZACIONES
// ============================================================

function renderPenalizaciones(penalizaciones, kpis) {
  const list = document.getElementById('penalizacionesList');
  const empty = document.getElementById('emptyPenalizaciones');
  list.innerHTML = '';

  if (penalizaciones.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  penalizaciones.forEach(p => {
    const kpi = kpis.find(k => k.id === p.kpi_id);
    const kpiName = kpi ? kpi.nombre : `KPI #${p.kpi_id}`;

    const row = document.createElement('div');
    row.className = 'pen-row';
    row.innerHTML = `
      <div class="pen-row__icon">
        <span class="material-symbols-outlined">gavel</span>
      </div>
      <div class="pen-row__info">
        <div class="pen-row__kpi">${kpiName}</div>
        <div class="pen-row__desc">${p.descripcion}</div>
        ${p.porcentaje_impacto ? `<div class="pen-row__pct">Impacto: ${p.porcentaje_impacto}% del presupuesto</div>` : ''}
      </div>
      <div class="pen-row__actions">
        <button class="btn btn--danger" onclick="handleDeletePenalizacion(${p.id})">
          <span class="material-symbols-outlined" style="font-size:16px">delete</span>
          Eliminar
        </button>
      </div>
    `;
    list.appendChild(row);
  });
}

// ============================================================
// RENDER: TABLAS RESUMEN (Dashboard + Resumen SLA)
// ============================================================

/**
 * Renderiza una tabla resumen en el tbody indicado.
 * Usa la vista v_resumen_sla.
 */
function renderResumenTable(resumen, tbodyId, emptyId) {
  const tbody = document.getElementById(tbodyId);
  const empty = document.getElementById(emptyId);
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!resumen || resumen.length === 0) {
    if (empty) empty.style.display = 'block';
    const tableWrap = tbody.closest('.table-wrap');
    if (tableWrap) tableWrap.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  const tableWrap = tbody.closest('.table-wrap');
  if (tableWrap) tableWrap.style.display = '';

  resumen.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${r.departamento}</strong></td>
      <td>${r.servicio}</td>
      <td>${fmtTime(r.horario_inicio)} — ${fmtTime(r.horario_fin)}</td>
      <td>
        ${r.kpi_disponibilidad_nombre
          ? `${r.kpi_disponibilidad_nombre}<br><small><strong>${r.kpi_disponibilidad_objetivo}${r.kpi_disponibilidad_unidad}</strong></small>`
          : '<small style="color:var(--on-surface-variant)">Pendiente</small>'}
      </td>
      <td>
        ${r.kpi_desempeno_nombre
          ? `${r.kpi_desempeno_nombre}<br><small><strong>${r.kpi_desempeno_objetivo} ${r.kpi_desempeno_unidad}</strong></small>`
          : '<small style="color:var(--on-surface-variant)">Pendiente</small>'}
      </td>
      <td style="max-width:220px;">
        ${r.penalizaciones
          ? r.penalizaciones.split(' | ').map(p => `<small>• ${p}</small>`).join('<br>')
          : '<small style="color:var(--on-surface-variant)">Sin penalización</small>'}
      </td>
    `;
    tbody.appendChild(tr);
  });
}
