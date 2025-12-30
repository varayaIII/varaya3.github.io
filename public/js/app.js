// public/js/app.js - Sistema completo de la aplicación

// ============================================================================
// 1. SISTEMA DE INTERNACIONALIZACIÓN (i18n)
// ============================================================================

const translations = {
  es: {
    // Navegación
    nav_home: "Inicio",
    nav_about: "Sobre mí",
    nav_projects: "Proyectos",
    nav_blog: "Blog",
    nav_contact: "Contacto",
    
    // Hero
    hero_title: "Víctor Araya",
    hero_subtitle: "Ingeniero DevOps",
    hero_description: "Construyendo sistemas fiables y escalables a través de la automatización, la infraestructura como código y la cultura colaborativa.",
    
    // Proyectos
    projects_title: "Proyectos Destacados",
    project_view_more: "Ver más",
    
    // Blog
    blog_title: "Últimas Publicaciones",
    blog_read_more: "Leer más",
    blog_fundamentos_title: "Fundamentos DevOps",
    blog_fundamentos_excerpt: "Explorando los conceptos esenciales de DevOps y cómo implementarlos en tu organización.",
    blog_automatizacion_title: "Automatización de Infraestructura",
    blog_automatizacion_excerpt: "Cómo implementar infraestructura como código de manera efectiva con Terraform y Ansible.",
    blog_monitoreo_title: "Monitoreo Accionable",
    blog_monitoreo_excerpt: "Configuración avanzada de Prometheus y Grafana para observabilidad en producción.",
    
    // Contacto
    contact_title: "Contacto",
    form_name: "Nombre",
    form_name_placeholder: "Tu nombre completo",
    form_email: "Email",
    form_email_placeholder: "tu@email.com",
    form_message: "Mensaje",
    form_message_placeholder: "Cuéntame sobre tu proyecto o consulta...",
    form_send: "Enviar",
    
    // Footer
    footer_home: "Inicio",
    footer_copyright_pre: "© ",
    footer_copyright: ". Todos los derechos reservados.",
    
    // About
    about_page_title: "Sobre Mí - Víctor Araya",
    about_main_title: "Mi Filosofía de Trabajo",
    about_p1: "Soy Víctor Araya, padre de familia, un ingeniero de sistemas autodidacta enfocado en el ecosistema Cloud. Mi trayectoria en tecnología me ha enseñado una lección fundamental: los sistemas más robustos no son los que nunca fallan, sino los que están diseñados para ser resilientes, observables y capaces de recuperarse con rapidez.",
    about_subtitle1: "Del \"Cómo\" al \"Porqué\"",
    about_p2: "Mi pasión por DevOps nació de la curiosidad por ir más allá de la simple ejecución de tareas. En lugar de preguntar \"¿cómo despliego esta aplicación?\", comencé a preguntarme \"¿cómo construimos un sistema que permita despliegues seguros y automatizados, a cualquier hora y con mínima intervención humana?\".",
    about_p3: "Esta pregunta me llevó a profundizar en los principios de la Infraestructura como Código (IaC), la entrega continua (CI/CD) y la observabilidad. Entiendo la tecnología no como un fin en sí misma, sino como un medio para alcanzar objetivos de negocio cruciales: agilidad, estabilidad y confianza.",
    about_subtitle2: "Cultura de Mejora Continua",
    about_p4: "Adopto una mentalidad de mejora iterativa en todo lo que hago. Creo firmemente que la automatización es la clave para liberar el potencial humano, permitiendo que los equipos se centren en la innovación en lugar de en la gestión de crisis. Para mí, un pipeline de CI/CD bien diseñado o un script de Terraform idempotente son más que simples herramientas; son la materialización de una cultura que valora la consistencia, la previsibilidad y la colaboración.",
    about_back_button: "Ir al inicio",
    
    // Posts
    post_published_on: "Publicado el",
    post_back_to_blog: "Volver al blog",
    post_fundamentos_title: "Fundamentos DevOps",
    post_fundamentos_body: "<p class='lead'>Explorando los conceptos esenciales de DevOps y cómo implementarlos en tu organización.</p><p>DevOps no es solo una metodología, es una cultura que busca eliminar las barreras entre desarrollo y operaciones.</p>",
    post_automatizacion_title: "Automatización de Infraestructura",
    post_automatizacion_body: "<p class='lead'>Cómo implementar infraestructura como código de manera efectiva.</p><p>La automatización es la clave para la escalabilidad y la confiabilidad en sistemas modernos.</p>",
    post_monitoreo_title: "Monitoreo Accionable",
    post_monitoreo_body: "<p class='lead'>Configuración avanzada de Prometheus y Grafana para producción.</p><p>El monitoreo efectivo no solo detecta problemas, sino que permite prevenir incidentes antes de que ocurran.</p>"
  },
  en: {
    // Navigation
    nav_home: "Home",
    nav_about: "About",
    nav_projects: "Projects",
    nav_blog: "Blog",
    nav_contact: "Contact",
    
    // Hero
    hero_title: "Víctor Araya",
    hero_subtitle: "DevOps Engineer",
    hero_description: "Building reliable and scalable systems through automation, infrastructure as code, and collaborative culture.",
    hero_cta_projects: "View Projects",
    hero_cta_contact: "Contact Me",
    
    // Projects
    projects_title: "Featured Projects",
    project_view_more: "View more",
    
    // Blog
    blog_title: "Latest Posts",
    blog_read_more: "Read more",
    blog_fundamentos_title: "DevOps Fundamentals",
    blog_fundamentos_excerpt: "Exploring the essential concepts of DevOps and how to implement them in your organization.",
    blog_automatizacion_title: "Infrastructure Automation",
    blog_automatizacion_excerpt: "How to effectively implement infrastructure as code with Terraform and Ansible.",
    blog_monitoreo_title: "Actionable Monitoring",
    blog_monitoreo_excerpt: "Advanced Prometheus and Grafana configuration for production observability.",
    
    // Contact
    contact_title: "Contact",
    form_name: "Name",
    form_name_placeholder: "Your full name",
    form_email: "Email",
    form_email_placeholder: "your@email.com",
    form_message: "Message",
    form_message_placeholder: "Tell me about your project or inquiry...",
    form_send: "Send",
    
    // Footer
    footer_home: "Home",
    footer_copyright_pre: "© ",
    footer_copyright: ". All rights reserved.",
    
    // About
    about_page_title: "About Me - Víctor Araya",
    about_main_title: "My Work Philosophy",
    about_p1: "I am Víctor Araya, a father and self-taught systems engineer focused on the Cloud ecosystem. My journey in technology has taught me a fundamental lesson: the most robust systems are not those that never fail, but those designed to be resilient, observable, and capable of quick recovery.",
    about_subtitle1: "From \"How\" to \"Why\"",
    about_p2: "My passion for DevOps was born from curiosity to go beyond simply executing tasks. Instead of asking \"how do I deploy this application?\", I began asking \"how do we build a system that enables safe, automated deployments at any time with minimal human intervention?\"",
    about_p3: "This question led me to delve deeper into the principles of Infrastructure as Code (IaC), continuous delivery (CI/CD), and observability. I understand technology not as an end in itself, but as a means to achieve crucial business objectives: agility, stability, and trust.",
    about_subtitle2: "Continuous Improvement Culture",
    about_p4: "I adopt an iterative improvement mindset in everything I do. I firmly believe that automation is key to unlocking human potential, allowing teams to focus on innovation rather than crisis management. For me, a well-designed CI/CD pipeline or an idempotent Terraform script are more than just tools; they are the embodiment of a culture that values consistency, predictability, and collaboration.",
    about_back_button: "Go to home",
    
    // Posts
    post_published_on: "Published on",
    post_back_to_blog: "Back to blog",
    post_fundamentos_title: "DevOps Fundamentals",
    post_fundamentos_body: "<p class='lead'>Exploring the essential concepts of DevOps and how to implement them in your organization.</p><p>DevOps is not just a methodology, it's a culture that seeks to eliminate barriers between development and operations.</p>",
    post_automatizacion_title: "Infrastructure Automation",
    post_automatizacion_body: "<p class='lead'>How to effectively implement infrastructure as code.</p><p>Automation is key to scalability and reliability in modern systems.</p>",
    post_monitoreo_title: "Actionable Monitoring",
    post_monitoreo_body: "<p class='lead'>Advanced Prometheus and Grafana configuration for production.</p><p>Effective monitoring not only detects problems but helps prevent incidents before they occur.</p>"
  }
};

