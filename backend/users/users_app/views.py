import os

from django.http import JsonResponse
from rest_framework.decorators import api_view

import json
from .models import User
from .models import UserBlocked

# Create your views here.
@api_view(['GET'])
def info(request, id):
    return JsonResponse({'error': 'Not implemented'}, status=501)

@api_view(['GET'])
def me(request):
    user = {
        'username': request.user.username,
        'email': request.user.email,
        'name': request.user.name,
    }
    return JsonResponse({'user': user}, status=200)

@api_view(['GET'])
def list(request):
    users = User.objects.all().exclude(id=request.user.id)
    users_data = []

    for user in users:
        if UserBlocked.objects.filter(user=request.user, blocked=user).exists():
            continue
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
        })

    return JsonResponse({
        'users': users_data
    }, status=200)

@api_view(['GET'])
def blocked(request):
    blocked_users = UserBlocked.objects.filter(user=request.user)
    blocked_users_data = []

    for blocked_user in blocked_users:
        blocked_users_data.append({
            'id': blocked_user.blocked.id,
            'username': blocked_user.blocked.username,
            'email': blocked_user.blocked.email,
            'name': blocked_user.blocked.name,
            'date': blocked_user.created_at.timestamp(),
        })

    return JsonResponse({
        'blocked': blocked_users_data
    }, status=200)

@api_view(['POST'])
def block(request, id):
    if request.user.id == id:
        return JsonResponse({'error': 'Cannot block yourself'}, status=400)

    user = User.objects.get(id=id)

    if not user:
        return JsonResponse({'error': 'User not found'}, status=404)

    if UserBlocked.objects.filter(user=request.user, blocked=user).exists():
        return JsonResponse({'error': 'User already blocked'}, status=400)

    UserBlocked.objects.create(user=request.user, blocked=user)

    return JsonResponse({
        'message': 'User blocked'
    }, status=200)

@api_view(['POST'])
def unblock(request, id):
    if request.user.id == id:
        return JsonResponse({'error': 'Cannot unblock yourself'}, status=400)

    user = User.objects.get(id=id)

    if not user:
        return JsonResponse({'error': 'User not found'}, status=404)

    if not UserBlocked.objects.filter(user=request.user, blocked_id=user.id).exists():
        return JsonResponse({'error': 'User not blocked'}, status=400)

    UserBlocked.objects.filter(user=request.user, blocked_id=user.id).delete()

    return JsonResponse({
        'message': 'User unblocked'
    }, status=200)
