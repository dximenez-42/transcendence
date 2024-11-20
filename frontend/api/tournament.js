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
            // console.log("Response",response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}



// Endpoint to create a tournament
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
            // console.log(res);
            return res;
        } else {
            console.error("Fetch failed with status:", response.status);
            // console.log("Response error:",response);
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
            // console.log("Tournament left successfully");
            return true;
        }
        else {
            throw new Error('Failed to leave Tournament');
        }
    } catch (error) {
        console.error('Error leaving Tournament:', error.message);
    }
}

// Endpoint to join a tournament
export async function joinTournament(tournamentId) {
    // console.log("Joining Tournament", tournamentId);
    const url = `/api/tournaments/join/${tournamentId}`;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
            },
        });
        if (response.status == 400) {
            return false;
        }
        return response.ok;
    } catch (error) {
        console.error('Error joining Tournament:', error.message);
    }
}