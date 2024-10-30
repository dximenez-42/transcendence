import { loadSelectedChatOnPageLoad } from './components/chat.js';
import { renderGame } from './game/main.js';
import { renderHome } from './components/home.js';
import { renderLogin } from './components/login.js';
import { renderonline, setMatchPoints } from './components/online.js';
import { renderProfile } from './components/profile.js';
import { getUser } from './api/users.js';

// Load and render content based on URL
function loadContent(url, callback) {
    url = "./templates/" + url;
    const appDiv = document.getElementById('app');

    fetch(url)
        .then(response => {

            if (!response.ok) {
                throw new Error('Error loading the page');
            }
            return response.text();
        })
        .then(html => {
            appDiv.innerHTML = html;
            executeInlineScripts(appDiv);
            if (callback) callback();
        })
        .catch(error => {
            appDiv.innerHTML = '<h1>404</h1><p>Page not found</p>';
            console.error('Error:', error);
        });
        
}

function executeInlineScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
    });
}


function router() {
    const userId = sessionStorage.getItem('auth_token');
    const hash = window.location.hash;
    
    function logout() {
        sessionStorage.clear();
        window.location.hash = '#login';
    }
    async function checkAuthentication() {
        await getUser();
    }

    checkAuthentication();
    if (!userId && hash !== '#login') {
        window.location.hash = '#login';
        return;
    }
    const routes = {
        '#home': { url: 'home.html', render: renderHome },
        '#chat': { url: 'chat.html', render: loadSelectedChatOnPageLoad },
        '#login': { url: 'login.html', render: renderLogin },
        '#game': { url: 'game.html', render: renderGame },
        '#profile': { url: 'profile.html', render: renderProfile },
        '#online': { url: 'online.html', render: renderonline},
        '#create_game': { url: 'create_game.html', render: setMatchPoints},
        '#tournament_settings': { url: 'tournament_settings.html', render: () => console.log('Tournament page loaded') }
    };

    const route = routes[hash];
    // Add a 1-second timeout before executing the route
        if (route) {
            loadContent(route.url, route.render);
        } else {

            loadContent('404.html', () => {})
        }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);