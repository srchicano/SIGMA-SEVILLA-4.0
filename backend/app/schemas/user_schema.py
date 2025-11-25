from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: Optional[str]
    matricula: str
    name: str
    surname1: str
    surname2: str
    password: str
    role: str   # "ADMIN", "SUPERVISOR", "AGENT"
