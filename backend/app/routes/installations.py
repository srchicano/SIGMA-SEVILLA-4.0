from fastapi import APIRouter
from bson import ObjectId
from ..database import installations_collection
from ..schemas.installation_schema import Installation

router = APIRouter(prefix="/installations", tags=["Installations"])

def serialize(inst):
    return {
        "id": str(inst["_id"]),
        "name": inst["name"],
        "type": inst["type"],
        "sector": inst["sector"],
        "description": inst["description"]
    }

@router.get("/")
def get_installations():
    return [serialize(i) for i in installations_collection.find()]

@router.post("/")
def create_installation(inst: Installation):
    data = inst.dict()
    del data["id"]
    new = installations_collection.insert_one(data)
    return serialize(installations_collection.find_one({"_id": new.inserted_id}))

@router.put("/{id}")
def update_installation(id: str, inst: Installation):
    installations_collection.update_one({"_id": ObjectId(id)}, {"$set": inst.dict()})
    return serialize(installations_collection.find_one({"_id": ObjectId(id)}))

@router.delete("/{id}")
def delete_installation(id: str):
    installations_collection.delete_one({"_id": ObjectId(id)})
    return {"message": "Installation deleted"}
