from django.urls import path
from . import views

urlpatterns = [
    path('info/<int:id>', views.info, name='info'),
    path('me', views.me, name='me'),
    path('list', views.list, name='list'),
]