import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from video_calls.middleware import JWTAuthMiddleware
from video_calls.routing import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'healhive_backend.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        'http': django_asgi_app,
        'websocket': AuthMiddlewareStack(
            JWTAuthMiddleware(
                URLRouter(websocket_urlpatterns)
            )
        ),
    }
)
