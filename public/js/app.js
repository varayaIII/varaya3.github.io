document.addEventListener('DOMContentLoaded', async () => {
  // ================================
  // CONFIGURACIÓN GLOBAL
  // ================================
  const translations = {};
  let currentLang = localStorage.getItem('language') || 'es';

  let basePath = './';
  if (window.location.pathname.includes('/views/blog/')) basePath = '../../';
  else if (window.location.pathname.includes('/views/')) basePath = '../';

  // ================================
  // FUNCIONES DE TRADUCCIÓN
  // ================================
    async function fetchTranslations(lang) {
    if (translations[lang]) return translations[lang];
    try {
      const response = await fetch(`/public/locales/${lang}.json`);
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
      if (!dict[key]) return;

      let text = dict[key].replace('{year}', new Date().getFullYear());

      if (el.tagName === 'LABEL' && el.classList.contains('form-label-enhanced')) {
        const existingIcon = el.querySelector('i');
        el.innerHTML = existingIcon ? existingIcon.outerHTML + ' ' + text : text;
      } else if (el.tagName === 'SPAN' && el.closest('.btn-send')) {
        el.textContent = text;
      } else if (el.classList.contains('btn-send') || el.querySelector('i')) {
        const icons = Array.from(el.querySelectorAll('i')).map(icon => icon.outerHTML);
        const originalHTML = el.innerHTML.trim();
        const hasIconsAtStart = originalHTML.startsWith('<i');
        const hasIconsAtEnd = originalHTML.endsWith('</i>') || originalHTML.includes('</i>');
        if (hasIconsAtStart && icons.length) el.innerHTML = icons[0] + ' ' + text;
        else if (hasIconsAtEnd && icons.length) el.innerHTML = text + ' ' + icons[icons.length - 1];
        else el.textContent = text;
      } else {
        if (text.includes('<')) el.innerHTML = text;
        else el.textContent = text;
      }
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.placeholder = dict[key];
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

  // ================================
  // INCLUSIÓN DE PARTIALS
  // ================================
  async function includePartials() {
    const targets = document.querySelectorAll('[data-include]');
    for (const el of targets) {
      const url = el.getAttribute('data-include');
      if (!url) continue;
      try {
        const res = await fetch(url);
        if (res.ok) el.innerHTML = await res.text();
      } catch (err) {
        console.error("Failed to include partial:", err);
      }
    }
  }

  // ================================
  // NAVEGACIÓN INTELIGENTE
  // ================================
  function setupSmartNavigation() {
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath.endsWith('index.html') || currentPath === '';
    const isAboutPage = currentPath.includes('about.html');
    const isBlogPage = currentPath.includes('/blog/');

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const cls = link.className;
      let newHref = '';

      if (isHomePage) {
        if (cls.includes('nav-home')) newHref = '#hero';
        else if (cls.includes('nav-about')) newHref = './views/about.html';
        else if (cls.includes('nav-projects')) newHref = '#projects';
        else if (cls.includes('nav-blog')) newHref = '#blog';
        else if (cls.includes('nav-contact')) newHref = '#contacto';
      } else if (isAboutPage) {
        if (cls.includes('nav-home')) newHref = '../index.html#hero';
        else if (cls.includes('nav-about')) newHref = '#about';
        else if (cls.includes('nav-projects')) newHref = '../index.html#projects';
        else if (cls.includes('nav-blog')) newHref = '../index.html#blog';
        else if (cls.includes('nav-contact')) newHref = '../index.html#contacto';
      } else if (isBlogPage) {
        if (cls.includes('nav-home')) newHref = '../../index.html#hero';
        else if (cls.includes('nav-about')) newHref = '../about.html';
        else if (cls.includes('nav-projects')) newHref = '../../index.html#projects';
        else if (cls.includes('nav-blog')) newHref = '../../index.html#blog';
        else if (cls.includes('nav-contact')) newHref = '../../index.html#contacto';
      }

      if (newHref) link.setAttribute('href', newHref);
    });
  }

  // ================================
  // CARGA DE PROYECTOS
  // ================================
  async function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    try {
      const response = await fetch(`${basePath}views/projects/projects.json`);
      const projects = await response.json();
      const keys = [
        "project_iac_modular_title","project_iac_modular_desc",
        "project_cicd_gitops_title","project_cicd_gitops_desc",
        "project_devsecops_k8s_title","project_devsecops_k8s_desc",
        "project_observability_360_title","project_observability_360_desc",
        "project_finops_opencost_title","project_finops_opencost_desc",
        "project_k8s_advanced_title","project_k8s_advanced_desc",
        "project_aiops_title","project_aiops_desc"
      ];
      grid.innerHTML = projects.map((p, i) => `
        <div class="project-card">
          <div class="project-image"><i class="${p.icon}" aria-hidden="true"></i></div>
          <div class="project-content">
            <h3 class="project-title" data-i18n-key="${keys[i*2]}"></h3>
            <p class="project-description" data-i18n-key="${keys[i*2+1]}"></p>
            <a href="${p.github}" target="_blank" rel="noopener" class="project-link">
              <span data-i18n-key="project_view_on_github"></span>
              <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
          </div>
        </div>`).join('');
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }

  // ================================
  // FORMULARIO DE CONTACTO
  // ================================
  function handleContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    enhanceFormAppearance(form);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const dict = translations[currentLang] || {};

      if (!validateAllFields(form)) {
        showFormMessage(dict.form_validation_error || 'Por favor, corrige los errores.', 'error');
        return;
      }

      setButtonLoading(btn, true);

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          clearFormValidation(form);
          showFormMessage(dict.form_status_success || '¡Mensaje enviado exitosamente!', 'success');
        } else {
          showFormMessage(dict.form_status_error || 'Error al enviar el mensaje', 'error');
        }
      } catch (err) {
        showFormMessage(dict.form_status_error || 'Error de conexión', 'error');
      } finally {
        setButtonLoading(btn, false);
      }
    });
  }

  function enhanceFormAppearance(form) {
    const fields = form.querySelectorAll('.form-control');
    fields.forEach(field => {
      field.classList.add('form-control-enhanced');
      const wrapper = field.parentElement;
      wrapper.classList.add('form-group-enhanced');

      const label = wrapper.querySelector('label');
      if (label && !label.querySelector('i')) {
        const iconMap = { nombre: 'fa-user', email: 'fa-envelope', mensaje: 'fa-comment-dots' };
        const icon = document.createElement('i');
        icon.className = `fas ${iconMap[field.name] || 'fa-edit'}`;
        const text = label.textContent.trim();
        label.innerHTML = '';
        label.appendChild(icon);
        label.appendChild(document.createTextNode(' ' + text));
      }

      if (!wrapper.querySelector('.form-icon')) {
        const statusIcon = document.createElement('i');
        statusIcon.className = 'form-icon fas';
        wrapper.appendChild(statusIcon);
      }

      if (!wrapper.querySelector('.form-feedback')) {
        const fb = document.createElement('div');
        fb.className = 'form-feedback';
        wrapper.appendChild(fb);
      }

      field.addEventListener('input', () => validateField(field));
      field.addEventListener('blur', () => validateField(field));
    });

    const btn = form.querySelector('.btn-send');
    if (btn && !btn.querySelector('.btn-text')) {
      btn.classList.add('btn-send-enhanced');
      const icon = btn.querySelector('i')?.cloneNode(true);
      const span = btn.querySelector('span[data-i18n-key]')?.cloneNode(true);
      const btnText = document.createElement('span');
      btnText.className = 'btn-text';
      if (icon) btnText.appendChild(icon);
      if (span) btnText.appendChild(span);
      const spinner = document.createElement('div');
      spinner.className = 'btn-spinner';
      spinner.innerHTML = '<div class="spinner"></div>';
      btn.innerHTML = '';
      btn.appendChild(btnText);
      btn.appendChild(spinner);
    }
  }

  function validateField(field) {
    const val = field.value.trim();
    const wrapper = field.parentElement;
    const icon = wrapper.querySelector('.form-icon');
    const fb = wrapper.querySelector('.form-feedback');
    const dict = translations[currentLang] || {};
    let valid = true, msg = '';

    if (field.required && !val) { valid = false; msg = dict.form_required || 'Campo requerido'; }
    else if (field.type === 'email' && val) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      valid = emailOk; msg = emailOk ? dict.form_field_valid || 'Correcto' : dict.form_email_invalid || 'Email inválido';
    } else if (field.name === 'nombre' && val.length < 2) {
      valid = false; msg = dict.form_name_short || 'Muy corto';
    } else if (field.name === 'mensaje' && val.length < 10) {
      valid = false; msg = dict.form_message_short || 'Muy corto';
    } else msg = dict.form_field_valid || 'Correcto';

    field.classList.remove('is-valid', 'is-invalid');
    icon.className = 'form-icon fas';
    fb.className = 'form-feedback';

    if (val) {
      if (valid) {
        field.classList.add('is-valid');
        icon.classList.add('fa-check', 'valid', 'show');
        fb.textContent = msg;
        fb.classList.add('valid', 'show');
      } else {
        field.classList.add('is-invalid');
        icon.classList.add('fa-times', 'invalid', 'show');
        fb.textContent = msg;
        fb.classList.add('invalid', 'show');
      }
    }
    return valid;
  }

  function validateAllFields(form) {
    return Array.from(form.querySelectorAll('.form-control-enhanced'))
      .map(f => validateField(f))
      .every(Boolean);
  }

  function setButtonLoading(btn, loading) {
    if (!btn) return;
    btn.classList.toggle('loading', loading);
    btn.disabled = loading;
  }

  function showFormMessage(message, type) {
    document.querySelectorAll('.success-message, .error-message').forEach(m => m.remove());
    const form = document.getElementById('contact-form');
    const div = document.createElement('div');
    div.className = type === 'error' ? 'error-message show' : 'success-message show';
    div.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
    form.parentElement.appendChild(div);
    setTimeout(() => div.remove(), 4000);
  }

  function clearFormValidation(form) {
    form.querySelectorAll('.form-control-enhanced').forEach(f => {
      f.classList.remove('is-valid', 'is-invalid');
      const icon = f.parentElement.querySelector('.form-icon');
      const fb = f.parentElement.querySelector('.form-feedback');
      if (icon) icon.className = 'form-icon fas';
      if (fb) fb.className = 'form-feedback';
    });
  }

  // ================================
  // INICIALIZACIÓN
  // ================================
  console.log('🚀 Iniciando aplicación...');

  try {
    await includePartials();
    await new Promise(r => setTimeout(r, 150));

    if (document.getElementById('projects-grid')) await loadProjects();
    await setLanguage(currentLang);
    setupSmartNavigation();
    handleContactForm();

    // ✅ Loader fuera
    document.body.classList.add('loaded');
    console.log('✨ Página lista');
  } catch (error) {
    console.error('❌ Error durante inicialización:', error);
    document.body.classList.add('loaded');
    const msg = document.createElement('div');
    msg.style.cssText = "color:white;text-align:center;margin-top:50px;font-size:1.2rem;";
    msg.textContent = "⚠️ Error al cargar el sitio. Intenta recargar la página.";
    document.body.appendChild(msg);
  }
});
