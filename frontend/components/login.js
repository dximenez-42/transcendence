import { setUserSession } from "../api/session.js";
import { getUser } from "../api/users.js";

export function renderLogin() {

    const loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", () => {
        window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-da24ef20df28e232477906fab1cef244486b986e4500de2e7823304ade8d7ca3&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fauth%2Flogin&response_type=code'
        //setUserSession();
        window.location.hash = '#home';
    });
}

window.onload = async function() {
    const fragment = window.location.hash;
    const params = new URLSearchParams(fragment.slice(fragment.indexOf('?') + 1));
    const code = params.get('token');
    if (code) {
        sessionStorage.setItem('auth_token', code);

        const user = await getUser();
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('email', user.email);
        sessionStorage.setItem('name', user.name);


        window.location.hash = 'home';
    }
};
