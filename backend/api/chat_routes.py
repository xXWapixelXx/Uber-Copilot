from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from services.ai_service import ai_service
from services.analytics_service import analytics_service
from services.data_service import data_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's chat message", min_length=1, max_length=1000)
    earner_id: Optional[str] = Field(None, description="Earner ID for personalized responses")
    conversation_history: Optional[List[Dict[str, str]]] = Field(None, description="Previous conversation messages")

class ChatResponse(BaseModel):
    response: str = Field(..., description="AI assistant's response")
    earner_insights: Optional[Dict[str, Any]] = Field(None, description="Personalized insights for the earner")
    timestamp: str = Field(..., description="Response timestamp")
    context_used: bool = Field(..., description="Whether earner context was used")

class EarningsPredictRequest(BaseModel):
    earner_id: str = Field(..., description="Earner ID for personalized prediction")
    hours: int = Field(8, description="Number of hours to predict", ge=1, le=24)
    additional_context: Optional[str] = Field("", description="Additional context for prediction")

class EarningsPredictResponse(BaseModel):
    predicted_earnings: float = Field(..., description="Predicted total earnings")
    hourly_rate: float = Field(..., description="Predicted hourly rate")
    confidence_score: float = Field(..., description="Prediction confidence (0-1)")
    ai_insights: str = Field(..., description="AI-generated insights and recommendations")
    factors: List[str] = Field(..., description="Key factors influencing the prediction")
    timestamp: str = Field(..., description="Prediction timestamp")

class RestOptimizeResponse(BaseModel):
    current_time: str = Field(..., description="Current time used for optimization")
    recommended_break_times: List[Dict[str, Any]] = Field(..., description="Recommended break windows")
    optimal_duration: str = Field(..., description="Recommended break duration")
    ai_recommendations: str = Field(..., description="AI-generated rest optimization advice")
    demand_impact: Dict[str, Any] = Field(..., description="Impact on earnings during break")
    timestamp: str = Field(..., description="Response timestamp")

