from django.shortcuts import render

import os

from django.http import JsonResponse
from rest_framework.decorators import api_view
import requests

import json
from .models import User
from .models import Game
from .models import Tournament
from .models import GamePlayer

import random
import string

# Create your views here.
@api_view(['POST'])
def create(request):
    data = json.loads(request.body)

    if not all([data.get('host_id'), data.get('tournament')]) and (data.get('tournament') == True and not data.get('tournament_name')):
        return JsonResponse({'error': 'Missing required fields.'}, status=400)

    if not User.objects.filter(id=data['host_id']).exists():
        return JsonResponse({'error': 'User not found.'}, status=404)
    
    tournament_id = None

    if data['tournament'] == True:
        tournament = Tournament.objects.create(
            name=data['tournament_name'],
        )
        if not tournament:
            return JsonResponse({'error': 'Error creating tournament.'}, status=500)
        tournament_id = tournament.id

    letters = string.ascii_uppercase
    game = True

    while game:
        room_id = ''.join(random.choice(letters) for i in range(8))
        game = Game.objects.filter(room_id=room_id).first()

    game = Game.objects.create(
        host_id=data['host_id'],
        room_id=room_id,
        tournament_id=tournament_id,
    )
    if not game:
        return JsonResponse({'error': 'Error creating game.'}, status=500)
    
    game_player = GamePlayer.objects.create(
        game_id=game.id,
        player_id=game.host_id
    )
    if not game_player:
        return JsonResponse({'error': 'Error creating game player.'}, status=500)

    return JsonResponse({
        'game_id': game.id,
        'room_id': game.room_id,
    }, status=200)



@api_view(['GET'])
def list(request):
    games = Game.objects.all()

    data = []
    for game in games:
        username = User.objects.get(id=game.host_id).username

        data.append({
            'game_id': game.id,
            'room_id': game.room_id,
            'host_username': username,
            'status': game.status,
            'tournament_id': game.tournament_id,
        })

    return JsonResponse({'data': data}, status=200)



@api_view(['POST'])
def join(request):
    data = json.loads(request.body)

    if not all([data.get('game_id'), data.get('player_id')]):
        return JsonResponse({'error': 'Missing required fields.'}, status=400)

    if not Game.objects.filter(id=data['game_id']).exists():
        return JsonResponse({'error': 'Game not found.'}, status=404)

    if not User.objects.filter(id=data['player_id']).exists():
        return JsonResponse({'error': 'User not found.'}, status=404)

    game = Game.objects.get(id=data['game_id'])
    if game.status != 'open':
        return JsonResponse({'error': 'Game is not open.'}, status=400)

    if GamePlayer.objects.filter(game_id=game.id, player_id=data['player_id']).exists():
        return JsonResponse({'error': 'Player already in game.'}, status=400)

    game_player = GamePlayer.objects.create(
        game_id=game.id,
        player_id=data['player_id']
    )
    if not game_player:
        return JsonResponse({'error': 'Error creating game player.'}, status=500)

    return JsonResponse({
        'game_id': game.id,
        'room_id': game.room_id,
    }, status=200)



@api_view(['PUT'])
def start(request):
    data = json.loads(request.body)

    if not all([data.get('game_id'), data.get('player_id')]):
        return JsonResponse({'error': 'Missing required fields.'}, status=400)

    if not Game.objects.filter(id=data['game_id']).exists():
        return JsonResponse({'error': 'Game not found.'}, status=404)

    if not User.objects.filter(id=data['player_id']).exists():
        return JsonResponse({'error': 'User not found.'}, status=404)

    game = Game.objects.get(id=data['game_id'])
    if game.status != 'open':
        return JsonResponse({'error': 'Game is not open.'}, status=400)

    if game.host_id != data['player_id']:
        return JsonResponse({'error': 'Only the host can start the game.'}, status=400)

    game.status = 'ready'
    game.save()

    return JsonResponse({
        'game_id': game.id
    }, status=200)



@api_view(['DELETE'])
def leave(request):
    data = json.loads(request.body)

    if not all([data.get('game_id'), data.get('player_id')]):
        return JsonResponse({'error': 'Missing required fields.'}, status=400)

    if not Game.objects.filter(id=data['game_id']).exists():
        return JsonResponse({'error': 'Game not found.'}, status=404)

    if not User.objects.filter(id=data['player_id']).exists():
        return JsonResponse({'error': 'User not found.'}, status=404)

    game = Game.objects.get(id=data['game_id'])
    if game.status != 'open':
        return JsonResponse({'error': 'Cannot leave game.'}, status=400)

    game_player = GamePlayer.objects.filter(
        game_id=game.id,
        player_id=data['player_id']
    ).first()
    if not game_player:
        return JsonResponse({'error': 'Game player not found.'}, status=404)

    game_player.delete()

    return JsonResponse({
        'game_id': game.id
    }, status=200)