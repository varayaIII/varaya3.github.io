document.addEventListener('DOMContentLoaded', async () => {
  // --- CONFIGURACIÓN GLOBAL ---
  const translations = {};
  let currentLang = localStorage.getItem('language') || 'es';

  // --- LÓGICA DE RUTAS ---
  let basePath = './';
  if (window.location.pathname.includes('/views/blog/')) {
    basePath = '../../';
  } else if (window.location.pathname.includes('/views/')) {
    basePath = '../';
  }

  // --- FUNCIONES ---

  async function fetchTranslations(lang) {
    if (translations[lang]) return translations[lang];
    try {
      const response = await fetch(`${basePath}public/locales/${lang}.json`);
      if (!response.ok) throw new Error(`Cannot fetch ${lang}.json`);
      translations[lang] = await response.json();
      return translations[lang];
    } catch (error) {
      console.error("Error fetching translation file:", error);
      return {};
    }
  }

  function applyTranslations(dict, root = document) {
    root.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if (dict[key]) {
        let text = dict[key].replace('{year}', new Date().getFullYear());
        el.innerHTML = text;
      }
    });
  }

  async function setLanguage(lang) {
    const dict = await fetchTranslations(lang);
    applyTranslations(dict);
    
    currentLang = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  async function includePartials() {
    const targets = document.querySelectorAll('[data-include]');
    for (const el of targets) {
      const url = el.getAttribute('data-include');
      if (!url) continue;
      try {
        const res = await fetch(url);
        if (res.ok) {
            el.innerHTML = await res.text();
        }
      } catch (error) {
        console.error("Failed to include partial:", error);
      }
    }
  }

  function bindLanguageButtons() {
    document.body.addEventListener('click', (e) => {
      const langBtn = e.target.closest('.lang-btn');
      if (langBtn) {
        const lang = langBtn.dataset.lang;
        if (lang && lang !== currentLang) {
          setLanguage(lang);
        }
      }
    });
  }

  function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('form-status');
      const btn = form.querySelector('button[type="submit"]');
      const dict = translations[currentLang] || {};
      
      btn.disabled = true;
      status.innerHTML = '';

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          status.innerHTML = dict.form_success_message || "¡Mensaje enviado!";
        } else {
          status.innerHTML = dict.form_error_message || "Error al enviar.";
        }
      } catch (error) {
        status.innerHTML = dict.form_error_message || "Error de red.";
      } finally {
        btn.disabled = false;
      }
    });
  }

  // ===== FUNCIÓN CORREGIDA =====
  async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    try {
        const response = await fetch(`${basePath}views/projects/projects.json`);
        const projects = await response.json();
        
        // Orden por dificultad: IaC → CI/CD → DevSecOps → Observabilidad → FinOps → K8s Avanzado → AIOps
        const projectKeys = [
          { titleKey: "project_iac_title",        descKey: "project_iac_desc" },        // 1
          { titleKey: "project_cicd_title",       descKey: "project_cicd_desc" },       // 2
          { titleKey: "project_security_title",   descKey: "project_security_desc" },   // 3
          { titleKey: "project_monitoring_title", descKey: "project_monitoring_desc" }, // 4
          { titleKey: "project_finops_title",     descKey: "project_finops_desc" },     // 5  ← NUEVO
          { titleKey: "project_k8s_title",        descKey: "project_k8s_desc" },        // 6
          { titleKey: "project_python_title",     descKey: "project_python_desc" }      // 7
        ];


        // Se crea el HTML con las etiquetas data-i18n-key
        grid.innerHTML = projectData.map(p => `
            <div class="project-card">
                <div class="project-image"><i class="${p.icon}" aria-hidden="true"></i></div>
                <div class="project-content">
                    <h3 class="project-title" data-i18n-key="${p.titleKey}"></h3>
                    <p class="project-description" data-i18n-key="${p.descKey}"></p>
                    <a href="${p.github}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <span data-i18n-key="project_view_on_github"></span>
                        <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </a>
                </div>
            </div>`).join('');
    } catch (e) {
        console.error("Failed to load projects:", e);
    }
  }

  // --- SECUENCIA DE INICIALIZACIÓN ---
  
  // 1. Cargar Header y Footer
  await includePartials();
  
  // 2. Cargar proyectos (si estamos en la página de inicio)
  if (document.getElementById('projects-grid')) {
      await loadProjects();
  }
  
  // 3. Cargar el idioma y traducir todo (incluyendo los parciales y proyectos)
  await setLanguage(currentLang);
  
  // 4. Activar los listeners para botones y formularios
  bindLanguageButtons();
  handleContactForm();
});
