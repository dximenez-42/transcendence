# this file contains the game logic

import json
import asyncio
import math
from asyncio import Lock
from games_app.extra.utiles import *



TABLE_HEIGHT = 100
TABLE_LENGTH = 200
PAD_LENGTH = 30
PAD_WIDTH = 10
BALL_RADIUS = 4
GAME_TIME = 150
FPS = 60
connected_users_id = {} # user_id: websocket
# history = {} # user_id: user_name
game_states = {} # game_id: {ball_x, ball_y, ball_speed_x, ball_speed_y, pad_1, pad_2, score_1, score_2, running}
games = {} # user_id: game_id
room_states = {} # room_id: {host_id, player_id1, player_id2...}
rooms = {} # user_id: room_id
room_locks = {} # room_id: Lock
# connected_lock = Lock()

async def start_room(room_id):
    
	await spread_room_msg (room_id, {
		'action': 'server_game_started_waiting',
	})

	room = room_states[room_id]
	# Start games in parallel
	while True:
		game_tasks = []
		print('==================start match games circle start==================')
		await asyncio.sleep(3)
		while len(room['game_queue']) >= 2:
			
			# print ('inicio of the circle => current game queue:', room['game_queue'])
			player1_id = room['game_queue'].pop(0)
			player2_id = room['game_queue'].pop(0)
			game_task = asyncio.create_task(start_game_1v1(player1_id, player2_id))
			game_tasks.append(game_task)
			# print ('end of the circle => current game queue:', room['game_queue'])
			
		print("wait the target to finish")
		# Wait for all games to complete
		if game_tasks:
			await asyncio.gather(*game_tasks)
		
		print('start match games circle end ready to check if continue the circle') 
		if len(room['game_queue']) == 0:
			print ('room state:', room['room_state'])
			print ('game state:', room['game_queue'])
			print ('==================no more games to play, end circle==================')
			game_tasks = []
			break
		
	# print ('start_room_game_middle: <<<<<<<<', connected_users_id, '>>>>>>>>')
	# Notify tournament completion
	results = room['result']
	# async with Game.connected_lock:
	await spread_room_msg(room_id, {
		'action': 'server_game_over',
		'result': results,
	})
	for user_id in room['player_ids']:
		if user_id in connected_users_id :
			cur_user = connected_users_id[user_id]
			del rooms[user_id]

	del room_states[room_id]   # need to see if need to delete the room
									# when i commit this line, the code works fine
									# theritically, the room should be deleted after the game is over
	print ('start_room_game_end: <<<<<<<<', connected_users_id, '>>>>>>>>')


async def start_game_1v1(player1_id, player2_id):
	try:
		# async with connected_lock:
		if player1_id not in connected_users_id  or player2_id not in connected_users_id :
			print(f"{player1_id} or {player2_id} not in connected_users_id")
			print(connected_users_id)
			return # no need to return, just continue the game, when we need to delete it, then delete it
		if player1_id not in rooms or player2_id not in rooms:
			print(f"{player1_id} or {player2_id} not in rooms")
			print(rooms)
			return

		game_id = generate_unique_id()
		games[player1_id] = game_id
		games[player2_id] = game_id
		room_id = rooms[player1_id]

		player1 = connected_users_id [player1_id]
		player2 = connected_users_id [player2_id]
  
		# Send match information to both players
		if player1_id in connected_users_id :
			try:
				await player1.send(text_data=json.dumps({
					'action': 'server_game_matched',
					'opp_name': player2.user_name,
					'opp_id': player2.user_id,
					'game_id': game_id,
				}))
			except Exception as e:
				print(f"Error in start_game to player1: {e}")
		if player2_id in connected_users_id :
			try:
				await player2.send(text_data=json.dumps({
					'action': 'server_game_matched',
					'opp_name': player1.user_name,
					'opp_id': player1.user_id,
					'game_id': game_id,
				}))
			except Exception as e:
				print(f"Error in start_game to player2: {e}")

		# Initialize game state
		game_states[game_id] = {
			'ball_x': 0, 'ball_y': 0,
			'ball_speed_x': 1.5,
			'ball_speed_y': 1.5,
			'pad_' + player1.user_name: 0,
			'pad_' + player2.user_name: 0,
			'score_' + player1.user_name: 0,
			'score_' + player2.user_name: 0,
			'running': True,
			'winner_id': None,
			'winner': None,
			'game_id': game_id,
			'user1_name': player1.user_name,
			'user2_name': player2.user_name,
			'user1_id': player1.user_id,
			'user2_id': player2.user_id,
			'room_id': room_id
		}

		# Start ball movement without awaiting it
		asyncio.create_task(start_ball_movement(game_id))

		# Wait for game completion
		while game_id in game_states and game_states[game_id]['running']:
			await asyncio.sleep(0.1)

	except Exception as e:
		print(f"Error in start_game: {e}")
		raise


