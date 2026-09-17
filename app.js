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
