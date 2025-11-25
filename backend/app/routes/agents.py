from fastapi import APIRouter
from bson import ObjectId
from ..database import agents_collection
from ..schemas.agent_schema import Agent
from fastapi import Depends, HTTPException
from ..deps import get_current_user

router = APIRouter(prefix="/agents", tags=["Agents"])

def serialize(agent) -> dict:
    return {
        "id": str(agent["_id"]),
        "name": agent["name"],
        "role": agent["role"],
        "phone": agent["phone"],
        "email": agent["email"]
    }

@router.get("/")
def get_agents(user = Depends(get_current_user)):  # cualquiera autenticado puede leer
    return [serialize(a) for a in agents_collection.find()]


@router.put("/{id}")
def update_agent(id: str, agent: Agent, user = Depends(get_current_user)):
    if user["role"] not in ["ADMIN", "SUPERVISOR"]:
        raise HTTPException(403, "No tienes permiso para actualizar agentes")
    else:
        agents_collection.update_one({"_id": ObjectId(id)}, {"$set": agent.dict()})
        return serialize(agents_collection.find_one({"_id": ObjectId(id)}))

@router.put("/{id}")
def update_agent(id: str, agent: Agent):
    agents_collection.update_one({"_id": ObjectId(id)}, {"$set": agent.dict()})
    return serialize(agents_collection.find_one({"_id": ObjectId(id)}))

@router.delete("/{id}")
def delete_agent(id: str):
    agents_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Agent deleted"}
