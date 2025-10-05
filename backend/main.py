from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import earner_routes, ai_routes, chat_routes, advanced_routes
from dotenv import load_dotenv
import uvicorn
import os

# Load environment variables from parent directory
load_dotenv(dotenv_path="../.env")

# Create FastAPI app
app = FastAPI(
    title="Uber Smart Copilot API",
    description="AI-powered assistant for Uber drivers and couriers",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",
        "http://localhost:8080",  # Alternative ports
        "http://127.0.0.1:8080",
        "http://192.168.1.123:5173",  # Your network IP
        "http://192.168.1.123:8000",  # Backend on network IP
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(earner_routes.router, prefix="/api/v1", tags=["earners"])
app.include_router(ai_routes.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(chat_routes.router, prefix="/api", tags=["chat"])
app.include_router(advanced_routes.router, prefix="/api/v1/advanced", tags=["advanced"])

@app.get("/")
async def root():
    return {"message": "Uber Smart Copilot API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
