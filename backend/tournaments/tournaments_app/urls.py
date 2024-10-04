from django.urls import path
from . import views

urlpatterns = [
    path('create', views.create, name='create'),
    path('list', views.list, name='list'),
    path('join/<int:id>', views.join, name='join'),
    path('start/<int:id>', views.start, name='start'),
    path('prepare/<int:id>', views.prepare, name='prepare'),
    path('game', views.game, name='game'),
    path('leave/<int:id>', views.leave, name='leave'),
]
