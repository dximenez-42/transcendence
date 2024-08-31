import { setUserSession } from "../api/session.js";

export function renderLogin() {

    const loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", () => {
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7018259045e81c3db27f51b7242fa8029e521f1ebf9a0e185ecac7f1952300b4&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fauth%2Flogin&response_type=code'
        //setUserSession();
        window.location.hash = '#home';
    });
}

window.onload = function() {
    const fragment = window.location.hash;
    const params = new URLSearchParams(fragment.slice(fragment.indexOf('?') + 1));
    const code = params.get('code');

    if (code) {
        sessionStorage.setItem('auth_code', code);

        // Optionally, redirect to a different page after storing the code
        window.location.hash = 'home'; // Replace with your desired route
    } else {
        console.error('Authorization code is missing.');
    }
};
