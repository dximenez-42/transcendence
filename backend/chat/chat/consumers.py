import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'test'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def receive(self, text_data):
        user = self.scope['user']
        if user.is_authenticated:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message':message,
                    'username': user.username,
                }
            )
        else:
            self.close()

    def chat_message(self, event):
        messages = event['message']
        username = event['username']

        self.send(text_data=json.dumps({
            'type': 'chat',
            'message': messages,
            'username': username,
        }))
