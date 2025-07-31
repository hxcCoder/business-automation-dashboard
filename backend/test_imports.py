# test_imports.py
try:
    import sqlite3
    print("✅ sqlite3: OK (viene con Python)")
    
    import fastapi
    print("✅ fastapi: OK")
    
    import uvicorn
    print("✅ uvicorn: OK")
    
    import requests
    print("✅ requests: OK")
    
    import pydantic
    print("✅ pydantic: OK")
    
    from dotenv import load_dotenv
    print("✅ python-dotenv: OK")
    
    print("\n🚀 ¡Todas las dependencias están listas!")
    
except ImportError as e:
    print(f"❌ Error: {e}")