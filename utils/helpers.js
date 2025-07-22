// utils/helpers.js

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CL", { year: 'numeric', month: 'long', day: 'numeric' });
}

export { formatDate };
