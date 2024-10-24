import { getChatMessages, getChats } from "../api/chat.js";
import { loadLanguage } from "../api/languages.js";
import { blockUser, getBlockedUsers, unblockUser } from "../api/users.js";



async function chatUserList() {
    const userListElement = document.getElementById('chatUserList');
    let users = [];
    let blockedUsers = [];

    // Obtener usuarios normales y bloqueados
    const normalUsers = await getChats(); // Usuarios normales
    const blocked = await getBlockedUsers(); // Usuarios bloqueados

    // Combinar ambos arrays, con los usuarios bloqueados al final
    users = [...normalUsers];
    blockedUsers = [...blocked];

    // Renderizar la lista
    const renderUsers = () => {
        userListElement.innerHTML = '';
        const ul = document.createElement('ul');

        // Agregar primero los usuarios normales
        users.forEach(user => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';

            const userInfo = document.createElement('div');
            const userName = document.createElement('h5');
            userName.textContent = user.username;
            userInfo.appendChild(userName);

            const userStatus = document.createElement('p');
            userStatus.textContent = user.status;
            userInfo.appendChild(userStatus);

            li.appendChild(userInfo);

            const lockIcon = document.createElement('span');
            lockIcon.style.fontSize = '1.5em';
            lockIcon.style.marginLeft = '10px';
            lockIcon.textContent = '🔓'; // Icono desbloqueado

            li.appendChild(lockIcon);

            // Lógica para bloquear al usuario
            lockIcon.addEventListener('click', async () => {
                const blocked = await blockUser(user.id);
                if (blocked) {
                    lockIcon.textContent = '🔒';
                    window.location.reload(); // Recargar la página para actualizar la lista
                }
            });

            li.dataset.userId = user.id;
            li.addEventListener('click', () => renderChat(user));
            ul.appendChild(li);
        });

        // Ahora agregar los usuarios bloqueados al final
        blockedUsers.forEach(user => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';

            const userInfo = document.createElement('div');
            const userName = document.createElement('h5');
            userName.textContent = user.username;
            userInfo.appendChild(userName);

            const userStatus = document.createElement('p');
            userStatus.textContent = user.status;
            userInfo.appendChild(userStatus);

            li.appendChild(userInfo);

            const lockIcon = document.createElement('span');
            lockIcon.style.fontSize = '1.5em';
            lockIcon.style.marginLeft = '10px';
            lockIcon.textContent = '🔒'; // Icono bloqueado

            li.appendChild(lockIcon);

            // Lógica para desbloquear al usuario
            lockIcon.addEventListener('click', async () => {
                const unblocked = await unblockUser(user.id);
                if (unblocked) {
                    lockIcon.textContent = '🔓';
                    window.location.reload(); // Recargar la página para actualizar la lista
                }
            });

            li.dataset.userId = user.id;
            li.addEventListener('click', () => renderChat(user));
            ul.appendChild(li);
        });

        userListElement.appendChild(ul);
    };

    // Llamar a la función para renderizar usuarios y bloqueados
    renderUsers();
}


async function sendMessage() {
    console.log("Sending...")
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    const users = await getChats();
    if (message) {
        const activeUserId = document.querySelector('.user-list li')?.dataset.userId;
        console.log(activeUserId);

        if (activeUserId) {
            const user = users.find(u => u.id === parseInt(activeUserId));
            if (user) {
                user.messages.push({ user_id: activeUserId, content: message });
                console.log(user.messages);
                console.log("User", user);
                renderChat(user);
            }
        }
        messageInput.value = '';
    }
};
//Hacer funcion en que base al id del usuario pille el chat

export async function renderChat(user) {
    console.log("Tus muertos")
    loadLanguage();
    chatUserList();
    if (!user) {
        return;
    }

    const userId = sessionStorage.getItem('id');
    const { room_id, id } = user;

    // Guardar el chat seleccionado en sessionStorage
    sessionStorage.setItem('selectedChatRoom', room_id);  // Guardar room_id en sessionStorage
    sessionStorage.setItem('selectedUserId', id);  // Guardar el id del usuario en sessionStorage

    // Iniciar socket
    await startSocket(room_id);
    
    // Obtener los mensajes del chat
    const chatMessagesElement = document.getElementById('chatMessages');
    const chat = await getChatMessages(id);
    if (chat) {
        chatMessagesElement.innerHTML = '';  // Limpiar el área de mensajes
        chat.forEach(message => {
            const div = document.createElement('div');
            div.className = 'message';
            if (message.sender.id == userId) {
                div.classList.add("my-message");
            }
            if (message.content_type === 'invitation') {
                const invitationText = document.createElement('p');
                invitationText.classList.add("invitation-message");
                invitationText.textContent = "You have been invited to join a game!";

                const joinButton = document.createElement('button');
                joinButton.textContent = 'Join the game';
                joinButton.onclick = () => {
                    console.log("Joining game...");
                };
                div.appendChild(invitationText);
                div.appendChild(joinButton);
            } else {
                div.textContent = message.content;
            }
            chatMessagesElement.appendChild(div);
        });
    }
}

// Función para cargar el chat al iniciar la página
export async function loadSelectedChatOnPageLoad() {
    // Verificar si hay un chat seleccionado en sessionStorage
    const selectedRoom = sessionStorage.getItem('selectedChatRoom');
    const selectedUserId = sessionStorage.getItem('selectedUserId');

    if (selectedRoom && selectedUserId) {
        // Crear un objeto de usuario simulado para llamar a renderChat
        const user = { room_id: selectedRoom, id: selectedUserId };
        
        // Llamar a renderChat para cargar el chat guardado
        await renderChat(user);
    }
    await renderChat();
}


async function startSocket(room_id) {
    const userId = sessionStorage.getItem('id');
    let url = `ws://${window.location.host}/ws/chat/${room_id}/${userId}`

    const chatSocket = new WebSocket(url)
    chatSocket.onopen = () => {
        console.log('WebSocket connection established');
    };
    chatSocket.onerror = (error) => {
        console.error('WebSocket Error: ', error);
    };

    chatSocket.onmessage = (e) => {
        console.log('Data')
        let data = JSON.parse(e.data)

        if (data.type === 'chat') {
            let messages = document.getElementById('messages')

            messages.insertAdjacentHTML('beforeend', `<div>
                <strong>${data.username}:</strong> <p>${data.message}</p>
                </div>`)
        }
    }

    console.log(chatSocket);
    let messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatForm = document.getElementById('chatForm');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let message = messageInput.value;

        if (message.trim() !== '') {
            chatSocket.send(JSON.stringify({
                "content": message,
                "content_type": "message"
            }));

            messageInput.value = '';
        }
        renderChat();
    });
}
