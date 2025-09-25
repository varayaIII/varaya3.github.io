// --- CONFIGURACIÓN GLOBAL ---
const translations = {};
let currentLang = 'es';

// --- UTILIDADES ---
function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

// Formatea fechas visibles (home y posts)
function formatBlogDates(lang, root = document) {
  const locales = lang === 'en' ? 'en-US' : 'es-CL';
  const fmt = new Intl.DateTimeFormat(locales, { day: 'numeric', month: 'long', year: 'numeric' });

  // En tarjetas de la home
  $all('.blog-date', root).forEach(el => {
    const txt = (el.dataset.date || el.textContent || '').trim();
    // Permite “15 de enero, 2025” o “2025-01-15”
    const d = new Date(txt.replace(' de ', ' ').replace(',', ''));
    if (!isNaN(d)) el.textContent = fmt.format(d);
  });

  // En páginas de post (si usas <time data-post-date="YYYY-MM-DD">)
  $all('time[data-post-date]', root).forEach(el => {
    const d = new Date(el.getAttribute('data-post-date'));
    if (!isNaN(d)) el.textContent = fmt.format(d);
  });
}

// --- i18n ---
/**
 * Aplica traducciones a elementos con data-i18n-key.
 * Si la clave existe pero viene vacía, NO sobreescribe (evita borrar HTML por accidente).
 */
function applyTranslations(lang, root = document) {
  const dict = translations[lang] || {};
  $all('[data-i18n-key]', root).forEach(el => {
    const key = el.getAttribute('data-i18n-key');
    let val = dict[key];

    if (key === 'footer_copyright' && typeof val === 'string') {
      val = val.replace('{year}', new Date().getFullYear());
    }

    if (val !== undefined && val !== null && String(val).trim() !== '') {
      el.innerHTML = val; // importante: mantener innerHTML para enlaces/HTML embebido
    }
  });
}

/**
 * Actualiza los enlaces de las tarjetas del blog según idioma.
 * Home: #blog .blog-link → /views/blog/... o /views/blog/en/...
 */
function updateBlogLinks(lang) {
  $all('#blog .blog-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const postName = href.substring(href.lastIndexOf('/') + 1);
    const clean = postName.replace('en/', '');
    link.href = (lang === 'en') ? `/views/blog/en/${clean}` : `/views/blog/${clean}`;
  });
}

/** Re-bindea los botones de idioma (viven en el header parcial). */
function bindLangButtons() {
  $all('.lang-btn').forEach(btn => {
    btn.onclick = () => {
      const selected = btn.dataset.lang;
      if (selected && selected !== currentLang) setLanguage(selected);
    };
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === currentLang ? 'true' : 'false');
  });
}

/** Carga parciales (header/footer) usando rutas ABSOLUTAS declaradas en data-include. */
async function includePartials() {
  const targets = $all('[data-include]');
  for (const el of targets) {
    const url = el.getAttribute('data-include');
    if (!url) continue;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        el.innerHTML = await res.text();
        // Re-aplicar i18n/fechas al fragmento inyectado y re-bindeo de botones
        applyTranslations(currentLang, el);
        formatBlogDates(currentLang, el);
        bindLangButtons();
      }
    } catch (e) {
      console.error('Include partial failed:', url, e);
    }
  }
}

/** Carga y renderiza la grilla de proyectos. */
async function loadProjects() {
  const grid = $('#projects-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="text-muted">Cargando proyectos…</div>';

  // Orden por dificultad: IaC → CI/CD → DevSecOps → Observabilidad → FinOps → K8s → AIOps
  const projectKeys = [
    { titleKey: "project_iac_title",        descKey: "project_iac_desc" },
    { titleKey: "project_cicd_title",       descKey: "project_cicd_desc" },
    { titleKey: "project_security_title",   descKey: "project_security_desc" },
    { titleKey: "project_monitoring_title", descKey: "project_monitoring_desc" },
    { titleKey: "project_finops_title",     descKey: "project_finops_desc" },
    { titleKey: "project_k8s_title",        descKey: "project_k8s_desc" },
    { titleKey: "project_python_title",     descKey: "project_python_desc" }
  ];

  try {
    const response = await fetch(`/views/projects/projects.json`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const projects = await response.json();

    const items = projects.map((p, i) => ({ ...p, ...(projectKeys[i] || {}) }));

    const tpl = (p) => `
      <div class="project-card">
        <div class="project-image"><i class="${p.icon || 'fas fa-square'}" aria-hidden="true"></i></div>
        <div class="project-content">
          <h3 class="project-title" ${p.titleKey ? `data-i18n-key="${p.titleKey}"` : ''}>${p.titulo || ''}</h3>
          <p class="project-description" ${p.descKey ? `data-i18n-key="${p.descKey}"` : ''}>${p.descripcion || ''}</p>
          <a href="${p.github || '#'}" target="_blank" rel="noopener noreferrer" class="project-link">
            <i class="fab fa-github" aria-hidden="true"></i>
            <span data-i18n-key="project_view_on_github">Ver en GitHub</span>
          </a>
        </div>
      </div>`;

    grid.innerHTML = items.map(tpl).join("");
    applyTranslations(currentLang, grid); // traduce lo recién inyectado
  } catch (e) {
    console.error("Failed to load projects:", e);
    grid.innerHTML = `
      <div class="alert alert-warning">
        No se pudieron cargar los proyectos. Revisa <code>/views/projects/projects.json</code>.
      </div>`;
  }
}

/** Intercepta el formulario de contacto para evitar redirección. */
function initContactForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  if (!form || !status) return;

  const submitBtn = form.querySelector('.btn-send');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value.trim() !== "") return;

    // textos i18n
    const t = (k, fb) => (translations[currentLang] && translations[currentLang][k]) || fb;
    status.textContent = t('form_status_sending', 'Enviando…');
    status.classList.remove('text-danger', 'text-success');
    submitBtn?.setAttribute('disabled', 'disabled');

    try {
      const data = new FormData(form);
      const res = await fetch(form.action, { method: form.method || 'POST', body: data, headers: { 'Accept': 'application/json' }});
      if (res.ok) {
        status.textContent = t('form_status_success', '¡Gracias! Tu mensaje fue enviado correctamente.');
        status.classList.add('text-success');
        form.reset();
      } else {
        status.textContent = t('form_status_error', 'No pudimos enviar el mensaje. Inténtalo nuevamente en unos minutos.');
        status.classList.add('text-danger');
      }
    } catch (err) {
      status.textContent = t('form_status_error', 'No pudimos enviar el mensaje. Inténtalo nuevamente en unos minutos.');
      status.classList.add('text-danger');
      console.error(err);
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  });
}

/** Carga traducciones, actualiza UI y persiste preferencia. */
async function setLanguage(lang) {
  currentLang = lang;

  if (!translations[lang]) {
    try {
      const res = await fetch(`/public/locales/${lang}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      translations[lang] = await res.json();
    } catch (e) {
      console.error(`Could not load translations for ${lang}:`, e);
      return;
    }
  }

  applyTranslations(lang, document);
  formatBlogDates(lang, document);
  if ($('#blog')) updateBlogLinks(lang);

  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;

  bindLangButtons();
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
  // Idioma preferido
  currentLang = localStorage.getItem('language') || 'es';

  // Incluir header/footer primero (son los que traen los botones de idioma)
  await includePartials();

  // Grilla de proyectos (solo en home)
  if ($('#projects-grid')) await loadProjects();

  // Traducciones iniciales
  await setLanguage(currentLang);

  // Form de contacto (solo en home)
  initContactForm();
});
