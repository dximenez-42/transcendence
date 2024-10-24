import { getChatMessages, getChats } from "../api/chat.js";
import { loadLanguage } from "../api/languages.js";
import { blockUser, getBlockedUsers, unblockUser } from "../api/users.js";



async function chatUserList() {
    const userListElement = document.getElementById('chatUserList');
    let users = [];

    // Obtener usuarios normales y bloqueados
    const normalUsers = await getChats(); // Usuarios normales

    // Combinar ambos arrays, con los usuarios bloqueados al final
    users = [...normalUsers];

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
            if (user.is_blocked)
                lockIcon.textContent = '🔒'; // Icono desbloqueado
            else
                lockIcon.textContent = '🔓'; // Icono desbloqueado
            li.appendChild(lockIcon);

            // Lógica para bloquear al usuario
            lockIcon.addEventListener('click', async () => {
                if (user.is_blocked) {
                    const blocked = await unblockUser(user.id);
                    if (blocked) {
                        lockIcon.textContent = '🔓';
                        renderChat(user);
                    }
                } else {
                    const blocked = await blockUser(user.id);
                    if (blocked) {
                        lockIcon.textContent = '🔒';
                        renderChat(user);
                    }
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

export async function renderChat(user) {
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

    // Obtener el contenedor de mensajes del chat
    const chatMessagesElement = document.getElementById('chatMessages');

    // Si el usuario está bloqueado, mostrar el mensaje y el candado
    if (user.is_blocked) {
        chatMessagesElement.innerHTML = '';  // Limpiar el área de mensajes

        // Crear el mensaje de advertencia
        const blockedMessage = document.createElement('div');
        blockedMessage.className = 'blocked-message';
        blockedMessage.innerHTML = `
        <h4 class="text-secondary">Este usuario ha sido bloqueado. No puedes enviar ni recibir mensajes.</h4>
            <div class="w-25">
                <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512" fill="#6c757d"><path d="M368 192h-16v-80a96 96 0 10-192 0v80h-16a64.07 64.07 0 00-64 64v176a64.07 64.07 0 0064 64h224a64.07 64.07 0 0064-64V256a64.07 64.07 0 00-64-64zm-48 0H192v-80a64 64 0 11128 0z"/></svg>    
            <div>
        `;

        // Añadir el mensaje de usuario bloqueado al chat
        chatMessagesElement.appendChild(blockedMessage);

        // Detener el resto de la ejecución para no cargar los mensajes
        return;
    }

    // Si el usuario no está bloqueado, cargar los mensajes del chat
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
                div.classList.add("invitation-message");
                const invitationText = document.createElement('p');
                invitationText.textContent = "You have been invited to join a game!";

                const joinButton = document.createElement('button');
                joinButton.textContent = 'Join';
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
        let data = JSON.parse(e.data)

        if (data.type === 'chat') {
            let messages = document.getElementById('messages')

            messages.insertAdjacentHTML('beforeend', `<div>
                <strong>${data.username}:</strong> <p>${data.message}</p>
                </div>`)
        }
    }

    let messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatForm = document.getElementById('chatForm');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let message = messageInput.value;
        console.log(message);
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
