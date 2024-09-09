import os

from django.http import JsonResponse
from rest_framework.decorators import api_view

import json
from .models import User
from .models import Game
from .models import Tournament
from .models import GamePlayer
from .models import TournamentPlayer

import random
import string

# Create your views here.
@api_view(['POST'])
def create(request):
    body = json.loads(request.body)

    if not 'name' in body:
        return JsonResponse({'error': 'Name is required.'}, status=400)
    
    if not 'max_players' in body:
        return JsonResponse({'error': 'Max players is required.'}, status=400)
    
    if body['max_players'] < 3:
        return JsonResponse({'error': 'Max players must be at least 3.'}, status=400)

    if Tournament.objects.filter(host_id=request.user.id, status='open').count() >= 2:
        return JsonResponse({'error': 'User cannot host more than 2 tournaments.'}, status=400)
    
    tournament = True
    while tournament:
        room_id = ''.join(random.choice(string.ascii_uppercase) for i in range(8))
        tournament = Game.objects.filter(room_id=room_id).first()

    tournament = Tournament.objects.create(
        host_id=request.user.id,
        name=body['name'],
        max_players=body['max_players'],
        room_id=room_id,
    )
    if not tournament:
        return JsonResponse({'error': 'Error creating tournament.'}, status=500)
    
    tournament_player = TournamentPlayer.objects.create(
        tournament_id=tournament.id,
        player_id=tournament.host_id
    )
    if not tournament_player:
        return JsonResponse({'error': 'Error creating tournament player.'}, status=500)

    return JsonResponse({
        'tournament_id': tournament.id,
        'name': tournament.name,
        'max_players': tournament.max_players,
        'room_id': tournament.room_id,
    }, status=201)

@api_view(['GET'])
def list(request):
    tournaments = Tournament.objects.all().filter(status='open')

    data = []
    for tournament in tournaments:
        username = User.objects.get(id=tournament.host_id).username
        players = TournamentPlayer.objects.filter(tournament_id=tournament.id).count()
        joined = TournamentPlayer.objects.filter(tournament_id=tournament.id, player_id=request.user.id).exists()
        data.append({
            'tournament_id': tournament.id,
            'name': tournament.name,
            # 'status': tournament.status,
            'players': players,
            'max_players': tournament.max_players,
            'room_id': tournament.room_id,
            'host_username': username,
            'joined': joined,
            'is_host': tournament.host_id == request.user.id,
        })

    return JsonResponse({'data': data}, status=200)

@api_view(['POST'])
def join(request, id):
    if not Tournament.objects.filter(id=id).exists():
        return JsonResponse({'error': 'Tournament does not exist.'}, status=404)
    
    tournament = Tournament.objects.get(id=id)
    if tournament.status != 'open':
        return JsonResponse({'error': 'Tournament is not open.'}, status=400)
    
    if TournamentPlayer.objects.filter(tournament_id=tournament.id, player_id=request.user.id).exists():
        return JsonResponse({'error': 'User already in tournament.'}, status=400)
    
    if TournamentPlayer.objects.filter(tournament_id=tournament.id).count() >= tournament.max_players:
        return JsonResponse({'error': 'Tournament is full.'}, status=400)
    
    tournament_player = TournamentPlayer.objects.create(
        tournament_id=tournament.id,
        player_id=request.user.id
    )
    if not tournament_player:
        return JsonResponse({'error': 'Error joining tournament.'}, status=500)
    
    return JsonResponse({
        'tournament_id': tournament.id,
        'room_id': tournament.room_id,
    }, status=201)

@api_view(['PUT'])
def start(request, id):
    if not Tournament.objects.filter(id=id).exists():
        return JsonResponse({'error': 'Tournament does not exist.'}, status=404)
    
    if not TournamentPlayer.objects.filter(tournament_id=id, player_id=request.user.id).exists():
        return JsonResponse({'error': 'User is not in tournament.'}, status=400)
    
    tournament = Tournament.objects.get(id=id)
    if tournament.status == 'ready':
        return JsonResponse({'error': 'Tournament is already ready.'}, status=400)
    if tournament.status != 'open':
        return JsonResponse({'error': 'Tournament is not open.'}, status=400)
    
    if tournament.host_id != request.user.id:
        return JsonResponse({'error': 'Only the host can start the tournament.'}, status=400)
    
    if TournamentPlayer.objects.filter(tournament_id=tournament.id).count() < 2:
        return JsonResponse({'error': 'Tournament must have more than 2 players.'}, status=400)
    
    tournament.status = 'ready'
    tournament.save()
    return JsonResponse({
        'tournament_id': tournament.id
    }, status=200)

