/**
 * SLA — Comercializadora Global S.A.
 * Capa de aplicación: Eventos, Navegación e Inicialización
 *
 * Orquesta supabase.js (datos) y ui.js (renderizado).
 */

// ============================================================
// ESTADO GLOBAL
// ============================================================
let _departamentos = [];
let _servicios = [];
let _kpis = [];
let _penalizaciones = [];
let _resumen = [];

// ============================================================
// CARGA COMPLETA DE DATOS
// ============================================================

async function loadAllData() {
  [_departamentos, _servicios, _kpis, _penalizaciones, _resumen] = await Promise.all([
    fetchDepartamentos(),
    fetchServicios(),
    fetchKPIs(),
    fetchPenalizaciones(),
    fetchResumenSLA()
  ]);

  // Renderizar todo
  renderStats(_servicios, _kpis, _penalizaciones, _departamentos);
  renderDashboardServices(_servicios, _kpis);
  renderServicios(_servicios);
  renderKPIs(_kpis, _servicios);
  renderPenalizaciones(_penalizaciones, _kpis);
  renderResumenTable(_resumen, 'bodyDashResumen', 'emptyDashResumen');
  renderResumenTable(_resumen, 'bodyResumenFinal', 'emptyResumenFinal');

  // Poblar selects
  populateDeptSelect(_departamentos);
  populateServicioSelect(_servicios);
  populateKPISelect(_kpis);
}

// ============================================================
// HANDLERS: DELETE (expuestos globalmente para onclick)
// ============================================================

async function handleDeleteServicio(id) {
  if (!confirm('¿Eliminar este servicio? Sus KPIs y penalizaciones asociadas también se eliminarán.')) return;
  const { error } = await deleteServicio(id);
  if (error) {
    showToast(`Error al eliminar servicio: ${error.message}`, 'error');
    return;
  }
  showToast('Servicio eliminado correctamente', 'info');
  await loadAllData();
}

async function handleDeleteKPI(id) {
  if (!confirm('¿Eliminar este KPI? Sus penalizaciones asociadas también se eliminarán.')) return;
  const { error } = await deleteKPI(id);
  if (error) {
    showToast(`Error al eliminar KPI: ${error.message}`, 'error');
    return;
  }
  showToast('KPI eliminado correctamente', 'info');
  await loadAllData();
}

async function handleDeletePenalizacion(id) {
  if (!confirm('¿Eliminar esta penalización?')) return;
  const { error } = await deletePenalizacion(id);
  if (error) {
    showToast(`Error al eliminar penalización: ${error.message}`, 'error');
    return;
  }
  showToast('Penalización eliminada correctamente', 'info');
  await loadAllData();
}

// ============================================================
// NAVEGACIÓN SIDEBAR
// ============================================================

function initSidebar() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.dataset.section;

      // Actualizar navegación activa
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Mostrar sección destino
      sections.forEach(s => s.classList.remove('active'));
      const targetSection = document.getElementById(`section-${target}`);
      if (targetSection) targetSection.classList.add('active');

      // Cerrar sidebar en mobile
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });

  // Toggle sidebar
  const menuBtn = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
      sidebar.classList.remove('collapsed');
    } else {
      sidebar.classList.toggle('collapsed');
      sidebar.classList.remove('open');
    }
  });

  // Cerrar sidebar al hacer click fuera (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 &&
        sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ============================================================
// FORMULARIOS
// ============================================================

function initForms() {
  // --- Formulario: Servicio ---
  document.getElementById('formServicio').addEventListener('submit', async (e) => {
    e.preventDefault();

    const departamento_id = parseInt(document.getElementById('svcDepartamento').value);
    const nombre = document.getElementById('svcNombre').value.trim();
    const descripcion = document.getElementById('svcDescripcion').value.trim();
    const horario_inicio = document.getElementById('svcHoraInicio').value;
    const horario_fin = document.getElementById('svcHoraFin').value;

    if (!departamento_id || !nombre || !horario_inicio || !horario_fin) {
      showToast('Complete todos los campos obligatorios', 'error');
      return;
    }

    const { data, error } = await createServicio({
      departamento_id, nombre, descripcion, horario_inicio, horario_fin
    });

    if (error) {
      showToast(`Error al crear servicio: ${error.message}`, 'error');
      return;
    }

    showToast('Servicio crítico agregado correctamente', 'success');
    e.target.reset();
    await loadAllData();
  });

  // --- Formulario: KPI ---
  document.getElementById('formKPI').addEventListener('submit', async (e) => {
    e.preventDefault();

    const servicio_id = parseInt(document.getElementById('kpiServicio').value);
    const tipo = document.getElementById('kpiTipo').value;
    const nombre = document.getElementById('kpiNombre').value.trim();
    const nivel_objetivo = parseFloat(document.getElementById('kpiObjetivo').value);
    const unidad = document.getElementById('kpiUnidad').value;

    if (!servicio_id || !tipo || !nombre || isNaN(nivel_objetivo) || !unidad) {
      showToast('Complete todos los campos obligatorios', 'error');
      return;
    }

    const { data, error } = await createKPI({
      servicio_id, tipo, nombre, nivel_objetivo, unidad
    });

    if (error) {
      showToast(`Error al crear KPI: ${error.message}`, 'error');
      return;
    }

    showToast('KPI agregado correctamente', 'success');
    e.target.reset();
    await loadAllData();
  });

  // --- Formulario: Penalización ---
  document.getElementById('formPenalizacion').addEventListener('submit', async (e) => {
    e.preventDefault();

    const kpi_id = parseInt(document.getElementById('penKPI').value);
    const descripcion = document.getElementById('penDescripcion').value.trim();
    const porcentaje_raw = document.getElementById('penPorcentaje').value;
    const porcentaje_impacto = porcentaje_raw ? parseFloat(porcentaje_raw) : null;

    if (!kpi_id || !descripcion) {
      showToast('Complete todos los campos obligatorios', 'error');
      return;
    }

    const { data, error } = await createPenalizacion({
      kpi_id, descripcion, porcentaje_impacto
    });

    if (error) {
      showToast(`Error al crear penalización: ${error.message}`, 'error');
      return;
    }

    showToast('Penalización agregada correctamente', 'success');
    e.target.reset();
    await loadAllData();
  });
}

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Fecha actual
  const now = new Date();
  const optsDate = { year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('es-ES', optsDate);

  document.getElementById('fechaActual').textContent = dateStr;

  // Fecha en documento SLA
  const slaFecha = document.getElementById('slaFecha');
  if (slaFecha) slaFecha.textContent = dateStr;

  // Inicializar módulos
  initSidebar();
  initForms();

  // Cargar datos
  loadAllData();
});