async def start_ball_movement(game_id):
	try:
		
		host_name = game_states[game_id]['user1_name']
		oppo_name = game_states[game_id]['user2_name']
		
		while game_id in game_states and game_states[game_id]['running']:
			game_state = game_states[game_id]
			ball_x = game_state['ball_x']
			ball_y = game_state['ball_y']
			ball_speed_x = game_state['ball_speed_x']
			ball_speed_y = game_state['ball_speed_y']
		
			# Update ball position
			new_ball_x = ball_x + ball_speed_x
			new_ball_y = ball_y + ball_speed_y
			collisionBuffer = BALL_RADIUS + ball_speed_x * 0.1 
			radiusBuffer = BALL_RADIUS + ball_speed_y * 0.1 

			if new_ball_x < -TABLE_LENGTH / 2 + PAD_WIDTH + collisionBuffer:  # Check player 1 paddle
				pad_top = game_state['pad_' + host_name] + PAD_LENGTH / 2
				pad_bottom = game_state['pad_' + host_name] - PAD_LENGTH / 2
				if pad_bottom - radiusBuffer <= new_ball_y <= pad_top + radiusBuffer:
					collide_point = new_ball_y - game_state['pad_' + host_name]
					normalized_collide_point = collide_point / (PAD_LENGTH / 2)
					# angle = normalized_collide_point * (math.pi / 2.5)
					angle = math.pi / 3
					speed = math.sqrt(ball_speed_x**2 + ball_speed_y**2) + 0.1
					game_state['ball_speed_x'] = abs(speed * math.cos(angle))
					game_state['ball_speed_y'] = speed * math.sin(angle)
				else:
					game_state['score_' + oppo_name] += 1
					new_ball_x = 0
					new_ball_y = 0
					await reset_ball(game_state)
					continue

			if new_ball_x > TABLE_LENGTH / 2 - PAD_WIDTH - collisionBuffer:  # Check player 2 paddle
				pad_top = -game_state['pad_' + oppo_name] + PAD_LENGTH / 2
				pad_bottom = -game_state['pad_' + oppo_name] - PAD_LENGTH / 2
				if pad_bottom - radiusBuffer <= new_ball_y <= pad_top + radiusBuffer:
					collide_point = new_ball_y - game_state['pad_' + oppo_name]
					normalized_collide_point = collide_point / (PAD_LENGTH / 2)
					# angle = normalized_collide_point * (math.pi / 2.5)
					angle = math.pi / 3
					speed = math.sqrt(ball_speed_x**2 + ball_speed_y**2) + 0.1
					game_state['ball_speed_x'] = -abs(speed * math.cos(angle))
					game_state['ball_speed_y'] = speed * math.sin(angle)
				else:
					game_state['score_' + host_name] += 1
					new_ball_x = 0
					new_ball_y = 0
					await reset_ball(game_state)
					continue

			# Check table boundaries
			if new_ball_y > TABLE_HEIGHT / 2 - collisionBuffer or new_ball_y < -TABLE_HEIGHT / 2 + collisionBuffer:
				game_state['ball_speed_y'] *= -1

			# Check game end condition
			if game_state['score_' + host_name] >= 5 or game_state['score_' + oppo_name] >= 5:
				await end_game(game_id)
				break

			# Update ball position
			game_state['ball_x'] += game_state['ball_speed_x']
			game_state['ball_y'] += game_state['ball_speed_y']

			# Broadcast new positions
			await broadcast_position(game_id)

			await asyncio.sleep(1 / FPS)

	except Exception as e:
		print(f"Error in ball movement: {e}")
		if game_id in game_states:
			await end_game(game_id)