// Estado global del idioma
let currentLang = localStorage.getItem('language') || 'es';

// Función para traducir toda la página
function translatePage(lang) {
  currentLang = lang;
  localStorage.setItem('language', lang);
  
  // Actualizar atributo lang del documento
  document.documentElement.lang = lang;
  
  // Traducir todos los elementos con data-i18n-key
  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    const translation = translations[lang][key];
    
    if (translation) {
      // Para inputs y textareas, solo actualizar si está vacío
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if (element.value === '') {
          element.placeholder = translation;
        }
      } 
      // Para títulos de página
      else if (element.tagName === 'TITLE') {
        element.textContent = translation;
      }
      // Para elementos que pueden contener HTML (como posts)
      else if (key.includes('_body') || key.includes('_p')) {
        element.innerHTML = translation;
      }
      // Para elementos normales
      else {
        element.textContent = translation;
      }
    }
  });
  
  // Traducir placeholders con data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = translations[lang][key];
    if (translation) {
      element.placeholder = translation;
    }
  });
  
  // Actualizar botones de idioma activos
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });
  
  console.log(`✅ Página traducida a: ${lang}`);
}

// ============================================================================
// 2. CARGA DE PARTIALS (header y footer)
// ============================================================================

async function loadPartials() {
  const partials = document.querySelectorAll('[data-include]');
  
  await Promise.all(Array.from(partials).map(async (partial) => {
    try {
      const response = await fetch(partial.dataset.include);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();
      partial.innerHTML = html;
    } catch (error) {
      console.error('Error loading partial:', error);
    }
  }));
}

