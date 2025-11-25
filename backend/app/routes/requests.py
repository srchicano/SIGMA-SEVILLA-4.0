from fastapi import APIRouter
from ..database import requests_collection

router = APIRouter(prefix="/requests", tags=["Requests"])

def serialize(req):
    return req

@router.get("/")
def get_requests():
    return [serialize(r) for r in requests_collection.find({}, {"_id": 0})]

@router.delete("/{matricula}")
def delete_request(matricula: str):
    requests_collection.delete_one({"matricula": matricula})
    return {"status": "ok"}
