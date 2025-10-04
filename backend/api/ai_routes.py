from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from services.ai_service import ai_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    use_case: str = "general_chat"  # earnings_prediction, rest_optimization, general_chat
    earner_id: Optional[str] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: Optional[str] = None
    error: Optional[str] = None
    fallback_response: Optional[str] = None
    usage: Optional[Dict[str, int]] = None
    model: Optional[str] = None
    timestamp: str
    context_used: bool = False

class EarningsPredictionRequest(BaseModel):
    earner_id: str
    hours: int = 8
    additional_context: str = ""

class RestRecommendationRequest(BaseModel):
    earner_id: Optional[str] = None
    current_time: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat with the AI assistant for general questions, earnings predictions, or rest optimization.
    
    Use cases:
    - general_chat: General Uber driver questions
    - earnings_prediction: Earnings optimization advice
    - rest_optimization: Rest timing recommendations
    """
    try:
        result = await ai_service.chat_completion(
            message=request.message,
            use_case=request.use_case,
            earner_id=request.earner_id,
            conversation_history=request.conversation_history
        )
        
        return ChatResponse(
            response=result.get("response"),
            error=result.get("error"),
            fallback_response=result.get("fallback_response"),
            usage=result.get("usage"),
            model=result.get("model"),
            timestamp=result["timestamp"],
            context_used=result.get("context_used", False)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@router.post("/predict-earnings", response_model=ChatResponse)
async def predict_earnings_with_ai(request: EarningsPredictionRequest):
    """
    Get AI-enhanced earnings prediction for a specific earner.
    """
    try:
        result = await ai_service.predict_earnings_with_ai(
            earner_id=request.earner_id,
            hours=request.hours,
            additional_context=request.additional_context
        )
        
        return ChatResponse(
            response=result.get("response"),
            error=result.get("error"),
            fallback_response=result.get("fallback_response"),
            usage=result.get("usage"),
            model=result.get("model"),
            timestamp=result["timestamp"],
            context_used=result.get("context_used", False)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Earnings prediction error: {str(e)}")

@router.post("/rest-recommendations", response_model=ChatResponse)
async def get_rest_recommendations(request: RestRecommendationRequest):
    """
    Get AI-powered rest recommendations based on current time and earner profile.
    """
    try:
        result = await ai_service.get_rest_recommendations(
            earner_id=request.earner_id,
            current_time=request.current_time
        )
        
        return ChatResponse(
            response=result.get("response"),
            error=result.get("error"),
            fallback_response=result.get("fallback_response"),
            usage=result.get("usage"),
            model=result.get("model"),
            timestamp=result["timestamp"],
            context_used=result.get("context_used", False)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rest recommendations error: {str(e)}")

@router.get("/chat/examples")
async def get_chat_examples():
    """
    Get example prompts for different use cases.
    """
    examples = {
        "general_chat": [
            "How can I improve my driver rating?",
            "What are the best practices for Uber drivers?",
            "How do I handle difficult passengers?",
            "What should I do if my car breaks down during a ride?"
        ],
        "earnings_prediction": [
            "When is the best time to go online today?",
            "How much can I expect to earn this weekend?",
            "Should I work in the city center or suburbs?",
            "What's my earning potential based on my profile?"
        ],
        "rest_optimization": [
            "When should I take a break?",
            "Is now a good time to rest?",
            "How long should my break be?",
            "What are the signs I need to rest?"
        ]
    }
    
    return {"examples": examples}

@router.get("/health")
async def ai_health_check():
    """
    Check if the AI service is properly configured and available.
    """
    from services.ai_service import MISTRAL_AVAILABLE
    
    health_status = {
        "mistral_available": MISTRAL_AVAILABLE,
        "api_key_configured": bool(ai_service.api_key),
        "client_initialized": ai_service.client is not None,
        "model": ai_service.model,
        "status": "healthy" if ai_service.client else "unavailable"
    }
    
    return health_status

@router.get("/models")
async def get_available_models():
    """
    Get information about available Mistral models.
    """
    models_info = {
        "current_model": ai_service.model,
        "available_models": [
            "mistral-tiny",
            "mistral-small", 
            "mistral-medium",
            "mistral-large-latest",
            "codestral-latest"
        ],
        "recommended_for_chat": "mistral-large-latest",
        "recommended_for_code": "codestral-latest"
    }
    
    return models_info

