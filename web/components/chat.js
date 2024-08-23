import { getUsersChat } from "../api/chat.js";



function chatUserList() {
    const users = getUsersChat();
    const userListElement = document.getElementById('chatUserList');
    console.log("Rendering chat");
    userListElement.innerHTML = '<h2>Usuarios</h2>';
    const ul = document.createElement('ul');
    users.forEach(user => {
        const li = document.createElement('li');
        
        const userName = document.createElement('h5');
        userName.textContent = user.name;
        li.appendChild(userName);
        
        const userStatus = document.createElement('p');
        userStatus.textContent = user.status;
        li.appendChild(userStatus);

        li.dataset.userId = user.id;
        li.addEventListener('click', () => renderChat(user.id));
        
        ul.appendChild(li);
    });
    userListElement.appendChild(ul);
}

function sendMessage() {
    console.log("Sending...")
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    if (message) {
        const activeUserId = document.querySelector('.user-list li')?.dataset.userId;
        console.log(activeUserId);

        if (activeUserId) {
            const user = users.find(u => u.id === parseInt(activeUserId));
            if (user) {
                user.messages.push({user_id: activeUserId, content: message});
                console.log(user.messages);
                renderChat(user.id);
            }
        }
        messageInput.value = '';
    }
};

export function renderChat(userId) {
    const messages = getChatMessages(userId);
    const chatMessagesElement = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    chatUserList();
    const user = users.find(u => u.id === userId);
    if (user) {
        chatMessagesElement.innerHTML = '';
        user.messages.forEach(message => {
            const div = document.createElement('div');
            div.className = 'message';
            message.user_id == userId ? div.classList.add("my-message") : '';
            div.textContent = message.content;
            chatMessagesElement.appendChild(div);
        });
    }

    sendButton.addEventListener("click", sendMessage);
}
