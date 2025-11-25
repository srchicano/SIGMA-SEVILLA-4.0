from fastapi import APIRouter
from bson import ObjectId
from ..database import assignments_collection

router = APIRouter(prefix="/assignments", tags=["Assignments"])

def serialize(doc):
    return {
        "sector": doc["sector"],
        "agents": doc["agents"]
    }

# Obtener todas las asignaciones
@router.get("/")
def get_assignments():
    return [serialize(a) for a in assignments_collection.find()]

# Guardar asignaciones de un sector concreto
@router.put("/{sector}")
def update_assignment(sector: str, data: dict):
    # data = { "agents": ["id1", "id2"] }
    assignments_collection.update_one(
        {"sector": sector},
        {"$set": {"sector": sector, "agents": data["agents"]}},
        upsert=True
    )
    return {"status": "ok", "sector": sector, "agents": data["agents"]}
