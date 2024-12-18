export async function getChats() {
    const url = 'api/chat/list';
    const token = sessionStorage.getItem('auth_token');

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const {chats} = await response.json();
            return chats;
        } else if (response.status === 401) {
            sessionStorage.clear();
            window.location.hash = '#login';
        } else {
            console.error("Fetch failed with status:", response.status);
            return [];
        }
    } catch (error) {
        console.error("There was a problem with the Fetch request:", error.message);
        return [];
    }
}

export async function getChatMessages(chat_id) {
    if (chat_id < 0)
        return null;
    const url = `api/chat/messages/${chat_id}`;
    const token = sessionStorage.getItem('auth_token');
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': token,
        },
    })
    if (response.ok) {
        const chats = await response.json();
        return chats;
    } else if (response.status === 401) {
        sessionStorage.clear();
        window.location.hash = '#login';
    } else if (response.status === 403) {
        return null;
    } else {
        console.error("Fetch failed with status:", response.status);
        return [];
    }
}
