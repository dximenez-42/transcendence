# from django.urls import path
# from . import views

# urlpatterns = [
#     path('create', views.create, name='create'),
#     path('game/<int:id>', views.update, name='update'),
#     path('update/<int:id>', views.update, name='update'),
#     path('list', views.list, name='list'),
#     path('join/<int:id>', views.join, name='join'),
#     path('start/<int:id>', views.start, name='start'),
#     path('leave/<int:id>', views.leave, name='leave'),
# ]



from django.urls import path
from . import views

urlpatterns = [
    
    path('create', views.create, name='create'),
    path('game/<int:id>', views.update, name='update'),
    path('update/<int:id>', views.update, name='update'),
    path('join/<int:id>', views.join, name='join'),
    path('list', views.list, name='list'),
    path('start/<int:id>', views.start, name='start'),
    path('leave/<int:id>', views.leave, name='leave'),
]
