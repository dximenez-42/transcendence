from django.urls import path
from .consumers import GamesConsumer

websocket_urlpatterns = [
    path('ws/games/<str:room_id>/<int:user_id>', GamesConsumer.as_asgi()),
]