import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone
import threading
import time
import math
import asyncio
from games_app.extra.utiles import *
from asyncio import Lock


TABLE_HEIGHT = 100
TABLE_LENGTH = 200
PAD_LENGTH = 30
PAD_WIDTH = 10
BALL_RADIUS = 4
GAME_TIME = 150
FPS = 60
connected_users_id = {} # user_id: websocket
game_states = {} # game_id: {ball_x, ball_y, ball_speed_x, ball_speed_y, pad_1, pad_2, score_1, score_2, running}
games = {} # user_id: game_id
room_states = {} # room_id: {host_id, player_id1, player_id2...}
rooms = {} # user_id: room_id
room_locks = {} # room_id: Lock


# game_lock = threading.Lock() # not needed

def sendMsgToUser(user_id, msg):
    if user_id in connected_users_id:
        connected_users_id[user_id].send(json.dumps(msg))
    else:
        print('User not connected')

class GamesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            
            self.user_name = self.scope['url_route']['kwargs']['user_name']  # user_name
            self.user_id = self.scope['url_route']['kwargs']['user_id']  # user_id (token)
            self.room_id = None

            await self.accept()
            connected_users_id[self.user_id] = self
            
            await self.send(text_data=json.dumps({
                'action': 'server_confirm_connection',
                'user_name': self.user_name,
                'user_id': self.user_id
            }))
        except Exception as e:
            print(e)

    async def disconnect(self, close_code): # need to rewrite
        if self.user_id in connected_users_id:
            del connected_users_id[self.user_id]

    async def receive(self, text_data): 
        try:
            text_data_json = json.loads(text_data)
            if 'action' not in text_data_json:
                return
                  
            match text_data_json['action']:
                
                case 'ping':
                    await self.send(text_data=json.dumps({'action': 'pong',}))
                case 'client_move_pad':
                    self.handle_move_pad(text_data_json)
                case 'client_create_room':
                    await self.create_room()
                case 'client_join_room':
                    await self.join_room(text_data_json)
                case 'client_leave_room':
                    await self.leave_room()
                case 'client_start_room':
                    await self.start_room_game()
                case 'client_info_room':
                    await self.get_room_list_by_id()
                case 'client_get_rooms':
                    await self.get_all_rooms()
        except Exception as e:
            print(e)
 
    async def start_game(self, player1_id, player2_id):
        
        if player1_id not in connected_users_id or player2_id not in connected_users_id:
            return
        player1 = connected_users_id[player1_id]
        player2 = connected_users_id[player2_id]

        game_id = generate_unique_id()
        player2.game_id = game_id
        player1.game_id = game_id
        player1.opp_id = player2.user_id
        player1.opp_name = player2.user_name
        player2.opp_id = player1.user_id
        player2.opp_name = player1.user_name
                
        await player2.send(text_data=json.dumps({
            'action': 'server_game_matched',
            'opp_name': player1.user_name,
            'opp_id': player1.user_id,
            'game_id': game_id,
            'is_tournament': False
        }))
        await player1.send(text_data=json.dumps({
            'action': 'server_game_matched',
            'opp_name': player2.user_name,
            'opp_id': player2.user_id,
            'game_id': game_id,
            'is_tournament': False
        }))
        
        
        game_states[player1.game_id] = {
            'ball_x': 0, 'ball_y': 0,
            'ball_speed_x': 1.5,
            'ball_speed_y': 1.5,
            'pad_' + player1.user_name: 0,
            'pad_' + player1.opp_name: 0,
            'score_' + player1.user_name: 0,
            'score_' + player1.opp_name: 0,
            'running': True,
            'winner_id': None,
            'winner': None,
            'is_tournament': False
        }
        
        games[player1.user_id] = player1.game_id
        games[player1.opp_id] = player1.game_id
        
        print('Game started')
        # await player1.start_ball_movement(player1.game_id)
        asyncio.create_task(self.start_ball_movement(player1.game_id))
        print('Ball movement started')
        
        # while game_states[player1.game_id]['running']:
        #     await asyncio.sleep(1)
        
        # winner_id = game_states[player1.game_id]['winner_id']
        # del game_states[player1.game_id]
        # del games[player1.user_id]
        # del games[player1.opp_id]
        # player1.game_id = None
        # player1.opp_id = None
        # player1.opp_name = None
        # opp = connected_users_id[player1.opp_id]
        # opp.game_id = None
        # opp.opp_id = None
        # opp.opp_name = None
        # return {'winner_id': winner_id}
    
    
        # winner_id = None
        # if game_states[player1.game_id]['score_' + player1.user_name] > game_states[player1.game_id]['score_' + player1.opp_name]:
        #     game_states[player1.game_id]['winner'] = player1.user_name
        #     winner_id = player1.user_id
        # else:
        #     game_states[player1.game_id]['winner'] = player1.opp_name
        #     winner_id = player1.opp_id
        # room_id = rooms[player1.user_id]
        # if room_id not in room_locks:
        #     room_locks[room_id] = Lock()
        # async with room_locks[room_id]:
        #     if room_id in room_states:
        #         room = room_states[room_id]
        #         room['result'].append({          
        #             player1.user_name: game_states[player1.game_id]['score_' + player1.user_name],
        #             player1.opp_name: game_states[player1.game_id]['score_' + player1.opp_name],
        #             'winner': game_states[player1.game_id]['winner'],
        #             'winner_id': winner_id
        #         })
        #         room['game_times'] -= 1
        #         if room['game_times'] != 0:
        #             room['game_queue'].append(winner_id)
        # del game_states[player1.game_id]
        # del games[player1.user_id]
        # del games[player1.opp_id]
        # player1.game_id = None
        # player1.opp_id = None
        # player1.opp_name = None
        # opp = connected_users_id[player1.opp_id]
        # opp.game_id = None
        # opp.opp_id = None
        # opp.opp_name = None
        
        # return {'winner_id': winner_id}
    
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
        if self.user_id in connected_users_id:
            await connected_users_id[self.user_id].send(text_data=json.dumps({
                'action': 'server_update_position',
                'ball_x': game_state['ball_x'],
                'ball_y': game_state['ball_y'],
                'score_' + self.user_name: game_state['score_' + self.user_name],
                'score_' + self.opp_name: game_state['score_' + self.opp_name],
                'pad_' + self.user_name: game_state['pad_' + self.user_name],
                'pad_' + self.opp_name: game_state['pad_' + self.opp_name]
            }))

        if self.opp_id in connected_users_id:
            await connected_users_id[self.opp_id].send(text_data=json.dumps({
                'action': 'server_update_position',
                'ball_x': -game_state['ball_x'],
                'ball_y': -game_state['ball_y'],
                'score_' + self.user_name: game_state['score_' + self.user_name],
                'score_' + self.opp_name: game_state['score_' + self.opp_name],
                'pad_' + self.user_name: game_state['pad_' + self.user_name],
                'pad_' + self.opp_name: game_state['pad_' + self.opp_name]
            }))

    async def end_game(self, game_id):
        
        winner_id = None
        if game_id in game_states:
            game_states[game_id]["running"] = False
            if game_states[game_id]['score_' + self.user_name] > game_states[game_id]['score_' + self.opp_name]:
                game_states[game_id]['winner'] = self.user_name
                winner_id = self.user_id
            else:
                game_states[game_id]['winner'] = self.opp_name
                winner_id = self.opp_id
            
            room_id = self.room_id
            if room_id not in room_locks:
                room_locks[room_id] = Lock()
            async with room_locks[room_id]:
                if room_id in room_states:
                    room = room_states[room_id]
                    room['result'].append({          
                        self.user_name: game_states[game_id]['score_' + self.user_name],
                        self.opp_name: game_states[game_id]['score_' + self.opp_name],
                        'winner': game_states[game_id]['winner'],
                        'winner_id': winner_id
                    })
                    room['game_times'] -= 1
                    if room['game_times'] != 0:
                        room['game_queue'].append(winner_id)
            #     if room['game_times'] == 0:
            #         room['room_state'] = 'open'
            #         room['game_queue'] = room['player_ids'][:]
            #         room['numbers'] = len(room['player_ids'])
            #         room['result'] = []
            #         for player_id in room['player_ids']:
            #             await connected_users_id[player_id].send(json.dumps({
            #                 'action': 'server_game_over',
            #                 'winner': game_states[game_id]['winner'],
            #                 'result': room['result'],
            #             }))    
            
            # # del game_states[game_id]
            await self.send(json.dumps({
                'action': 'server_game_over',
                'winner': game_states[game_id]['winner'],
                'is_tournament': False
            }))
            await connected_users_id[self.opp_id].send(json.dumps({
                'action': 'server_game_over',
                'winner': game_states[game_id]['winner'],
                'is_tournament': False
            }))
            opp = connected_users_id[self.opp_id]
            del game_states[game_id]
            del games[self.user_id]
            del games[self.opp_id]
            self.game_id = None
            self.opp_id = None
            self.opp_name = None
            opp.game_id = None
            opp.opp_id = None
            opp.opp_name = None
    
    def handle_move_pad(self, data_json):
        if data_json['game_id'] in game_states:
            game_state = game_states[data_json['game_id']]
            newPosition = game_state['pad_' + data_json['user_name']] + data_json['pad_y']
            if (newPosition + PAD_LENGTH / 2) > TABLE_HEIGHT / 2:
                newPosition = TABLE_HEIGHT / 2 - PAD_LENGTH / 2
            if (newPosition - PAD_LENGTH / 2) < -TABLE_HEIGHT / 2:
                newPosition = -TABLE_HEIGHT / 2 + PAD_LENGTH / 2
            game_state['pad_' + data_json['user_name']] = newPosition

    async def create_room(self):
        
        if self.room_id is not None:
            await self.send(json.dumps({
                'action': 'server_room_created_denied',
                'error': 'User already in a room'
            }))
            return
        room_id = generate_unique_id()
        self.room_id = room_id
        rooms[self.user_id] = room_id
        room_states[room_id] = {
            'host_id': self.user_id,
            'player_ids': [self.user_id],
            'game_queue': [],
            'room_state': 'open',
            'numbers': 1,
            'game_times': 0,
            'result': [],
            'room_id': room_id
        }
        await self.send(json.dumps({
            'action': 'server_room_created',
            'room_id': room_id
        }))
        
    async def join_room(self, data_json):
        if 'room_id' not in data_json:
            await self.send(json.dumps({
                'action': 'server_room_joined_denied',
                'error': 'Room id not provided'
            }))
            return
        if self.room_id is not None:
            await self.send(json.dumps({
                'action': 'server_room_joined_denied',
                'error': 'User already in a room'
            }))
            return
        room_id = data_json['room_id']
        if room_id in room_states:
            room = room_states[room_id]
            if room['room_state'] == 'open':
                room['player_ids'].append(self.user_id)
                room['numbers'] += 1
                rooms[self.user_id] = room_id
                self.room_id = room_id
                await self.send(json.dumps({
                    'action': 'server_room_joined',
                    'room_id': room_id
                }))
            else:
                await self.send(json.dumps({
                    'action': 'server_room_joined_denied',
                }))
        else:
            await self.send(json.dumps({
                'action': 'server_room_not_exist'
            }))
    
    async def leave_room(self):
        
        if self.room_id is None:
            await self.send(json.dumps({
                'action': 'server_room_left_error',
                'error': 'User not in any room'
            }))
            return
        if self.room_id not in room_states:
            await self.send(json.dumps({
                'action': 'server_room_left_error',
                'error': 'Room not exist'
            }))
            return
        room_id = self.room_id
        room = room_states[room_id]

        # 如果房间状态不是 'open'，则禁止离开
        if room['room_state'] != 'open':
            await self.send(json.dumps({
                'action': 'server_room_left_error',
                'error': 'Room is closed'
            }))
            return

        # 房主离开房间逻辑
        if room['host_id'] == self.user_id:
            if room['numbers'] == 1:
                del rooms[self.user_id]
                del room_states[room_id]
                self.room_id = None
                await self.send(json.dumps({
                    'action': 'server_room_left_success'
                }))
            else:
                room['player_ids'].remove(self.user_id)
                room['numbers'] -= 1
                del rooms[self.user_id]
                self.room_id = None
                room['host_id'] = room['player_ids'][0]
                await self.send(json.dumps({
                    'action': 'server_room_left_success'
                }))
                new_host = connected_users_id[room['host_id']]
                await new_host.send(json.dumps({
                    'action': 'server_room_new_host',
                    'host_id': room['host_id']
                }))
        else:
            # 房间成员离开逻辑
            room['player_ids'].remove(self.user_id)
            room['numbers'] -= 1
            del rooms[self.user_id]
            self.room_id = None
            await self.send(json.dumps({
                'action': 'server_room_left_success'
            }))
            
                
    async def start_room_game(self):
        if self.room_id is None:
            await self.send(json.dumps({
                'action': 'server_game_start_denied',
                'error': 'User not in any room'
            }))
            return
        room_id = self.room_id # 这里的room_id是房间号 而且此时的self是房主 即players_1
        room = room_states[room_id]
        
        if room_id not in room_locks:
            room_locks[room_id] = Lock()
        async with room_locks[room_id]:
            if room_id not in room_states:
                await self.send(json.dumps({
                    'action': 'server_game_start_denied',
                    'error': 'Room not exist'
                }))
                return
            if room['host_id'] != self.user_id:
                await self.send(json.dumps({
                    'action': 'server_game_start_denied',
                    'error': 'User is not the host'
                }))
                return
            if room['numbers'] < 2:
                await self.send(json.dumps({
                    'action': 'server_game_start_denied',
                    'error': 'Not enough players, at least 2 players: current players => ' + str(room['numbers'])
                }))
                return
            
            room['room_state'] = 'closed'
            room['game_queue'] = room['player_ids'][:]
            room['game_times'] = len(room['player_ids']) - 1
            await self.send(json.dumps({
                'action': 'server_game_start_success'
            }))
            
        
            # 使用 asyncio.create_task() 来并行地启动游戏
            game_tasks = []

            # while room['game_times'] > 0:
            #     while len(room['game_queue']) >= 2:
            #         player1 = room['game_queue'].pop(0)
            #         player2 = room['game_queue'].pop(0)
            #         game_task = asyncio.create_task(self.start_game(player1, player2))
            #         game_tasks.append(game_task)

            #     # 等待所有游戏任务完成
            #     if game_tasks:
            #         done, pending = await asyncio.wait(game_tasks, return_when=asyncio.FIRST_COMPLETED)
            #         game_tasks = list(pending)
            #         for finished_game in done:
            #             await finished_game
                                
            # while room['game_times'] > 0 :
            #     while len(room['game_queue']) >= 2:
            #         player1 = room['game_queue'].pop(0)
            #         player2 = room['game_queue'].pop(0)
            #         await self.start_game(player1, player2)
    
            while room['game_times'] != 0:
                player1 = room['game_queue'].pop(0)
                player2 = room['game_queue'].pop(0)
                
                game_task = asyncio.create_task(self.start_game(player1, player2))
                game_tasks.append(game_task)
                
            if game_tasks:
                done, pending = await asyncio.wait(game_tasks, return_when=asyncio.FIRST_COMPLETED)
                game_tasks = list(pending)
                for finished_game in done:
                    await finished_game
            
            results = room['result']
            for player_id in room['player_ids']:
                if player_id in connected_users_id:
                    await connected_users_id[player_id].send(json.dumps({
                        'action': 'server_game_over',
                        'result': results,
                        'msg': 'Game Over'
                    }))
                    
            #////////////////////////////////////////////////////////////////
            # del room_states[room_id]
            # for player_id in room['player_ids']:
            #     if player_id in connected_users_id:
            #         player_id.room_id = None
            #         del rooms[player_id]
            #////////////////////////////////////////////////////////////////
                    
        
    async def get_room_list_by_id(self):
        if self.room_id is None:
            await self.send(json.dumps({
                'action': 'server_room_list_error',
                'error': 'User not in any room'
            }))
            return
        await self.send(json.dumps({
            'action': 'server_room_list',
            'room_list': room_states[self.room_id]
        }))
    async def get_all_rooms(self):
        await self.send(json.dumps({
            'action': 'server_all_rooms',
            'room_list': room_states
        }))
        
    # async def leave_room(self, room_id):
    #     if room_id in room_states:
    #         if room_states[room_id]['room_state'] == 'open':
    #             if room_states[room_id]['host_id'] == self.user_id:
    #                 for i in range(1, room_states[room_id]['numbers'] + 1):
    #                     if f'players_{i}' in room_states[room_id]:
    #                         player = connected_users_id[room_states[room_id][f'players_{i}']]
    #                         await player.send(json.dumps({
    #                             'action': 'server_room_deleted',
    #                         }))
    #                         del rooms[player.user_id]
    #                 del room_states[room_id]
    #                 del rooms[self.user_id]
    #                 await self.send(json.dumps({
    #                     'action': 'server_room_deleted',
    #                 }))
    #             else:
    #                 for i in range(1, room_states[room_id]['numbers'] + 1):
    #                     if f'players_{i}' in room_states[room_id] and room_states[room_id][f'players_{i}'] == self.user_id:
    #                         del room_states[room_id][f'players_{i}']
    #                         del rooms[self.user_id]
    #                         room_states[room_id]['numbers'] -= 1
    #                         await self.send(json.dumps({
    #                             'action': 'server_room_left_success',
    #                         }))
    #                     else:
    #                         await self.send(json.dumps({
    #                             'action': 'server_room_left_error',
    #                         }))
    #         else:
    #             await self.send(json.dumps({
    #                 'action': 'server_room_left_denied',
    #             }))
    #     else:
    #         await self.send(json.dumps({
    #             'action': 'server_room_not_exist'
    #         }))
 
        