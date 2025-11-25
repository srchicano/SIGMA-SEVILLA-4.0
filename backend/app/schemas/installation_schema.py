from pydantic import BaseModel
from typing import Optional

class Installation(BaseModel):
    id: Optional[str]
    name: str
    type: str
    sector: str
    description: str
