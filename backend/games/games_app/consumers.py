import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone

class GamesConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.id = self.scope['url_route']['kwargs']['room_id']
            self.user_id = self.scope['url_route']['kwargs']['user_id']
            self.room_group_name = 'chat_room_%s' % self.id

            # Add the user to a group
            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name
            )
            self.accept()
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',


                    'id': self.user_id,
                    'content': None,
                    'content_type': 'user_joined',
                    'datetime': timezone.now().timestamp(),
                }
            )
        except Exception as e:
            print(e)

    def disconnect(self, close_code):
        try:
            # Remove the user from the group when they disconnect
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name,
                self.channel_name
            )
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',

                    'id': self.user_id,
                    'content': None,
                    'content_type': 'user_left',
                    'datetime': timezone.now().timestamp(),
                }
            )
        except Exception as e:
            print(e)

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            if 'content' not in text_data_json:
                return
            if 'content_type' not in text_data_json:
                return

            # Send the message to the group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',

                    'id': self.user_id,
                    'content': text_data_json['content'],
                    'content_type': text_data_json['content_type'],
                    'datetime': timezone.now().timestamp(),
                }
            )
        except Exception as e:
            print(e)

    def chat_message(self, event):
        # Send the message to WebSocket
        try:
            if event['id'] != self.user_id:
                self.send(text_data=json.dumps({
                    'id': event['id'],
                    'content': event['content'],
                    'content_type': event['content_type'],
                    'datetime': event['datetime'],
                }))
        except Exception as e:
            print(e)