// ============================================================================
// 2.1 AJUSTAR RUTAS DEL HEADER SEGÚN LA UBICACIÓN
// ============================================================================

function adjustHeaderPaths() {
  const currentPath = window.location.pathname;
  let basePath = '';
  
  // Detectar nivel de profundidad
  if (currentPath.includes('/views/blog/')) {
    basePath = '../../';
  } else if (currentPath.includes('/views/')) {
    basePath = '../';
  } else {
    basePath = './';
  }
  
  // Ajustar logo
  const brandLogo = document.getElementById('brand-logo');
  const brandLink = document.getElementById('brand-link');
  if (brandLogo) {
    brandLogo.src = `${basePath}public/assets/icono.png`;
  }
  if (brandLink) {
    // Si estamos en home, href="#hero", si no, href a la raíz
    if (basePath === './') {
      brandLink.href = '#hero';
    } else {
      brandLink.href = basePath.slice(0, -1); // Quitar el último /
    }
  }
  
  // Ajustar link de "Sobre mí"
  const aboutLinks = document.querySelectorAll('a[href*="about.html"]');
  aboutLinks.forEach(link => {
    if (currentPath.includes('/views/blog/')) {
      link.href = '../about.html';
    } else if (currentPath.includes('/views/about')) {
      link.href = './about.html';
    } else {
      link.href = './views/about.html';
    }
  });
  
  console.log(`✅ Rutas ajustadas para: ${currentPath} (basePath: ${basePath})`);
}

// ============================================================================
// 3. CARGA DE PROYECTOS DINÁMICOS
// ============================================================================

async function loadProjects() {
  const projectsGrid = document.getElementById('projects-grid');
  if (!projectsGrid) return;
  
  try {
    const response = await fetch('./views/projects/projects.json');
    const projects = await response.json();
    
    projectsGrid.innerHTML = projects.map(project => `
      <article class="card project-card" role="listitem">
        <div class="card-body">
          <div class="project-icon">
            <i class="${project.icon}" aria-hidden="true"></i>
          </div>
          <h3 class="project-title">${typeof project.titulo === 'object' ? project.titulo[currentLang] : project.titulo}</h3>
          <p class="project-description">${typeof project.descripcion === 'object' ? project.descripcion[currentLang] : project.descripcion}</p>
          <a href="${project.github}" 
             class="btn btn-outline-primary btn-sm" 
             target="_blank" 
             rel="noopener noreferrer">
            <i class="fab fa-github me-2"></i>
            <span data-i18n-key="project_view_more">Ver más</span>
          </a>
        </div>
      </article>
    `).join('');
    
    console.log(`✅ ${projects.length} proyectos cargados`);
    
    // Re-traducir los nuevos elementos
    translatePage(currentLang);
    
  } catch (error) {
    console.error('❌ Error cargando proyectos:', error);
    projectsGrid.innerHTML = `
      <div class="col-12">
        <p class="text-center text-muted">Error cargando proyectos. Por favor, recarga la página.</p>
      </div>
    `;
  }
}

