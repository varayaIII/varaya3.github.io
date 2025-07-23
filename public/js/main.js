// public/js/main.js
import { loadProjects, loadBlogPosts } from "../../controllers/mainController.js";

function includePartials() {
  fetch("/views/partials/header.html")
    .then(res => res.text())
    .then(data => document.getElementById("header").innerHTML = data);

  fetch("/views/partials/footer.html")
    .then(res => res.text())
    .then(data => document.getElementById("footer").innerHTML = data);
}

function renderProjects() {
  const container = document.getElementById("projects-container");
  if (!container) return;
  const projects = loadProjects();
  container.innerHTML = projects.map(p => `
    <article>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      <a href="${p.link}">Ver más</a>
    </article>
  `).join("");
}

function renderBlog() {
  const container = document.getElementById("blog-container");
  if (!container) return;
  const posts = loadBlogPosts();
  container.innerHTML = posts.map(p => `
    <article>
      <h3>${p.title}</h3>
      <p>${p.date}</p>
      <p>${p.content}</p>
    </article>
  `).join("");
}

// Animación de aparición al hacer scroll
document.addEventListener('DOMContentLoaded', function() {
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
  
  // Actualizar año en el footer
  const currentYear = new Date().getFullYear();
  document.getElementById('current-year').textContent = currentYear;
});
});
// Cargar header y footer
fetch('./views/partials/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
  });

fetch('./views/partials/footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer-placeholder').innerHTML = data;
  });
