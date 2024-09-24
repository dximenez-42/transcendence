from django.urls import path
from . import views

urlpatterns = [
    path('', views.waiting_room, name='waiting_room'),
    path('signup/', views.signup, name='signup'),
    path('waiting-room/', views.waiting_room, name='waiting_room'),
    path('start-chat/<str:username>/', views.start_chat, name='start_chat'),
]

