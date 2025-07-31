import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",  # 👈 Cambiar aquí
        port=8000,
        reload=True
    )