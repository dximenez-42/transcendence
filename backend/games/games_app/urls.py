from django.urls import path
from . import views

urlpatterns = [
    path('create', views.create, name='create'),
    path('list', views.list, name='list'),
    path('join', views.join, name='join'),
    path('start', views.start, name='start'),
    path('leave', views.leave, name='leave'),
]
