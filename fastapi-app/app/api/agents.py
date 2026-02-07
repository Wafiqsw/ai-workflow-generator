from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.open_router import OpenRouterService
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/agents", tags=["Agents"])
open_router_service = OpenRouterService()

class ChatRequest(BaseModel):
    prompt: str
    model: Optional[str] = "openrouter/free"
    reasoning: Optional[bool] = True

class ChatResponse(BaseModel):
    content: str
    reasoning_details: Optional[Any] = None
    role: str

@router.post("/test-openrouter", response_model=ChatResponse)
async def test_openrouter_post(request: ChatRequest):
    """
    Test the OpenRouter model with a simple prompt and reasoning (POST).
    """
    try:
        messages = [{"role": "user", "content": request.prompt}]
        result = open_router_service.chat(
            messages=messages,
            model=request.model,
            reasoning=request.reasoning
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-openrouter", response_model=ChatResponse)
async def test_openrouter_get(
    prompt: str = "Hye, how are you today?", 
    model: str = "openrouter/free", 
    reasoning: bool = True
):
    """
    Test the OpenRouter model via GET (Query Parameters).
    Example: /agents/test-openrouter?prompt=Hello&reasoning=true
    """
    try:
        messages = [{"role": "user", "content": prompt}]
        result = open_router_service.chat(
            messages=messages,
            model=model,
            reasoning=reasoning
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
