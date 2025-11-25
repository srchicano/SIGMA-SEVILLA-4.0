from fastapi import APIRouter
from bson import ObjectId
from ..database import users_collection, requests_collection
from ..schemas.user_schema import User
from fastapi import Depends, HTTPException
from ..deps import get_current_user


router = APIRouter(prefix="/users", tags=["Users"])

def serialize(user):
    return {
        "id": str(user["_id"]),
        "matricula": user["matricula"],
        "name": user["name"],
        "surname1": user["surname1"],
        "surname2": user["surname2"],
        "password": user["password"],
        "role": user["role"]
    }

@router.get("/")
def get_users(user = Depends(get_current_user)):
    # SOLO ADMIN puede ver la lista completa
    if user["role"] != "ADMIN":
        raise HTTPException(403, "No autorizado")

    return [serialize(u) for u in users_collection.find()]

@router.post("/approve")
def approve_user(data: dict):
    matricula = data["matricula"]
    req = requests_collection.find_one({"matricula": matricula})
    if not req:
        return {"error": "Solicitud no encontrada"}

    req["role"] = "AGENT"  # Default role

    inserted = users_collection.insert_one(req)
    requests_collection.delete_one({"matricula": matricula})

    return serialize(users_collection.find_one({"_id": inserted.inserted_id}))

@router.put("/{id}/role")
def update_role(id: str, data: dict):
    new_role = data["role"]
    users_collection.update_one({"_id": ObjectId(id)}, {"$set": {"role": new_role}})
    return serialize(users_collection.find_one({"_id": ObjectId(id)}))

@router.delete("/{id}")
def delete_user(id: str):
    users_collection.delete_one({"_id": ObjectId(id)})
    return {"status": "ok"}
