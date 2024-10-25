import os

from django.http import JsonResponse
from rest_framework.decorators import api_view

import json
from .models import User, UserBlocked, Chat, UsersChat, Message

import random
import string

# Create your views here.
@api_view(['GET'])
def list(request):
    response = []

    chats = Chat.objects.filter(userschat__user=request.user).order_by('updated_at').reverse().all()
    for chat in chats:
        user = UsersChat.objects.filter(chat=chat).exclude(user=request.user).first().user
        response.append({
            'id': user.id,
            'name': user.name,
            'username': user.username,
            'room_id': chat.room_id,
            'chat_name': chat.name,
            'is_blocked': UserBlocked.objects.filter(user=request.user, blocked=user).exists() or UserBlocked.objects.filter(user=user, blocked=request.user).exists()
        })

    users = User.objects.exclude(id=request.user.id).order_by('created_at').reverse().all()
    for user in users:
        # Check if user is already in response (check response.id)
        if user.id in [r['id'] for r in response]:
            continue
        response.append({
            'id': user.id,
            'name': user.name,
            'username': user.username,
            'room_id': None,
            'chat_name': None,
            'is_blocked': UserBlocked.objects.filter(user=request.user, blocked=user).exists() or UserBlocked.objects.filter(user=user, blocked=request.user).exists()
        })

    return JsonResponse({
        'chats': response
    }, status=200)

@api_view(['GET'])
def messages(request, user_id):
    if request.user.id == user_id:
        return JsonResponse({'error': 'You cannot chat with yourself'}, status=400)
    
    user = User.objects.get(id=user_id)
    if not user:
        return JsonResponse({'error': 'User not found'}, status=404)

    if UserBlocked.objects.filter(user=request.user, blocked=user).exists():
        return JsonResponse({'error': 'User is blocked'}, status=403)
    
    if UserBlocked.objects.filter(user=user, blocked=request.user).exists():
        return JsonResponse({'error': 'You are blocked'}, status=403)

    chat = Chat.objects.filter(userschat__user=user).filter(userschat__user=request.user).first()
    if not chat:
        room_id = None
        while room_id is None or Chat.objects.filter(room_id=room_id).exists():
            room_id = ''.join(random.choice(string.ascii_uppercase) for i in range(8))
        chat = Chat.objects.create(room_id=room_id)

        UsersChat.objects.create(user=user, chat=chat)
        UsersChat.objects.create(user=request.user, chat=chat)

    messages = Message.objects.filter(chat=chat).order_by('created_at').reverse().all()
    response = []
    for message in messages:
        response.append({
            'id': message.id,
            'content': message.content,
            'content_type': message.content_type,
            'datetime': message.created_at.timestamp(),
            'sender': {
                'id': message.sender.id,
                'name': message.sender.name,
                'username': message.sender.username,
            }
        })
    
    return JsonResponse({
        'chat': {
            'id': chat.id,
            'room_id': chat.room_id,
            'user': {
                'id': user.id,
                'name': user.name,
                'username': user.username,
            },
            'name': chat.name,
        },
        'messages': response
    }, status=200)