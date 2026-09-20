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
   HELIOT MEDIA — Aviso legal (popup global)
   Avisa a los usuarios sobre la actualización de los Términos.
   Para re-activar el aviso: cambia TERMS_VERSION.
   ============================================================ */
(function () {
  'use strict';

  var TERMS_VERSION = '3.5'; // ← Cambiar cuando actualices los T&C
  var STORAGE_KEY = 'heliot_terms_accepted';

  try {
    if (localStorage.getItem(STORAGE_KEY) === TERMS_VERSION) return;
  } catch (e) {
    // Si localStorage no está disponible, mostrar siempre
  }

  // Evitar duplicar si por alguna razón ya existe
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
      '<span class="legal-popup-eyebrow">Aviso legal</span>' +
      '<h3 id="legalPopupTitle">Actualización de Términos y Condiciones</h3>' +
      '<p>Hemos actualizado nuestros Términos y Condiciones y la Política de Privacidad. ' +
      'Te invitamos a revisarlos antes de continuar navegando por el sitio.</p>' +
      '<p class="legal-popup-version">Versión vigente: ' + TERMS_VERSION + '</p>' +
      '<div class="legal-popup-actions">' +
        '<a href="terminos-y-condiciones-de-uso.html" class="btn btn-outline" target="_blank" rel="noopener">Leer Términos</a>' +
        '<button type="button" class="btn btn-gold" id="legalPopupAccept">Aceptar y continuar</button>' +
      '</div>' +
      '<p class="legal-popup-note">Al continuar navegando aceptas los Términos y Condiciones vigentes.</p>' +
    '</div>';

  document.body.appendChild(popup);

  // Bloquear scroll del body mientras está abierto
  var prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(function () {
    popup.classList.add('active');
  });

  function cerrar() {
    try {
      localStorage.setItem(STORAGE_KEY, TERMS_VERSION);
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
