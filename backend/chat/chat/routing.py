from django.urls import path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    path('ws/room/<int:room_id>/', ChatConsumer.as_asgi()),
]