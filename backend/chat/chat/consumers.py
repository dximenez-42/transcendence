import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = 'chat_room_%s' % self.id
        self.user = self.scope['user']
        print(self.id)

        print('Conexión establecida al room_group_name ' + self.room_group_name)
        print('Conexión establecida al channel_name ' + self.channel_name)

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        print('conexión cerrada')

    def receive(self, text_data):
        print('mensaje recibido')

        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']

            # Obtenemos el ID del usuario que envió el mensaje

            if self.scope['user'].is_authenticated:
                sender_id = self.scope['user'].id
            else:
                sender_id = None

            if sender_id:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message,
                        'username': self.user.username,
                        'datetime': timezone.localtime(timezone.now()).strftime('%Y-%m-%d %H:%M:%S'),
                        'sender_id': sender_id
                    }
                )
            else:
                print('Usuario no autenticado. Ignorando el mensaje')# Enviamos el mensaje al grupo

        except json.JSONDecodeError as e:
            print('Hubo un error al decodificar el JSON: ', e)
        except KeyError as e:
            print('El JSON no tiene la clave esperada: ', e)
        except Exception as e:
            print('Error inesperado: ', e)

    def chat_message(self, event):
        message = event['message']
        username = event['username']
        datetime = event['datetime']
        sender_id = event['sender_id']

        current_user_id = self.scope['user'].id
        if sender_id != current_user_id:
            self.send(text_data=json.dumps({
                'message': message,
                'username': username,
                'datetime': datetime,
            }))