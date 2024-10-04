# games_app/consumers.py
import json
import random
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    # 用于存储所有等待中的用户，实际使用中可以换成数据库
    # used to store all waiting users, in real world, you can use database
    waiting_users = []  
    # 存放用户和其对应的channel_name 
    # used to store user and its channel_name
    games_rooms = {}  
    # 存放游戏房间和其中的玩家
    # used to store game room and its players

    async def connect(self):
        self.room_id = "waiting_room"
        self.username = self.scope['user'].username
        self.user_id = self.scope['user'].id
        await self.accept()
        await self.add_to_waiting_room()

    async def add_to_waiting_room(self):
        # 将用户添加到等待列表
        # add user to waiting list
        GameConsumer.waiting_users.append((self.username, self.channel_name))
        await self.channel_layer.group_add(self.room_id, self.channel_name)
        
        # 检查是否可以匹配对战
        # check if can match players
        if len(GameConsumer.waiting_users) >= 2:
            await self.match_players()

    async def match_players(self):
        # 随机选择两个玩家
        # randomly select two players
        player1 = random.choice(GameConsumer.waiting_users)
        GameConsumer.waiting_users.remove(player1)
        player2 = random.choice(GameConsumer.waiting_users)
        GameConsumer.waiting_users.remove(player2)

        # 创建私人房间并将两名玩家加入
        # create private room and add two players
        room_id = f"game_room_{player1[0]}_{player2[0]}"
        GameConsumer.games_rooms[room_id] = (player1[1], player2[1])
        
        # 从等待房间移除，并加入新的游戏房间
        # remove from waiting room and add to new game room
        await self.channel_layer.group_discard(self.room_id, player1[1])
        await self.channel_layer.group_discard(self.room_id, player2[1])
        
        # 分配两个玩家到游戏房间
        # add two players to game room
        self.room_id = room_id
        await self.channel_layer.group_add(room_id, player1[1])
        await self.channel_layer.group_add(room_id, player2[1])

        # 发送初始化信息
        # send init info
        await self.send_init_info(room_id, player1, player2)

    async def send_init_info(self, room_id, player1, player2):
        # 向两个玩家分别发送初始化信息
        # send init info to two players
        for player, enemy in [(player1, player2), (player2, player1)]:
            await self.channel_layer.send(
                player[1],
                {
                    'type': 'init_info',
                    'room_id': room_id,
                    'playerName': player[0],
                    'enemyName': enemy[0]
                }
            )

    async def init_info(self, event):
        # 处理initInfo, 将信息发给前端
        await self.send(text_data=json.dumps({
            'action': 'initInfo',
            'playerName': event['playerName'],
            'enemyName': event['enemyName']
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'requestBattleInfo':
            await self.add_to_waiting_room()

        elif action == 'updatePadPosition':
            # 转发玩家位置数据给游戏房间中的其他玩家
            await self.channel_layer.group_send(
                self.room_id,
                {
                    'type': 'game_message',
                    'action': action,
                    'userId': data['userId'],
                    'x': data['x'],
                    'y': data['y']
                }
            )

        elif action == 'updateBallPosition':
            await self.channel_layer.group_send(
                self.room_id,
                {
                    'type': 'game_message',
                    'action': action,
                    'userId': data['userId'],
                    'x': data['x'],
                    'y': data['y']
                }
            )

        elif action == 'gameOver':
            await self.handle_game_over()

    async def game_message(self, event):
        # 转发位置更新消息
        await self.send(text_data=json.dumps({
            'action': event['action'],
            'userId': event['userId'],
            'x': event['x'],
            'y': event['y']
        }))

    async def handle_game_over(self):
        # 处理游戏结束，将玩家踢出房间
        # handle game over, kick players out of room
        if self.room_id in GameConsumer.games_rooms:
            player1_channel, player2_channel = GameConsumer.games_rooms.pop(self.room_id)
            await self.channel_layer.group_discard(self.room_id, player1_channel)
            await self.channel_layer.group_discard(self.room_id, player2_channel)

            await self.channel_layer.send(player1_channel, {"type": "game_end"})
            await self.channel_layer.send(player2_channel, {"type": "game_end"})

    async def game_end(self, event):
        # 通知前端游戏结束
        # notify frontend game over
        await self.send(text_data=json.dumps({
            'action': 'gameEnd'
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_id, self.channel_name)
        # 移除离开的用户
        GameConsumer.waiting_users = [user for user in GameConsumer.waiting_users if user[1] != self.channel_name]