async def reset_ball(game_state):
    
	try:
		game_state['ball_x'] = 0
		game_state['ball_y'] = 0
		# game_state['ball_speed_x'] = random.choice([1, -1]) * (1 + random.random() * 0.5)  # don't need to randomize the speed
		# game_state['ball_speed_y'] = random.choice([1, -1]) * (1 + random.random() * 0.5)
		await broadcast_position(game_state['game_id'])
		# await asyncio.sleep(1) # if delay the reset ball, the ball will have lagging effect, maybe because of the async nature of the function
	except Exception as e:
		print(f"Error in reset_ball: {e}")
	
	
async def broadcast_position(game_id):
    
	try:
		game_state = game_states[game_id]
		player1_id = game_state['user1_id']
		player2_id = game_state['user2_id']
		player1_name = game_state['user1_name']
		player2_name = game_state['user2_name']

		# send the ball position to both players
		# async with connected_lock:
		if player1_id in connected_users_id :
			player1 = connected_users_id [player1_id]
			try:
				await player1.send(text_data=json.dumps({
					'action': 'server_update_position',
					'ball_x': game_state['ball_x'],
					'ball_y': game_state['ball_y'],
					'score_' + player1_name: game_state['score_' + player1_name],
					'score_' + player2_name: game_state['score_' + player2_name],
					'pad_' + player1_name: game_state['pad_' + player1_name],
					'pad_' + player2_name: game_state['pad_' + player2_name],
					'user1_name': player1_name,
					'user2_name': player2_name,
					'game_id': game_id
				}))
			except Exception as e:
				print(f"Error in broadcast_position to player1: {e}")
		# async with connected_lock:
		if player2_id in connected_users_id :
			player2 = connected_users_id [player2_id]
			try:
				await player2.send(text_data=json.dumps({
					'action': 'server_update_position',
					'ball_x': -game_state['ball_x'],
					'ball_y': -game_state['ball_y'],
					'score_' + player2_name: game_state['score_' + player2_name],
					'score_' + player1_name: game_state['score_' + player1_name],
					'pad_' + player2_name: game_state['pad_' + player2_name],
					'pad_' + player1_name: game_state['pad_' + player1_name],
					'user1_name': player1_name,
					'user2_name': player2_name,
					'game_id': game_id
				}))
			except Exception as e:
				print(f"Error in broadcast_position to player2: {e}")
	except Exception as e:
		print(f"Error in broadcast_position: {e}")


async def end_game(game_id):

	try:
		winner_id = None
		loser_id = None
		loser = None
		if game_id in game_states:
			game_states[game_id]["running"] = False
			print("================Game Over ================")
			print(game_states[game_id]['running'])
			user1_name = game_states[game_id]['user1_name']
			user2_name = game_states[game_id]['user2_name']
			if game_states[game_id]['score_' + user1_name] > game_states[game_id]['score_' + user2_name]:
				game_states[game_id]['winner'] = user1_name
				winner_id = game_states[game_id]['user1_id']
				loser_id = game_states[game_id]['user2_id']
			else:
				game_states[game_id]['winner'] = user2_name
				winner_id = game_states[game_id]['user2_id']
				loser_id = game_states[game_id]['user1_id']
			
			room_id = game_states[game_id]['room_id']
			
			if room_id in room_states:
				room = room_states[room_id]
				room['result'].append({          
					user1_name: game_states[game_id]['score_' + user1_name],
					user2_name: game_states[game_id]['score_' + user2_name],
					'winner': game_states[game_id]['winner'],
					'winner_id': winner_id
				})
				room['game_times'] -= 1
				if room['game_times'] != 0:
					room['game_queue'].append(winner_id)
			
			if loser_id in connected_users_id :
				loser = connected_users_id [loser_id]
				try:
					await loser.send(json.dumps({
					'action': 'server_game_waiting_result',
					'winner': game_states[game_id]['winner'],
					'msg': 'Waiting for the result of the tournament',
					}))
				except Exception as e:
					print(f"Error in end_game to loser: {e}")
     
			if winner_id in connected_users_id :
				winner = connected_users_id [winner_id]
				try:
					await winner.send(json.dumps({
					'action': 'server_game_seek_battle',
					'winner': game_states[game_id]['winner'],
					'msg': 'You are the winner of this game',
					}))
				except Exception as e:
					print(f"Error in end_game to winner: {e}")
     
			if game_id in game_states:
				del game_states[game_id]
			
			if winner_id in games:
				del games[winner_id]
			if loser_id in games:
				del games[loser_id]
			print('game ended connected_users_id:  ', connected_users_id)
	except Exception as e:
		print(f"Error in end_game: {e}")
	

		
