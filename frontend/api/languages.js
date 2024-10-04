export async function loadLanguage() {
    const lang = sessionStorage.getItem('lan') || 'en';
    const response = await fetch(`/languages/${lang}.json`);
    const translations = await response.json();
    applyTranslations(translations);
}

function applyTranslations(translations) {
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.getAttribute('data-translate-key');
        if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
            element.setAttribute('placeholder', translations[key]);
        } else {
            element.textContent = translations[key];
        }

    });
}
