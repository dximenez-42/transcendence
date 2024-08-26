from django.urls import path
from . import views

urlpatterns = [
    path('games/create', views.create, name='create'),
    path('games/list', views.list, name='list'),
    path('games/join', views.join, name='join'),
    path('games/start', views.start, name='start'),
    path('games/leave', views.leave, name='leave'),
]
