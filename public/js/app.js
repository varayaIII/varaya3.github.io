// --- CONFIGURACIÓN GLOBAL ---
const translations = {};
const basePath = window.location.pathname.includes('/views/') ? '../' : './';
let currentLang = localStorage.getItem('language') || 'es';

// --- UTILIDADES I18N ---

/**
 * Traduce atributos declarados en data-i18n-attr con el formato:
 * data-i18n-attr="attr:clave; attr2:clave2"
 */
function translateAttributes(root, dict) {
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const pairs = el.getAttribute('data-i18n-attr').split(';');
    pairs.forEach(p => {
      const [attr, key] = p.split(':').map(s => s.trim());
      if (!attr || !key) return;
      const val = dict[key];
      if (typeof val === 'string') el.setAttribute(attr, val);
    });
  });
}

/**
 * Traduce todos los elementos con data-i18n-key (texto/HTML).
 * Usa innerHTML para permitir claves con HTML (enlaces, spans, etc.).
 */
function translateText(root, dict) {
  root.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (dict && dict[key]) {
      let text = dict[key];

      // Reemplazos comunes
      if (text.includes('{year}')) {
        text = text.replace('{year}', new Date().getFullYear());
      }

      element.innerHTML = text;
    }
  });
}

/**
 * Fallback específico para el footer si NO se marcaron claves:
 * - Si existe .copyright y la clave footer_copyright en el diccionario,
 *   inyecta el HTML ahí (con {year}).
 */
function translateFooterFallback(root, dict) {
  const box = root.querySelector('.copyright');
  if (!box) return;

  // Si ya hay algo marcado con data-i18n-key dentro, no hacer fallback
  if (box.querySelector('[data-i18n-key]')) return;

  const html = dict['footer_copyright'];
  if (typeof html === 'string') {
    box.innerHTML = html.replace('{year}', new Date().getFullYear());
  }
}

/**
 * Aplica las traducciones dentro de un root dado (por defecto todo el documento).
 * Cubre texto (data-i18n-key), atributos (data-i18n-attr) y footer fallback.
 */
function applyTranslations(lang, root = document) {
  const dict = translations[lang] || {};
  translateText(root, dict);
  translateAttributes(root, dict);
  translateFooterFallback(root, dict);
}

/**
 * Actualiza los enlaces de las tarjetas del blog para que apunten a la versión correcta del post.
 * @param {string} lang - El idioma actual.
 */
function updateBlogLinks(lang) {
  const blogLinks = document.querySelectorAll('#blog .blog-link');
  blogLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const postName = href.substring(href.lastIndexOf('/') + 1);
    const cleanPostName = postName.replace('en/', ''); // por si venía con en/

    if (lang === 'en') {
      link.href = `${basePath}views/blog/en/${cleanPostName}`;
    } else {
      link.href = `${basePath}views/blog/${cleanPostName}`;
    }
  });
}

/**
 * Carga el archivo de idioma, aplica las traducciones y actualiza la UI.
 * @param {string} lang - El idioma a establecer.
 */
async function setLanguage(lang) {
  if (!translations[lang]) {
    try {
      const response = await fetch(`${basePath}public/locales/${lang}.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      translations[lang] = await response.json();
    } catch (error) {
      console.error(`Could not load translations for ${lang}:`, error);
      return;
    }
  }

  currentLang = lang;

  // Aplica traducciones globalmente
  applyTranslations(lang, document);

  // Links del blog (si corresponde)
  if (document.getElementById('blog')) {
    updateBlogLinks(lang);
  }

  // Persistencia y atributos de accesibilidad
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;

  // Estado visual de botones de idioma
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/**
 * Asigna listeners a botones de idioma (delegado o directo).
 * Llamar después de inyectar parciales para cubrir botones dentro del header.
 */
function bindLanguageButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    // Evitar listeners duplicados
    btn.removeEventListener('click', btn.__langHandler);
    btn.__langHandler = () => {
      const selectedLang = btn.dataset.lang;
      if (selectedLang && selectedLang !== currentLang) {
        setLanguage(selectedLang);
      }
    };
    btn.addEventListener('click', btn.__langHandler);
  });
}

/**
 * Ajusta el año en cualquier #year encontrado.
 */
function updateFooterYear(root = document) {
  const y = root.getElementById ? root.getElementById('year') : root.querySelector('#year');
  if (y) y.textContent = new Date().getFullYear();
}

// --- CARGA DE COMPONENTES DINÁMICOS ---

/**
 * Carga los componentes parciales como el header y el footer.
 * Tras inyectar cada parcial, aplica traducciones SOLO en ese fragmento y
 * vuelve a enlazar botones de idioma si fuera necesario.
 */
async function includePartials() {
  const targets = document.querySelectorAll('[data-include]');
  for (const el of targets) {
    const url = el.getAttribute('data-include');
    if (!url) continue;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const html = await res.text();
        el.innerHTML = html;

        // Inicializaciones específicas al nuevo fragmento
        updateFooterYear(el);
        applyTranslations(currentLang, el); // aplicar traducciones solo a este bloque
        bindLanguageButtons();              // por si el header tenía .lang-btn
      }
    } catch (e) {
      console.error("Include partial failed:", e);
    }
  }
}

/**
 * Carga y renderiza la cuadrícula de proyectos desde un JSON.
 */
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  const projectKeys = [
    { titleKey: "project_cicd_title",        descKey: "project_cicd_desc" },
    { titleKey: "project_security_title",    descKey: "project_security_desc" },
    { titleKey: "project_iac_title",         descKey: "project_iac_desc" },
    { titleKey: "project_python_title",      descKey: "project_python_desc" },
    { titleKey: "project_k8s_title",         descKey: "project_k8s_desc" },
    { titleKey: "project_monitoring_title",  descKey: "project_monitoring_desc" }
  ];

  try {
    const response = await fetch(`${basePath}views/projects/projects.json`, { cache: 'no-store' });
    const projects = await response.json();
    const projectData = projects.map((p, i) => ({ ...p, ...projectKeys[i] }));

    const tpl = (p) => `
      <div class="project-card">
        <div class="project-image"><i class="${p.icon}" aria-hidden="true"></i></div>
        <div class="project-content">
          <h3 class="project-title" data-i18n-key="${p.titleKey}">${p.titulo}</h3>
          <p class="project-description" data-i18n-key="${p.descKey}">${p.descripcion}</p>
          <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="project-link">
            <span data-i18n-key="project_view_on_github">Ver en GitHub</span>
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>`;

    grid.innerHTML = projectData.map(tpl).join("");

    // Aplica traducciones al grid recién inyectado
    applyTranslations(currentLang, grid);
  } catch (e) {
    console.error("Failed to load projects:", e);
  }
}

// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1) Incluir parciales primero (header/footer)
  await includePartials();

  // 2) Cargar módulos dinámicos
  if (document.getElementById('projects-grid')) {
    await loadProjects();
  }

  // 3) Idioma inicial
  await setLanguage(currentLang);

  // 4) Listeners de idioma (también cubre los botones del header ya inyectado)
  bindLanguageButtons();

  // 5) (Opcional, robustez extra) Observa nodos nuevos y tradúcelos
  const observer = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(n => {
        if (!(n instanceof Element)) return;
        // año y traducción sólo en el subárbol agregado
        updateFooterYear(n);
        applyTranslations(currentLang, n);
        // por si se inyectan botones .lang-btn posteriormente
        if (n.matches('.lang-btn') || n.querySelector('.lang-btn')) {
          bindLanguageButtons();
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
