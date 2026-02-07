from fastapi import FastAPI
from app.api.test import router as test_router
from app.api.csv import router as csv_router
from app.api.mysql import router as mysql_router
from app.api.chroma import router as chroma_router
from app.api.user_api import router as user_router
from app.api.payment_api import router as payment_router
from app.api.notification_api import router as notification_router
from fastapi.middleware.cors import CORSMiddleware
from app.services.vector_service import _get_model

app = FastAPI() 

# Pre-load the AI model during startup to avoid timeout on first request
@app.on_event("startup")
async def startup_event():
    print("🚀 Pre-loading Vector Model...")
    _get_model()
    print("✅ Vector Model Loaded and Ready!")

# Allow requests from frontend (Vite dev server)
origins = [
    "http://localhost:5173",  # your Vite dev server
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # or ["*"] for hackathon MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "FastAPI running 🚀"}

app.include_router(test_router)
app.include_router(csv_router)
app.include_router(mysql_router)
app.include_router(chroma_router)
app.include_router(user_router)
app.include_router(payment_router)
app.include_router(notification_router)