from django.http import JsonResponse
from .models import User

def IsAuthenticatedMiddleware(get_response):
    # One-time configuration and initialization.

    def middleware(request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        if request.path.startswith("/ws/"):
            return get_response(request)

        headers = request.headers

        if 'Authorization' not in headers:
            return JsonResponse({
                'error': 'Missing Authorization header.'
            },status=401)
        else:
            setattr(request, '_dont_enforce_csrf_checks', True) # Disable CSRF check
        
        authorization = headers['Authorization']
        user = User.objects.filter(token=authorization).first()

        if not user:
            return JsonResponse({
                'error': 'Invalid Authorization token.'
            }, status=401)

        request.user = user

        response = get_response(request)    # Call the next middleware or the view.

        # Code to be executed for each request/response after
        # the view is called.
        return response

    return middleware