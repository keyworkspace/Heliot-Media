/* ============================================================
   Captación de Gastos · Heliot Media
   Wizard paso a paso + Dashboard visual + Edición + Totales
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

  /* ---------------- Orden de pasos ---------------- */
  const STEP_ORDER = [
    'fecha',
    'categoria',
    'proveedor',
    'descripcion',
    'monto',
    'poseeRecibo',
    'archivo',
    'comentarios'
  ];

  /* ---------------- Estado ---------------- */
  const state = {
    colaborador: null,
    gastos: [],
    wizard: null,
    wizardStep: null,
    editarIndex: null
  };

  /* ---------------- Referencias ---------------- */
  const viewColab   = document.getElementById('cgViewColab');
  const viewDash    = document.getElementById('cgViewDash');
  const viewWizard  = document.getElementById('cgViewWizard');

  const codigoInput = document.getElementById('cgCodigo');
  const collabInfo  = document.getElementById('cgCollabInfo');
  const collabName  = document.getElementById('cgCollabName');
  const collabRole  = document.getElementById('cgCollabRole');
  const collabAv    = document.getElementById('cgCollabAvatar');
  const colabCont   = document.getElementById('cgColabContinuar');

  const dashAvatar  = document.getElementById('cgDashAvatar');
  const dashName    = document.getElementById('cgDashName');
  const dashRole    = document.getElementById('cgDashRole');
  const dashCount   = document.getElementById('cgDashCount');
  const dashTotal   = document.getElementById('cgDashTotal');
  const dashTotalV  = document.getElementById('cgDashTotalValue');
  const grid        = document.getElementById('cgGrid');
  const btnEnviar   = document.getElementById('cgEnviar');
  const btnCambiar  = document.getElementById('cgCambiarColab');

  const wizardBody  = document.getElementById('cgWizardBody');
  const wizardNext  = document.getElementById('cgWizardNext');
  const wizardBack  = document.getElementById('cgWizardBack');
  const wizardCancel= document.getElementById('cgWizardCancel');
  const progressFill= document.getElementById('cgProgressFill');
  const progressText= document.getElementById('cgProgressText');

  /* ---------------- Utilidades ---------------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  function formatFecha(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function formatUSD(n) {
    const num = Number(n) || 0;
    return '$' + num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function subtotalDe(g) {
    const pu = parseFloat(g.precioUnitario) || 0;
    const c  = parseFloat(g.cantidad) || 0;
    return pu * c;
  }

  function totalGeneral() {
    return state.gastos.reduce((acc, g) => acc + subtotalDe(g), 0);
  }

  /* ---------------- Vistas ---------------- */
  function mostrarVista(vista) {
    viewColab.hidden  = vista !== 'colab';
    viewDash.hidden   = vista !== 'dash';
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

  codigoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!colabCont.disabled) colabCont.click();
    }
  });

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
      grid.appendChild(crearTarjetaGasto(g, i));
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

    if (n > 0) {
      dashTotal.hidden = false;
      dashTotalV.textContent = formatUSD(totalGeneral());
    } else {
      dashTotal.hidden = true;
    }

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

    const pu = parseFloat(g.precioUnitario) || 0;
    const c  = parseFloat(g.cantidad) || 0;
    const subtotal = subtotalDe(g);

    card.innerHTML = `
      <div class="cg-card-top">
        <span class="cg-card-num">Gasto ${index + 1}</span>
        <span class="cg-card-cat">${escapeHtml(g.categoria)}</span>
      </div>
      <p class="cg-card-desc">${escapeHtml(g.descripcion)}</p>
      <div class="cg-card-subtotal">
        ${formatUSD(subtotal)}
        <small>${formatUSD(pu)} × ${c}</small>
      </div>
      <div class="cg-card-meta">
        <span><strong>Fecha:</strong> ${formatFecha(g.fecha)}</span>
        ${g.proveedor ? `<span><strong>Lugar:</strong> ${escapeHtml(g.proveedor)}</span>` : ''}
        ${g.comentarios ? `<span><strong>Notas:</strong> ${escapeHtml(g.comentarios)}</span>` : ''}
      </div>
      <div class="cg-card-footer">
        ${tiene}
        <div class="cg-card-actions">
          <button type="button" class="cg-card-edit" title="Editar">✎</button>
          <button type="button" class="cg-card-del" title="Eliminar">×</button>
        </div>
      </div>
    `;

    card.querySelector('.cg-card-edit').addEventListener('click', () => abrirWizardEditar(index));
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
  function gastoVacio() {
    return {
      fecha: '',
      categoria: '',
      proveedor: '',
      descripcion: '',
      precioUnitario: '',
      cantidad: '',
      poseeRecibo: null,
      archivo: null,
      comentarios: ''
    };
  }

  function abrirWizardNuevo() {
    state.wizard = gastoVacio();
    state.wizardStep = 'fecha';
    state.editarIndex = null;
    mostrarVista('wizard');
    renderWizard();
  }

  function abrirWizardEditar(index) {
    const g = state.gastos[index];
    state.wizard = {
      fecha: g.fecha,
      categoria: g.categoria,
      proveedor: g.proveedor,
      descripcion: g.descripcion,
      precioUnitario: g.precioUnitario,
      cantidad: g.cantidad,
      poseeRecibo: g.poseeRecibo,
      archivo: g.archivo,
      comentarios: g.comentarios
    };
    state.editarIndex = index;
    state.wizardStep = 'fecha';
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
    const editBadge = state.editarIndex !== null
      ? `<div class="cg-wizard-edit-badge">Editando gasto ${state.editarIndex + 1}</div>`
      : '';

    switch (step) {
      case 'fecha':
        return `
          ${editBadge}
          <h2 class="cg-wizard-title">¿Cuándo fue el gasto?</h2>
          <p class="cg-wizard-sub">Selecciona la fecha en que realizaste el gasto.</p>
          <div class="cg-wizard-input-wrap">
            <input type="date" class="cg-input cg-input-lg" id="cgWizInput" value="${escapeAttr(w.fecha)}">
          </div>
        `;

      case 'categoria':
        return `
          ${editBadge}
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
          ${editBadge}
          <h2 class="cg-wizard-title">¿Dónde lo compraste?</h2>
          <p class="cg-wizard-sub">Nombre del proveedor, tienda o lugar. Puedes dejarlo vacío si no aplica.</p>
          <div class="cg-wizard-input-wrap">
            <input type="text" class="cg-input cg-input-lg" id="cgWizInput"
                   placeholder="Ej: Farmacia San Pablo" value="${escapeAttr(w.proveedor)}">
          </div>
        `;

      case 'descripcion':
        return `
          ${editBadge}
          <h2 class="cg-wizard-title">¿Cuál fue el motivo?</h2>
          <p class="cg-wizard-sub">Describe brevemente en qué consistió el gasto.</p>
          <div class="cg-wizard-input-wrap">
            <input type="text" class="cg-input cg-input-lg" id="cgWizInput"
                   placeholder="Ej: Almuerzo durante rodaje en locación" value="${escapeAttr(w.descripcion)}">
          </div>
        `;

      case 'monto': {
        const pu = parseFloat(w.precioUnitario) || 0;
        const c  = parseFloat(w.cantidad) || 0;
        const sub = pu * c;
        return `
          ${editBadge}
          <h2 class="cg-wizard-title">Detalle del monto</h2>
          <p class="cg-wizard-sub">Indica el precio unitario y cuántas unidades compraste. El sistema calcula el subtotal automáticamente.</p>

          <div class="cg-monto-grid">
            <div class="cg-field">
              <label class="cg-label">Precio unitario (USD) <span class="cg-req">*</span></label>
              <input type="number" class="cg-input cg-input-lg" id="cgWizPrecio"
                     inputmode="decimal" step="0.01" min="0" placeholder="0.00"
                     value="${escapeAttr(w.precioUnitario)}">
            </div>
            <div class="cg-field">
              <label class="cg-label">Cantidad comprada <span class="cg-req">*</span></label>
              <input type="number" class="cg-input cg-input-lg" id="cgWizCantidad"
                     inputmode="numeric" step="1" min="1" placeholder="1"
                     value="${escapeAttr(w.cantidad)}">
            </div>
          </div>

          <div class="cg-subtotal-preview">
            <span>Subtotal del gasto</span>
            <strong id="cgWizSubtotal">${formatUSD(sub)}</strong>
          </div>
        `;
      }

      case 'poseeRecibo':
        return `
          ${editBadge}
          <h2 class="cg-wizard-title">¿Tienes recibo o factura?</h2>
          <p class="cg-wizard-sub">Si lo tienes, podrás adjuntarlo en el siguiente paso.</p>
          <div class="cg-options">
            <button type="button" class="cg-option ${w.poseeRecibo === true ? 'selected' : ''}" data-value="si">
              <span class="cg-option-icon">🧾</span>
              <span>Sí, tengo recibo</span>
              ${w.poseeRecibo === true ? '<span class="cg-option-check">✓</span>' : ''}
            </button>
            <button type="button" class="cg-option ${w.poseeRecibo === false ? 'selected' : ''}" data-value="no">
              <span class="cg-option-icon">🚫</span>
              <span>No tengo recibo</span>
              ${w.poseeRecibo === false ? '<span class="cg-option-check">✓</span>' : ''}
            </button>
          </div>
        `;

      case 'archivo':
        return `
          ${editBadge}
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
          ${editBadge}
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

    } else if (step === 'monto') {
      const inpPrecio   = document.getElementById('cgWizPrecio');
      const inpCantidad = document.getElementById('cgWizCantidad');
      const lblSub      = document.getElementById('cgWizSubtotal');

      const actualizar = () => {
        const pu = parseFloat(inpPrecio.value) || 0;
        const c  = parseFloat(inpCantidad.value) || 0;
        lblSub.textContent = formatUSD(pu * c);
      };

      inpPrecio.addEventListener('input', () => { w.precioUnitario = inpPrecio.value; actualizar(); });
      inpCantidad.addEventListener('input', () => { w.cantidad = inpCantidad.value; actualizar(); });

      inpPrecio.focus();

    } else if (step === 'categoria') {
      wizardBody.querySelectorAll('.cg-option').forEach(btn => {
        btn.addEventListener('click', () => {
          w.categoria = btn.dataset.value;
          renderWizard();
          // Auto-avance cómodo tras seleccionar
          setTimeout(() => wizardNext.click(), 220);
        });
      });

    } else if (step === 'poseeRecibo') {
      wizardBody.querySelectorAll('.cg-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset.value === 'si';
          w.poseeRecibo = val;
          renderWizard();
          setTimeout(() => wizardNext.click(), 220);
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
      case 'monto': {
        const pu = parseFloat(w.precioUnitario);
        const c  = parseFloat(w.cantidad);
        if (!pu || pu <= 0) return 'Ingresa un precio unitario mayor a 0.';
        if (!c || c < 1)    return 'Ingresa una cantidad mayor o igual a 1.';
        return null;
      }
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
      max-width: 90vw; text-align: center;
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
    const msg = state.editarIndex !== null
      ? '¿Cancelar la edición? Se perderán los cambios.'
      : '¿Cancelar este gasto? Se perderá lo que llevas.';
    if (confirm(msg)) {
      state.wizard = null;
      state.editarIndex = null;
      mostrarVista('dash');
    }
  });

  /* ---------- Enter avanza de paso en el wizard ---------- */
  wizardBody.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const tag = (e.target.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      e.preventDefault();
      wizardNext.click();
    }
  });

  function guardarGastoYVolver() {
    const g = { ...state.wizard };

    // Si no tiene recibo, limpiamos el archivo
    if (!g.poseeRecibo) g.archivo = null;

    if (state.editarIndex !== null) {
      state.gastos[state.editarIndex] = g;
    } else {
      state.gastos.push(g);
    }

    state.wizard = null;
    state.editarIndex = null;
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

    addHidden(form, '_subject', 'Nuevo gasto registrado · Captación de Gastos');
    addHidden(form, '_template', 'table');
    addHidden(form, '_captcha', 'false');
    addHidden(form, 'Moneda', 'USD');
    addHidden(form, 'Código de colaborador', state.colaborador.codigo);
    addHidden(form, 'Colaborador', state.colaborador.nombre + ' — ' + state.colaborador.rol);
    addHidden(form, 'Gastos generales (USD)', formatUSD(totalGeneral()));

    state.gastos.forEach((g, i) => {
      const n = i + 1;
      const pu = parseFloat(g.precioUnitario) || 0;
      const c  = parseFloat(g.cantidad) || 0;
      const sub = pu * c;

      addHidden(form, `Gasto ${n} - Fecha`, g.fecha);
      addHidden(form, `Gasto ${n} - Categoría`, g.categoria);
      addHidden(form, `Gasto ${n} - Proveedor`, g.proveedor || '—');
      addHidden(form, `Gasto ${n} - Descripción`, g.descripcion);
      addHidden(form, `Gasto ${n} - Precio unitario (USD)`, pu.toFixed(2));
      addHidden(form, `Gasto ${n} - Cantidad`, c);
      addHidden(form, `Gasto ${n} - Subtotal (USD)`, sub.toFixed(2));
      addHidden(form, `Gasto ${n} - Posee recibo`, g.poseeRecibo ? 'Sí' : 'No');
      addHidden(form, `Gasto ${n} - Comentarios`, g.comentarios || '—');

      if (g.poseeRecibo && g.archivo) {
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

})();
