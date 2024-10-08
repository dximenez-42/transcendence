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

@api_view(['PUT'])
def edit(request):
    data = json.loads(request.body)

    if not data:
        return JsonResponse({'error': 'Missing data'}, status=400)

    if 'name' in data:
        if data['name'] == '':
            return JsonResponse({'error': 'Name cannot be empty'}, status=400)
        
        if len(data['name']) > 40:
            return JsonResponse({'error': 'Name too long'}, status=400)

        request.user.name = data['name']

    if 'username' in data:
        if data['username'] == '':
            return JsonResponse({'error': 'Username cannot be empty'}, status=400)
        
        for char in data['username']:
            if char.isalnum() == False and char != '-':
                return JsonResponse({'error': 'Username must be alphanumeric and can only include -'}, status=400)
        
        if User.objects.filter(username=data['username']).exclude(id=request.user.id).exists():
            return JsonResponse({'error': 'Username already taken'}, status=400)
        
        request.user.username = data['username']

    request.user.save()

    return JsonResponse({
        'message': 'User updated'
    }, status=200)

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
