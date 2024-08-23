from django.shortcuts import render

from django.http import JsonResponse
from rest_framework.decorators import api_view

# Create your views here.
@api_view(['GET'])
def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})