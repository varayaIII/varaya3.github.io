// Cargar header y footer
document.addEventListener('DOMContentLoaded', function() {
  // Cargar header
  fetch('./views/partials/header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-container').innerHTML = data;
      initNavigation();
    });
  
  // Cargar footer
  fetch('./views/partials/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-container').innerHTML = data;
    });
  
  // Cargar proyectos
  loadProjects();
  
  // Cargar blog
  loadBlogPosts();
});

// Inicializar navegación
function initNavigation() {
  // Desplazamiento suave para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Calcular posición de destino
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        // Desplazamiento suave
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });
  
  // Actualizar navegación activa al hacer scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', function() {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (pageYOffset >= (sectionTop - 100)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
  
  // Animación de aparición al hacer scroll
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  fadeElements.forEach(element => {
    observer.observe(element);
  });
}

// Cargar proyectos dinámicamente
function loadProjects() {
  const projects = [
    {
      title: "Infraestructura como Código",
      description: "Implementación de infraestructura en la nube usando Terraform y AWS para despliegues automatizados.",
      icon: "fas fa-server",
      url: "https://github.com/varayaIII/proyecto-iac"
    },
    {
      title: "Pipeline CI/CD",
      description: "Sistema de integración y despliegue continuo para aplicaciones web usando Jenkins y Docker.",
      icon: "fas fa-code-branch",
      url: "https://github.com/varayaIII/cicd-pipeline"
    },
    {
      title: "Monitoreo de Sistemas",
      description: "Solución de monitoreo con Prometheus, Grafana y Alertmanager para infraestructura distribuida.",
      icon: "fas fa-chart-line",
      url: "https://github.com/varayaIII/monitoring-system"
    },
    {
      title: "Kubernetes Cluster",
      description: "Configuración y gestión de un clúster de Kubernetes para aplicaciones en contenedores.",
      icon: "fas fa-cloud",
      url: "https://github.com/varayaIII/k8s-cluster"
    }
  ];
  
  const projectsGrid = document.querySelector('.projects-grid');
  
  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card fade-in';
    projectCard.innerHTML = `
      <div class="project-image">
        <i class="${project.icon}"></i>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <a href="${project.url}" target="_blank" class="project-link">
          Ver en GitHub <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    `;
    projectsGrid.appendChild(projectCard);
  });
}

// Cargar entradas de blog dinámicamente
function loadBlogPosts() {
  const posts = [
    {
      title: "Fundamentos de Kubernetes para SRE",
      date: "15 Enero, 2025",
      excerpt: "Explorando los conceptos esenciales de Kubernetes y cómo aplicarlos en entornos de Site Reliability Engineering...",
      url: "#"
    },
    {
      title: "Automatización con Terraform",
      date: "10 Enero, 2025",
      excerpt: "Cómo implementar infraestructura como código usando Terraform para gestionar recursos en múltiples nubes...",
      url: "#"
    },
    {
      title: "Monitoreo Eficiente con Prometheus",
      date: "5 Enero, 2025",
      excerpt: "Configuración avanzada de Prometheus para monitoreo de sistemas distribuidos y estrategias de alerting efectivas...",
      url: "#"
    }
  ];
  
  const blogGrid = document.querySelector('.blog-grid');
  
  posts.forEach(post => {
    const blogCard = document.createElement('div');
    blogCard.className = 'blog-card fade-in';
    blogCard.innerHTML = `
      <div class="blog-header">
        <div class="blog-date">${post.date}</div>
        <h3 class="blog-title">${post.title}</h3>
      </div>
      <div class="blog-content">
        <p class="blog-excerpt">${post.excerpt}</p>
        <a href="${post.url}" class="blog-link">Leer más <i class="fas fa-arrow-right"></i></a>
      </div>
    `;
    blogGrid.appendChild(blogCard);
  });
}
