// controllers/mainController.js
import { projects, blogPosts } from "../models/data.js";

function loadProjects() {
  return projects;
}

function loadBlogPosts() {
  return blogPosts;
}

export { loadProjects, loadBlogPosts };
