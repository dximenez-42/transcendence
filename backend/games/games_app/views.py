from django.shortcuts import render

import os

from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
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
    if Game.objects.filter(host_id=request.user.id, status='open').count() >= 5:
        return JsonResponse({'error': 'User cannot host more than 5 games.'}, status=400)

    game = True
    while game:
        room_id = ''.join(random.choice(string.ascii_uppercase) for i in range(8))
        game = Game.objects.filter(room_id=room_id).exists()

    game = Game.objects.create(
        host_id=request.user.id,
        room_id=room_id,
        tournament_id=None,
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
    }, status=201)



@api_view(['GET'])
def list(request):
    games = Game.objects.all().filter(status='open', tournament_id=None)

    data = []
    for game in games:
        username = User.objects.get(id=game.host_id).username
        players = GamePlayer.objects.filter(game_id=game.id).count()
        joined = GamePlayer.objects.filter(game_id=game.id, player_id=request.user.id).exists()

        data.append({
            'game_id': game.id,
            'room_id': game.room_id,
            'host_username': username,
            # 'status': game.status,
            'players': players,
            'joined': joined,
            'is_host': game.host_id == request.user.id,
        })

    return JsonResponse({
        'data': data
    }, status=200)



@api_view(['POST'])
def join(request, id):
    if not Game.objects.filter(id=id).exists():
        return JsonResponse({'error': 'Game not found.'}, status=404)

    # Check if game is open
    game = Game.objects.get(id=id)
    if game.status != 'open':
        return JsonResponse({'error': 'Game is not open.'}, status=400)

    if game.tournament_id is not None:
        return JsonResponse({'error': 'Game is part of a tournament.'}, status=400)

    # Check if player is already in game
    if GamePlayer.objects.filter(game_id=game.id, player_id=request.user.id).exists():
        return JsonResponse({'error': 'Player already in game.'}, status=400)

    # Check if game is full
    if GamePlayer.objects.filter(game_id=game.id).count() >= 2:
        return JsonResponse({'error': 'Game is full.'}, status=400)

    game_player = GamePlayer.objects.create(
        game_id=game.id,
        player_id=request.user.id
    )
    if not game_player:
        return JsonResponse({'error': 'Error creating game player.'}, status=500)

    return JsonResponse({
        'game_id': game.id,
        'room_id': game.room_id,
    }, status=200)



@api_view(['PUT'])
def start(request, id):
    if not Game.objects.filter(id=id).exists():
        return JsonResponse({'error': 'Game not found.'}, status=404)

    game = Game.objects.get(id=id)
    if game.status == 'ready':
        return JsonResponse({'error': 'Game is already ready.'}, status=400)
    if game.status != 'open':
        return JsonResponse({'error': 'Game is not open.'}, status=400)

    if game.host_id != request.user.id:
        return JsonResponse({'error': 'Only the host can start the game.'}, status=400)
    
    if GamePlayer.objects.filter(game_id=game.id).count() < 2:
        return JsonResponse({'error': 'Game is not full.'}, status=400)

    game.status = 'ready'
    game.save()

    return JsonResponse({
        'game_id': game.id  # TODO: Return game socket
    }, status=200)



@api_view(['DELETE'])
def leave(request, id):
    game = Game.objects.filter(id=id).first()
    if not game:
        return JsonResponse({'error': 'Game not found.'}, status=404)

    game_player = GamePlayer.objects.filter(game_id=game.id, player_id=request.user.id).first()
    if not game_player:
        return JsonResponse({'error': 'Player not in game.'}, status=400)

    if game.status != 'open':
        return JsonResponse({'error': 'Cannot leave game.'}, status=400)

    if game_player.player_id == game.host_id:
        if GamePlayer.objects.filter(game_id=game.id).count() > 1:
            return JsonResponse({'error': 'Game must be empty for the host to leave.'}, status=400)
        game_player.delete()
        game.delete()
        return JsonResponse({
            'message': 'Game deleted.'
        }, status=200)
    else:
        game_player.delete()

    return JsonResponse({
        'message': 'Player left the game.'
    }, status=200)
