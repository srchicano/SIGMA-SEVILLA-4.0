from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class Element(BaseModel):
    id: Optional[str]
    name: str
    type: str
    station: str
    sector: str
    params: Dict[str, Any]
    lastMaintenance: Optional[str]
    completedBy: Optional[str]
    isPendingMonthly: bool
    maintenanceHistory: List[dict]
    faultHistory: List[dict]
