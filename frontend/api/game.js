
const URL_API='/api';

export async function getGames() {
    const url = `/games/list`;
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
            return games.data;
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


export async function createGame() {
    const url = `${URL_API}/games/create`;
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

export async function leaveGame(gameId) {
    try {
        const response = await fetch(`/games/leave/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to leave game');
        }
        console.log('Game left successfully');
    } catch (error) {
        console.error('Error leaving game:', error.message);
    }
}

export async function joinGame(gameId) {

    console.log('joinGame');
    try {
        const response = await fetch(`/games/join/${gameId}`, {
            method: 'POST',
            headers: {
                'Authorization': sessionStorage.getItem('auth_token'),
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to join game');
        }
        console.log('Game joined successfully');
    } catch (error) {
        console.error('Error joining game:', error.message);
    }
}   