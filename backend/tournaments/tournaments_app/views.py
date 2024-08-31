import os

from django.http import JsonResponse
from rest_framework.decorators import api_view

import json
from .models import User
from .models import Game
from .models import Tournament
from .models import GamePlayer

# Create your views here.
@api_view(['POST'])
def create(request):
    return JsonResponse({'error': 'Not implemented'}, status=501)

@api_view(['GET'])
def list(request):
    return JsonResponse({'error': 'Not implemented'}, status=501)

@api_view(['POST'])
def join(request, id):
    return JsonResponse({'error': 'Not implemented'}, status=501)

@api_view(['PUT'])
def start(request, id):
    return JsonResponse({'error': 'Not implemented'}, status=501)

@api_view(['DELETE'])
def leave(request, id):
    return JsonResponse({'error': 'Not implemented'}, status=501)