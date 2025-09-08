// --- MANEJO DE TRADUCCIONES (i18n) ---
const translations = {};

// Función para aplicar las traducciones a los elementos de la página
function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });
}

// Función principal para cambiar el idioma
async function setLanguage(lang) {
  // Carga las traducciones solo si no las tenemos ya
  if (!translations[lang]) {
    try {
      const response = await fetch(`/public/locales/${lang}.json`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      translations[lang] = await response.json();
    } catch (error) {
      console.error(`Could not load translations for ${lang}:`, error);
      return; // No continuar si falla la carga
    }
  }

  applyTranslations(lang);
  localStorage.setItem('language', lang);
  document.documentElement.lang = lang;

  // Actualiza el botón activo
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// --- CARGA DE COMPONENTES PARCIALES (HEADER/FOOTER) ---
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

// --- FUNCIÓN PARA CARGAR PROYECTOS DINÁMICAMENTE ---
async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    // Se asocia cada proyecto a una clave de traducción
    const projectKeys = [
        { titleKey: "project_cicd_title", descKey: "project_cicd_desc" },
        { titleKey: "project_security_title", descKey: "project_security_desc" },
        { titleKey: "project_iac_title", descKey: "project_iac_desc" },
        { titleKey: "project_python_title", descKey: "project_python_desc" },
        { titleKey: "project_k8s_title", descKey: "project_k8s_desc" },
        { titleKey: "project_monitoring_title", descKey: "project_monitoring_desc" }
    ];

    try {
        const response = await fetch('/views/projects/projects.json');
        const projects = await response.json();

        // Combina los datos del JSON con las claves de traducción
        const projectData = projects.map((p, i) => ({ ...p, ...projectKeys[i] }));

        const tpl = (p) => `
          <div class="project-card">
            <div class="project-image"><i class="${p.icon}" aria-hidden="true"></i></div>
            <div class="project-content">
              <h3 class="project-title" data-i18n-key="${p.titleKey}">${p.titulo}</h3>
              <p class="project-description" data-i18n-key="${p.descKey}">${p.descripcion}</p>
              <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="project-link">
                Ver en GitHub <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>`;

        grid.innerHTML = projectData.map(tpl).join("");
    } catch (e) {
        console.error("Failed to load projects:", e);
        // Opcional: Mostrar un mensaje de error en la UI
    }
}


// --- INICIALIZACIÓN DE LA PÁGINA ---
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Cargar Header y Footer
  await includePartials();

  // 2. Cargar los proyectos en la grilla
  if (document.getElementById('projects-grid')) {
    await loadProjects();
  }
  
  // 3. Configurar y aplicar el idioma
  const userLang = localStorage.getItem('language') || 'es';
  await setLanguage(userLang);

  // 4. Añadir los event listeners a los botones de idioma (ahora que el header existe)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      const currentLang = localStorage.getItem('language');
      if (selectedLang !== currentLang) {
        setLanguage(selectedLang);
      }
    });
  });

  // 5. Funciones adicionales
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
