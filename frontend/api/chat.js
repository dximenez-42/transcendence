export async function getUsersChat() {
    const url = 'api/users/list';
    console.log(url);
    const token = sessionStorage.getItem('auth_token');
    console.log(token);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
            },
        });

        if (response.ok) {
            const users = await response.json();
            console.log(users.users);
            return users.users;
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

export function getChatMessages(chat_id) {
    const chats = [
        { id: 1, name: 'Pedro', status: 'online', messages: [{user_id: 1, content: 'Hola, ¿cómo estás?'}, {user_id: 2, content: 'Bien!, gracias'}] },
        { id: 2, name: 'Elena', status: 'online', messages: [{user_id: 2, content: '¿Qué tal tu día?'}, {user_id: 2, content: '¿Qué tal tu día? jajajaja'}] },
        { id: 3, name: 'Fede', status: 'online', messages: [{user_id: 2, content: 'Hola a todos!'}, {user_id: 3, content: '¿Alguien ha visto la última película?'}] },
    ];
    const chat = chats.find(c => c.id === chat_id)
    
    
    return chat.messages;
}

