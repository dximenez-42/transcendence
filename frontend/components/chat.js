import { getChatMessages, getChats } from "../api/chat.js";
import { loadLanguage } from "../api/languages.js";
import { blockUser, getBlockedUsers, unblockUser } from "../api/users.js";



async function chatUserList(currentSocket) {
    const userListElement = document.getElementById('chatUserList');
    let users = [];

    const normalUsers = await getChats();

    users = [...normalUsers];

    const renderUsers = () => {
        userListElement.innerHTML = '';
        const ul = document.createElement('ul');

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
            li.addEventListener('click', () => {
                if (currentSocket) {
                    currentSocket.close();
                }
                renderChat(user)
            });
            ul.appendChild(li);
        });

        userListElement.appendChild(ul);
    };
    // Llamar a la función para renderizar usuarios y bloqueados
    renderUsers();
}

export async function renderChat(user) {
    loadLanguage();

    let currentSocket = null
    let id = -1;
    const userId = sessionStorage.getItem('id');


    if (user) {
        const { room_id } = user;
        currentSocket = startSocket(room_id);
        sessionStorage.setItem('selectedChatRoom', room_id);
        sessionStorage.setItem('selectedUserId', id);
        id = user.id;
    }
    chatUserList(currentSocket);
    if (!user) {
        return;
    }

    const chatUsernameElement = document.querySelector('.chat-username');
    chatUsernameElement.textContent = user.name;
    const chatMessagesElement = document.getElementById('chatMessages');

    if (user.is_blocked) {
        chatMessagesElement.innerHTML = '';

        const blockedMessage = document.createElement('div');
        blockedMessage.className = 'blocked-message';
        blockedMessage.innerHTML = `
        <h4 class="text-secondary">Este usuario ha sido bloqueado. No puedes enviar ni recibir mensajes.</h4>
            <div class="w-25">
                <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512" fill="#6c757d"><path d="M368 192h-16v-80a96 96 0 10-192 0v80h-16a64.07 64.07 0 00-64 64v176a64.07 64.07 0 0064 64h224a64.07 64.07 0 0064-64V256a64.07 64.07 0 00-64-64zm-48 0H192v-80a64 64 0 11128 0z"/></svg>
            <div>
        `;

        chatMessagesElement.appendChild(blockedMessage);

        return;
    }

    const chat = await getChatMessages(id);
    console.log(chat);
    if (chat) {
        chatMessagesElement.innerHTML = '';

        // Invertir el orden de los mensajes
        chat.reverse().forEach(message => {
            const div = document.createElement('div');
            div.className = 'message';
            if (message.sender.id == userId) {
                div.classList.add("my-message");
            }
            if (message.content_type === 'invitation') {
                div.classList.add("invitation-message");

                const invitationText = document.createElement('p');
                const joinButton = document.createElement('button');

                if (message.sender.id == userId) {
                    invitationText.textContent = "You invited to join a game!";
                    joinButton.textContent = 'Waiting';
                    joinButton.classList.add('text-light');
                    joinButton.disabled = true;
                } else {
                    invitationText.textContent = "You have been invited to join a game!";
                    joinButton.textContent = 'Join';
                    joinButton.onclick = () => {
                        console.log("Joining game...");
                    };
                }

                div.appendChild(invitationText);
                div.appendChild(joinButton);
            } else {
                div.textContent = message.content;
            }

            chatMessagesElement.appendChild(div);

        });
        createChatFrom();

        // Desplazar hacia abajo para mostrar los mensajes más recientes
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    }
}

export async function loadSelectedChatOnPageLoad() {
    const selectedRoom = sessionStorage.getItem('selectedChatRoom');
    const selectedUserId = sessionStorage.getItem('selectedUserId');

    if (selectedRoom && selectedUserId) {
        const user = { room_id: selectedRoom, id: selectedUserId };

        await renderChat(user);
    }
    await renderChat();
}


