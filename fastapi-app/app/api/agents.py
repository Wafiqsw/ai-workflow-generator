from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.open_router import chat_with_openrouter, run_agent_query
from app.services.vector_service import reindex_all_apis
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/agents", tags=["Agents"])

class ChatRequest(BaseModel):
    prompt: str
    model: Optional[str] = "openrouter/free"
    reasoning: Optional[bool] = True

class AgentQueryRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    content: str
    reasoning_details: Optional[Any] = None
    role: str

import re

class AgentQueryResponse(BaseModel):
    content: str
    is_feasible: bool = True
    score: float = 1.0
    reason: Optional[str] = None
    workflow_id: Optional[str] = None

@router.post("/query", response_model=AgentQueryResponse)
async def query_agent(request: AgentQueryRequest):
    """
    Invoke the LangChain agent with tools (Vector Search & Feasibility).
    """
    try:
        content = run_agent_query(request.prompt)
        
        # Parse [FEASIBILITY_REPORT: is_feasible=True/False, score=0.X, reason='...']
        is_feasible = True
        score = 1.0
        reason = None
        workflow_id = None
        
        report_match = re.search(r"\[FEASIBILITY_REPORT:\s*is_feasible=(True|False),\s*score=([0-9.]+),\s*reason='(.*?)'\]", content)
        
        if report_match:
            is_feasible = report_match.group(1) == "True"
            score = float(report_match.group(2))
            reason = report_match.group(3)
            # Remove the report from the user-facing content
            content = content.replace(report_match.group(0), "").strip()

        # Parse Folder ID: `wf_...`
        id_match = re.search(r"`(wf_[a-z0-9]+)`", content)
        if not id_match:
            # Also check without backticks
            id_match = re.search(r"wf_[a-z0-9]{8}", content)
            
        if id_match:
            # If it matches the pattern wf_ plus 8 lower-alpha/nums
            workflow_id = id_match.group(1) if "`" in id_match.group(0) else id_match.group(0)

        return AgentQueryResponse(
            content=content,
            is_feasible=is_feasible,
            score=score,
            reason=reason,
            workflow_id=workflow_id
        )
    except Exception as e:
        error_detail = str(e)
        # Try to extract the inner error message if it's an OpenAI/OpenRouter status error
        if "Provider returned error" in error_detail:
            match = re.search(r'"message":"(.*?)"', error_detail)
            if match:
                error_detail = match.group(1)
        
        return AgentQueryResponse(
            content=f"❌ Backend Error: {error_detail}",
            is_feasible=False,
            score=0.0,
            reason=f"Technical Failure: {error_detail}"
        )

@router.post("/reindex")
async def reindex_apis():
    """
    Manually trigger re-indexing of all APIs from MySQL to ChromaDB.
    """
    try:
        result = reindex_all_apis()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-openrouter", response_model=ChatResponse)
async def test_openrouter_post(request: ChatRequest):
    """
    Test the OpenRouter model with a simple prompt and reasoning (POST).
    """
    try:
        messages = [{"role": "user", "content": request.prompt}]
        result = chat_with_openrouter(
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
        result = chat_with_openrouter(
            messages=messages,
            model=model,
            reasoning=reasoning
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
