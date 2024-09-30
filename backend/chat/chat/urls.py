from django.urls import path
#from .views import home, room
from . import views

urlpatterns = [
    path('', views.home, name='home'),
	path('room/<int:room_id>/', views.room, name='room'),
]
