import { getChatMessages, getChats } from "../api/chat.js";
import { createGame, joinGame, leaveGame } from "../api/game.js";
import { loadLanguage } from "../api/languages.js";
import { blockUser, unblockUser } from "../api/users.js";

// Componentes reutilizables
const createUserListItem = (user, currentSocket) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    const userInfo = document.createElement('div');
    userInfo.innerHTML = `
        <h5>${user.username}</h5>
    `;

    const lockIcon = document.createElement('span');
    lockIcon.style.fontSize = '1.5em';
    lockIcon.style.marginLeft = '10px';
    lockIcon.textContent = user.is_blocked ? '🔒' : '🔓';

    lockIcon.addEventListener('click', async () => {
        const messageType = user.is_blocked ? 'block' : 'unblock';
        console.log("Message type: ", messageType);
        if (currentSocket && currentSocket.readyState === WebSocket.OPEN) {
            currentSocket.send(JSON.stringify({ "content": null, "content_type": messageType }));
        }
        const action = user.is_blocked ? unblockUser : blockUser;
        const success = await action(user.id);
        if (success) {
            user.is_blocked = !user.is_blocked;
            lockIcon.textContent = user.is_blocked ? '🔒' : '🔓';
            
            // Update blocked status in session storage
            sessionStorage.setItem('selectedUserIsBlocked', user.is_blocked);
            
            renderChat(user);
        }
        return;
    });

    li.appendChild(userInfo);
    li.appendChild(lockIcon);
    li.dataset.userId = user.id;
    li.addEventListener('click', () => {
        renderChat(user);
    });

    return li;
};

const createMessageElement = (message, userId) => {
    if (message.content_type != "message" && message.content_type != "invitation") {
        const span = document.createElement('span');
        return span;
    }
    const div = document.createElement('div');
    div.className = `message ${message.sender?.id && message.sender.id == userId ? 'my-message' : 'other-message'}`;

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
            joinButton.onclick = async () => {
                const joined = await joinGame(message.game_id);
                if (joined) {
                    console.log("Joined game");
                }
            };
        }

        div.appendChild(invitationText);
        div.appendChild(joinButton);
    } else {
        div.textContent = message.content;
    }

    return div;
};

// Funciones principales
async function chatUserList(currentSocket) {
    const userListElement = document.getElementById('chatUserList');
    const users = await getChats();

    const ul = document.createElement('ul');
    users.forEach(user => {
        ul.appendChild(createUserListItem(user, currentSocket));
    });

    userListElement.innerHTML = '';
    userListElement.appendChild(ul);
}

let currentSocket = null;
export async function renderChat(user) {
    loadLanguage();
    let id = user?.id ?? -1;
    const userId = sessionStorage.getItem('id');
    let userName = null;
    let isBlocked = user?.is_blocked ?? sessionStorage.getItem('selectedUserIsBlocked') === 'true';
    const imBlocked = user?.im_blocked ?? sessionStorage.getItem('selectedUserImBlocked') === 'true';
    chatUserList(currentSocket);
    if (!user) return;

    document.querySelector('.chat-username').textContent = userName;
    const chatMessagesElement = document.getElementById('chatMessages');
    if (isBlocked) {
        chatMessagesElement.innerHTML = `
            <div class="blocked-message">
                <h4 class="text-secondary">Este usuario ha sido bloqueado. No puedes enviar ni recibir mensajes.</h4>
                <div class="w-25">
                    <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512" fill="#6c757d"><path d="M368 192h-16v-80a96 96 0 10-192 0v80h-16a64.07 64.07 0 00-64 64v176a64.07 64.07 0 0064 64h224a64.07 64.07 0 0064-64V256a64.07 64.07 0 00-64-64zm-48 0H192v-80a64 64 0 11128 0z"/></svg>
                </div>
            </div>
        `;
        deleteChatForm();
        return;
    }

    if (imBlocked) {
        chatMessagesElement.innerHTML = `
            <div class="blocked-message">
                <h4 class="text-secondary">Este usuario te ha bloqueado. No puedes enviar ni recibir mensajes.</h4>
                <div class="w-25">
                    <svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512" fill="#6c757d"><path d="M368 192h-16v-80a96 96 0 10-192 0v80h-16a64.07 64.07 0 00-64 64v176a64.07 64.07 0 0064 64h224a64.07 64.07 0 0064-64V256a64.07 64.07 0 00-64-64zm-48 0H192v-80a64 64 0 11128 0z"/></svg>
                </div>
            </div>
        `;
        deleteChatForm();
        return;
    }

    if (!imBlocked && !isBlocked) createChatForm(currentSocket);

    const chat = await getChatMessages(user.id);
    let room_id;
    if (chat) {
        chatMessagesElement.innerHTML = '';
        chat.messages.reverse().forEach(message => {
            chatMessagesElement.appendChild(createMessageElement(message, userId));
        });
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
        room_id = chat.chat.room_id;
    }   
    if (room_id != "null") {
        userName = user.name || sessionStorage.getItem('selectedUserName');
        console.log("starting: ", currentSocket)
        if (!currentSocket || (currentSocket && currentSocket.url.split('/')[5] != room_id)) {
            if (currentSocket) {
                currentSocket.close();
                currentSocket = null;
            }
            if (currentSocket === null) currentSocket = startSocket(room_id);
        }
        sessionStorage.setItem('selectedChatRoom', room_id);
        sessionStorage.setItem('selectedUserId', id);
        if (userName) sessionStorage.setItem('selectedUserName', userName);
        sessionStorage.setItem('selectedUserIsBlocked', user.is_blocked);
        sessionStorage.setItem('selectedUserImBlocked', user.im_blocked);
    }
}

