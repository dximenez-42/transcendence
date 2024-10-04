import { getChatMessages, getUsersChat } from "../api/chat.js";
import { loadLanguage } from "../api/languages.js";



const users = getUsersChat();
function chatUserList() {
    const userListElement = document.getElementById('chatUserList');
    console.log("Rendering chat");
    userListElement.innerHTML = '<h2 data-translate-key="users">Usuarios</h2>';
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
        console.log("USER ID : ", user.id);
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
                console.log("User", user);
                renderChat(user.id);
            }
        }
        messageInput.value = '';
    }
};
//Hacer funcion en que base al id del usuario pille el chat

export function renderChat(userId) {
    loadLanguage();
    if (!userId)
        userId = 1;
    chatUserList();
    const chatMessagesElement = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    const chat = getChatMessages(userId);
    console.log("Chat: ", chat, userId);
    const user = users.find(u => u.id === userId);
    if (chat) {
        chatMessagesElement.innerHTML = '';
        chat.forEach(message => {
            const div = document.createElement('div');
            div.className = 'message';
            message.user_id == userId ? div.classList.add("my-message") : '';
            div.textContent = message.content;
            chatMessagesElement.appendChild(div);
        });
    }

    //sendButton.addEventListener("click", sendMessage);


    
    /*parte conexion web sockets chat Pablo*/

    let url = `ws://${window.location.host}/ws/socket-server/`
    
    const chatSocket = new WebSocket(url)
    
    console.log(chatSocket);

    chatSocket.onmessage = function(e) {
        let data = JSON.parse(e.data)
        console.log('Data:', data)
    
        if (data.type === 'chat'){
            let messages = document.getElementById('messages')
    
            messages.insertAdjacentHTML('beforeend', `<div>
                <strong>${data.username}:</strong> <p>${data.message}</p>
            </div>`)
    
        }
    }
    
    let messageInput = document.getElementById('messageInput');
    
    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        let message = messageInput.value;
    
        if (message.trim() !== '') {
            chatSocket.send(JSON.stringify({
                'message': message
            }));
    
            messageInput.value = '';
        }
    });
}
