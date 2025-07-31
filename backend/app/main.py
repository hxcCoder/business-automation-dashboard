from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import workflows, executions
import os
from dotenv import load_dotenv

load_dotenv()

# Crear aplicación FastAPI
app = FastAPI(
    title="Business Automation API",
    description="API para gestionar workflows de automatización empresarial",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development
        "http://127.0.0.1:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(workflows.router)
app.include_router(executions.router)

@app.get("/")
async def root():
    return {
        "message": "Business Automation API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "business-automation-api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("DEBUG", "False").lower() == "true"
    )