async def spread_room_msg(room_id, msg):
    
	try:
		# async with connected_lock:
		if room_id in room_states:
			room = room_states[room_id]
			for player_id in room['player_ids']:
				if player_id in connected_users_id:
					player_ws = connected_users_id[player_id]
					try:
						await player_ws.send(json.dumps(msg))
					except Exception as e:
						print(f"Error in spread_room_msg to player: {e}")
				else:
					print(f"player_id not in connected_users_id: {player_id}")
	except Exception as e:
		print(f"Error in spread_room_msg: {e}")
  
  
async def spread_msg(msg):
	
	print(f"spread_msg: {msg}")
	try:
		# async with connected_lock:
		for player_id in connected_users_id:
			print(f"player_id: {player_id}")
			player_ws = connected_users_id[player_id]
			try:
				await player_ws.send(json.dumps(msg))
			except Exception as e:
				print(f"Error in spread_msg to player: {e}")
	except Exception as e:
		print(f"Error in spread_msg: {e}")
				
async def rejoin_game_set(ws): # in this func need to consider more situation like the game is not started yet
							   # or the game is already ended
	try:
		# this sleep is for waiting the front to load successfully the game page
		await asyncio.sleep(1)
		opp_name = None
		opp_id = None
		game_id = None
		# if ws.user_id in rooms:
		# 	room_id = rooms[ws.user_id]
		# 	ws.room_id = room_id
		if ws.user_id in games:
			game_id = games[ws.user_id]
			if game_id in game_states:
				game_state = game_states[game_id]
				if game_state['running']:
					opp_id = game_state['user1_id'] if game_state['user1_id'] != ws.user_id else game_state['user2_id']
					opp_name = game_state['user1_name'] if game_state['user1_id'] != ws.user_id else game_state['user2_name']
					# ws.game_id = game_id
					# ws.opp_id = opp_id
					# ws.opp_name = opp_name
					
					# await asyncio.sleep(2)
				try:
					await ws.send(json.dumps({
						'action': 'server_game_matched',
						'opp_name': opp_name,
						'opp_id': opp_id,
						'game_id': game_id,
					}))
				except Exception as e:
					print(f"Error in rejoin_game_set to player: {e}")
		elif ws.user_id in rooms:
			room_id = rooms[ws.user_id]
			if room_id in room_states:
				room = room_states[room_id]
				try:
					await ws.send(json.dumps({
						'action': 'server_game_waiting_result',
						'msg': 'Waiting for the result of the tournament',
					}))
				except Exception as e:
					print(f"Error in rejoin_game_set to player: {e}")
		else:
			return
	except Exception as e:
		print(f"Error in rejoin_game_set: {e}")
  
async def handle_move_pad(data_json):
        if data_json['game_id'] in game_states:
            print ('handle_move_pad called successfully')
            game_state = game_states[data_json['game_id']]
            newPosition = game_state['pad_' + data_json['user_name']] + data_json['pad_y']
            if (newPosition + PAD_LENGTH / 2) > TABLE_HEIGHT / 2:
                newPosition = TABLE_HEIGHT / 2 - PAD_LENGTH / 2
            if (newPosition - PAD_LENGTH / 2) < -TABLE_HEIGHT / 2:
                newPosition = -TABLE_HEIGHT / 2 + PAD_LENGTH / 2
            game_state['pad_' + data_json['user_name']] = newPosition
			
