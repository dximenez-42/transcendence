from django.urls import path
from . import views

urlpatterns = [
    path('list', views.list, name='list'),
    path('chat/<int:user_id>', views.chat, name='chat'),
]