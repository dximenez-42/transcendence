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

function getChat(user_id) {
    return null;
}

export async function getChatMessages(chat_id) {
    const url = `api/chat/messages/${chat_id}`;
    const token = sessionStorage.getItem('auth_token');
    console.log(url);
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': token,
        },
    })
    if (response.ok) {
        const {messages} = await response.json();
        console.log(messages)
        return messages;
    } else {
        console.error("Fetch failed with status:", response.status);
        return [];
    }
}
