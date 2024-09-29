$(function() {
    var url = 'ws://' + window.location.host + '/ws/room/' + room_id + '/'
    console.log(url)

    var chatSocket = new WebSocket(url)
    console.log(chatSocket)

    chatSocket.onopen = function(e) {
        console.log("Websocket abierto")
    }

    chatSocket.onclose = function(e) {
        console.error('Chat socket cerrado')
    }

    chatSocket.onmessage = function(data) {
        const datamsj = JSON.parse(data.data)
        var msj = datamsj.message
        var username = datamsj.username
        var datetime = datamsj.datetime

        document.querySelector('#boxMessages').innerHTML +=
           `
        <div class="alert alert-success" role="alert">
            ${msj}
            <div>
                <small class="fst-italic fw-bold">${username}</small>
                <small class="float-end">${datetime} </small>
            </div>
        </div>
        `
    }





   document.querySelector('#btnMessage').addEventListener('click', sendMessage)
   document.querySelector('#inputMessage').addEventListener('keypress',
       function(e){
           if(e.key === 'Enter'){
               sendMessage()
           }
       })

   function sendMessage(){
       var message = document.querySelector('#inputMessage')


       if (message.value.trim() !== ''){
           loadMessageHTML(message.value.trim())
           chatSocket.send(JSON.stringify({
               'message': message.value.trim(),
           }))

           console.log(message.value.trim())

           message.value = ''
       }
       else {
           console.log('Message is empty')
       }
   }

   function loadMessageHTML(m){

        const dateObj = new Date()
        const year = dateObj.getFullYear()
        const month = dateObj.getMonth() + 1
        const day = dateObj.getDate()
        const hour = dateObj.getHours()
        const minutes = dateObj.getMinutes()
        const seconds = dateObj.getSeconds()

       const formattedDate = `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`


       document.querySelector('#boxMessages').innerHTML +=
           `
        <div class="alert alert-primary" role="alert">
            ${m}
            <div>
                <small class="fst-italic fw-bold">${user}</small>
                <small class="float-end">${formattedDate} </small>
            </div>
        </div>
        `

   }
})