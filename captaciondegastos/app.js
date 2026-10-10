/* ============================================================
   Captación de Gastos · Heliot Media
   Wizard paso a paso + Dashboard visual
   ============================================================ */

(function () {
  'use strict';

  /* ---------------- Datos ---------------- */
  const COLABORADORES = {
    '2026-HELIOT-0001': { nombre: 'Alexander Hernández', rol: 'Director General · Administración', iniciales: 'AH' },
    '2026-HELIOT-0002': { nombre: 'Odalys Amaya',        rol: 'Fotografía Principal · Dirección Creativa', iniciales: 'OA' },
    '2026-HELIOT-0003': { nombre: 'Nelson Romero',       rol: 'Producción · Apoyo Técnico', iniciales: 'NR' },
    '2026-HELIOT-0004': { nombre: 'Cristian Fernández',  rol: 'Marketing · Producción Creativa', iniciales: 'CF' },
    '2026-HELIOT-0005': { nombre: 'Keysi Hernández',     rol: 'Coordinación Operativa · Atención al Cliente', iniciales: 'KH' },
    '2026-HELIOT-0006': { nombre: 'Yaritza Portillo',    rol: 'Edición · Control Visual', iniciales: 'YP' }
  };

  const CATEGORIAS = [
    { valor: 'Alimentación', icono: '🍽️' },
    { valor: 'Transporte',   icono: '🚗' },
    { valor: 'Insumos',      icono: '📦' },
    { valor: 'Servicios',    icono: '💡' },
    { valor: 'Equipos',      icono: '🎥' },
    { valor: 'Otros',        icono: '📌' }
  ];

  const STEP_ORDER = ['fecha', 'categoria', 'proveedor', 'descripcion', 'poseeRecibo', 'archivo', 'comentarios'];

  /* ---------------- Estado ---------------- */
  const state = {
    colaborador: null,           // { codigo, nombre, rol, iniciales }
    gastos: [],                  // [{fecha, categoria, proveedor, descripcion, poseeRecibo, archivo, comentarios}]
    wizard: null,                // gasto en construcción
    wizardStep: null,            // key actual
    editarIndex: null            // null = nuevo; número = editar
  };

  /* ---------------- Referencias ---------------- */
  const viewColab     = document.getElementById('cgViewColab');
  const viewDash      = document.getElementById('cgViewDash');
  const viewWizard    = document.getElementById('cgViewWizard');

  const codigoInput   = document.getElementById('cgCodigo');
  const collabInfo    = document.getElementById('cgCollabInfo');
  const collabName    = document.getElementById('cgCollabName');
  const collabRole    = document.getElementById('cgCollabRole');
  const collabAv      = document.getElementById('cgCollabAvatar');
  const colabCont     = document.getElementById('cgColabContinuar');

  const dashAvatar    = document.getElementById('cgDashAvatar');
  const dashName      = document.getElementById('cgDashName');
  const dashRole      = document.getElementById('cgDashRole');
  const dashCount     = document.getElementById('cgDashCount');
  const grid          = document.getElementById('cgGrid');
  const btnEnviar     = document.getElementById('cgEnviar');
  const btnCambiar    = document.getElementById('cgCambiarColab');

  const wizardBody    = document.getElementById('cgWizardBody');
  const wizardNext    = document.getElementById('cgWizardNext');
  const wizardBack    = document.getElementById('cgWizardBack');
  const wizardCancel  = document.getElementById('cgWizardCancel');
  const progressFill  = document.getElementById('cgProgressFill');
  const progressText  = document.getElementById('cgProgressText');

  /* ---------------- Navegación entre vistas ---------------- */
  function mostrarVista(vista) {
    viewColab.hidden = vista !== 'colab';
    viewDash.hidden  = vista !== 'dash';
    viewWizard.hidden = vista !== 'wizard';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ============================================================
     VISTA 1 · COLABORADOR
     ============================================================ */
  function validarCodigo() {
    const val = codigoInput.value.trim().toUpperCase();
    const col = COLABORADORES[val];

    if (col) {
      codigoInput.classList.remove('cg-input-error');
      collabInfo.hidden = false;
      collabName.textContent = col.nombre;
      collabRole.textContent = col.rol;
      collabAv.textContent   = col.iniciales;
      colabCont.disabled = false;
    } else {
      collabInfo.hidden = true;
      colabCont.disabled = true;
      if (val) codigoInput.classList.add('cg-input-error');
      else codigoInput.classList.remove('cg-input-error');
    }
  }

  codigoInput.addEventListener('input', () => {
    codigoInput.value = codigoInput.value.toUpperCase();
    validarCodigo();
  });
  codigoInput.addEventListener('blur', validarCodigo);

  colabCont.addEventListener('click', () => {
    const val = codigoInput.value.trim().toUpperCase();
    const col = COLABORADORES[val];
    if (!col) return;
    state.colaborador = { codigo: val, ...col };
    dashAvatar.textContent = col.iniciales;
    dashName.textContent   = col.nombre;
    dashRole.textContent   = col.rol;
    renderDashboard();
    mostrarVista('dash');
  });

  btnCambiar.addEventListener('click', () => {
    if (state.gastos.length > 0 && !confirm('Se perderán los gastos que no hayas enviado. ¿Continuar?')) return;
    state.gastos = [];
    state.colaborador = null;
    codigoInput.value = '';
    validarCodigo();
    mostrarVista('colab');
  });

  /* ============================================================
     VISTA 2 · DASHBOARD
     ============================================================ */
  function renderDashboard() {
    grid.innerHTML = '';

    state.gastos.forEach((g, i) => {
      const card = crearTarjetaGasto(g, i);
      grid.appendChild(card);
    });

    const addCard = document.createElement('button');
    addCard.type = 'button';
    addCard.className = 'cg-card-add';
    addCard.innerHTML = `
      <div class="cg-card-add-icon">+</div>
      <div class="cg-card-add-label">Añadir gasto</div>
    `;
    addCard.addEventListener('click', abrirWizardNuevo);
    grid.appendChild(addCard);

    const n = state.gastos.length;
    dashCount.textContent = n === 1 ? '1 gasto' : `${n} gastos`;
    btnEnviar.disabled = n === 0;
    btnEnviar.textContent = n === 0
      ? 'Añade al menos un gasto'
      : `Enviar ${n === 1 ? 'gasto' : 'gastos'} a administración`;
  }

  function crearTarjetaGasto(g, index) {
    const card = document.createElement('article');
    card.className = 'cg-card';

    const tiene = g.poseeRecibo
      ? '<span class="cg-card-tag tiene">✓ Con recibo</span>'
      : '<span class="cg-card-tag sin">Sin recibo</span>';

    card.innerHTML = `
      <div class="cg-card-top">
        <span class="cg-card-num">Gasto ${index + 1}</span>
        <span class="cg-card-cat">${g.categoria}</span>
      </div>
      <p class="cg-card-desc">${escapeHtml(g.descripcion)}</p>
      <div class="cg-card-meta">
        <span><strong>Fecha:</strong> ${formatFecha(g.fecha)}</span>
        ${g.proveedor ? `<span><strong>Lugar:</strong> ${escapeHtml(g.proveedor)}</span>` : ''}
        ${g.comentarios ? `<span><strong>Notas:</strong> ${escapeHtml(g.comentarios)}</span>` : ''}
      </div>
      <div class="cg-card-footer">
        ${tiene}
        <button type="button" class="cg-card-del" title="Eliminar">×</button>
      </div>
    `;

    card.querySelector('.cg-card-del').addEventListener('click', () => {
      if (!confirm('¿Eliminar este gasto?')) return;
      state.gastos.splice(index, 1);
      renderDashboard();
    });

    return card;
  }

  /* ============================================================
     VISTA 3 · WIZARD
     ============================================================ */
  function abrirWizardNuevo() {
    state.wizard = {
      fecha: '',
      categoria: '',
      proveedor: '',
      descripcion: '',
      poseeRecibo: null,
      archivo: null,
      comentarios: ''
    };
    state.wizardStep = 'fecha';
    state.editarIndex = null;
    mostrarVista('wizard');
    renderWizard();
  }

  function getStepsActivos() {
    return STEP_ORDER.filter(k => k !== 'archivo' || state.wizard.poseeRecibo === true);
  }

  function renderWizard() {
    const steps = getStepsActivos();
    const idx = steps.indexOf(state.wizardStep);
    const total = steps.length;

    progressFill.style.width = ((idx + 1) / total * 100) + '%';
    progressText.textContent = `Paso ${idx + 1} de ${total}`;

    wizardBack.disabled = idx === 0;
    wizardNext.textContent = (idx === total - 1) ? 'Guardar gasto ✓' : 'Siguiente →';

    wizardBody.innerHTML = renderStep(state.wizardStep);
    bindStep(state.wizardStep);
  }

  function renderStep(step) {
    const w = state.wizard;

    switch (step) {
      case 'fecha':
        return `
          <h2 class="cg-wizard-title">¿Cuándo fue el gasto?</h2>
          <p class="cg-wizard-sub">Selecciona la fecha en que realizaste el gasto.</p>
          <div class="cg-wizard-input-wrap">
            <input type="date" class="cg-input cg-input-lg" id="cgWizInput" value="${w.fecha || ''}">
          </div>
        `;

      case 'categoria':
        return `
          <h2 class="cg-wizard-title">¿Qué tipo de gasto fue?</h2>
          <p class="cg-wizard-sub">Elige la categoría que mejor lo describa.</p>
          <div class="cg-options">
            ${CATEGORIAS.map(c => `
              <button type="button" class="cg-option ${w.categoria === c.valor ? 'selected' : ''}" data-value="${c.valor}">
                <span class="cg-option-icon">${c.icono}</span>
                <span>${c.valor}</span>
                ${w.categoria === c.valor ? '<span class="cg-option-check">✓</span>' : ''}
              </button>
            `).join('')}
          </div>
        `;

      case 'proveedor':
        return `
          <h2 class="cg-wizard-title">¿Dónde lo compraste?</h2>
          <p class="cg-wizard-sub">Nombre del proveedor, tienda o lugar. Puedes dejarlo vacío si no aplica.</p>
          <div class="cg-wizard-input-wrap">
            <input type="text" class="cg-input cg-input-lg" id="cgWizInput"
                   placeholder="Ej: Farmacia San Pablo" value="${escapeAttr(w.proveedor)}">
          </div>
        `;

      case 'descripcion':
        return `
          <h2 class="cg-wizard-title">¿Cuál fue el motivo?</h2>
          <p class="cg-wizard-sub">Describe brevemente en qué consistió el gasto.</p>
          <div class="cg-wizard-input-wrap">
            <input type="text" class="cg-input cg-input-lg" id="cgWizInput"
                   placeholder="Ej: Almuerzo durante rodaje en locación" value="${escapeAttr(w.descripcion)}">
          </div>
        `;

      case 'poseeRecibo':
        return `
          <h2 class="cg-wizard-title">¿Tienes recibo o factura?</h2>
          <p class="cg-wizard-sub">Si lo tienes, podrás adjuntarlo en el siguiente paso.</p>
          <div class="cg-options">
            <button type="button" class="cg-option ${w.poseeRecibo === true ? 'selected' : ''}" data-value="si">
              <span class="cg-option-icon">🧾</span>
              <span>Sí, tengo recibo</span>
            </button>
            <button type="button" class="cg-option ${w.poseeRecibo === false ? 'selected' : ''}" data-value="no">
              <span class="cg-option-icon">🚫</span>
              <span>No tengo recibo</span>
            </button>
          </div>
        `;

      case 'archivo':
        return `
          <h2 class="cg-wizard-title">Adjunta el recibo</h2>
          <p class="cg-wizard-sub">Formatos aceptados: JPG, PNG o PDF. Máx. 10 MB.</p>
          <label class="cg-dropzone ${w.archivo ? 'has-file' : ''}" for="cgWizFile">
            <div class="cg-dropzone-icon">${w.archivo ? '✓' : '⬆'}</div>
            ${w.archivo
              ? `<div class="cg-dropzone-file">${escapeHtml(w.archivo.name)}</div>
                 <div class="cg-dropzone-hint">Haz clic para cambiar el archivo</div>`
              : `<div class="cg-dropzone-text">Haz clic para subir el archivo</div>
                 <div class="cg-dropzone-hint">JPG, PNG o PDF · máx. 10 MB</div>`}
            <input type="file" id="cgWizFile" accept=".jpg,.jpeg,.png,.pdf" hidden>
          </label>
        `;

      case 'comentarios':
        return `
          <h2 class="cg-wizard-title">¿Algo más que agregar?</h2>
          <p class="cg-wizard-sub">Comentarios adicionales para administración. Opcional.</p>
          <div class="cg-wizard-input-wrap">
            <input type="text" class="cg-input cg-input-lg" id="cgWizInput"
                   placeholder="Ej: Se pagó en efectivo" value="${escapeAttr(w.comentarios)}">
          </div>
        `;

      default: return '';
    }
  }

  function bindStep(step) {
    const w = state.wizard;

    if (step === 'fecha') {
      const input = document.getElementById('cgWizInput');
      input.focus();
      input.addEventListener('input', () => { w.fecha = input.value; });

    } else if (step === 'proveedor') {
      const input = document.getElementById('cgWizInput');
      input.focus();
      input.addEventListener('input', () => { w.proveedor = input.value; });

    } else if (step === 'descripcion') {
      const input = document.getElementById('cgWizInput');
      input.focus();
      input.addEventListener('input', () => { w.descripcion = input.value; });

    } else if (step === 'comentarios') {
      const input = document.getElementById('cgWizInput');
      input.focus();
      input.addEventListener('input', () => { w.comentarios = input.value; });

    } else if (step === 'categoria') {
      wizardBody.querySelectorAll('.cg-option').forEach(btn => {
        btn.addEventListener('click', () => {
          w.categoria = btn.dataset.value;
          renderWizard();
          setTimeout(() => wizardNext.focus(), 50);
        });
      });

    } else if (step === 'poseeRecibo') {
      wizardBody.querySelectorAll('.cg-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.value === 'si';
          if (w.poseeRecibo !== val) {
            w.poseeRecibo = val;
            if (!val) w.archivo = null;
          }
          renderWizard();
          setTimeout(() => wizardNext.focus(), 50);
        });
      });

    } else if (step === 'archivo') {
      const input = document.getElementById('cgWizFile');
      input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
          w.archivo = input.files[0];
          renderWizard();
        }
      });
    }
  }

  /* ---------------- Validación por paso ---------------- */
  function validarPasoActual() {
    const step = state.wizardStep;
    const w = state.wizard;

    switch (step) {
      case 'fecha':
        if (!w.fecha) return 'Selecciona una fecha para continuar.';
        if (new Date(w.fecha) > new Date()) return 'La fecha no puede ser futura.';
        return null;
      case 'categoria':
        if (!w.categoria) return 'Elige una categoría.';
        return null;
      case 'descripcion':
        if (!w.descripcion.trim()) return 'Escribe el motivo del gasto.';
        return null;
      case 'poseeRecibo':
        if (w.poseeRecibo === null) return 'Indica si tienes recibo o no.';
        return null;
      case 'archivo':
        if (!w.archivo) return 'Adjunta el archivo del recibo.';
        return null;
      default:
        return null;
    }
  }

  function mostrarAlerta(msg) {
    // pequeño aviso visual temporal
    const existing = document.querySelector('.cg-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cg-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #ef4444; color: #fff; font-family: inherit; font-size: 13.5px;
      font-weight: 600; padding: 12px 20px; border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25); z-index: 9999;
      animation: cgFadeIn .2s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  /* ---------------- Navegación del wizard ---------------- */
  wizardNext.addEventListener('click', () => {
    const error = validarPasoActual();
    if (error) { mostrarAlerta(error); return; }

    const steps = getStepsActivos();
    const idx = steps.indexOf(state.wizardStep);

    if (idx === steps.length - 1) {
      // Terminar → guardar
      guardarGastoYVolver();
    } else {
      state.wizardStep = steps[idx + 1];
      renderWizard();
    }
  });

  wizardBack.addEventListener('click', () => {
    const steps = getStepsActivos();
    const idx = steps.indexOf(state.wizardStep);
    if (idx > 0) {
      state.wizardStep = steps[idx - 1];
      renderWizard();
    }
  });

  wizardCancel.addEventListener('click', () => {
    if (confirm('¿Cancelar este gasto? Se perderá lo que llevas.')) {
      state.wizard = null;
      mostrarVista('dash');
    }
  });

  function guardarGastoYVolver() {
    state.gastos.push({ ...state.wizard });
    state.wizard = null;
    renderDashboard();
    mostrarVista('dash');
  }

  /* ============================================================
     ENVÍO FINAL
     ============================================================ */
  btnEnviar.addEventListener('click', () => {
    if (state.gastos.length === 0) return;
    if (!state.colaborador) return;
    if (!confirm('¿Enviar los gastos a administración? Esta acción no se puede deshacer.')) return;

    const form = document.getElementById('cgFinalForm');
    form.innerHTML = '';

    // Campos fijos
    addHidden(form, '_subject', 'Nuevo gasto registrado · Captación de Gastos');
    addHidden(form, '_template', 'table');
    addHidden(form, '_captcha', 'false');
    addHidden(form, 'Moneda', 'USD');
    addHidden(form, 'Código de colaborador', state.colaborador.codigo);
    addHidden(form, 'Colaborador', state.colaborador.nombre + ' — ' + state.colaborador.rol);

    // Gastos
    state.gastos.forEach((g, i) => {
      const n = i + 1;
      addHidden(form, `Gasto ${n} - Fecha`, g.fecha);
      addHidden(form, `Gasto ${n} - Categoría`, g.categoria);
      addHidden(form, `Gasto ${n} - Proveedor`, g.proveedor || '—');
      addHidden(form, `Gasto ${n} - Descripción`, g.descripcion);
      addHidden(form, `Gasto ${n} - Posee recibo`, g.poseeRecibo ? 'Sí' : 'No');
      addHidden(form, `Gasto ${n} - Comentarios`, g.comentarios || '—');

      if (g.archivo) {
        const dt = new DataTransfer();
        dt.items.add(g.archivo);
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = `Gasto ${n} - Recibo`;
        fileInput.files = dt.files;
        fileInput.style.cssText = 'position:absolute;left:-9999px;';
        form.appendChild(fileInput);
      }
    });

    form.submit();
  });

  function addHidden(form, name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  /* ---------------- Helpers ---------------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s || ''); }

  function formatFecha(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

})();
