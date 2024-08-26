from django.shortcuts import render

import os

from django.http import JsonResponse
from rest_framework.decorators import api_view
import requests

import json
from .models import User

# Create your views here.
@api_view(['GET'])
def games(request):
    return JsonResponse({'message': 'Hello, World!'}, status=200)