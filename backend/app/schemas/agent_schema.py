from pydantic import BaseModel
from typing import Optional

class Agent(BaseModel):
    id: Optional[str]
    name: str
    role: str
    phone: str
    email: str