// ============================================================================
// 4. MANEJO DEL FORMULARIO DE CONTACTO
// ============================================================================

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
    
    try {
      // Ejecutar reCAPTCHA v3
      const token = await grecaptcha.execute('6LfcpzssAAAAAFhrOsYOBo377mc4eLSOZNK2K89w', {action: 'submit'});
      
      // Crear FormData
      const formData = new FormData(form);
      formData.append('g-recaptcha-response', token);
      
      // Enviar con fetch
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Éxito - Mostrar mensaje
        form.innerHTML = `
          <div class="text-center py-5">
            <i class="fas fa-check-circle text-success mb-3" style="font-size: 4rem;"></i>
            <h3 class="text-white mb-3">¡Mensaje Enviado!</h3>
            <p class="text-muted mb-4">Gracias por contactarme. Te responderé pronto.</p>
            <button onclick="location.reload()" class="btn btn-primary">
              <i class="fas fa-home me-2"></i>Volver al inicio
            </button>
          </div>
        `;
      } else {
        throw new Error('Error en el envío');
      }
      
    } catch (error) {
      console.error('Error:', error);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      
      // Mostrar error en el formulario
      const errorDiv = document.createElement('div');
      errorDiv.className = 'alert alert-danger mt-3';
      errorDiv.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Error al enviar. Intenta nuevamente.';
      form.appendChild(errorDiv);
      
      setTimeout(() => errorDiv.remove(), 5000);
    }
  });
}


// ============================================================================
// 5. NAVEGACIÓN SUAVE
// ============================================================================

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Solo aplicar scroll suave a anclas válidas
      if (href === '#' || href === '#!') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Cerrar menú móvil si está abierto
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarCollapse && navbarCollapse.classList.contains('show')) {
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  });
}

// ============================================================================
// 6. ACTUALIZAR AÑO EN FOOTER
// ============================================================================

function updateYear() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// ============================================================================
// 7. OCULTAR PANTALLA DE CARGA
// ============================================================================

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    // Esperar un poco para mostrar la animación
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
        console.log('✅ Pantalla de carga ocultada');
      }, 300);
    }, 500);
  }
}

// ============================================================================
// 8. CONFIGURAR BOTONES DE IDIOMA
// ============================================================================

function setupLanguageButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      translatePage(lang);
    });
  });
  
  // Marcar idioma actual como activo
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    }
  });
}

// ============================================================================
// 9. INICIALIZACIÓN PRINCIPAL
// ============================================================================

async function init() {
  console.log('🚀 Iniciando aplicación...');
  
  try {
    // 1. Cargar partials (header y footer)
    await loadPartials();
    
    // 2. Configurar botones de idioma
    setupLanguageButtons();
    
    // 3. Traducir página al idioma guardado
    translatePage(currentLang);
    
    // 4. Cargar proyectos dinámicos
    await loadProjects();
    
    // 5. Configurar formulario de contacto
    setupContactForm();
    
    // 6. Configurar navegación suave
    setupSmoothScroll();
    
    // 7. Actualizar año en footer
    updateYear();
    
    // 8. Ocultar pantalla de carga
    hideLoader();
    
    console.log('✅ Aplicación iniciada correctamente');
    
  } catch (error) {
    console.error('❌ Error inicializando aplicación:', error);
    hideLoader(); // Ocultar loader incluso si hay error
  }
}

// ============================================================================
// 10. EJECUTAR AL CARGAR EL DOM
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exportar funciones si se usan en otros scripts
window.translatePage = translatePage;
