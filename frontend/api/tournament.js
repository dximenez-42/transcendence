async function getTournaments() {
    const url = 'api/tournament/list';
    const token = sessionStorage.getItem('auth_token');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const tournaments = await response.json();
            return tournaments;
        } else {
            console.error("Fetch failed with status:", response.status);
            console.log("Response",response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}

export async function renderTournaments() {
    const tournamentsDiv = document.getElementById('tournaments');
    tournamentsDiv.innerHTML = '';
    const tournaments = await getTournaments(); 

    if (tournaments.length === 0) {
        tournamentsDiv.innerHTML = '<p>No hay torneos disponibles</p>';
        return;
    }

    tournaments.forEach(tournament => {
        const card = document.createElement('div');
        card.classList.add('tournament-card');

        const title = document.createElement('h2');
        title.textContent = tournament.name; 

        const host = document.createElement('p');
        host.textContent = `Host: ${tournament.host}`; 

        const viewButton = document.createElement('a');
        viewButton.href = `/tournament/${tournament.id}`; 
        viewButton.textContent = 'Ver Torneo';
        viewButton.classList.add('view-button');

        card.appendChild(title);
        card.appendChild(host);
        card.appendChild(viewButton);

        tournamentsDiv.appendChild(card);
    });
}
