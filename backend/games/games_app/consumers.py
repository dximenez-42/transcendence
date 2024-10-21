import json
import random
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone

connected_users = {}
waiting_1v1_room = []

class GamesConsumer(WebsocketConsumer):
    def connect(self):
        try:
            
            self.user_name = self.scope['url_route']['kwargs']['user_name']  # room_type 1v1 or 4v4
            # self.room_id = self.scope['url_route']['kwargs']['room_id']  # room_id
            self.user_id = self.scope['url_route']['kwargs']['user_id']  # user_id
            # self.room_group_name = f'{self.room_type}_room_{self.room_id}'  # room_group_name

            self.accept()
            connected_users[self.user_id] = self
            
            self.send(text_data=json.dumps({
                'action': 'server_confirm_connection',
                'user_name': self.user_name,
                # 'room_id': self.room_id,
                'user_id': self.user_id
            }))

            # if self.room_type == '1v1':
            #     self.join_1v1_room()
            # elif self.room_type == '4v4':
            #     self.join_4v4_room()
        except Exception as e:
            print(e)

    def disconnect(self, close_code):
        try:
            if self.room_type == '1v1':
                if self in waiting_1v1_room:
                    waiting_1v1_room.remove(self)  # remove player from waiting room
            elif self.room_type == '4v4':
                # remove player from 4v4 room
                for room_id, players in rooms_4v4.items():
                    if self in players:
                        players.remove(self)
                        break
        except Exception as e:
            print(e)

    def receive(self, text_data):
        
        
        # self.send(text_data)
        # return 
        try:
            text_data_json = json.loads(text_data)
            if 'action' not in text_data_json:
                return
            
            ##########################################
            # ping pong message
            if text_data_json['action'] == 'ping':
                self.send(text_data=json.dumps({
                    'action': 'pong',
                }))             
                return
            ##########################################
            
            # self.send (text_data)
            # return
            
            match text_data_json['action']:
                
                case 'client_match_request':
                    if text_data_json['is_tournament'] == False :
                        if len(waiting_1v1_room) == 1:
                            self.opp_name = waiting_1v1_room[0].user_name
                            self.opp_id = waiting_1v1_room[0].user_id
                            waiting_1v1_room[0].opp_id = self.user_id
                            waiting_1v1_room[0].opp_name = self.user_name
                            
                            waiting_1v1_room[0].send(text_data=json.dumps({
                                'action': 'server_game_matched',
                                'opp_name': self.user_name,
                                'opp_id': self.user_id,
                                'is_tournament': False
                            }))
                            self.send(text_data=json.dumps({
                                'action': 'server_game_matched',
                                'opp_name': waiting_1v1_room[0].user_name,
                                'opp_id': waiting_1v1_room[0].user_id,
                                'is_tournament': False
                            }))
                            waiting_1v1_room.pop()
                        else:
                            waiting_1v1_room.append(self)
                            self.send(text_data=json.dumps({
                                'action': 'server_game_waiting',
                                'is_tournament': False
                            }))
                case 'client_update_position':
                    if 'to_user_id' in text_data_json:
                        if text_data_json['to_user_id'] in connected_users:
                            connected_users[text_data_json['to_user_id']].send(text_data=json.dumps({
                                'action': 'server_update_position',
                                'ball_x': text_data_json['ball_x'],
                                'ball_y': text_data_json['ball_y'],
                                'pad_x': text_data_json['pad_x'],
                                'pad_y': text_data_json['pad_y'],
                            }))
                case 'client_game_over':
                    if 'is_tournament' in text_data_json:
                        if text_data_json['is_tournament'] == False:
                            if 'to_user_id' in text_data_json:
                                if text_data_json['to_user_id'] in connected_users:
                                    connected_users[text_data_json['to_user_id']].send(text_data=json.dumps({
                                        'action': 'server_game_over',
                                        'is_tournament': False
                                    }))
                            


            # message_with_id = {
            #     'id': self.user_id, 
            #     **text_data_json 
            # }

            # # send message to opponent
            # if self.room_type == '1v1' and hasattr(self, 'opponent'):
            #     self.opponent.send(text_data=json.dumps(message_with_id))
            # elif self.room_type == '4v4' and hasattr(self, 'opponent'):
            #     # 4v4 room, send message to all players in the room
            #     for player in self.opponent:
            #         player.send(text_data=json.dumps(message_with_id))
                    
        except Exception as e:
            print(e)

    def join_1v1_room(self):
        global waiting_1v1_room
        # player join 1v1 room
        if len(waiting_1v1_room) == 0:
            waiting_1v1_room.append(self)
        else:
            opponent = waiting_1v1_room.pop()
            # match two players start game
            self.opponent = opponent
            opponent.opponent = self
            self.notify_start_game(self.user_id, opponent.user_id)
            opponent.notify_start_game(opponent.user_id, self.user_id)

    def join_4v4_room(self):
        global rooms_4v4
        room_id = None
        # find a room with less than 4 players
        for r_id, players in rooms_4v4.items():
            if len(players) < 4:
                room_id = r_id
                break

        if room_id is None:
            room_id = f'room_{len(rooms_4v4) + 1}'
            rooms_4v4[room_id] = []

        rooms_4v4[room_id].append(self)

        # check if the room is full
        if len(rooms_4v4[room_id]) == 4:
            players = rooms_4v4[room_id]
            # match two players randomly
            random.shuffle(players)
            for i in range(0, 4, 2):
                players[i].opponent = players[i+1]
                players[i+1].opponent = players[i]
                # notify players to start game
                players[i].notify_start_game(players[i].user_id, players[i+1].user_id)
                players[i+1].notify_start_game(players[i+1].user_id, players[i].user_id)

    def notify_start_game(self, user_id, opponent_id):
        # notify players
        self.send(text_data=json.dumps({
            'action': 'start_game',
            'your_id': user_id,
            'opponent_id': opponent_id,
            'datetime': timezone.now().timestamp(),
        }))
