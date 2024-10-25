import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone
import threading
import uuid
import time
import math
import asyncio


TABLE_HEIGHT = 100
TABLE_LENGTH = 200
PAD_LENGTH = 30
PAD_WIDTH = 10
BALL_RADIUS = 4
GAME_TIME = 150
FPS = 60
connected_users = {} # user_id: websocket
waiting_1v1_room = [] # template matching queuewww
game_states = {} # game_id: {ball_x, ball_y, ball_speed_x, ball_speed_y, pad_1, pad_2, score_1, score_2, running}
games = {} # user_id: game_id
room_states = {} # room_id: {host_id, player_id1, player_id2...}
rooms = {} # user_id: room_id


# game_lock = threading.Lock() # not needed

def generate_unique_id():
    return str(uuid.uuid4())

class GamesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            
            self.user_name = self.scope['url_route']['kwargs']['user_name']  # user_name
            self.user_id = self.scope['url_route']['kwargs']['user_id']  # user_id (token)

            await self.accept()
            connected_users[self.user_id] = self
            
            await self.send(text_data=json.dumps({
                'action': 'server_confirm_connection',
                'user_name': self.user_name,
                'user_id': self.user_id
            }))
        except Exception as e:
            print(e)

    async def disconnect(self, close_code): # need to rewrite
        if self.user_id in connected_users:
            del connected_users[self.user_id]

    async def receive(self, text_data): 
        try:
            text_data_json = json.loads(text_data)
            if 'action' not in text_data_json:
                return
                  
            match text_data_json['action']:
                
                case 'ping':
                    await self.send(text_data=json.dumps({'action': 'pong',}))
                case 'client_match_request':
                    await self.handle_match_request(text_data_json['is_tournament'])
                case 'client_move_pad':
                    if text_data_json['game_id'] in game_states:
                        game_state = game_states[text_data_json['game_id']]
                        newPosition = game_state['pad_' + text_data_json['user_name']] + text_data_json['pad_y']
                        if (newPosition + PAD_LENGTH / 2) > TABLE_HEIGHT / 2:
                            newPosition = TABLE_HEIGHT / 2 - PAD_LENGTH / 2
                        if (newPosition - PAD_LENGTH / 2) < -TABLE_HEIGHT / 2:
                            newPosition = -TABLE_HEIGHT / 2 + PAD_LENGTH / 2
                        game_state['pad_' + text_data_json['user_name']] = newPosition
        except Exception as e:
            print(e)
    
    
            
    async def handle_match_request(self, is_tournament):
        if not is_tournament:
            if len(waiting_1v1_room) >= 1:
                opp = waiting_1v1_room.pop()
                game_id = generate_unique_id()
                opp.game_id = game_id
                self.game_id = game_id
                self.opp_id = opp.user_id
                self.opp_name = opp.user_name
                opp.opp_id = self.user_id
                opp.opp_name = self.user_name
                
                await opp.send(text_data=json.dumps({
                    'action': 'server_game_matched',
                    'opp_name': self.user_name,
                    'opp_id': self.user_id,
                    'game_id': game_id,
                    'is_tournament': False
                }))
                await self.send(text_data=json.dumps({
                    'action': 'server_game_matched',
                    'opp_name': opp.user_name,
                    'opp_id': opp.user_id,
                    'game_id': game_id,
                    'is_tournament': False
                }))
  
                await self.start_game(opp)
            else:
                waiting_1v1_room.append(self)
                await self.send(text_data=json.dumps({
                    'action': 'server_game_waiting',
                    'is_tournament': False
                }))

    async def start_game(self, opp):
        game_states[self.game_id] = {
            'ball_x': 0, 'ball_y': 0,
            'ball_speed_x': 1.5,
            'ball_speed_y': 1.5,
            'pad_' + self.user_name: 0,
            'pad_' + opp.user_name: 0,
            'score_' + self.user_name: 0,
            'score_' + self.opp_name: 0,
            'running': True,
            'is_tournament': False
        }
        
        games[self.user_id] = self.game_id
        games[self.opp_id] = self.game_id
         
        await self.start_ball_movement(self.game_id)
    
    async def start_ball_movement(self, game_id):
        async def move_ball():
            while game_id in game_states and game_states[game_id]['running']:
                
                try:
                    game_state = game_states[game_id]
                    ball_x = game_state['ball_x']
                    ball_y = game_state['ball_y']
                    ball_speed_x = game_state['ball_speed_x']
                    ball_speed_y = game_state['ball_speed_y']
                
                    # 更新球的位置
                    new_ball_x = ball_x + ball_speed_x
                    new_ball_y = ball_y + ball_speed_y
                    collisionBuffer = BALL_RADIUS + ball_speed_x * 0.1 
                    radiusBuffer = BALL_RADIUS + ball_speed_y * 0.1 

                    if new_ball_x < -TABLE_LENGTH / 2 + PAD_WIDTH + collisionBuffer:  # border of player 1 (the last matched player)
                        pad_top = game_state['pad_' + self.user_name] + PAD_LENGTH / 2
                        pad_bottom = game_state['pad_' + self.user_name] - PAD_LENGTH / 2
                        if pad_bottom - radiusBuffer <= new_ball_y <= pad_top + radiusBuffer:
                            collide_point = new_ball_y - game_state['pad_' + self.user_name]
                            normalized_collide_point = collide_point / (PAD_LENGTH / 2)
                            angle = normalized_collide_point * (math.pi / 4)
                            speed = math.sqrt(ball_speed_x**2 + ball_speed_y**2) + 0.1
                            game_state['ball_speed_x'] = abs(speed * math.cos(angle))
                            game_state['ball_speed_y'] = speed * math.sin(angle)
                        else:
                            game_state['score_' + self.opp_name] += 1
                            new_ball_x = 0
                            new_ball_y = 0
                            await self.reset_ball(game_state)
                    if new_ball_x > TABLE_LENGTH / 2 - PAD_WIDTH - collisionBuffer:  # border of player 2 (the first matched player)
                        pad_top = -game_state['pad_' + self.opp_name] + PAD_LENGTH / 2 # remember to add minus sign (!!!!!)
                        pad_bottom = -game_state['pad_' + self.opp_name] - PAD_LENGTH / 2  # remember to add minus sign (holy shit)
                        if pad_bottom - radiusBuffer <= new_ball_y <= pad_top + radiusBuffer:
                            collide_point = new_ball_y - game_state['pad_' + self.opp_name]
                            normalized_collide_point = collide_point / (PAD_LENGTH / 2)
                            angle = normalized_collide_point * (math.pi / 4)
                            speed = math.sqrt(ball_speed_x**2 + ball_speed_y**2) + 0.1
                            game_state['ball_speed_x'] = -abs(speed * math.cos(angle))
                            game_state['ball_speed_y'] = speed * math.sin(angle)
                        else:
                            game_state['score_' + self.user_name] += 1
                            new_ball_x = 0
                            new_ball_y = 0
                            await self.reset_ball(game_state)
                    # check the limbo of the table
                    if new_ball_y > TABLE_HEIGHT / 2 - collisionBuffer or new_ball_y < -TABLE_HEIGHT / 2 + collisionBuffer:
                        game_state['ball_speed_y'] *= -1
                    
                    if game_state['score_' + self.user_name] > 5 or game_state['score_' + self.opp_name] > 5:
                        # self.send(json.dumps({
                        
                        #     'score_' + self.user_name: game_state['score_' + self.user_name],
                        #     'score_' + self.opp_name: game_state['score_' + self.opp_name],
                        # }))
                        await self.end_game(self.game_id)
                        break
                    game_state['ball_x'] += game_state['ball_speed_x']
                    game_state['ball_y'] += game_state['ball_speed_y']

                    # spred the ball position to both players  
                    await self.broadcast_position(game_id)

                    await asyncio.sleep(1 / FPS)
                except Exception as e:
                    self.send(json.dumps({
                        'error': str(e)
                    }))
        # start the ball movement
        asyncio.create_task(move_ball())
        
    async def reset_ball(self, game_state):
        game_state['ball_x'] = 0
        game_state['ball_y'] = 0
        # game_state['ball_speed_x'] = random.choice([1, -1]) * (1 + random.random() * 0.5)  # don't need to randomize the speed
        # game_state['ball_speed_y'] = random.choice([1, -1]) * (1 + random.random() * 0.5)
        await self.broadcast_position(self.game_id)
        # await asyncio.sleep(1) # if delay the reset ball, the ball will have lagging effect, maybe because of the async nature of the function
        
    async def broadcast_position(self, game_id):
        game_state = game_states[game_id]

        # send the ball position to both players
        if self.user_id in connected_users:
            await connected_users[self.user_id].send(text_data=json.dumps({
                'action': 'server_update_position',
                'ball_x': game_state['ball_x'],
                'ball_y': game_state['ball_y'],
                'score_' + self.user_name: game_state['score_' + self.user_name],
                'score_' + self.opp_name: game_state['score_' + self.opp_name],
                'pad_' + self.user_name: game_state['pad_' + self.user_name],
                'pad_' + self.opp_name: game_state['pad_' + self.opp_name]
            }))

        if self.opp_id in connected_users:
            await connected_users[self.opp_id].send(text_data=json.dumps({
                'action': 'server_update_position',
                'ball_x': -game_state['ball_x'],
                'ball_y': -game_state['ball_y'],
                'score_' + self.user_name: game_state['score_' + self.user_name],
                'score_' + self.opp_name: game_state['score_' + self.opp_name],
                'pad_' + self.user_name: game_state['pad_' + self.user_name],
                'pad_' + self.opp_name: game_state['pad_' + self.opp_name]
            }))


    # def update_pad_position(self, data):
    #     if 'to_user_id' in data and data['to_user_id'] in connected_users:
    #         connected_users[data['to_user_id']].send(text_data=json.dumps({
    #             'action': 'server_update_position',
    #             'ball_x': data['ball_x'],
    #             'ball_y': data['ball_y'],
    #             'pad_y': data['pad_y']
    #         }))

    async def end_game(self, game_id):
        if game_id in game_states:
            game_states[game_id]["running"] = False
            del game_states[game_id]
            await self.send(json.dumps({
                'action': 'server_game_over',
                'is_tournament': False
            }))
            await connected_users[self.opp_id].send(json.dumps({
                'action': 'server_game_over',
                'is_tournament': False
            }))
            