async function includePartials() {
  const targets = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(targets).map(async el => {
    const url = el.getAttribute('data-include');
    if (!url) return;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) el.innerHTML = await res.text();
    } catch (_) {}
  }));
}

function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/**
 * Reescribe href de navbar para que funcionen dentro de /views/*
 * - La marca (#hero) pasa a ../../index.html#hero si no estás en index
 * - Los anchors (#projects/#blog/#contacto) también
 * - El link a ./views/about.html se ajusta a ../../views/about.html desde /views/*
 */
function normalizeNavLinks() {
  const onIndex = !!document.getElementById('hero');
  const inViews = location.pathname.includes('/views/');
  const prefix = inViews ? '../../' : './';

  // Marca
  const brand = document.querySelector('.navbar-brand');
  if (brand) {
    const raw = brand.getAttribute('href') || '#hero';
    if (raw.startsWith('#') && !onIndex) {
      brand.setAttribute('href', prefix + 'index.html' + raw);
    }
  }

  // Nav items
  document.querySelectorAll('a.nav-link').forEach(a => {
    const raw = a.getAttribute('href') || '';
    if (!raw) return;

    // Anchors (#...)
    if (raw.startsWith('#')) {
      if (!onIndex) a.setAttribute('href', prefix + 'index.html' + raw);
      return;
    }

    // Ruta a about relativa desde raíz del repo
    if (raw.startsWith('./views/')) {
      if (inViews) a.setAttribute('href', prefix + raw.replace('./',''));
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await includePartials();   // carga header/footer si existen
  setYear();
  normalizeNavLinks();
});
<script>
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar footer parcial si existe el atributo data-include
  const footer = document.querySelector('#site-footer[data-include]');
  if (footer) {
    try {
      const url = footer.getAttribute('data-include');
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) footer.innerHTML = await res.text();
    } catch (_) { /* noop */ }
  }
  // Ajustar el año (funciona tanto con footer inline como con el cargado)
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
</script>


