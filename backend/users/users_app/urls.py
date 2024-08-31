from django.urls import path
from . import views

urlpatterns = [
    path('info/<int:id>', views.info, name='info'),
]