export async function loadSelectedChatOnPageLoad() {
    const selectedRoom = sessionStorage.getItem('selectedChatRoom');
    const selectedUserId = sessionStorage.getItem('selectedUserId');

    if (selectedRoom && selectedUserId) {
        await renderChat({ room_id: selectedRoom, id: selectedUserId });
    }
    await renderChat();
}

function startSocket(room_id) {
    const userId = sessionStorage.getItem('id');
    const url = `ws://${window.location.host}/ws/chat/${room_id}/${userId}`;
    console.log("Starting socket: ", url);
    const chatSocket = new WebSocket(url);
    chatSocket.onopen = () => console.log('WebSocket opened');
    chatSocket.onerror = (error) => console.error('WebSocket Error: ', error);
    chatSocket.onmessage = handleWebSocketMessage;
    chatSocket.onclose = () => console.log('WebSocket close');
    
    const isBlocked = sessionStorage.getItem('selectedUserIsBlocked') === 'true';
    const imBlocked = sessionStorage.getItem('selectedUserImBlocked') === 'true';

    if (!isBlocked && !imBlocked) {
        createChatForm(chatSocket);
    } else {
        deleteChatForm();
    }
    
    setupInvitationButton(chatSocket);

    return chatSocket;
}

function handleWebSocketMessage(e) {
    const data = JSON.parse(e.data);
    console.log("WebSocket message: ", data);
    const chatMessagesElement = document.getElementById('chatMessages');
    if (data.content_type === 'block' || data.content_type === 'unblock') {
        const user = { id: data.sender.id, im_blocked: data.content_type === 'block'};
        sessionStorage.setItem('selectedUserImBlocked', false);
        renderChat(user);
    } else {
        console.log("WebSocket message: ", e.data);
        const messageElement = createMessageElement(data, sessionStorage.getItem('id'));
        chatMessagesElement.appendChild(messageElement);
        chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
    }
}

function setupInvitationButton(chatSocket) {
    const sendInvitationButton = document.getElementById('sendInvitationButton');
    let createdGame = null;
    if (sendInvitationButton) {
        sendInvitationButton.addEventListener('click', async () => {
            if (sendInvitationButton.textContent === 'Invitar partida') {
                // Lógica para enviar invitación
                createdGame = await createGame();

                if (createdGame) {
                    const invitationMessage = { content: "required", content_type: 'invitation', game_id: createdGame.id };
                    chatSocket.send(JSON.stringify(invitationMessage));
                    const messageElement = createMessageElement({ content_type: 'invitation', sender: { id: sessionStorage.getItem('id') }, game_id: createdGame.id }, sessionStorage.getItem('id'));
                    const chatMessagesElement = document.getElementById('chatMessages');
                    chatMessagesElement.appendChild(messageElement);
                    chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;

                    sendInvitationButton.textContent = 'Eliminar invitación';
                    sendInvitationButton.dataset.gameId = createdGame.id;
                } else {
                    console.error('Failed to create game');
                }
            } else {
                if (createdGame) {
                    const gameId = createdGame.game_id;
                    const success = await leaveGame(gameId);
                    if (success) {
                        sendInvitationButton.textContent = 'Invitar partida';
                        delete sendInvitationButton.dataset.gameId;
                    } else {
                        console.error('Failed to leave game');
                    }
                }
            }
        });
    }
}

function deleteChatForm() {
    const chatFormContainer = document.getElementById('chat-form-container');
    chatFormContainer.innerHTML = '';
}

function createChatForm(chatSocket) {
    const chatFormContainer = document.getElementById('chat-form-container');
    chatFormContainer.innerHTML = `
        <button id="sendInvitationButton" class="px-3">Invitar partida</button>
        <form id="chatForm" class="chat-form w-100">
            <input class="tc-input w-100" id="messageInput" autocomplete="off" type="text" data-translate-key="write_message" placeholder="Escribe un mensaje...">
            <input id="sendButton" type="submit" class="px-3" value="Enviar" data-translate-key="send">
        </form>
    `;
    chatFormContainer.classList.add('d-flex', 'w-100');

    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        const message = messageInput.value.trim();
        if (message !== '') {
            console.log("Sending message: ", message);
            chatSocket.send(JSON.stringify({ "content": message, "content_type": "message" }));
            messageInput.value = '';
            const messageElement = createMessageElement({ content: message, "content_type": "message", sender: { id: sessionStorage.getItem('id') } }, sessionStorage.getItem('id'));
            const chatMessagesElement = document.getElementById('chatMessages');
            chatMessagesElement.appendChild(messageElement);
            chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
        }
    });
}