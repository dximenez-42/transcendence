// Función para cargar un archivo HTML y renderizarlo en el div #app    
function loadContent(url) {
    url = "./templates/" + url
    const appDiv = document.getElementById('app');

    appDiv.classList.add('fade-out');

    setTimeout(() => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar la página');
                }
                return response.text();
            })
            .then(html => {
                appDiv.innerHTML = html;
                
                appDiv.classList.remove('fade-out');
                appDiv.classList.add('fade-in');

                setTimeout(() => {
                    appDiv.classList.remove('fade-in');
                }, 500);
            })
            .catch(error => {
                appDiv.innerHTML = '<h1>404</h1><p>Página no encontrada</p>';
                console.error('Error:', error);

                appDiv.classList.remove('fade-out');
                appDiv.classList.add('fade-in');
                setTimeout(() => {
                    appDiv.classList.remove('fade-in');
                }, 500);
            });
    }, 500);

}

// Inicializar el enrutador
function router() {
    const routes = {
        '#play': 'play.html',
        '#chat': 'chat.html',
        '#users': 'users.html'
    };

    const hash = window.location.hash;

    if (routes[hash]) {
        loadContent(routes[hash]);
    } else {
        loadContent('404.html'); // Puedes crear una página 404 personalizada
    }
}

// Escuchar cambios en el hash y cargar la ruta correspondiente
window.addEventListener('hashchange', router);

// Cargar la ruta correcta cuando la página se carga por primera vez
window.addEventListener('load', router);
