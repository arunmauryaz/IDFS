from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.core.database import init_db, SessionLocal
from app.api.router import api_router
from app.services.scheduler_service import scheduler_service
from app.services.logging_service import logger, add_log_buffer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    init_db()
    
    # Start APScheduler
    scheduler_service.start()
    add_log_buffer("INFO", "Main", f"{settings.APP_NAME} FastAPI backend initialized successfully.")
    
    yield

    # Shutdown APScheduler
    scheduler_service.shutdown()
    add_log_buffer("INFO", "Main", f"{settings.APP_NAME} backend shut down.")

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "docs": "/docs"
    }