@api_view(['PUT'])
def prepare(request, id):
    if not Tournament.objects.filter(id=id).exists():
        return JsonResponse({'error': 'Tournament does not exist.'}, status=404)
    
    tournament = Tournament.objects.get(id=id)
    games = Game.objects.filter(tournament_id=tournament.id)
    for game in games:
        if GamePlayer.objects.filter(game_id=game.id).count() == 2 and game.status != 'finished':
            return JsonResponse({'error': 'All games must be finished to prepare the tournament.'}, status=400)

    if tournament.status != 'ready' and tournament.status != 'playing':
        return JsonResponse({'error': 'Tournament is not ready to be prepared.'}, status=400)
    
    if tournament.host_id != request.user.id:
        return JsonResponse({'error': 'Only the host can prepare the tournament.'}, status=400)

    players = TournamentPlayer.objects.filter(tournament_id=tournament.id, eliminated=False)
    # Check if we have an odd number of players and handle the last one
    pairs = [(players[i], players[i+1]) for i in range(0, len(players) - len(players) % 2, 2)]

    # If there's an odd player, append them as a solo player
    if len(players) % 2 == 1:
        pairs.append((players[len(players) - 1],))

    for pair in pairs:
        game = True
        while game:
            room_id = ''.join(random.choice(string.ascii_uppercase) for i in range(8))
            game = Game.objects.filter(room_id=room_id).exists()

        games = Game.objects.filter(tournament_id=tournament.id)

        game = None
        for _game in games:
            if GamePlayer.objects.filter(game_id=_game.id).count() == 2:
                continue
            game = _game

        if not game:
            game = Game.objects.create(
                host_id=pair[0].player_id,
                tournament_id=tournament.id,
                room_id=room_id,
                status='preparing',
            )
            if not game:
                return JsonResponse({'error': 'Error creating game.'}, status=500)
        
        if (not GamePlayer.objects.filter(game_id=game.id, player_id=pair[0].player_id).exists()):
            game_player1 = GamePlayer.objects.create(
                game_id=game.id,
                player=User.objects.filter(id=pair[0].player_id).first()
            )
            if not game_player1:
                return JsonResponse({'error': 'Error creating game player.'}, status=500)
        
        if len(pair) == 1:
            continue
        if (not GamePlayer.objects.filter(game_id=game.id, player_id=pair[1].player_id).exists()):
            game_player2 = GamePlayer.objects.create(
                game_id=game.id,
                player=User.objects.filter(id=pair[1].player_id).first()
            )
            if not game_player2:
                return JsonResponse({'error': 'Error creating game player.'}, status=500)
        game.status = 'ready'
        game.save()


    tournament.status = 'playing'
    tournament.save()
    return JsonResponse({
        'tournament_id': tournament.id
    }, status=200)

@api_view(['GET'])
def game(request):
    games = []

    games_player = GamePlayer.objects.filter(player_id=request.user.id, game__status='ready').exclude(game__tournament_id=None)

    for game_player in games_player:
        oponent = User.objects.filter(id=GamePlayer.objects.filter(game_id=game_player.game.id).exclude(player_id=request.user.id).first().player_id).first()
        games.append({
            'game_id': game_player.game.id,
            'room_id': game_player.game.room_id,
            'tournament': {
                'tournament_id': game_player.game.tournament.id,
                'name': game_player.game.tournament.name,
                'players': TournamentPlayer.objects.filter(tournament_id=game_player.game.tournament.id).count(),
                'max_players': game_player.game.tournament.max_players,
                'host_username': User.objects.filter(id=game_player.game.tournament.host_id).first().username,
            },
            'oponent': oponent.username,
            'status': game_player.game.status,
        })

    return JsonResponse({
        'games': games,
    }, status=200)

@api_view(['DELETE'])
def leave(request, id):
    # only if status is open
    return JsonResponse({'error': 'Not implemented'}, status=501)