class DashboardStatsResponse(BaseModel):
    total_earners: int = Field(..., description="Total number of earners")
    earnings_by_city: Dict[str, float] = Field(..., description="Average earnings by city")
    earnings_by_experience: Dict[str, float] = Field(..., description="Average earnings by experience level")
    time_patterns: Dict[str, Any] = Field(..., description="Demand patterns by time")
    vehicle_type_distribution: Dict[str, int] = Field(..., description="Distribution of vehicle types")
    rating_statistics: Dict[str, float] = Field(..., description="Rating statistics")
    timestamp: str = Field(..., description="Data timestamp")

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Chat with the AI assistant for general questions, tips, and advice.
    Provides personalized responses when earner_id is provided.
    """
    try:
        # Get AI response
        result = await ai_service.chat_completion(
            message=request.message,
            use_case="general_chat",
            earner_id=request.earner_id,
            conversation_history=request.conversation_history
        )
        
        # Get earner insights if earner_id provided
        earner_insights = None
        if request.earner_id:
            try:
                earner_insights = analytics_service.get_earner_insights(request.earner_id)
            except Exception as e:
                print(f"Warning: Could not get earner insights: {e}")
        
        return ChatResponse(
            response=result.get("response") or result.get("fallback_response", "I'm here to help!"),
            earner_insights=earner_insights if earner_insights and "error" not in earner_insights else None,
            timestamp=result["timestamp"],
            context_used=result.get("context_used", False)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")

@router.post("/earnings/predict", response_model=EarningsPredictResponse)
async def predict_earnings(request: EarningsPredictRequest):
    """
    Get AI-enhanced earnings prediction for a specific earner.
    Combines data analytics with AI insights for accurate forecasting.
    """
    try:
        # Get AI-powered prediction
        ai_result = await ai_service.predict_earnings_with_ai(
            earner_id=request.earner_id,
            hours=request.hours,
            additional_context=request.additional_context
        )
        
        # Get analytical prediction as backup
        analytical_prediction = analytics_service.predict_earnings(request.earner_id, request.hours)
        
        # Calculate final prediction (average of AI and analytical)
        ai_response = ai_result.get("response") or ai_result.get("fallback_response", "")
        
        # Extract hourly rate from analytical prediction
        hourly_rate = analytical_prediction.predicted_earnings_per_hour
        total_earnings = hourly_rate * request.hours
        confidence = analytical_prediction.confidence_score
        
        return EarningsPredictResponse(
            predicted_earnings=round(total_earnings, 2),
            hourly_rate=round(hourly_rate, 2),
            confidence_score=round(confidence, 2),
            ai_insights=ai_response,
            factors=analytical_prediction.factors,
            timestamp=ai_result["timestamp"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Earnings prediction error: {str(e)}")

@router.get("/rest/optimize", response_model=RestOptimizeResponse)
async def optimize_rest_times(
    current_time: Optional[str] = None,
    earner_id: Optional[str] = None
):
    """
    Get AI-powered rest optimization recommendations based on current time and demand patterns.
    """
    try:
        # Get AI recommendations
        ai_result = await ai_service.get_rest_recommendations(
            earner_id=earner_id,
            current_time=current_time
        )
        
        # Get time patterns for demand impact
        time_patterns = analytics_service.get_time_patterns()
        
        # Get recommended break times
        recommended_breaks = time_patterns.get("recommended_break_times", [])
        
        # Calculate demand impact
        current_hour = int(current_time.split(':')[0]) if current_time else 14
        demand_multiplier = 1.0
        
        # Simple demand calculation based on time
        if 7 <= current_hour <= 9:  # Morning peak
            demand_multiplier = 1.8
        elif 17 <= current_hour <= 19:  # Evening peak
            demand_multiplier = 1.6
        elif 22 <= current_hour <= 2:  # Night peak
            demand_multiplier = 1.4
        elif 14 <= current_hour <= 16:  # Low demand
            demand_multiplier = 0.6
        elif 2 <= current_hour <= 6:  # Very low demand
            demand_multiplier = 0.4
        
        return RestOptimizeResponse(
            current_time=current_time or "14:30",
            recommended_break_times=recommended_breaks,
            optimal_duration="30-60 minutes",
            ai_recommendations=ai_result.get("response") or ai_result.get("fallback_response", ""),
            demand_impact={
                "current_demand_multiplier": demand_multiplier,
                "earnings_impact": f"{int((1 - demand_multiplier) * 100)}%",
                "break_recommended": demand_multiplier < 1.0
            },
            timestamp=ai_result["timestamp"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rest optimization error: {str(e)}")

@router.get("/dashboard/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats():
    """
    Get aggregated statistics and data for dashboard charts and visualizations.
    """
    try:
        # Get basic statistics
        stats = analytics_service.get_basic_statistics()
        
        # Get earnings data
        city_earnings = analytics_service.get_earnings_by_city()
        experience_earnings = analytics_service.get_earnings_by_experience()
        
        # Get time patterns
        time_patterns = analytics_service.get_time_patterns()
        
        # Format city earnings as string keys for JSON serialization
        city_earnings_formatted = {str(k): round(v, 2) for k, v in city_earnings.items()}
        
        return DashboardStatsResponse(
            total_earners=stats["total_earners"],
            earnings_by_city=city_earnings_formatted,
            earnings_by_experience=experience_earnings,
            time_patterns=time_patterns,
            vehicle_type_distribution=stats["vehicle_types"],
            rating_statistics={
                "average": round(stats["avg_rating"], 2),
                "min": 1.0,
                "max": 5.0
            },
            timestamp=stats.get("timestamp", "2024-01-01T00:00:00")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard stats error: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for the chat API"""
    return {
        "status": "healthy",
        "service": "chat-api",
        "ai_available": ai_service.client is not None,
        "data_loaded": data_service._data is not None
    }
