/* ============================================================
   Captación de Gastos · Heliot Media
   Lógica del formulario (validación de código + tabla dinámica)
   ============================================================ */

(function () {
  'use strict';

  /* -------- Colaboradores -------- */
  const COLABORADORES = {
    '2026-HELIOT-0001': { nombre: 'Alexander Hernández', rol: 'Director General · Administración', iniciales: 'AH' },
    '2026-HELIOT-0002': { nombre: 'Odalys Amaya',        rol: 'Fotografía Principal · Dirección Creativa', iniciales: 'OA' },
    '2026-HELIOT-0003': { nombre: 'Nelson Romero',       rol: 'Producción · Apoyo Técnico', iniciales: 'NR' },
    '2026-HELIOT-0004': { nombre: 'Cristian Fernández',  rol: 'Marketing · Producción Creativa', iniciales: 'CF' },
    '2026-HELIOT-0005': { nombre: 'Keysi Hernández',     rol: 'Coordinación Operativa · Atención al Cliente', iniciales: 'KH' },
    '2026-HELIOT-0006': { nombre: 'Yaritza Portillo',    rol: 'Edición · Control Visual', iniciales: 'YP' }
  };

  const CATEGORIAS = ['Alimentación', 'Transporte', 'Insumos', 'Servicios', 'Equipos', 'Otros'];

  /* -------- Referencias -------- */
  const codigoInput = document.getElementById('cgCodigo');
  const collabInfo  = document.getElementById('cgCollabInfo');
  const collabName  = document.getElementById('cgCollabName');
  const collabRole  = document.getElementById('cgCollabRole');
  const collabAv    = document.getElementById('cgCollabAvatar');
  const tbody       = document.getElementById('cgTbody');
  const addBtn      = document.getElementById('cgAddRow');

  /* -------- Validación del código -------- */
  function validarCodigo() {
    const val = codigoInput.value.trim().toUpperCase();
    const col = COLABORADORES[val];

    if (col) {
      codigoInput.classList.remove('cg-input-error');
      collabInfo.hidden = false;
      collabName.textContent = col.nombre;
      collabRole.textContent = col.rol;
      collabAv.textContent   = col.iniciales;

      // Campo oculto con el nombre, para que llegue al correo
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
      const hidden = document.getElementById('cgNombreHidden');
      if (hidden) hidden.value = '';
    }
  }

  codigoInput.addEventListener('input', () => {
    // Autocompleta mayúsculas y guiones cómodamente
    codigoInput.value = codigoInput.value.toUpperCase();
    validarCodigo();
  });

  codigoInput.addEventListener('blur', () => {
    if (codigoInput.value.trim() && !COLABORADORES[codigoInput.value.trim().toUpperCase()]) {
      codigoInput.setCustomValidity('El código debe estar entre 2026-HELIOT-0001 y 2026-HELIOT-0006');
    } else {
      codigoInput.setCustomValidity('');
    }
  });

  /* -------- Construcción de una fila de gasto -------- */
  function crearFila() {
    const tr = document.createElement('tr');
    tr.className = 'cg-row-gasto';

    tr.innerHTML = `
      <td class="cg-cell-num"><span class="cg-num"></span></td>

      <td>
        <input class="cg-input" type="date" data-field="fecha" required>
      </td>

      <td>
        <select class="cg-input" data-field="categoria" required>
          <option value="">Selecciona</option>
          ${CATEGORIAS.map(c => `<option>${c}</option>`).join('')}
        </select>
      </td>

      <td>
        <input class="cg-input" type="text" data-field="proveedor" placeholder="Ej: Farmacia San Pablo">
      </td>

      <td>
        <input class="cg-input" type="text" data-field="descripcion" placeholder="Motivo del gasto" required>
      </td>

      <td class="cg-check-cell">
        <input type="checkbox" data-field="posee-recibo">
      </td>

      <td>
        <input class="cg-file" type="file" data-field="recibo"
               accept=".jpg,.jpeg,.png,.pdf" disabled>
      </td>

      <td>
        <input class="cg-input" type="text" data-field="comentarios" placeholder="Opcional">
      </td>

      <td>
        <button type="button" class="cg-del-btn" title="Eliminar fila">×</button>
      </td>
    `;

    // Checkbox activa/desactiva el file input
    const check = tr.querySelector('[data-field="posee-recibo"]');
    const file  = tr.querySelector('[data-field="recibo"]');
    check.addEventListener('change', () => {
      file.disabled = !check.checked;
      if (!check.checked) file.value = '';
    });

    // Botón eliminar
    tr.querySelector('.cg-del-btn').addEventListener('click', () => {
      if (tbody.querySelectorAll('.cg-row-gasto').length <= 1) return;
      tr.remove();
      renumerar();
    });

    return tr;
  }

  /* -------- Renumerar filas y actualizar nombres de campos -------- */
  function renumerar() {
    const filas = tbody.querySelectorAll('.cg-row-gasto');
    const total = filas.length;

    filas.forEach((tr, i) => {
      const n = i + 1;
      tr.querySelector('.cg-num').textContent = n;

      tr.querySelectorAll('[data-field]').forEach(el => {
        const field = el.getAttribute('data-field');
        const label = field.charAt(0).toUpperCase() + field.slice(1);
        el.name = `Gasto ${n} - ${label}`;
      });

      // El primero no se puede borrar si sólo hay uno
      tr.querySelector('.cg-del-btn').disabled = (total <= 1);
    });
  }

  /* -------- Agregar fila -------- */
  function agregarFila() {
    tbody.appendChild(crearFila());
    renumerar();
  }

  addBtn.addEventListener('click', agregarFila);

  /* -------- Inicio -------- */
  agregarFila();
})();
