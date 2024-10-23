export async function getTournaments() {
    const url = 'api/tournaments/list';
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
            return tournaments.data;
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


export async function createTournament() {
    const url = `/api/tournaments/create`;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
            },
            body: JSON.stringify({
                "name": "TORNEO",
                "max_players": 4
            })
        });

        if (response.ok) {
            const res = await response.json();
            console.log(res);
            return res;
        } else {
            console.error("Fetch failed with status:", response.status);
            console.log("Response error:",response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}


export async function leaveTournament(tournamentId) {
    try {
        const response = await fetch(`/api/tournaments/leave/${tournamentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            return true;
        }
        else {
            throw new Error('Failed to leave Tournament');
        }
        console.log('Tournament left successfully');
    } catch (error) {
        console.error('Error leaving Tournament:', error.message);
    }
}

