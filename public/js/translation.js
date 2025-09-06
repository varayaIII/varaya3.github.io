// Variable para guardar los textos del idioma actual
let translations = {};

// Función para cargar el archivo JSON del idioma
async function loadTranslations(lang) {
  try {
    const response = await fetch(`/public/locales/${lang}.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    translations = await response.json();
  } catch (error) {
    console.error(`Could not load translations for ${lang}:`, error);
  }
}

// Función para traducir la página
function translatePage() {
  document.querySelectorAll('[data-i18n-key]').forEach(element => {
    const key = element.getAttribute('data-i18n-key');
    if (translations[key]) {
      element.textContent = translations[key];
    }
  });
}

// Función para cambiar el idioma
async function setLanguage(lang) {
  await loadTranslations(lang);
  translatePage();
  // Guarda la preferencia de idioma del usuario
  localStorage.setItem('language', lang);
  // Opcional: actualiza el atributo lang del HTML
  document.documentElement.lang = lang;
}

// Función que se ejecuta al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  // Obtiene el idioma guardado, o usa 'es' por defecto
  const userLang = localStorage.getItem('language') || 'es';
  setLanguage(userLang);
});
