import { getChatMessages, getChats } from "../api/chat.js";
import { loadLanguage } from "../api/languages.js";
import { blockUser, getBlockedUsers, unblockUser } from "../api/users.js";



async function chatUserList() {
    const userListElement = document.getElementById('chatUserList');
    const showUsersTab = document.getElementById('showUsersTab');
    const showBlockedTab = document.getElementById('showBlockedTab');
    let users = [];
    let currentView = 'users';

    const renderUsers = async (filterBlocked = false) => {
        userListElement.innerHTML = '';
        const ul = document.createElement('ul');

        if (!filterBlocked) {
            users = await getChats();
        } else {
            users = await getBlockedUsers(); 
        }

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
            lockIcon.textContent = filterBlocked ? '🔒' : '🔓';

            li.appendChild(lockIcon);

            lockIcon.addEventListener('click', async () => {
                if (lockIcon.textContent === '🔓') {
                    const blocked = await blockUser(user.id);
                    if (blocked) {
                        lockIcon.textContent = '🔒'; 
                    }
                } else {
                    const unblocked = await unblockUser(user.id);
                    if (unblocked) {
                        lockIcon.textContent = '🔓'; 
                    }
                }
                window.location.reload();
            });

            li.dataset.userId = user.id;
            li.addEventListener('click', () => renderChat(user.room_id));
            ul.appendChild(li);
        });

        userListElement.appendChild(ul);
    };

    renderUsers(false);

    showUsersTab.addEventListener('click', () => {
        currentView = 'users';
        renderUsers(false);
        showUsersTab.classList.add('active');
        showBlockedTab.classList.remove('active');
    });

    showBlockedTab.addEventListener('click', () => {
        currentView = 'blocked';
        renderUsers(true); 
        showUsersTab.classList.remove('active');
        showBlockedTab.classList.add('active');
    });
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
                renderChat(user.room_id);
            }
        }
        messageInput.value = '';
    }
};
//Hacer funcion en que base al id del usuario pille el chat

export async function renderChat(room_id) {
    loadLanguage();
    startSocket(room_id);
    chatUserList();
    const chatMessagesElement = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    const chat = await getChatMessages(3);
    return;
    if (chat) {
        chatMessagesElement.innerHTML = '';
        chat.forEach(message => {
            const div = document.createElement('div');
            div.className = 'message';

            if (message.user_id == userId) {
                div.classList.add("my-message");
            }

            if (message.type === 'invitation') {
                const invitationText = document.createElement('p');
                invitationText.textContent = "You have been invited to join a game!";

                const joinButton = document.createElement('button');
                joinButton.textContent = 'Join the game';
                joinButton.onclick = () => {
                    // Aquí puedes poner la lógica para unirte a la partida
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

    sendButton.addEventListener("click", sendMessage);
}

function startSocket(room_id) {
    sessionStorage.getItem()
    let url = `ws://${window.location.host}/ws/chat/${room_id}/1/`
    console.log(url);

    const chatSocket = new WebSocket(url)

    chatSocket.onmessage = function (e) {
        let data = JSON.parse(e.data)
        console.log('Data:', data)

        if (data.type === 'chat') {
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
