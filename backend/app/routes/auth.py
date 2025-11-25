from fastapi import APIRouter, HTTPException, Response, Depends, Cookie
from ..database import users_collection, requests_collection
from ..schemas.login_schema import LoginData
from ..schemas.request_schema import RegistrationRequest
from ..security import create_access_token, create_refresh_token
from fastapi import Cookie
from ..security import verify_token
from ..deps import get_current_user
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(request: RegistrationRequest):
    # Check duplicates
    if users_collection.find_one({"matricula": request.matricula}):
        raise HTTPException(400, "Usuario ya registrado")
    if requests_collection.find_one({"matricula": request.matricula}):
        raise HTTPException(400, "Solicitud ya enviada")

    requests_collection.insert_one(request.dict())
    return {"status": "ok", "message": "Solicitud enviada"}

@router.post("/login")
def login(data: LoginData, response: Response):
    # Hardcoded admin
    if data.matricula == "srchicano" and data.password == "admin":
        payload = {
            "matricula": "srchicano",
            "role": "ADMIN"
        }

        access = create_access_token(payload)
        refresh = create_refresh_token(payload)

        response.set_cookie(
            "access_token",
            access,
            httponly=True,
            samesite="none",
            secure=True   # obligatorio en HTTPS
        )

        response.set_cookie("refresh_token", refresh, httponly=True, samesite="none", secure=True)
        
        return {"status": "ok", "user": payload}

    user = users_collection.find_one({
        "matricula": data.matricula,
        "password": data.password
    })

    if not user:
        raise HTTPException(401, "Credenciales incorrectas")

    payload = {
        "matricula": user["matricula"],
        "role": user["role"],
        "id": str(user["_id"])
    }

    access = create_access_token(payload)
    refresh = create_refresh_token(payload)

    # Cookies seguras
    response.set_cookie(
            "access_token",
            access,
            httponly=True,
            samesite="none",
            secure=True   # obligatorio en HTTPS
    )
    response.set_cookie("refresh_token", refresh, httponly=True, samesite="none", secure=True)

    del payload["id"]
    return {"status": "ok", "user": payload}

@router.post("/refresh")
def refresh_token(response: Response, refresh_token: Optional[str] = Cookie(None)):
    if refresh_token is None:
        raise HTTPException(401, "No token")

    payload = verify_token(refresh_token)
    if not payload:
        raise HTTPException(401, "Token inválido")

    new_access = create_access_token({
        "matricula": payload["matricula"],
        "role": payload["role"]
    })

    response.set_cookie(
            "access_token",
            new_access,
            httponly=True,
            samesite="none",
            secure=True   # obligatorio en HTTPS
    )
    return {"status": "ok"}

@router.get("/me")
def get_me(user = Depends(get_current_user)):
    return user

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"status": "logged_out"}
