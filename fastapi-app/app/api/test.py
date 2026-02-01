from fastapi import APIRouter

router = APIRouter(prefix="/test", tags=["Test"])

@router.get("/")
def say_hello():
    return {"message": "Hello from test router!"}

@router.get("/{name}")
def greet_name(name: str):
    return {"message": f"Hello, {name} the test is working!"}
