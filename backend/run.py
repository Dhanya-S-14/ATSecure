import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting FastAPI on http://{host}:{port} ...")
    uvicorn.run(app, host=host, port=port, log_level="info")
