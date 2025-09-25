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

  // --- FUNCIONES BÁSICAS (MANTENER COMO ESTABAN) ---

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
    // Traducir textos normales
    root.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if (dict[key]) {
        let text = dict[key].replace('{year}', new Date().getFullYear());
        
        // ARREGLO: Si es un label del formulario con icono, preservar el icono
        if (el.tagName === 'LABEL' && el.classList.contains('form-label-enhanced')) {
          const existingIcon = el.querySelector('i');
          if (existingIcon) {
            // Mantener el icono y solo cambiar el texto
            const iconHTML = existingIcon.outerHTML;
            el.innerHTML = iconHTML + ' ' + text;
          } else {
            el.innerHTML = text;
          }
        } else {
          el.innerHTML = text;
        }
      }
    });
    
    // Traducir placeholders
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.placeholder = dict[key];
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

  async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    try {
        const response = await fetch(`${basePath}views/projects/projects.json`);
        const projects = await response.json();
        
        const projectKeys = [
          "project_iac_modular_title", "project_iac_modular_desc",
          "project_cicd_gitops_title", "project_cicd_gitops_desc",
          "project_devsecops_k8s_title", "project_devsecops_k8s_desc",
          "project_observability_360_title", "project_observability_360_desc",
          "project_finops_opencost_title", "project_finops_opencost_desc",
          "project_k8s_advanced_title", "project_k8s_advanced_desc",
          "project_aiops_title", "project_aiops_desc"
        ];

        grid.innerHTML = projects.map((p, i) => `
            <div class="project-card">
                <div class="project-image"><i class="${p.icon}" aria-hidden="true"></i></div>
                <div class="project-content">
                    <h3 class="project-title" data-i18n-key="${projectKeys[i*2]}"></h3>
                    <p class="project-description" data-i18n-key="${projectKeys[i*2+1]}"></p>
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

  // --- FORMULARIO MEJORADO PERO SEGURO ---
  function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    console.log('🔧 Inicializando formulario mejorado...');

    // APLICAR MEJORAS VISUALES
    enhanceFormAppearance(form);

    // MANEJAR ENVÍO CON TU LÓGICA ORIGINAL
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('form-status');
      const btn = form.querySelector('button[type="submit"]');
      const dict = translations[currentLang] || {};
      
      // Validar antes de enviar
      if (!validateAllFields(form)) {
        showFormMessage('Por favor, corrige los errores en el formulario', 'error');
        return;
      }
      
      // Estado de loading
      setButtonLoading(btn, true);
      if (status) status.innerHTML = '';

      try {
        console.log('📤 Enviando formulario a:', form.action);
        const response = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          console.log('✅ Formulario enviado exitosamente');
          form.reset();
          clearFormValidation(form);
          if (status) status.innerHTML = dict.form_success_message || "¡Mensaje enviado!";
          showFormMessage(dict.form_success_message || '¡Mensaje enviado exitosamente!', 'success');
        } else {
          console.error('❌ Error del servidor:', response.status);
          if (status) status.innerHTML = dict.form_error_message || "Error al enviar.";
          showFormMessage(dict.form_error_message || 'Error al enviar el mensaje', 'error');
        }
      } catch (error) {
        console.error('❌ Error de red:', error);
        if (status) status.innerHTML = dict.form_error_message || "Error de red.";
        showFormMessage(dict.form_error_message || 'Error de conexión', 'error');
      } finally {
        setButtonLoading(btn, false);
      }
    });
  }

  // FUNCIONES AUXILIARES PARA EL FORMULARIO
  function enhanceFormAppearance(form) {
    const fields = form.querySelectorAll('.form-control');
    fields.forEach(field => {
      field.classList.add('form-control-enhanced');
      enhanceFieldVisually(field);
      addFieldValidation(field);
    });
    
    const submitBtn = form.querySelector('.btn-send');
    if (submitBtn) {
      submitBtn.classList.add('btn-send-enhanced');
      enhanceSubmitButton(submitBtn);
    }
  }

  function enhanceFieldVisually(field) {
    const wrapper = field.parentElement;
    wrapper.classList.add('form-group-enhanced');
    
    // Mejorar label con icono
    const label = wrapper.querySelector('label');
    if (label) {
      label.classList.add('form-label-enhanced');
      addIconToLabel(label, field);
    }
    
    // Agregar icono de estado si no existe
    if (!wrapper.querySelector('.form-icon')) {
      const statusIcon = document.createElement('i');
      statusIcon.className = 'form-icon fas';
      wrapper.appendChild(statusIcon);
    }
    
    // Agregar feedback si no existe
    if (!wrapper.querySelector('.form-feedback')) {
      const feedback = document.createElement('div');
      feedback.className = 'form-feedback';
      wrapper.appendChild(feedback);
    }
  }

  function addIconToLabel(label, field) {
    // Solo agregar si no tiene icono ya
    if (label.querySelector('i')) return;
    
    const iconMap = {
      'nombre': 'fas fa-user',
      'email': 'fas fa-envelope',
      'mensaje': 'fas fa-comment-dots'
    };
    
    const iconClass = iconMap[field.name] || 'fas fa-edit';
    const icon = document.createElement('i');
    icon.className = iconClass;
    label.insertBefore(icon, label.firstChild);
    label.insertBefore(document.createTextNode(' '), icon.nextSibling);
  }

  function addFieldValidation(field) {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur', () => validateField(field));
  }

  function validateField(field) {
    const value = field.value.trim();
    const wrapper = field.parentElement;
    const icon = wrapper.querySelector('.form-icon');
    const feedback = wrapper.querySelector('.form-feedback');
    
    let isValid = true;
    let message = '';
    
    // Obtener mensajes traducidos
    const dict = translations[currentLang] || {};
    
    if (field.required && !value) {
      isValid = false;
      message = dict.form_required || 'Este campo es requerido';
    } else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = dict.form_email_invalid || 'Email inválido';
      } else {
        message = dict.form_field_valid || '¡Perfecto!';
      }
    } else if (field.name === 'nombre' && value) {
      if (value.length < 2) {
        isValid = false;
        message = dict.form_name_short || 'Muy corto';
      } else {
        message = dict.form_field_valid || '¡Correcto!';
      }
    } else if (field.name === 'mensaje' && value) {
      if (value.length < 10) {
        isValid = false;
        message = dict.form_message_short || 'Muy corto';
      } else {
        message = dict.form_field_valid || '¡Correcto!';
      }
    } else if (value) {
      message = dict.form_field_valid || '¡Correcto!';
    }
    
    // Aplicar estado visual
    updateFieldVisualState(field, isValid, message, icon, feedback);
    return isValid;
  }

  function updateFieldVisualState(field, isValid, message, icon, feedback) {
    // Limpiar estados
    field.classList.remove('is-valid', 'is-invalid');
    icon.classList.remove('fa-check', 'fa-times', 'valid', 'invalid', 'show');
    feedback.classList.remove('valid', 'invalid', 'show');
    
    if (field.value.trim()) {
      if (isValid) {
        field.classList.add('is-valid');
        icon.classList.add('fa-check', 'valid', 'show');
        feedback.textContent = message;
        feedback.classList.add('valid', 'show');
      } else {
        field.classList.add('is-invalid');
        icon.classList.add('fa-times', 'invalid', 'show');
        feedback.textContent = message;
        feedback.classList.add('invalid', 'show');
      }
    }
  }

  function validateAllFields(form) {
    const fields = form.querySelectorAll('.form-control-enhanced');
    let allValid = true;
    
    fields.forEach(field => {
      if (!validateField(field)) {
        allValid = false;
      }
    });
    
    return allValid;
  }

  function enhanceSubmitButton(btn) {
    const originalText = btn.textContent;
    btn.innerHTML = `
      <span class="btn-text">
        <i class="fas fa-paper-plane"></i>
        ${originalText}
      </span>
      <div class="btn-spinner">
        <div class="spinner"></div>
      </div>
    `;
  }

  function setButtonLoading(btn, loading) {
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  function showFormMessage(message, type) {
    const form = document.getElementById('contact-form');
    const messageDiv = document.createElement('div');
    messageDiv.className = `success-message ${type === 'error' ? 'error-message' : ''}`;
    
    if (type === 'error') {
      messageDiv.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
      messageDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    } else {
      messageDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    }
    
    form.parentElement.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.classList.add('show'), 100);
    setTimeout(() => {
      messageDiv.classList.remove('show');
      setTimeout(() => messageDiv.remove(), 500);
    }, 4000);
  }

  function clearFormValidation(form) {
    form.querySelectorAll('.form-control-enhanced').forEach(field => {
      field.classList.remove('is-valid', 'is-invalid');
      const wrapper = field.parentElement;
      const icon = wrapper.querySelector('.form-icon');
      const feedback = wrapper.querySelector('.form-feedback');
      
      if (icon) icon.classList.remove('fa-check', 'fa-times', 'valid', 'invalid', 'show');
      if (feedback) feedback.classList.remove('valid', 'invalid', 'show');
    });
  }

  // --- SECUENCIA DE INICIALIZACIÓN ---
  console.log('🚀 Iniciando aplicación...');
  
  try {
    // 1. Cargar Header y Footer
    await includePartials();
    console.log('✅ Partials cargados');
    
    // 2. Cargar proyectos
    if (document.getElementById('projects-grid')) {
        await loadProjects();
        console.log('✅ Proyectos cargados');
    }
    
    // 3. Aplicar traducciones
    await setLanguage(currentLang);
    console.log('✅ Traducciones aplicadas');
    
    // 4. Activar funcionalidades
    bindLanguageButtons();
    handleContactForm();
    console.log('✅ Formulario inicializado');

    // NAVEGACIÓN INTELIGENTE ENTRE PÁGINAS
function setupSmartNavigation() {
  // Detectar en qué página estamos
  const currentPath = window.location.pathname;
  const isHomePage = currentPath === '/' || currentPath.endsWith('index.html') || currentPath === '';
  const isAboutPage = currentPath.includes('about.html');
  const isBlogPage = currentPath.includes('/blog/');
  
  // Esperar a que se cargue el header
  setTimeout(() => {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const originalHref = link.getAttribute('href');
      
      // Ajustar rutas según la página actual
      if (isHomePage) {
        // En la página principal, mantener las rutas con #
        if (originalHref === '#about') {
          link.setAttribute('href', './views/about.html');
        }
      } else if (isAboutPage) {
        // En about.html
        if (originalHref === '#hero') {
          link.setAttribute('href', '../index.html#hero');
        } else if (originalHref === '#projects') {
          link.setAttribute('href', '../index.html#projects');
        } else if (originalHref === '#blog') {
          link.setAttribute('href', '../index.html#blog');
        } else if (originalHref === '#contacto') {
          link.setAttribute('href', '../index.html#contacto');
        } else if (originalHref === '#about') {
          link.setAttribute('href', '#about'); // Se queda en la misma página
        }
      } else if (isBlogPage) {
        // En páginas de blog
        if (originalHref === '#hero') {
          link.setAttribute('href', '../../index.html#hero');
        } else if (originalHref === '#projects') {
          link.setAttribute('href', '../../index.html#projects');
        } else if (originalHref === '#blog') {
          link.setAttribute('href', '../../index.html#blog');
        } else if (originalHref === '#contacto') {
          link.setAttribute('href', '../../index.html#contacto');
        } else if (originalHref === '#about') {
          link.setAttribute('href', '../about.html');
        }
      }
    });
  }, 500); // Esperar a que se cargue el header
}

// Ejecutar después de que todo esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    setupSmartNavigation();
  }, 1000); // Dar tiempo para que se carguen los partials
});
    
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  }
});
