/* ============================================================
   HELIOT MEDIA — Comportamiento compartido
   Incluir en todas las páginas: <script src="app.js" defer></script>
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Header scroll ---------- */
  const header = document.getElementById('mainHeader');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('scroll-hidden', window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---------- Menú móvil ---------- */
  const mobileToggle = document.getElementById('mobileToggle');
  const navMain = document.getElementById('navMain');
  if (mobileToggle && navMain) {
    mobileToggle.addEventListener('click', () => {
      const open = navMain.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', String(open));
    });

    // Cerrar menú al navegar (móvil)
    document.querySelectorAll('.nav-main a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) navMain.classList.remove('active');
      });
    });

    // Dropdowns en móvil
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      const btn = dropdown.querySelector('.dropbtn');
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        }
      });
    });
  }

  /* ---------- Buscador ---------- */
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const resultsContainer = document.getElementById('searchResults');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');
  const toggleBtn = document.getElementById('searchToggle');

  if (overlay && searchInput && resultsContainer) {
    const PAGES = [
      { title: 'Inicio',            url: 'index.html' },
      { title: 'Quiénes somos',     url: 'sobre-nosotros.html' },
      { title: 'Equipo',            url: 'sobre-nosotros.html#equipo' },
      { title: 'Política editorial',url: 'politica-editorial.html' },
      { title: 'Aranceles',         url: 'aranceles.html' },
      { title: 'Promociones',       url: 'promociones.html' },
      { title: 'Reservar',          url: 'contratar.html' },
      { title: 'Beneficios',        url: 'beneficios.html' },
      { title: 'CIDE',              url: 'cide-heliot.html' },
      { title: 'Contacto',          url: 'contactanos.html' },
      { title: 'Política de Privacidad', url: 'politica-de-privacidad.html' },
      { title: 'Política de Cookies',    url: 'politica-de-cookies.html' },
      { title: 'Términos y Condiciones', url: 'terminos-y-condiciones-de-uso.html' },
      { title: 'Aviso Legal',       url: 'aviso-legal.html' }
    ];

    let timeout;
    const escapeHtml = (s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function performSearch(query) {
      const q = query.trim().toLowerCase();
      if (q.length < 2) { resultsContainer.innerHTML = ''; return; }
      const hits = PAGES.filter(p => p.title.toLowerCase().includes(q));
      if (!hits.length) {
        resultsContainer.innerHTML = `<div class="no-results">Sin resultados para "<strong>${escapeHtml(query)}</strong>"</div>`;
        return;
      }
      resultsContainer.innerHTML = hits.slice(0, 10).map(r =>
        `<div class="result-item"><a href="${r.url}">${escapeHtml(r.title)}</a></div>`
      ).join('');
    }

    searchInput.addEventListener('input', function () {
      clearTimeout(timeout);
      const v = this.value;
      timeout = setTimeout(() => performSearch(v), 250);
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); performSearch(searchInput.value); }
    });
    if (searchButton) searchButton.addEventListener('click', () => performSearch(searchInput.value));

    function closeSearch() {
      overlay.classList.remove('active');
      resultsContainer.innerHTML = '';
      searchInput.value = '';
    }
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearch(); });

    if (toggleBtn) toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.classList.add('active');
      setTimeout(() => searchInput.focus(), 100);
    });
  }
})();
/* ============================================================
   HELIOT MEDIA — Aviso previo de actualización legal (popup global)
   Notifica con anticipación el cambio de Términos y Condiciones,
   conforme a la cláusula 2 de los T&C vigentes.
   ============================================================ */
(function () {
  'use strict';

  // --- Configuración del aviso ---
  var AVISO_ID       = '2026-09-legal-v3.5'; // identificador único del aviso
  var FECHA_CAMBIO   = '30 de septiembre de 2026'; // fecha en que entra en vigor
  var DIAS_ANTICIPO  = '5 días hábiles'; // plazo de preaviso
  var STORAGE_KEY    = 'heliot_legal_aviso_visto';

  try {
    if (localStorage.getItem(STORAGE_KEY) === AVISO_ID) return;
  } catch (e) {
    // Si localStorage no está disponible, se muestra siempre
  }

  if (document.getElementById('legalPopup')) return;

  var popup = document.createElement('div');
  popup.id = 'legalPopup';
  popup.className = 'legal-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-labelledby', 'legalPopupTitle');
  popup.innerHTML =
    '<div class="legal-popup-overlay" data-legal-close></div>' +
    '<div class="legal-popup-content">' +
      '<span class="legal-popup-eyebrow">Aviso previo</span>' +
      '<h3 id="legalPopupTitle">Actualizaremos nuestros Términos y Condiciones</h3>' +
      '<p>Te informamos que <strong>Heliot Media actualizará sus Términos y Condiciones y su Política de Privacidad</strong> el próximo <strong>' + FECHA_CAMBIO + '</strong>.</p>' +
      '<p>Conforme a la cláusula 2 de nuestros Términos vigentes, este aviso se emite con al menos <strong>' + DIAS_ANTICIPO + '</strong> de anticipación. Las modificaciones no afectarán los contratos ya celebrados antes de su entrada en vigor.</p>' +
      '<p>Te recomendamos revisar los documentos actualizados a partir de la fecha indicada. El uso continuado del sitio tras la entrada en vigor constituirá la aceptación plena de las modificaciones.</p>' +
      '<div class="legal-popup-actions">' +
        '<a href="terminos-y-condiciones-de-uso.html" class="btn btn-outline" target="_blank" rel="noopener">Ver Términos vigentes</a>' +
        '<button type="button" class="btn btn-gold" id="legalPopupAccept">Entendido</button>' +
      '</div>' +
      '<p class="legal-popup-note">Este aviso no modifica los Términos vigentes. Solo notifica su próxima actualización.</p>' +
    '</div>';

  document.body.appendChild(popup);

  var prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(function () {
    popup.classList.add('active');
  });

  function cerrar() {
    try {
      localStorage.setItem(STORAGE_KEY, AVISO_ID);
    } catch (e) { /* ignorar */ }
    popup.classList.remove('active');
    document.body.style.overflow = prevOverflow || '';
    setTimeout(function () {
      if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    }, 300);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') cerrar();
  }

  document.getElementById('legalPopupAccept').addEventListener('click', cerrar);
  popup.querySelector('[data-legal-close]').addEventListener('click', cerrar);
  document.addEventListener('keydown', onKey);
})();
