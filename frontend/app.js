import { renderChat } from './components/chat.js';
import { renderGame } from './components/game.js';
import { renderHome } from './components/home.js';
import { renderUsers } from './components/users.js'
import { renderLogin } from './components/login.js';

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
            if (callback) callback(); // Execute the callback function after loading HTML
        })
        .catch(error => {
            appDiv.innerHTML = '<h1>404</h1><p>Page not found</p>';
            console.error('Error:', error);
        });
}

// Execute inline scripts after inserting HTML into the DOM
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
    // Check if the user is logged in
    const userId = sessionStorage.getItem('auth_code');
    const hash = window.location.hash;

    if (!userId && hash !== '#login') {
        // Redirect to login if user is not authenticated and not already on the login page
        window.location.hash = '#login';
        return; // Exit the router function early
    }

    const routes = {
        '#home': { url: 'home.html', render: renderHome },
        '#chat': { url: 'chat.html', render: renderChat },
        '#login': { url: 'login.html', render: renderLogin },
        '#users': { url: 'users.html', render: renderUsers },
        '#game': { url: 'game.html', render: renderGame },
        '#game_settings': { url: 'game_settings.html', render: ()  => {console.log('game settings')}},
        '#tournament': { url: 'tournament.html', render: () => console.log('Tournament page loaded') }
    };

    const route = routes[hash];

    if (route) {
        loadContent(route.url, route.render);
    } else {
        loadContent('404.html', () => console.log('404 page loaded'));
    }
}


// Initialize router on page load and hash change
window.addEventListener('hashchange', router);
window.addEventListener('load', router);



