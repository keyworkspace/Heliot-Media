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
   HELIOT MEDIA — Cargador de aviso legal
   Lee avisos.js y muestra el aviso si no ha sido visto.
   ============================================================ */
(function () {
  'use strict';

  function cargarAviso(callback) {
    if (window.HELIOT_AVISO) { callback(); return; }
    var s = document.createElement('script');
    s.src = 'avisos.js';
    s.onload = callback;
    s.onerror = function () { /* silencioso */ };
    document.head.appendChild(s);
  }

  function mostrarAviso(aviso) {
    if (document.getElementById('legalPopup')) return;

    var popup = document.createElement('div');
    popup.id = 'legalPopup';
    popup.className = 'legal-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-labelledby', 'legalPopupTitle');

    var parrafosHTML = (aviso.parrafos || []).map(function (p) {
      return '<p>' + p + '</p>';
    }).join('');

    popup.innerHTML =
      '<div class="legal-popup-overlay" data-legal-close></div>' +
      '<div class="legal-popup-content">' +
        (aviso.eyebrow ? '<span class="legal-popup-eyebrow">' + aviso.eyebrow + '</span>' : '') +
        '<h3 id="legalPopupTitle">' + (aviso.titulo || 'Aviso legal') + '</h3>' +
        parrafosHTML +
        '<div class="legal-popup-actions">' +
          (aviso.enlaceUrl
            ? '<a href="' + aviso.enlaceUrl + '" class="btn btn-outline" target="_blank" rel="noopener">' + (aviso.enlaceTexto || 'Ver más') + '</a>'
            : '') +
          '<button type="button" class="btn btn-gold" id="legalPopupAccept">' + (aviso.botonTexto || 'Entendido') + '</button>' +
        '</div>' +
        (aviso.nota ? '<p class="legal-popup-nota">' + aviso.nota + '</p>' : '') +
      '</div>';

    document.body.appendChild(popup);

    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () { popup.classList.add('active'); });

    function cerrar() {
      try { localStorage.setItem('heliot_legal_aviso_visto', aviso.id); } catch (e) {}
      popup.classList.remove('active');
      document.body.style.overflow = prevOverflow || '';
      setTimeout(function () {
        if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
      }, 300);
      document.removeEventListener('keydown', onKey);
    }

    function onKey(e) { if (e.key === 'Escape') cerrar(); }

    document.getElementById('legalPopupAccept').addEventListener('click', cerrar);
    popup.querySelector('[data-legal-close]').addEventListener('click', cerrar);
    document.addEventListener('keydown', onKey);
  }

  cargarAviso(function () {
    var aviso = window.HELIOT_AVISO;
    if (!aviso || !aviso.activo || !aviso.id) return;

    var visto = null;
    try { visto = localStorage.getItem('heliot_legal_aviso_visto'); } catch (e) {}
    if (visto === aviso.id) return;

    mostrarAviso(aviso);
  });
})();
