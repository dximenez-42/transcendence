from django.urls import path
from . import views

urlpatterns = [
    path('info/<int:id>', views.info, name='info'),
    path('me', views.me, name='me'),
    path('edit', views.edit, name='edit'),
    path('list', views.list, name='list'),
    path('blocked', views.blocked, name='blocked'),
    path('block/<int:id>', views.block, name='block'),
    path('unblock/<int:id>', views.unblock, name='unblock'),
]