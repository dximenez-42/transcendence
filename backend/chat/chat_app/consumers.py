import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone

from .models import Message, Chat, User  # Import the necessary models

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.id = self.scope['url_route']['kwargs']['room_id']
            self.user_id = self.scope['url_route']['kwargs']['user_id']
            self.room_group_name = 'chat_room_%s' % self.id

            self.user = User.objects.get(id=self.user_id)  # Fetch the user by user_id

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

            # Save the message to the database
            if text_data_json['content_type'] == 'message':
                try:
                    chat = Chat.objects.get(room_id=self.id)  # Fetch the chat by room_id
                    user = User.objects.get(id=self.user_id)  # Fetch the user by user_id

                    Message.objects.create(
                        sender=user,
                        chat=chat,
                        content=text_data_json['content'],
                        content_type=text_data_json['content_type']
                    )
                    chat.updated_at = timezone.now()
                    chat.save()
                except Exception as e:
                    print(e)

        except Exception as e:
            print(e)

    def chat_message(self, event):
        # Send the message to WebSocket
        try:
            if event['id'] != self.user_id:
                sender = User.objects.get(id=event['id'])

                self.send(text_data=json.dumps({
                    # 'id': event['id'],
                    'content': event['content'],
                    'content_type': event['content_type'],
                    'sender': {
                        'id': sender.id,
                        'username': sender.username,
                        'name': sender.name,
                    },
                    'datetime': event['datetime'],
                }))
        except Exception as e:
            print(e)
