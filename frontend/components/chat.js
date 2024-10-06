import { getChatMessages, getUsersChat } from "../api/chat.js";
import { loadLanguage } from "../api/languages.js";
import { blockUser, getBlockedUsers, unblockUser } from "../api/users.js";



async function chatUserList() {
    const userListElement = document.getElementById('chatUserList');
    const showUsersTab = document.getElementById('showUsersTab');
    const showBlockedTab = document.getElementById('showBlockedTab');
    let users = [];
    let currentView = 'users'; // Almacenar cuál pestaña está activa

    // Función para renderizar la lista de usuarios
    const renderUsers = async (filterBlocked = false) => {
        userListElement.innerHTML = ''; // Limpiar la lista
        const ul = document.createElement('ul');

        // Obtener usuarios según la pestaña activa
        if (!filterBlocked) {
            users = await getUsersChat();  // Obtener usuarios normales
        } else {
            users = await getBlockedUsers();  // Obtener usuarios bloqueados
        }

        users.forEach(user => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';

            const userInfo = document.createElement('div');
            const userName = document.createElement('h5');
            userName.textContent = user.name;
            userInfo.appendChild(userName);

            const userStatus = document.createElement('p');
            userStatus.textContent = user.status;
            userInfo.appendChild(userStatus);

            li.appendChild(userInfo);

            // Candado para indicar estado bloqueado o no
            const lockIcon = document.createElement('span');
            lockIcon.style.fontSize = '1.5em';
            lockIcon.style.marginLeft = '10px';
            lockIcon.textContent = filterBlocked ? '🔒' : '🔓';

            li.appendChild(lockIcon);

            // Listener para bloquear/desbloquear
            lockIcon.addEventListener('click', async () => {
                if (lockIcon.textContent === '🔓') {
                    // El usuario está desbloqueado, así que lo bloqueamos
                    const blocked = await blockUser(user.id);
                    if (blocked) {
                        lockIcon.textContent = '🔒';  // Actualiza el candado a bloqueado
                    }
                } else {
                    // El usuario está bloqueado, así que lo desbloqueamos
                    const unblocked = await unblockUser(user.id);
                    if (unblocked) {
                        lockIcon.textContent = '🔓';  // Actualiza el candado a desbloqueado
                    }
                }
                // Volver a renderizar la lista completa tras bloquear/desbloquear
                window.location.reload();
            });

            li.dataset.userId = user.id;
            li.addEventListener('click', () => renderChat(user.id));

            ul.appendChild(li);
        });

        userListElement.appendChild(ul);
    };

    // Inicializar mostrando los usuarios normales
    renderUsers(false);

    // Eventos para cambiar entre las pestañas
    showUsersTab.addEventListener('click', () => {
        currentView = 'users';
        renderUsers(false); // Mostrar usuarios normales
        showUsersTab.classList.add('active');
        showBlockedTab.classList.remove('active');
    });

    showBlockedTab.addEventListener('click', () => {
        currentView = 'blocked';
        renderUsers(true); // Mostrar usuarios bloqueados
        showUsersTab.classList.remove('active');
        showBlockedTab.classList.add('active');
    });
}





async function sendMessage() {
    console.log("Sending...")
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    const users = await getUsersChat();
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

export async function renderChat(userId) {
    loadLanguage();
    startSocket();
    if (!userId)
        userId = 1;
    chatUserList();
    const chatMessagesElement = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    const chat = getChatMessages(userId);
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


    sendButton.addEventListener("click", sendMessage);


    
    /*parte conexion web sockets chat Pablo*/


}

function startSocket() {
    let url = `ws://${window.location.host}/ws/chat/1/`
    
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
