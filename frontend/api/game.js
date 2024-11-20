
export async function getGames() {
    const url = `/api/games/list`;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const games = await response.json();
            // console.log(games.data)
            return games.data;
        } else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        } else {
            console.error("Fetch failed with status:", response.status);
            // console.log("Response", response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}


export async function createGame() {
    const url = `/api/games/create`;
    const token = sessionStorage.getItem('auth_token');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const res = await response.json();
            return res;
        } else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        } else {
            console.error("Fetch failed with status:", response.status);
            // console.log("Response error:", response);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}


export async function joinGame(id) {
    const url = `/api/games/join/${id}`;
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': token,
        },
    });

    if (response.ok) {
        return response.ok;
    } else if (response.status === 401) {
        sessionStorage.clear();
        window.location.hash = '#login';
    } else if (response.status === 404) {
        return false;
    } else {
        console.error("Fetch failed with status:", response.status);
        // console.log("Response error:", response);
        return [];
    }
}


export async function leaveGame(gameId) {
    try {
        const response = await fetch(`/api/games/leave/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json',
            },
        });
        if (response.ok)
            return true;
        else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        }
    } catch (error) {
        console.error('Error leaving game:', error.message);
    }
}


