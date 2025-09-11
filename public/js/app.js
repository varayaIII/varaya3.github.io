// --- CONFIGURACIÓN GLOBAL ---
const translations = {};
const basePath = window.location.pathname.includes('/views/') ? '../' : './';

// --- FUNCIONES DE TRADUCCIÓN (i18n) ---

/**
 * Aplica las traducciones a todos los elementos marcados con data-i18n-key.
 * @param {string} lang - El idioma a aplicar (ej: 'es', 'en').
 */
function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (translations[lang] && translations[lang][key]) {
      let text = translations[lang][key];

      // Reemplaza la variable {year} si la clave es la del copyright
      if (key === 'footer_copyright') {
        text = text.replace('{year}', new Date().getFullYear());
      }

      // Usamos innerHTML para permitir que el enlace del footer se renderice
      element.innerHTML = text;
    }
  });
}

/**
 * Actualiza los enlaces de las tarjetas del blog para que apunten a la versión correcta del post.
 * @param {string} lang - El idioma actual.
 */
function updateBlogLinks(lang) {
  const blogLinks = document.querySelectorAll('#blog .blog-link');
  blogLinks.forEach(link => {
    const href = link.getAttribute('href');
    const postName = href.substring(href.lastIndexOf('/') + 1);
    const cleanPostName = postName.replace('en/', ''); // Limpia por si acaso

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
      const response = await fetch(`${basePath}public/locales/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      translations[lang] = await response.json();
    } catch (error) {
      console.error(`Could not load translations for ${lang}:`, error);
      return;
    }
  }

  applyTranslations(lang);
  
  if (document.getElementById('blog')) {
    updateBlogLinks(lang);
  }

  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// --- CARGA DE COMPONENTES DINÁMICOS ---

/**
 * Carga los componentes parciales como el header y el footer.
 */
async function includePartials() {
  const targets = document.querySelectorAll('[data-include]');
  for (const el of targets) {
    const url = el.getAttribute('data-include');
    if (url) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) el.innerHTML = await res.text();
      } catch (e) { console.error("Include partial failed:", e); }
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
    { titleKey: "project_cicd_title", descKey: "project_cicd_desc" },
    { titleKey: "project_security_title", descKey: "project_security_desc" },
    { titleKey: "project_iac_title", descKey: "project_iac_desc" },
    { titleKey: "project_python_title", descKey: "project_python_desc" },
    { titleKey: "project_k8s_title", descKey: "project_k8s_desc" },
    { titleKey: "project_monitoring_title", descKey: "project_monitoring_desc" }
  ];

  try {
    const response = await fetch(`${basePath}views/projects/projects.json`);
    const projects = await response.json();
    const projectData = projects.map((p, i) => ({ ...p, ...projectKeys[i] }));
    
    const tpl = (p) => `
      <div class="project-card">
        <div class="project-image"><i class="${p.icon}" aria-hidden="true"></i></div>
        <div class="project-content">
          <h3 class="project-title" data-i18n-key="${p.titleKey}">${p.titulo}</h3>
          <p class="project-description" data-i18n-key="${p.descKey}">${p.descripcion}</p>
          <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="project-link">
            <span data-i18n-key="project_view_on_github">Ver en GitHub</span> <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>`;
      
    grid.innerHTML = projectData.map(tpl).join("");
  } catch (e) {
    console.error("Failed to load projects:", e);
  }
}

// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
  await includePartials();

  if (document.getElementById('projects-grid')) {
    await loadProjects();
  }
  
  const userLang = localStorage.getItem('language') || 'es';
  await setLanguage(userLang);

  // Solo después de cargar los parciales, asignamos los listeners a los botones de idioma
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      const currentLang = localStorage.getItem('language');
      if (selectedLang !== currentLang) {
        setLanguage(selectedLang);
      }
    });
  });
});