function startSocket(room_id) {
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
        const data = JSON.parse(e.data); // Asumiendo que el mensaje está en formato JSON

        const div = document.createElement('div');
        div.className = 'message';

        // Verificar si el mensaje es del usuario actual o de otro usuario
        div.classList.add("other-message");

        // Verificar si el mensaje es una invitación
        if (data.content_type === 'invitation') {
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
            div.textContent = data.content;  // Mostrar el contenido del mensaje
        }

        // Insertar el nuevo mensaje en el chat
        const chatMessagesElement = document.getElementById('chatMessages');
        chatMessagesElement.appendChild(div);

        // Desplazar hacia abajo para mostrar el último mensaje
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    };


    chatSocket.onclose = () => {
        console.log('WebSocket close');
    }

    let messageInput = document.getElementById('messageInput');
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {

        chatForm.addEventListener('submit', (e) => {
            console.log(chatSocket.url)
            e.preventDefault();
            let message = messageInput.value;
            if (message.trim() !== '') {
                chatSocket.send(JSON.stringify({
                    "content": message,
                    "content_type": "message"
                }));

                messageInput.value = '';

                const div = document.createElement('div');
                div.className = 'message';
                div.classList.add("my-message");

                div.textContent = message;
                const chatMessagesElement = document.getElementById('chatMessages');
                chatMessagesElement.appendChild(div);
                chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
            }
        });
    }

    const sendInvitationButton = document.getElementById('sendInvitationButton');
    if (sendInvitationButton) {

        sendInvitationButton.addEventListener('click', () => {
            const invitationMessage = {
                content: "required",
                content_type: 'invitation',
            };

            chatSocket.send(JSON.stringify(invitationMessage));

            const chatMessagesElement = document.getElementById('chatMessages');
            const div = document.createElement('div');
            div.className = 'message invitation-message';

            const invitationText = document.createElement('p');
            invitationText.textContent = "You invited to join a game!";

            const joinButton = document.createElement('button');
            joinButton.textContent = 'Waiting';
            joinButton.classList.add('text-light');
            joinButton.disabled = true;

            div.appendChild(invitationText);
            div.appendChild(joinButton);

            chatMessagesElement.appendChild(div);
            chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;

            console.log('Invitation message sent');

        });
    }

    return chatSocket;
}


function createChatFrom() {
    // Seleccionar el contenedor donde se crearán los elementos
    const chatFormContainer = document.getElementById('chat-form-container');

    // Verificar si los elementos ya existen para no duplicarlos
    if (!document.getElementById('sendInvitationButton')) {
        // Crear botón de enviar invitación
        const sendInvitationButton = document.createElement('button');
        sendInvitationButton.id = 'sendInvitationButton';
        sendInvitationButton.className = 'px-3';
        sendInvitationButton.textContent = 'Send Invitation';

        // Insertar el botón en el contenedor 'chat-form-container'
        chatFormContainer.appendChild(sendInvitationButton);

    }

    if (!document.getElementById('chatForm')) {
        // Crear el formulario de chat
        const chatForm = document.createElement('form');
        chatForm.id = 'chatForm';
        chatForm.className = 'chat-form';

        // Crear el input para escribir el mensaje
        const messageInput = document.createElement('input');
        messageInput.className = 'tc-input w-100';
        messageInput.id = 'messageInput';
        messageInput.type = 'text';
        messageInput.setAttribute('data-translate-key', 'write_message');
        messageInput.placeholder = 'Escribe un mensaje...';

        // Crear el botón de enviar mensaje
        const sendButton = document.createElement('input');
        sendButton.id = 'sendButton';
        sendButton.type = 'submit';
        sendButton.className = 'px-3';
        sendButton.value = 'Enviar';
        sendButton.setAttribute('data-translate-key', 'send');

        // Insertar los elementos en el formulario
        chatForm.appendChild(messageInput);
        chatForm.appendChild(sendButton);

        // Insertar el formulario en el contenedor 'chat-form-container'
        chatFormContainer.appendChild(chatForm);
    }
}