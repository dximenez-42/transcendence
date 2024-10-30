import { loadLanguage } from "../api/languages.js";
import { updateUsername } from "../api/users.js";

export function renderProfile() {
    
    const logoutButton = document.getElementById('logout-button');
    const submitUpdateProfile = document.getElementById('update-profile-button');
    const profileNameInput = document.getElementById('profile-name-input');

    submitUpdateProfile.addEventListener('click', async () => {
        const newName = await profileNameInput.value;
        updateUsername(newName);
        profileNameInput.value = '';
    })

    logoutButton.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.hash = 'home';
    })

    document.getElementById('language-selector').addEventListener('click', function(event) {
        if (event.target.matches('button[data-lang]')) {
            sessionStorage.removeItem('lan');
            sessionStorage.setItem('lan', event.target.getAttribute('data-lang'));
            loadLanguage();
            window.location.hash = "profile";
        }
    });

    loadLanguage();
}