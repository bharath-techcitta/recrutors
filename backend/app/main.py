from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import chat, requirements, profiles

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TalentMatch AI Backend")

# Allow CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(requirements.router, prefix="/api/requirements", tags=["requirements"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["profiles"])
