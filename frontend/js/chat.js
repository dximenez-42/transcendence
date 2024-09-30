document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chatBox');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    const ws = new WebSocket('ws://' + window.location.host + '/ws/room/1/');

    ws.onopen = function() {
		console.log('Conectando a WebSocket en:', ws.url);
    };

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = `${data.username || "Anonimo"}: ${data.message}`;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    ws.onclose = function() {
        console.log('WebSocket desconectado');
    };

    sendButton.onclick = function() {
        const message = messageInput.value.trim();
        if (message) {
            ws.send(JSON.stringify({ 'message': message }));
            messageInput.value = '';
        }
    };

    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
});
