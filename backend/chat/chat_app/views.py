import os

from django.http import JsonResponse
from rest_framework.decorators import api_view

import json
from .models import User

# Create your views here.
@api_view(['GET'])
def list(request):
    return JsonResponse({'error': 'Not implemented'}, status=501)
