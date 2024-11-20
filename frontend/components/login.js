import { setUserSession } from "../api/session.js";
import { getUser } from "../api/users.js";

//////////////////////////////////////// // add new imports modifyed by gao
import { createWebSocket } from "../game/socket.js";
import { gameInfo } from "../game/constants.js";
////////////////////////////////////////

export function renderLogin() {
    
    const loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", () => {
        
        window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-7018259045e81c3db27f51b7242fa8029e521f1ebf9a0e185ecac7f1952300b4&redirect_uri=http%3A%2F%2F${window.location.host.split(':')[0]}%3A8080%2Fapi%2Fauth%2Flogin&response_type=code`
        window.location.hash = '#home';
    });
}

window.onload = async function() {
    const fragment = window.location.hash;
    const params = new URLSearchParams(fragment ? fragment.slice(fragment.indexOf('?') + 1) : '');
    const code = params.get('token');
    if (code) {
        sessionStorage.setItem('auth_token', code);
        const user = await getUser();
        sessionStorage.setItem('id', user.id);
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('email', user.email);
        sessionStorage.setItem('name', user.name);

        // //////////////////////////////////////// // add new code modifyed by gao
        // gameInfo.user_name = user.username;
        // gameInfo.user_id = code;
        // createWebSocket();
        // ////////////////////////////////////////

        window.location.hash = 'home';
    }
};

