document.addEventListener('DOMContentLoaded', () => {
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

    // Función para aplicar las traducciones a la página
    function translatePage() {
        document.querySelectorAll('[data-i18n-key]').forEach(element => {
            const key = element.getAttribute('data-i18n-key');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    }

    // Función principal para cambiar el idioma
    async function setLanguage(lang) {
        await loadTranslations(lang);
        translatePage();
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;

        // Actualiza el botón activo
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    }

    // Añadir los event listeners a los botones
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });

    // Cargar el idioma guardado al iniciar la página o usar 'es' por defecto
    const userLang = localStorage.getItem('language') || 'es';
    setLanguage(userLang);
});
