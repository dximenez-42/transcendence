import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        # Add the user to a group called 'chat'
        async_to_sync(self.channel_layer.group_add)(
            'chat', 
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Remove the user from the group when they disconnect
        async_to_sync(self.channel_layer.group_discard)(
            'chat', 
            self.channel_name
        )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        
        # Send the message to the group
        async_to_sync(self.channel_layer.group_send)(
            'chat',
            {
                'type': 'chat_message',
                'message': message
            }
        )

    def chat_message(self, event):
        message = event['message']
        # Send the message to WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))
