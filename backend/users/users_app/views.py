import os

from django.http import JsonResponse
from rest_framework.decorators import api_view

import json
from .models import User

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
        users_data.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
        })

    return JsonResponse({
        'users': users_data
    }, status=200)