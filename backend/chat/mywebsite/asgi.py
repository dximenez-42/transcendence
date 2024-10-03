import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

from channels.auth import AuthMiddlewareStack
import chat.routing

# Configuramos el entorno y especificamos el módulo de configuración
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mywebsite.settings')

# redirigimos ciertas peticiones a un endpoint o a otro, las de websocket deben pasar por un Middleware de autenticacion
application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket' : AuthMiddlewareStack(
        URLRouter(chat.routing.websocket_urlpatterns)
    )
})
