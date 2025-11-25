from fastapi import Depends, HTTPException, Cookie
from .security import verify_token

def get_current_user(access_token: str = Cookie(None)):
    if access_token is None:
        raise HTTPException(401, "Token no proporcionado")

    payload = verify_token(access_token)
    if not payload:
        raise HTTPException(401, "Token inválido o expirado")

    return payload
