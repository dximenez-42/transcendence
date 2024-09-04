import { loadLanguage } from "../api/languages.js";

export function renderProfile() {
    
    document.getElementById('language-selector').addEventListener('click', function(event) {
        if (event.target.matches('button[data-lang]')) {
            sessionStorage.removeItem('lan');
            sessionStorage.setItem('lan', event.target.getAttribute('data-lang'));
            console.log(event.target.getAttribute('data-lang'));
            loadLanguage();
            window.location.hash = "profile";
        }
    });

    loadLanguage();
}