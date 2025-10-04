from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.earner import Earner, AnalyticsResponse, EarningsPrediction
from services.data_service import data_service
from services.analytics_service import analytics_service

router = APIRouter()

@router.get("/earners", response_model=List[Earner])
async def get_all_earners():
    """Get all earners"""
    try:
        earners = data_service.get_all_earners()
        return earners
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving earners: {str(e)}")

@router.get("/earners/{earner_id}", response_model=Earner)
async def get_earner_by_id(earner_id: str):
    """Get a specific earner by ID"""
    try:
        earners = data_service.get_all_earners()
        earner = next((e for e in earners if e.earner_id == earner_id), None)
        
        if not earner:
            raise HTTPException(status_code=404, detail="Earner not found")
        
        return earner
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving earner: {str(e)}")

@router.get("/earners/city/{city_id}", response_model=List[Earner])
async def get_earners_by_city(city_id: int):
    """Get earners filtered by city ID"""
    try:
        earners = data_service.get_earners_by_city(city_id)
        return earners
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving earners by city: {str(e)}")

@router.get("/analytics/statistics")
async def get_basic_statistics():
    """Get basic statistics about the earner data"""
    try:
        stats = analytics_service.get_basic_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving statistics: {str(e)}")

@router.get("/analytics/earnings/by-city")
async def get_earnings_by_city():
    """Get average earnings by city"""
    try:
        earnings = analytics_service.get_earnings_by_city()
        return {"earnings_by_city": earnings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving earnings by city: {str(e)}")

@router.get("/analytics/earnings/by-experience")
async def get_earnings_by_experience():
    """Get average earnings by experience level"""
    try:
        earnings = analytics_service.get_earnings_by_experience()
        return {"earnings_by_experience": earnings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving earnings by experience: {str(e)}")

@router.get("/analytics/time-patterns")
async def get_time_patterns():
    """Get time-based demand patterns and recommendations"""
    try:
        patterns = analytics_service.get_time_patterns()
        return patterns
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving time patterns: {str(e)}")

@router.get("/analytics/earner/{earner_id}/insights")
async def get_earner_insights(earner_id: str):
    """Get personalized insights for a specific earner"""
    try:
        insights = analytics_service.get_earner_insights(earner_id)
        
        if "error" in insights:
            raise HTTPException(status_code=404, detail=insights["error"])
        
        return insights
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving earner insights: {str(e)}")

@router.get("/analytics/earner/{earner_id}/predict", response_model=EarningsPrediction)
async def predict_earnings(
    earner_id: str,
    hours: int = Query(8, description="Number of hours to predict earnings for", ge=1, le=24)
):
    """Predict earnings for a specific earner over a given time period"""
    try:
        prediction = analytics_service.predict_earnings(earner_id, hours)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting earnings: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for the API"""
    return {"status": "healthy", "service": "earner-api"}

