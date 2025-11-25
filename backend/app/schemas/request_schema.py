from pydantic import BaseModel

class RegistrationRequest(BaseModel):
    matricula: str
    name: str
    surname1: str
    surname2: str
    password: str
