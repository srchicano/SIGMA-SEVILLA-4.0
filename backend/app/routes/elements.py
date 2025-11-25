from fastapi import APIRouter
from bson import ObjectId
from ..database import elements_collection
from ..schemas.element_schema import Element

router = APIRouter(prefix="/elements", tags=["Elements"])

def serialize(doc):
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "type": doc["type"],
        "station": doc["station"],
        "sector": doc["sector"],
        "params": doc["params"],
        "lastMaintenance": doc["lastMaintenance"],
        "completedBy": doc["completedBy"],
        "isPendingMonthly": doc["isPendingMonthly"],
        "maintenanceHistory": doc["maintenanceHistory"],
        "faultHistory": doc["faultHistory"]
    }

@router.get("/")
def get_elements():
    return [serialize(e) for e in elements_collection.find()]

@router.post("/")
def create_element(element: Element):
    data = element.dict()
    del data["id"]
    inserted = elements_collection.insert_one(data)
    return serialize(elements_collection.find_one({"_id": inserted.inserted_id}))

@router.put("/{id}")
def update_element(id: str, element: Element):
    elements_collection.update_one({"_id": ObjectId(id)}, {"$set": element.dict()})
    return serialize(elements_collection.find_one({"_id": ObjectId(id)}))

@router.delete("/{id}")
def delete_element(id: str):
    elements_collection.delete_one({"_id": ObjectId(id)})
    return {"status": "ok"}
