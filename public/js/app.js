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

  // --- FUNCIONES BÁSICAS ---

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
        
        // ARREGLO CRÍTICO: Preservar iconos y HTML existente al traducir
        if (el.tagName === 'LABEL' && el.classList.contains('form-label-enhanced')) {
          const existingIcon = el.querySelector('i');
          if (existingIcon) {
            // Mantener el icono y solo cambiar el texto después del icono
            const iconHTML = existingIcon.outerHTML;
            el.innerHTML = iconHTML + ' ' + text;
          } else {
            el.innerHTML = text;
          }
        } else if (el.tagName === 'SPAN' && el.closest('.btn-send')) {
          // ARREGLO ESPECÍFICO: Traducir spans dentro de botones de envío
          el.textContent = text;
        } else if (el.classList.contains('btn-send') || el.querySelector('i')) {
          // Si el elemento tiene iconos (como botones o enlaces), preservarlos
          const icons = Array.from(el.querySelectorAll('i')).map(icon => icon.outerHTML);
          const textWithoutIcons = text;
          
          // Detectar si los iconos van antes o después del texto
          const originalHTML = el.innerHTML;
          const hasIconsAtStart = originalHTML.trim().startsWith('<i');
          const hasIconsAtEnd = originalHTML.trim().endsWith('</i>') || originalHTML.includes('</i>');
          
          if (hasIconsAtStart && icons.length > 0) {
            el.innerHTML = icons[0] + ' ' + textWithoutIcons;
          } else if (hasIconsAtEnd && icons.length > 0) {
            el.innerHTML = textWithoutIcons + ' ' + icons[icons.length - 1];
          } else {
            el.innerHTML = textWithoutIcons;
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
    
    // Actualizar navegación después de cambiar idioma
    setTimeout(() => {
      setupSmartNavigation();
    }, 100);
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
        // ARREGLO: Usar mensaje traducido para error de validación
        const errorMsg = dict.form_validation_error || 'Por favor, corrige los errores en el formulario';
        showFormMessage(errorMsg, 'error');
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
          showFormMessage(dict.form_status_success || '¡Mensaje enviado exitosamente!', 'success');
        } else {
          console.error('❌ Error del servidor:', response.status);
          if (status) status.innerHTML = dict.form_error_message || "Error al enviar.";
          showFormMessage(dict.form_status_error || 'Error al enviar el mensaje', 'error');
        }
      } catch (error) {
        console.error('❌ Error de red:', error);
        if (status) status.innerHTML = dict.form_error_message || "Error de red.";
        showFormMessage(dict.form_status_error || 'Error de conexión', 'error');
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
    
    // ARREGLO: Insertar correctamente sin romper traducciones
    const textContent = label.textContent.trim();
    label.innerHTML = '';
    label.appendChild(icon);
    label.appendChild(document.createTextNode(' ' + textContent));
    
    // Mantener el atributo de traducción
    if (label.hasAttribute('data-i18n-key')) {
      // El applyTranslations se encargará de mantener el icono
    }
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
    
    // ARREGLO: Obtener mensajes traducidos correctamente
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
    // ARREGLO CRÍTICO: Preservar la estructura de traducción del botón
    const existingSpan = btn.querySelector('span[data-i18n-key]');
    const existingIcon = btn.querySelector('i');
    
    if (existingSpan && existingIcon) {
      // El botón ya tiene la estructura correcta con span traducible
      // Solo agregamos el spinner
      const spinner = document.createElement('div');
      spinner.className = 'btn-spinner';
      spinner.innerHTML = '<div class="spinner"></div>';
      btn.appendChild(spinner);
      
      // Envolver el contenido existente en btn-text si no está ya
      if (!btn.querySelector('.btn-text')) {
        const btnText = document.createElement('span');
        btnText.className = 'btn-text';
        btnText.appendChild(existingIcon.cloneNode(true));
        btnText.appendChild(document.createTextNode(' '));
        btnText.appendChild(existingSpan.cloneNode(true));
        
        // Limpiar y reorganizar
        btn.innerHTML = '';
        btn.appendChild(btnText);
        btn.appendChild(spinner);
      }
    } else {
      console.warn('Botón no tiene la estructura esperada para traducción');
    }
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

  // --- NAVEGACIÓN INTELIGENTE ---
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
        let newHref = '';
        const linkClass = link.className;
        
        // Determinar la ruta correcta basada en la página actual y el tipo de enlace
        if (isHomePage) {
          // En la página principal
          if (linkClass.includes('nav-home')) newHref = '#hero';
          else if (linkClass.includes('nav-about')) newHref = './views/about.html';
          else if (linkClass.includes('nav-projects')) newHref = '#projects';
          else if (linkClass.includes('nav-blog')) newHref = '#blog';
          else if (linkClass.includes('nav-contact')) newHref = '#contacto';
        } else if (isAboutPage) {
          // En about.html
          if (linkClass.includes('nav-home')) newHref = '../index.html#hero';
          else if (linkClass.includes('nav-about')) newHref = '#about';
          else if (linkClass.includes('nav-projects')) newHref = '../index.html#projects';
          else if (linkClass.includes('nav-blog')) newHref = '../index.html#blog';
          else if (linkClass.includes('nav-contact')) newHref = '../index.html#contacto';
        } else if (isBlogPage) {
          // En páginas de blog
          if (linkClass.includes('nav-home')) newHref = '../../index.html#hero';
          else if (linkClass.includes('nav-about')) newHref = '../about.html';
          else if (linkClass.includes('nav-projects')) newHref = '../../index.html#projects';
          else if (linkClass.includes('nav-blog')) newHref = '../../index.html#blog';
          else if (linkClass.includes('nav-contact')) newHref = '../../index.html#contacto';
        }
        
        if (newHref) {
          link.setAttribute('href', newHref);
        }
      });
    }, 300); // Tiempo suficiente para que se cargue el header
  }

    // --- SECUENCIA DE INICIALIZACIÓN ---
  console.log('🚀 Iniciando aplicación...');
  
  try {
    // 1. Cargar Header y Footer
    await includePartials();
    console.log('✅ Partials cargados');
  
    // 2. Esperar brevemente para asegurar inserción en DOM
    await new Promise(r => setTimeout(r, 150));
  
    // 3. Cargar proyectos si existe el grid
    if (document.getElementById('projects-grid')) {
      await loadProjects();
      console.log('✅ Proyectos cargados');
    }
  
    // 4. Aplicar traducciones
    await setLanguage(currentLang);
    console.log('✅ Traducciones aplicadas');
  
    // 5. Configurar navegación inteligente (una sola vez)
    setupSmartNavigation();
    console.log('✅ Navegación configurada');
  
    // 6. Activar funcionalidades
    bindLanguageButtons();
    handleContactForm();
    console.log('✅ Formulario inicializado');
  
    // 7. 🔥 Ocultar loader tras carga exitosa
    document.body.classList.add('loaded');
    console.log('✨ Página lista');
  
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    // Siempre quitar loader para evitar bloqueo visual
    document.body.classList.add('loaded');
  
    // Mostrar un mensaje visual opcional
    const fallback = document.createElement('div');
    fallback.style.cssText = "color:white;text-align:center;margin-top:50px;font-size:1.2rem;";
    fallback.textContent = "⚠️ Error al cargar el sitio. Intenta recargar la página.";
    document.body.appendChild(fallback);
  }
