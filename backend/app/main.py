from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.agents import router as agents_router
from .routes.users import router as users_router
from .routes.installations import router as installations_router
from .routes.assignments import router as assignments_router
from .routes.elements import router as elements_router
from .routes.auth import router as auth_router
from .routes.users import router as users_router
from .routes.requests import router as requests_router



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(agents_router)
app.include_router(users_router)
app.include_router(installations_router)
app.include_router(assignments_router)
app.include_router(elements_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(requests_router)



@app.get("/")
def root():
    return {"status": "API SIGMA Sevilla Running"}
