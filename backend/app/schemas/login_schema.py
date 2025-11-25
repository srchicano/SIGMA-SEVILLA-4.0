from pydantic import BaseModel

class LoginData(BaseModel):
    matricula: str
    password: str
