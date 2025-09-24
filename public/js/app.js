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

  // --- FUNCIONES EXISTENTES (SIN CAMBIOS) ---

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

  // ===== FUNCIÓN CORREGIDA Y ACTUALIZADA =====
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

        // Se crea el HTML con las etiquetas data-i18n-key correctas
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

  // ===== FUNCIÓN DE CONTACTO MEJORADA =====
  class EnhancedContactForm {
    constructor() {
      this.form = document.getElementById('contact-form');
      if (!this.form) return;
      
      this.submitBtn = null;
      this.successMessage = null;
      this.charCounter = null;
      
      this.init();
    }
    
    init() {
      this.enhanceForm();
      this.attachEventListeners();
      this.createSuccessMessage();
    }
    
    enhanceForm() {
      // Convertir campos normales a mejorados
      const fields = this.form.querySelectorAll('.form-control');
      fields.forEach(field => {
        field.classList.add('form-control-enhanced');
        this.enhanceField(field);
      });
      
      // Mejorar el botón de envío
      const submitBtn = this.form.querySelector('.btn-send');
      if (submitBtn) {
        submitBtn.classList.add('btn-send-enhanced');
        this.enhanceSubmitButton(submitBtn);
        this.submitBtn = submitBtn;
      }
    }
    
    enhanceField(field) {
      const wrapper = field.parentElement;
      wrapper.classList.add('form-group-enhanced');
      
      // Mejorar el label
      const label = wrapper.querySelector('label');
      if (label) {
        label.classList.add('form-label-enhanced');
        this.addIconToLabel(label, field);
      }
      
      // Agregar icono de estado
      const statusIcon = document.createElement('i');
      statusIcon.className = 'form-icon fas';
      wrapper.appendChild(statusIcon);
      
      // Agregar feedback
      const feedback = document.createElement('div');
      feedback.className = 'form-feedback';
      wrapper.appendChild(feedback);
      
      // Si es textarea, agregar contador de caracteres
      if (field.tagName === 'TEXTAREA') {
        this.addCharacterCounter(wrapper, field);
      }
    }
    
    addIconToLabel(label, field) {
      const iconMap = {
        'nombre': 'fas fa-user',
        'email': 'fas fa-envelope',
        'mensaje': 'fas fa-comment-dots'
      };
      
      const fieldName = field.name;
      const iconClass = iconMap[fieldName] || 'fas fa-edit';
      
      const icon = document.createElement('i');
      icon.className = iconClass;
      label.insertBefore(icon, label.firstChild);
    }
    
    addCharacterCounter(wrapper, field) {
      const maxLength = field.getAttribute('maxlength') || 500;
      
      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.innerHTML = `<span class="char-count">0</span>/${maxLength} caracteres`;
      
      wrapper.appendChild(counter);
      wrapper.classList.add('has-counter');
      
      this.charCounter = counter.querySelector('.char-count');
    }
    
    enhanceSubmitButton(btn) {
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
    
    createSuccessMessage() {
      const successDiv = document.createElement('div');
      successDiv.id = 'form-success-message';
      successDiv.className = 'success-message';
      successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span data-i18n-key="form_success_message">¡Mensaje enviado exitosamente!</span>
      `;
      
      this.form.parentElement.appendChild(successDiv);
      this.successMessage = successDiv;
    }
    
    attachEventListeners() {
      // Validación en tiempo real
      this.form.querySelectorAll('.form-control-enhanced').forEach(input => {
        input.addEventListener('input', (e) => this.validateField(e.target));
        input.addEventListener('blur', (e) => this.validateField(e.target));
        input.addEventListener('focus', (e) => this.handleFocus(e.target));
      });
      
      // Contador de caracteres para textarea
      const textarea = this.form.querySelector('#mensaje');
      if (textarea) {
        textarea.addEventListener('input', (e) => this.updateCharCounter(e.target));
      }
      
      // Envío del formulario
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    validateField(field) {
      const value = field.value.trim();
      const fieldType = field.type;
      const isRequired = field.required;
      
      let isValid = true;
      let message = '';
      
      // Obtener mensajes traducidos
      const dict = translations[currentLang] || {};
      const messages = {
        required: dict.form_required || 'Este campo es requerido',
        email_invalid: dict.form_email_invalid || 'Ingresa un email válido',
        name_short: dict.form_name_short || 'El nombre debe tener al menos 2 caracteres',
        name_long: dict.form_name_long || 'El nombre no puede exceder 50 caracteres',
        message_short: dict.form_message_short || 'El mensaje debe tener al menos 10 caracteres',
        message_long: dict.form_message_long || 'El mensaje no puede exceder 500 caracteres',
        valid: dict.form_field_valid || '¡Perfecto!'
      };
      
      // Validaciones específicas
      if (isRequired && !value) {
        isValid = false;
        message = messages.required;
      } else if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          isValid = false;
          message = messages.email_invalid;
        } else {
          message = messages.valid;
        }
      } else if (field.name === 'nombre' && value) {
        if (value.length < 2) {
          isValid = false;
          message = messages.name_short;
        } else if (value.length > 50) {
          isValid = false;
          message = messages.name_long;
        } else {
          message = messages.valid;
        }
      } else if (field.name === 'mensaje' && value) {
        if (value.length < 10) {
          isValid = false;
          message = messages.message_short;
        } else if (value.length > 500) {
          isValid = false;
          message = messages.message_long;
        } else {
          message = messages.valid;
        }
      } else if (value) {
        message = messages.valid;
      }
      
      this.updateFieldState(field, isValid, message);
      return isValid;
    }
    
    updateFieldState(field, isValid, message) {
      const wrapper = field.parentElement;
      const icon = wrapper.querySelector('.form-icon');
      const feedback = wrapper.querySelector('.form-feedback');
      
      // Remover clases anteriores
      field.classList.remove('is-valid', 'is-invalid');
      icon.classList.remove('fa-check', 'fa-times', 'valid', 'invalid', 'show');
      feedback.classList.remove('valid', 'invalid', 'show');
      
      // Si el campo no está vacío, aplicar estado
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
    
    handleFocus(field) {
      // Mostrar contador de caracteres si es textarea
      if (field.name === 'mensaje') {
        const counter = field.parentElement.querySelector('.character-counter');
        if (counter) {
          counter.classList.add('show');
        }
      }
    }
    
    updateCharCounter(textarea) {
      if (!this.charCounter) return;
      
      const count = textarea.value.length;
      const maxLength = parseInt(textarea.getAttribute('maxlength')) || 500;
      
      this.charCounter.textContent = count;
      
      // Cambiar color si se acerca al límite
      const counter = textarea.parentElement.querySelector('.character-counter');
      if (counter) {
        counter.style.color = count > maxLength * 0.8 ? '#dc3545' : 'rgba(255,255,255,.6)';
      }
    }
    
    async handleSubmit(e) {
      e.preventDefault();
      
      // Validar todos los campos
      const fields = this.form.querySelectorAll('.form-control-enhanced');
      let allValid = true;
      
      fields.forEach(field => {
        if (!this.validateField(field)) {
          allValid = false;
        }
      });
      
      if (!allValid) {
        const dict = translations[currentLang] || {};
        this.showError(dict.form_validation_error || 'Por favor, corrige los errores en el formulario');
        return;
      }
      
      // Mostrar estado de carga
      this.setLoadingState(true);
      
      try {
        // IMPORTANTE: Usar exactamente la misma configuración que Formspree requiere
        const formData = new FormData(this.form);
        
        const response = await fetch(this.form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('Formulario enviado exitosamente:', result);
          this.showSuccess();
          this.resetForm();
        } else {
          console.error('Error de Formspree:', result);
          // Si Formspree devuelve errores específicos, mostrarlos
          if (result.errors) {
            const errorMsg = result.errors.map(err => err.message).join(', ');
            throw new Error(errorMsg);
          } else {
            throw new Error('Error al procesar el formulario');
          }
        }
      } catch (error) {
        console.error('Error completo:', error);
        const dict = translations[currentLang] || {};
        this.showError(dict.form_error_message || 'Hubo un error al enviar el mensaje. Inténtalo nuevamente.');
      } finally {
        this.setLoadingState(false);
      }
    }
    
    setLoadingState(loading) {
      if (!this.submitBtn) return;
      
      if (loading) {
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
      } else {
        this.submitBtn.classList.remove('loading');
        this.submitBtn.disabled = false;
      }
    }
    
    showSuccess() {
      if (this.successMessage) {
        // Aplicar traducción al mensaje de éxito
        const dict = translations[currentLang] || {};
        applyTranslations(dict, this.successMessage);
        
        this.successMessage.classList.add('show');
        setTimeout(() => {
          this.successMessage.classList.remove('show');
        }, 5000);
      }
    }
    
    showError(message) {
      // Crear un toast de error temporal
      const errorToast = document.createElement('div');
      errorToast.className = 'success-message';
      errorToast.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
      errorToast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
      
      this.form.parentElement.appendChild(errorToast);
      
      setTimeout(() => errorToast.classList.add('show'), 100);
      setTimeout(() => {
        errorToast.classList.remove('show');
        setTimeout(() => errorToast.remove(), 500);
      }, 4000);
    }
    
    resetForm() {
      this.form.reset();
      
      // Limpiar estados visuales
      this.form.querySelectorAll('.form-control-enhanced').forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
        const wrapper = field.parentElement;
        const icon = wrapper.querySelector('.form-icon');
        const feedback = wrapper.querySelector('.form-feedback');
        
        icon.classList.remove('fa-check', 'fa-times', 'valid', 'invalid', 'show');
        feedback.classList.remove('valid', 'invalid', 'show');
      });
      
      // Resetear contador
      if (this.charCounter) {
        this.charCounter.textContent = '0';
      }
    }
  }

  // ===== FUNCIÓN DE CONTACTO SIMPLIFICADA (FALLBACK) =====
  function handleContactForm() {
    // Si ya existe una instancia de EnhancedContactForm, no hacer nada
    if (window.enhancedContactForm) return;
    
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Verificar que el formulario tiene la configuración correcta de Formspree
    console.log('Configuración del formulario:', {
      action: form.action,
      method: form.method,
      hasHiddenFields: form.querySelector('input[name="_subject"]') ? 'Sí' : 'No'
    });

    // Intentar crear el formulario mejorado
    try {
      window.enhancedContactForm = new EnhancedContactForm();
    } catch (error) {
      console.error('Error creating enhanced contact form, falling back to basic:', error);
      
      // Fallback a la versión básica original (IDÉNTICA a tu versión original)
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('form-status');
        const btn = form.querySelector('button[type="submit"]');
        const dict = translations[currentLang] || {};
        
        btn.disabled = true;
        if (status) status.innerHTML = '';

        try {
          const response = await fetch(form.action, {
            method: form.method,
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            form.reset();
            if (status) status.innerHTML = dict.form_success_message || "¡Mensaje enviado!";
            console.log('Formulario enviado exitosamente (fallback)');
          } else {
            if (status) status.innerHTML = dict.form_error_message || "Error al enviar.";
          }
        } catch (error) {
          console.error('Error en fallback:', error);
          if (status) status.innerHTML = dict.form_error_message || "Error de red.";
        } finally {
          btn.disabled = false;
        }
      });
    }
  }

  // --- SECUENCIA DE INICIALIZACIÓN ---
  
  // 1. Cargar Header y Footer
  await includePartials();
  
  // 2. Cargar la estructura de los proyectos (si estamos en la página de inicio)
  if (document.getElementById('projects-grid')) {
      await loadProjects();
  }
  
  // 3. Cargar el idioma y traducir todo (incluyendo los parciales y la estructura de proyectos)
  await setLanguage(currentLang);
  
  // 4. Activar los listeners para botones y formularios
  bindLanguageButtons();
  handleContactForm();
});
