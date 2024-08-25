from django.shortcuts import render

import os

from django.http import JsonResponse
from rest_framework.decorators import api_view
import requests

import json
from django.db import connection

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

        accessToken = responseOauth.json()['access_token']

        payloadData = {
            'access_token': accessToken,
        }

        try:
            responseData = requests.get('https://api.intra.42.fr/v2/me', data=payloadData)
            responseData.raise_for_status()  # Raises HTTPError for bad responses (4xx or 5xx)

            try:
                # Parse the request body as JSON
                data = responseData.json()

                # Extract user data from the request
                name = data.get('displayname')
                username = data.get('login')
                email = data.get('email')

                # Validate required fields
                if not all([name, username, email]):
                    return JsonResponse({'error': 'Missing required fields.'}, status=400)

                # Insert the user into the database using raw SQL
                with connection.cursor() as cursor:
                    cursor.execute('''
                        SELECT id FROM users WHERE username = %s OR email = %s;
                    ''', [username, email])

                    # Fetch the user's ID if it already exists
                    user = cursor.fetchone()
                    if user:
                        return JsonResponse({
                            'id': user[0],
                            'name': name,
                            'username': username,
                            'email': email
                        }, status=200)

                    cursor.execute('''
                        INSERT INTO users (name, username, email)
                        VALUES (%s, %s, %s)
                        RETURNING id;
                    ''', [name, username, email])
                    
                    # Fetch the new user's ID
                    user_id = cursor.fetchone()[0]

                # Return success response
                return JsonResponse({
                    'id': user_id,
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