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
import games_app.extra.game as Game


# game_lock = threading.Lock() # not needed
class GamesConsumer(AsyncWebsocketConsumer):
    async def connect(self):

        try:
            
            self.user_name = self.scope['url_route']['kwargs']['user_name']  # user_name
            self.user_id = self.scope['url_route']['kwargs']['user_id']  # user_id (token)

            await self.accept()
            
            # if self.user_id not in Game.history:
            #     Game.history[self.user_id] = self.user_name
            # asyncio.create_task(Game.rejoin_game_set(self))
            # async with Game.connected_lock:
            if self.user_id in Game.connected_users_id :
                del Game.connected_users_id [self.user_id]
            Game.connected_users_id [self.user_id] = self
            print ('== > connected_users_id:', Game.connected_users_id)
            await Game.rejoin_game_set(self)
            
            await self.send(text_data=json.dumps({
                'action': 'server_confirm_connection',
                'user_name': self.user_name,
                'user_id': self.user_id
            }))
        except Exception as e:
            print(e)

    async def disconnect(self, close_code):
        
        try:
            # async with Game.connected_lock:
            # if self.user_id in Game.connected_users_id :     # the bug is here, now it is fixed, those two lines are not needed
            #     del Game.connected_users_id [self.user_id]   # the thing is that we are not sure the order of the disconnect func in
                                                               # async tasks, it may have resourse risk whitch may cause that 
                                                               # when host wanna restart a game in new room, the user is not in the
                                                               # connected_users_id. So this part will be realized in `connect` func
            print ('user disconnect ! == > ', self.user_name)
            if self.user_id in Game.rooms:
                room_id = Game.rooms[self.user_id]
                if room_id in Game.room_states:
                    room = Game.room_states[room_id]
                    if room['room_state'] == 'open':
                        await self.leave_room()
        except Exception as e:
            print("disconnect error: ", e)

    async def receive(self, text_data): 
        try:
            text_data_json = json.loads(text_data)
            if 'action' not in text_data_json:
                return
            print ('test_data_json:', text_data_json) 
            match text_data_json['action']:
                
                case 'ping':
                    await self.send(text_data=json.dumps({'action': 'pong',}))
                case 'client_move_pad':
                    print ('handle_move_pad:', text_data_json['user_name'])
                    await Game.handle_move_pad(text_data_json)
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
                # case 'test_game_list':
                #     await self.test_game_list()
        except json.JSONDecodeError:
            print('json.JSONDecodeError')
        except Exception as e:
            print(e)
    
    async def create_room(self):
        
        if self.user_id in Game.rooms:
            room_id = Game.rooms[self.user_id]
            async with Game.room_locks[room_id]:
                if room_id in Game.room_states:
                    await self.send(json.dumps({
                        'action': 'server_room_created_denied',
                        'error': 'User already in a room'
                    }))
                    return
        room_id = generate_unique_id()
        if room_id not in Game.room_locks:
            Game.room_locks[room_id] = Lock()
        # self.room_id = room_id
        async with Game.room_locks[room_id]:
            Game.rooms[self.user_id] = room_id
            Game.room_states[room_id] = {
                'host_id': self.user_id,
                'host_name': self.user_name,
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
        # ///////////////////////////////////////////////////
        await Game.spread_msg ({
            'action': 'server_room_list_update',
            'room_list': Game.room_states
        })
        # ///////////////////////////////////////////////////
    
    # need to discuss if is needed to spread the message to all users in the room
    # if is needed, this func need to write a new part to spread the message
    async def join_room(self, data_json): 
        if 'room_id' not in data_json:    
            await self.send(json.dumps({
                'action': 'server_room_joined_denied',
                'error': 'Room id not provided'
            }))
            return
        if self.user_id in Game.rooms:
            room_id = Game.rooms[self.user_id]
            async with Game.room_locks[room_id]:
                if room_id in Game.room_states:
                    await self.send(json.dumps({
                        'action': 'server_room_joined_denied',
                        'error': 'User already in a room'
                    }))
                    return
        room_id = data_json['room_id']
        async with Game.room_locks[room_id]:
            if room_id in Game.room_states:
                room = Game.room_states[room_id]
                if room['room_state'] == 'open':
                    room['player_ids'].append(self.user_id)
                    room['numbers'] += 1
                    Game.rooms[self.user_id] = room_id
                    # self.room_id = room_id
                    await self.send(json.dumps({
                        'action': 'server_room_joined',
                        'room_id': room_id
                    }))
                    
                    # ///////////////////////////////////////////////////
                    await Game.spread_msg ({
                        'action': 'server_room_list_update',
                        'room_list': Game.room_states
                    })
                    # ///////////////////////////////////////////////////
                    
                else:
                    await self.send(json.dumps({
                        'action': 'server_room_joined_denied',
                        'error': 'Room is closed'
                    }))
            else:
                await self.send(json.dumps({
                    'action': 'server_room_joined_denied',
                    'error': 'Room not exist'
                }))
    
    async def leave_room(self):
        
        if self.user_id not in Game.rooms:
            await self.send(json.dumps({
                'action': 'server_room_left_error',
                'error': 'User not in any room'
            }))
            return
        if self.user_id in Game.rooms:
            room_id = Game.rooms[self.user_id]
            async with Game.room_locks[room_id]:
                if room_id not in Game.room_states:
                    await self.send(json.dumps({
                        'action': 'server_room_left_error',
                        'error': 'Room not exist'
                    }))
                    return
        room_id = Game.rooms[self.user_id]
        room = Game.room_states[room_id]
        async with Game.room_locks[room_id]:
            # 如果房间状态不是 'open'，则禁止离开
            # if the room is not open, then deny leaving
            if room['room_state'] != 'open':
                await self.send(json.dumps({
                    'action': 'server_room_left_error',
                    'error': 'Room is closed'
                }))
                return

            # 房主离开房间逻辑
            # host leave room logic
            if room['host_id'] == self.user_id:
                if room['numbers'] == 1:
                    del Game.rooms[self.user_id]
                    del Game.room_states[room_id]
                    # self.room_id = None
                    await self.send(json.dumps({
                        'action': 'server_room_left_success'
                    }))
                else:
                    room['player_ids'].remove(self.user_id)
                    room['numbers'] -= 1
                    del Game.rooms[self.user_id]
                    # self.room_id = None
                    room['host_id'] = room['player_ids'][0]
                    room['host_name'] = Game.connected_users_id[room['host_id']].user_name
                    await self.send(json.dumps({
                        'action': 'server_room_left_success'
                    }))
                    host_id = room['host_id']
                    # async with Game.connected_lock:
                    if host_id in Game.connected_users_id :
                        new_host = Game.connected_users_id [room['host_id']]
                        new_host.room_id = room_id
                        await new_host.send(json.dumps({
                            'action': 'server_room_new_host',
                            'host_id': room['host_id']
                        }))
            else:
                # 房间成员离开逻辑
                # room member leave logic
                room['player_ids'].remove(self.user_id)
                room['numbers'] -= 1
                del Game.rooms[self.user_id]
                # self.room_id = None
                await self.send(json.dumps({
                    'action': 'server_room_left_success'
                }))
                
        # ///////////////////////////////////////////////////
        await Game.spread_msg ({
            'action': 'server_room_list_update',
            'room_list': Game.room_states
        })
        # ///////////////////////////////////////////////////
        
    async def get_room_list_by_id(self):
        try:
            if self.user_id not in Game.rooms:
                await self.send(json.dumps({
                    'action': 'server_info_room_error',
                    'error': 'User not in any room'
                }))
                return
            info = None
            room_id = Game.rooms[self.user_id]
            async with Game.room_locks[room_id]:
                if room_id in Game.room_states:
                    info = Game.room_states[room_id]
                    await self.send(json.dumps({
                        'action': 'server_info_room',
                        'room_info': info
                    }))
                else:
                    print ('room_id:', room_id)
                    await self.send(json.dumps({
                        'action': 'server_info_room_error',
                        'error': 'Room not exist'
                    }))
        except Exception as e:
            print("get_room_list_by_id error: ", e)
    
    # this func used to get all rooms list     
    async def get_all_rooms(self):
        try:
            await self.send(json.dumps({
                'action': 'server_all_rooms',
                'room_list': Game.room_states
            }))
        except Exception as e:
            print("get_all_rooms error: ", e)
        

    async def start_room_game(self):
        try:
            print ('start_room_game_init: <<<<<<<<', Game.connected_users_id, '>>>>>>>>')
            if self.user_id not in Game.rooms:
                await self.send(json.dumps({
                    'action': 'server_game_start_denied',
                    'error': 'User not in any room'
                }))
                return
                
            room_id = Game.rooms[self.user_id]
            
            if room_id not in Game.room_states:
                await self.send(json.dumps({
                    'action': 'server_game_start_denied',
                    'error': 'Room not exist'
                }))
                return

            room = Game.room_states[room_id]
            
            if room['host_id'] != self.user_id:
                await self.send(json.dumps({
                    'action': 'server_game_start_denied',
                    'error': 'User is not the host'
                }))
                return
                
            if room['numbers'] < 2:
                await self.send(json.dumps({
                    'action': 'server_game_start_denied',
                    'error': 'Not enough players'
                }))
                return
            async with Game.room_locks[room_id]:
                # Initialize tournament
                room['room_state'] = 'closed'
                room['game_queue'] = room['player_ids'][:]
                room['game_times'] = len(room['player_ids']) - 1
            
                # await self.send(json.dumps({
                #     'action': 'server_game_start_success'
                # }))
                # ///////////////////////////////////////////////////
            await Game.spread_msg ({
                'action': 'server_room_list_update',
                'room_list': Game.room_states
            })
            # ///////////////////////////////////////////////////
            asyncio.create_task(Game.start_room(room_id))
        except Exception as e:
            print("start_room_game error: ", e)
    