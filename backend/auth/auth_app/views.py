from django.shortcuts import render

import os

from django.http import JsonResponse
from rest_framework.decorators import api_view
import requests

import json
from .models import User

# Create your views here.
@api_view(['GET'])
def auth(request):
    code = request.GET.get('code')

    if not code:
        return JsonResponse({'error': 'Missing code parameter.'}, status=400)

    payloadOauth = {
        'grant_type': 'authorization_code',
        'client_id': os.getenv('CLIENT_ID'),
        'client_secret': os.getenv('CLIENT_SECRET'),
        'redirect_uri': os.getenv('REDIRECT_URI'),
        'code': code,
    }

    try:
        responseOauth = requests.post('https://api.intra.42.fr/oauth/token', data=payloadOauth)
        responseOauth.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)

        payloadData = {
            'access_token': responseOauth.json()['access_token'],
        }

        try:
            responseData = requests.get('https://api.intra.42.fr/v2/me', data=payloadData)
            responseData.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)

            try:
                data = responseData.json()

                name = data.get('displayname')
                username = data.get('login')
                email = data.get('email')

                if not all([name, username, email]):
                    return JsonResponse({'error': 'Missing required fields.'}, status=400)

                user = User.objects.filter(username=username, email=email).first()
                if user:
                    return JsonResponse({
                        'id': user.id,
                        'name': user.name,
                        'username': user.username,
                        'email': user.email
                    }, status=200)

                user = User.objects.create(name=name, username=username, email=email)
                if not user:
                    return JsonResponse({'error': 'Failed to create user.'}, status=500)
                return JsonResponse({
                    'id': user.id,
                    'name': name,
                    'username': username,
                    'email': email
                }, status=201)

            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON.'}, status=400)

        except requests.exceptions.RequestException as e:
            # Handle any exceptions raised during the request
            return JsonResponse({'error': str(e)}, status=500)

    except requests.exceptions.RequestException as e:
        # Handle any exceptions raised during the request
        return JsonResponse({'error': str(e)}, status=500)