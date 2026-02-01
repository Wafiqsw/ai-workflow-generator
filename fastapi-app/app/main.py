from fastapi import FastAPI
from app.api.test import router as test_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI() 

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