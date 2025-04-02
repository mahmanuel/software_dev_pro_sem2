from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()


@database_sync_to_async
def get_user(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token["user_id"]
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleware:
    """
    Custom middleware that takes a token from the query string and authenticates the user.
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Get the token from the query string
        query_string = scope.get("query_string", b"").decode()
        query_params = dict(
            param.split("=") for param in query_string.split("&") if param
        )

        token = query_params.get("token", None)

        if token:
            scope["user"] = await get_user(token)
        else:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
