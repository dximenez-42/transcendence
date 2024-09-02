import os

from django.http import JsonResponse
from rest_framework.decorators import api_view

import json
from .models import User
from .models import Game
from .models import Tournament
from .models import GamePlayer

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