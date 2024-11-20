from django.urls import path
from .consumers import GamesConsumer

websocket_urlpatterns = [
    path('ws/games/<str:user_name>/<str:user_id>', GamesConsumer.as_asgi()),
]