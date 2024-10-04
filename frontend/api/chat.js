export function getUsersChat() {
    const users = [
        { id: 1, name: 'Pedro', status: 'online', messages: [{user_id: 1, content: 'Hola, ¿cómo estás?'}, {user_id: 2, content: 'Bien!, gracias'}] },
        { id: 2, name: 'Elena', status: 'online', messages: [{user_id: 2, content: '¿Qué tal tu día?'}, {user_id: 2, content: '¿Qué tal tu día? jajajaja'}] },
        { id: 3, name: 'Fede', status: 'online', messages: [{user_id: 2, content: 'Hola a todos!'}, {user_id: 3, content: '¿Alguien ha visto la última película?'}] },
    ];
    return users;
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

