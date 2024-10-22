import json
import random
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone
import threading
import uuid
import time


TABLE_HEIGHT = 100
TABLE_LENGTH = 200
PAD_LENGTH = 30
PAD_WIDTH = 10
BALL_RADIUS = 4
GAME_TIME = 150
connected_users = {}
waiting_1v1_room = []
game_states = {}
games = {}

game_lock = threading.Lock()

def generate_unique_id():
    return str(uuid.uuid4())

class GamesConsumer(WebsocketConsumer):
    def connect(self):
        try:
            
            self.user_name = self.scope['url_route']['kwargs']['user_name']  # room_type 1v1 or 4v4
            self.user_id = self.scope['url_route']['kwargs']['user_id']  # user_id

            self.accept()
            connected_users[self.user_id] = self
            
            self.send(text_data=json.dumps({
                'action': 'server_confirm_connection',
                'user_name': self.user_name,
                'user_id': self.user_id
            }))
        except Exception as e:
            print(e)

    # def disconnect(self, close_code):
    #     try:
    #         if self.room_type == '1v1':
    #             if self in waiting_1v1_room:
    #                 waiting_1v1_room.remove(self)  # remove player from waiting room
    #         elif self.room_type == '4v4':
    #             # remove player from 4v4 room
    #             for room_id, players in rooms_4v4.items():
    #                 if self in players:
    #                     players.remove(self)
    #                     break
    #     except Exception as e:
    #         print(e)

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
                    self.handle_match_request(text_data_json['is_tournament'])
                    # if text_data_json['is_tournament'] == False :
                    #     if len(waiting_1v1_room) == 1:
                    #         self.opp_name = waiting_1v1_room[0].user_name
                    #         self.opp_id = waiting_1v1_room[0].user_id
                    #         waiting_1v1_room[0].opp_id = self.user_id
                    #         waiting_1v1_room[0].opp_name = self.user_name
                            
                    #         waiting_1v1_room[0].send(text_data=json.dumps({
                    #             'action': 'server_game_matched',
                    #             'opp_name': self.user_name,
                    #             'opp_id': self.user_id,
                    #             'is_tournament': False
                    #         }))
                    #         self.send(text_data=json.dumps({
                    #             'action': 'server_game_matched',
                    #             'opp_name': waiting_1v1_room[0].user_name,
                    #             'opp_id': waiting_1v1_room[0].user_id,
                    #             'is_tournament': False
                    #         }))
                    #         waiting_1v1_room.pop()
                    #     else:
                    #         waiting_1v1_room.append(self)
                    #         self.send(text_data=json.dumps({
                    #             'action': 'server_game_waiting',
                    #             'is_tournament': False
                    #         }))
                case 'client_update_position':
                    if 'to_user_id' in text_data_json:
                        if text_data_json['to_user_id'] in connected_users:
                            connected_users[text_data_json['to_user_id']].send(text_data=json.dumps({
                                'action': 'server_update_position',
                                'ball_x': text_data_json['ball_x'],
                                'ball_y': text_data_json['ball_y'],
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
                case 'client_move_pad':
                    with game_lock:
                        if text_data_json['game_id'] in game_states:
                            game_state = game_states[text_data_json['game_id']]
                            game_state['pad_' + text_data_json['user_name']] = text_data_json['pad_y']
        except Exception as e:
            print(e)
    
    
            
    def handle_match_request(self, is_tournament):
    
        if not is_tournament:
            if len(waiting_1v1_room) == 1:
                opp = waiting_1v1_room.pop()
                game_id = generate_unique_id()
                opp.game_id = game_id
                self.game_id = game_id
                self.opp_id = opp.user_id
                self.opp_name = opp.user_name
                opp.opp_id = self.user_id
                opp.opp_name = self.user_name
                
                opp.send(text_data=json.dumps({
                    'action': 'server_game_matched',
                    'opp_name': self.user_name,
                    'opp_id': self.user_id,
                    'game_id': game_id,
                    'is_tournament': False
                }))
                self.send(text_data=json.dumps({
                    'action': 'server_game_matched',
                    'opp_name': opp.user_name,
                    'opp_id': opp.user_id,
                    'game_id': game_id,
                    'is_tournament': False
                }))
  
                self.start_game(opp)
            else:
                waiting_1v1_room.append(self)
                self.send(text_data=json.dumps({
                    'action': 'server_game_waiting',
                    'is_tournament': False
                }))

    def start_game(self, opp):
        
        game_states[self.game_id] = {
            
            'ball_x': 0, 'ball_y': 0,
            'ball_speed_x': 1,
            'ball_speed_y': 1,
            'pad_' + self.user_name: 0,
            'pad_' + opp.user_name: 0,
            'score_' + self.user_name: 0,
            'score_' + self.opp_name: 0,
            'running': True,
            'is_tournament': False
        }
        
        games[self.user_id] = self.game_id
        games[self.opp_id] = self.game_id
         
        self.start_ball_movement(self.game_id)
    
    def start_ball_movement(self, game_id):
        def move_ball():
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

                    # 碰撞检测（边界检测）
                    if new_ball_y > TABLE_HEIGHT / 2 - BALL_RADIUS or new_ball_y < -TABLE_HEIGHT / 2 + BALL_RADIUS:
                        game_state['ball_speed_y'] *= -1

                    # 检测与玩家的碰撞
                    if new_ball_x < -TABLE_LENGTH / 2 + PAD_WIDTH + BALL_RADIUS:  # 玩家1的边界
                        if abs(game_state['pad_' + self.user_name] - new_ball_y) < PAD_LENGTH / 2 - BALL_RADIUS:
                            game_state['ball_speed_x'] *= -1
                        else:
                            game_state['score_' + self.opp_name] += 1
                            self.reset_ball(game_state)

                    if new_ball_x > TABLE_LENGTH / 2 - PAD_WIDTH - BALL_RADIUS:  # 玩家2的边界
                        if abs(game_state['pad_' + self.opp_name] - new_ball_y) < PAD_LENGTH / 2 - BALL_RADIUS:
                            game_state['ball_speed_x'] *= -1
                        else:
                            game_state['score_' + self.user_name] += 1
                            self.reset_ball(game_state)
                    
                    if game_state['score_' + self.user_name] > 5 or game_state['score_' + self.opp_name] > 5:
                        # self.send(json.dumps({
                        
                        #     'score_' + self.user_name: game_state['score_' + self.user_name],
                        #     'score_' + self.opp_name: game_state['score_' + self.opp_name],
                        # }))
                        self.end_game(self.game_id)
                        break
                    game_state['ball_x'] = new_ball_x
                    game_state['ball_y'] = new_ball_y

                    # 广播球的位置和分数给两个玩家
                    
                    self.broadcast_position(game_id)

                    time.sleep(1 / 60)  # 每秒60次更新
                except Exception as e:
                    self.send(json.dumps({
                        'error': str(e)
                    }))
        # 启动球的移动线程
        threading.Thread(target=move_ball, daemon=True).start()
        
    def reset_ball(self, game_state):
        game_state['ball_x'] = 0
        game_state['ball_y'] = 0
        game_state['ball_speed_x'] = random.choice([1, -1]) * (1 + random.random() * 0.5)  # 随机初始速度
        game_state['ball_speed_y'] = random.choice([1, -1]) * (1 + random.random() * 0.5)
        time.sleep(1)
        
    def broadcast_position(self, game_id):
        game_state = game_states[game_id]

        # 广播给当前玩家和对手玩家
        if self.user_id in connected_users:
            connected_users[self.user_id].send(text_data=json.dumps({
                'action': 'server_update_position',
                'ball_x': game_state['ball_x'],
                'ball_y': game_state['ball_y'],
                'score_' + self.user_name: game_state['score_' + self.user_name],
                'score_' + self.opp_name: game_state['score_' + self.opp_name],
                'pad_' + self.user_name: game_state['pad_' + self.user_name],
                'pad_' + self.opp_name: game_state['pad_' + self.opp_name]
            }))

        if self.opp_id in connected_users:
            connected_users[self.opp_id].send(text_data=json.dumps({
                'action': 'server_update_position',
                'ball_x': game_state['ball_x'],
                'ball_y': game_state['ball_y'],
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

    def end_game(self, game_id):
        if game_id in game_states:
            game_states[game_id]["running"] = False
            del game_states[game_id]
            self.send(json.dumps({
                'action': 'server_game_over',
                'is_tournament': False
            }))
            connected_users[self.opp_id].send(json.dumps({
                'action': 'server_game_over',
                'is_tournament': False
            }))
            