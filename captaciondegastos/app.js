/* ============================================================
   Captación de Gastos · Heliot Media
   Lógica del formulario
   ============================================================ */

(function () {
  'use strict';

  const COLABORADORES = {
    '2026-HELIOT-0001': { nombre: 'Alexander Hernández', rol: 'Director General · Administración', iniciales: 'AH' },
    '2026-HELIOT-0002': { nombre: 'Odalys Amaya',        rol: 'Fotografía Principal · Dirección Creativa', iniciales: 'OA' },
    '2026-HELIOT-0003': { nombre: 'Nelson Romero',       rol: 'Producción · Apoyo Técnico', iniciales: 'NR' },
    '2026-HELIOT-0004': { nombre: 'Cristian Fernández',  rol: 'Marketing · Producción Creativa', iniciales: 'CF' },
    '2026-HELIOT-0005': { nombre: 'Keysi Hernández',     rol: 'Coordinación Operativa · Atención al Cliente', iniciales: 'KH' },
    '2026-HELIOT-0006': { nombre: 'Yaritza Portillo',    rol: 'Edición · Control Visual', iniciales: 'YP' }
  };

  const CATEGORIAS = ['Alimentación', 'Transporte', 'Insumos', 'Servicios', 'Equipos', 'Otros'];

  const codigoInput = document.getElementById('cgCodigo');
  const collabInfo  = document.getElementById('cgCollabInfo');
  const collabName  = document.getElementById('cgCollabName');
  const collabRole  = document.getElementById('cgCollabRole');
  const collabAv    = document.getElementById('cgCollabAvatar');
  const contenedor  = document.getElementById('cgGastos');
  const addBtn      = document.getElementById('cgAddRow');

  /* -------- Validación del código -------- */
  function validarCodigo() {
    const val = codigoInput.value.trim().toUpperCase();
    const col = COLABORADORES[val];

    if (col) {
      codigoInput.classList.remove('cg-input-error');
      codigoInput.setCustomValidity('');
      collabInfo.hidden = false;
      collabName.textContent = col.nombre;
      collabRole.textContent = col.rol;
      collabAv.textContent   = col.iniciales;

      let hidden = document.getElementById('cgNombreHidden');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.id = 'cgNombreHidden';
        hidden.name = 'Colaborador';
        codigoInput.parentElement.appendChild(hidden);
      }
      hidden.value = col.nombre + ' — ' + col.rol;
    } else {
      collabInfo.hidden = true;
      codigoInput.classList.add('cg-input-error');
      if (val) {
        codigoInput.setCustomValidity('El código debe estar entre 2026-HELIOT-0001 y 2026-HELIOT-0006');
      } else {
        codigoInput.setCustomValidity('');
      }
      const hidden = document.getElementById('cgNombreHidden');
      if (hidden) hidden.value = '';
    }
  }

  codigoInput.addEventListener('input', () => {
    codigoInput.value = codigoInput.value.toUpperCase();
    validarCodigo();
  });
  codigoInput.addEventListener('blur', validarCodigo);

  /* -------- Construcción de una tarjeta de gasto -------- */
  function crearGasto() {
    const card = document.createElement('article');
    card.className = 'cg-gasto';

    card.innerHTML = `
      <div class="cg-gasto-head">
        <span class="cg-gasto-badge"><span class="cg-badge-dot"></span>Gasto <span class="cg-num"></span></span>
        <button type="button" class="cg-del-btn" title="Eliminar gasto">×</button>
      </div>

      <div class="cg-gasto-grid">
        <div class="cg-field">
          <label class="cg-label">Fecha del gasto <span class="cg-req">*</span></label>
          <input class="cg-input" type="date" data-field="fecha" required>
        </div>

        <div class="cg-field">
          <label class="cg-label">Categoría <span class="cg-req">*</span></label>
          <select class="cg-input" data-field="categoria" required>
            <option value="">Selecciona</option>
            ${CATEGORIAS.map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>

        <div class="cg-field">
          <label class="cg-label">Proveedor o lugar de compra</label>
          <input class="cg-input" type="text" data-field="proveedor" placeholder="Ej: Farmacia San Pablo">
        </div>

        <div class="cg-field">
          <label class="cg-label">Descripción o motivo <span class="cg-req">*</span></label>
          <input class="cg-input" type="text" data-field="descripcion" placeholder="Motivo del gasto" required>
        </div>

        <div class="cg-field cg-check-field">
          <label class="cg-check-label">
            <input type="checkbox" data-field="posee-recibo">
            <span>Posee recibo o factura</span>
          </label>
        </div>

        <div class="cg-field">
          <label class="cg-label">Adjuntar recibo</label>
          <input class="cg-file" type="file" data-field="recibo"
                 accept=".jpg,.jpeg,.png,.pdf" disabled>
        </div>

        <div class="cg-field cg-field-full">
          <label class="cg-label">Comentarios adicionales</label>
          <input class="cg-input" type="text" data-field="comentarios" placeholder="Opcional">
        </div>
      </div>
    `;

    const check = card.querySelector('[data-field="posee-recibo"]');
    const file  = card.querySelector('[data-field="recibo"]');

    check.addEventListener('change', () => {
      file.disabled = !check.checked;
      if (!check.checked) file.value = '';
    });

    card.querySelector('.cg-del-btn').addEventListener('click', () => {
      if (contenedor.querySelectorAll('.cg-gasto').length <= 1) return;
      card.remove();
      renumerar();
    });

    return card;
  }

  /* -------- Renumerar tarjetas y campos -------- */
  function renumerar() {
    const cards = contenedor.querySelectorAll('.cg-gasto');
    const total = cards.length;

    cards.forEach((card, i) => {
      const n = i + 1;
      card.querySelector('.cg-num').textContent = n;

      card.querySelectorAll('[data-field]').forEach(el => {
        const field = el.getAttribute('data-field');
        const label = field.charAt(0).toUpperCase() + field.slice(1);
        el.name = `Gasto ${n} - ${label}`;
      });

      card.querySelector('.cg-del-btn').disabled = (total <= 1);
    });
  }

  function agregarGasto() {
    contenedor.appendChild(crearGasto());
    renumerar();
  }

  addBtn.addEventListener('click', agregarGasto);

  /* -------- Inicio -------- */
  agregarGasto();
})();
