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

document.addEventListener("DOMContentLoaded", () => {
  includePartials();
  renderProjects();
  renderBlog();
});
