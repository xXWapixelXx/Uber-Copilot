from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from services.enhanced_data_service import enhanced_data_service
from services.advanced_analytics_service import advanced_analytics_service

router = APIRouter()

# Response Models
class MultiPlatformEarningsResponse(BaseModel):
    earner_id: str
    platform: str
    hours: int
    predictions: Dict[str, Any]
    total_predicted_earnings: Optional[float] = None
    optimal_strategy: Optional[Dict[str, Any]] = None

class LocationIntelligenceResponse(BaseModel):
    city_id: int
    current_conditions: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    heatmap_data: Optional[Dict[str, Any]] = None
    surge_patterns: Optional[Dict[str, Any]] = None
    weather_impact: Optional[Dict[str, Any]] = None

class ComprehensiveInsightsResponse(BaseModel):
    earner_id: str
    earner_profile: Dict[str, Any]
    multi_platform_performance: Dict[str, Any]
    recommendations: List[str]
    optimization_opportunities: List[Dict[str, Any]]
    predicted_performance: Dict[str, Any]
    location_insights: Dict[str, Any]

class CityComparisonResponse(BaseModel):
    cities: Dict[str, Any]
    best_cities: List[str]
    insights: Dict[str, Any]

class TimePatternsResponse(BaseModel):
    ride_patterns: Dict[str, Any]
    eats_patterns: Dict[str, Any]
    peak_hours: Dict[str, List[int]]
    recommendations: List[str]

# Endpoints

@router.get("/multi-platform-earnings/{earner_id}", response_model=MultiPlatformEarningsResponse)
async def get_multi_platform_earnings(
    earner_id: str,
    hours: int = Query(8, ge=1, le=24, description="Hours to predict"),
    platform: str = Query("both", description="Platform: rides, eats, or both")
):
    """
    Get comprehensive earnings predictions across multiple platforms (rides + eats)
    """
    try:
        predictions = advanced_analytics_service.get_multi_platform_earnings_prediction(
            earner_id=earner_id,
            hours=hours,
            platform=platform
        )
        
        if "error" in predictions:
            raise HTTPException(status_code=404, detail=predictions["error"])
        
        return MultiPlatformEarningsResponse(**predictions)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting multi-platform earnings: {str(e)}")

@router.get("/location-intelligence/{city_id}", response_model=LocationIntelligenceResponse)
async def get_location_intelligence(
    city_id: int,
    current_time: Optional[str] = Query(None, description="Current time in HH:MM format"),
    hex_id: Optional[str] = Query(None, description="Specific hexagon ID for detailed insights")
):
    """
    Get location intelligence including heatmaps, surge patterns, and recommendations
    """
    try:
        # Get location recommendations
        recommendations = advanced_analytics_service.get_location_recommendations(
            city_id=city_id,
            current_time=current_time
        )
        
        # Get detailed location data
        location_data = enhanced_data_service.get_location_intelligence(city_id, hex_id)
        
        # Get heatmap data
        heatmap_data = enhanced_data_service.get_heatmap_data(city_id)
        if not heatmap_data.empty:
            heatmap_summary = {
                "total_hexagons": len(heatmap_data),
                "avg_earnings_per_hour": heatmap_data['msg.predictions.predicted_eph'].mean(),
                "high_earning_areas": len(heatmap_data[heatmap_data['msg.predictions.predicted_eph'] > 25])
            }
        else:
            heatmap_summary = None
        
        return LocationIntelligenceResponse(
            city_id=city_id,
            current_conditions=recommendations["current_conditions"],
            recommendations=recommendations["recommendations"],
            heatmap_data=heatmap_summary,
            surge_patterns=location_data.get("surge_patterns"),
            weather_impact=location_data.get("weather_impact")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting location intelligence: {str(e)}")

@router.get("/comprehensive-insights/{earner_id}", response_model=ComprehensiveInsightsResponse)
async def get_comprehensive_insights(earner_id: str):
    """
    Get comprehensive insights for an earner including multi-platform performance, 
    optimization opportunities, and location intelligence
    """
    try:
        insights = advanced_analytics_service.get_comprehensive_earner_insights(earner_id)
        
        if "error" in insights:
            raise HTTPException(status_code=404, detail=insights["error"])
        
        return ComprehensiveInsightsResponse(
            earner_id=earner_id,
            earner_profile=insights.get("earner_profile", {}),
            multi_platform_performance=insights.get("multi_platform_performance", {}),
            recommendations=insights.get("recommendations", []),
            optimization_opportunities=insights.get("optimization_opportunities", []),
            predicted_performance=insights.get("predicted_performance", {}),
            location_insights=insights.get("location_insights", {})
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting comprehensive insights: {str(e)}")

@router.get("/city-comparison", response_model=CityComparisonResponse)
async def get_city_comparison():
    """
    Compare performance across all cities with insights and recommendations
    """
    try:
        city_comparison = enhanced_data_service.get_city_comparison()
        
        # Find best cities based on earnings
        best_cities = []
        city_earnings = {}
        
        for city_key, city_data in city_comparison.items():
            earnings_stats = city_data.get("earnings_stats", {})
            avg_earnings = earnings_stats.get("avg_daily_earnings", 0)
            city_earnings[city_key] = avg_earnings
        
        # Sort cities by earnings
        sorted_cities = sorted(city_earnings.items(), key=lambda x: x[1], reverse=True)
        best_cities = [city[0] for city in sorted_cities[:3]]
        
        insights = {
            "highest_earning_city": sorted_cities[0][0] if sorted_cities else None,
            "average_city_earnings": sum(city_earnings.values()) / len(city_earnings) if city_earnings else 0,
            "total_cities": len(city_comparison),
            "earnings_range": {
                "highest": sorted_cities[0][1] if sorted_cities else 0,
                "lowest": sorted_cities[-1][1] if sorted_cities else 0
            }
        }
        
        return CityComparisonResponse(
            cities=city_comparison,
            best_cities=best_cities,
            insights=insights
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting city comparison: {str(e)}")

@router.get("/time-patterns", response_model=TimePatternsResponse)
async def get_enhanced_time_patterns():
    """
    Get enhanced time patterns across rides and eats with recommendations
    """
    try:
        time_patterns = enhanced_data_service.get_time_patterns()
        
        # Generate recommendations based on patterns
        recommendations = []
        
        ride_patterns = time_patterns.get("ride_patterns", {})
        eats_patterns = time_patterns.get("eats_patterns", {})
        
        # Find peak hours
        if ride_patterns:
            ride_peak_hours = sorted(ride_patterns.keys(), 
                                   key=lambda x: ride_patterns[x].get("net_earnings", 0), 
                                   reverse=True)[:3]
            recommendations.append(f"Best hours for rides: {', '.join(map(str, ride_peak_hours))}")
        
        if eats_patterns:
            eats_peak_hours = sorted(eats_patterns.keys(), 
                                   key=lambda x: eats_patterns[x].get("net_earnings", 0), 
                                   reverse=True)[:3]
            recommendations.append(f"Best hours for eats: {', '.join(map(str, eats_peak_hours))}")
        
        # Add general recommendations
        recommendations.extend([
            "Consider working both rides and eats for maximum earning potential",
            "Monitor surge pricing patterns for optimal ride timing",
            "Track weather conditions for demand spikes"
        ])
        
        return TimePatternsResponse(
            ride_patterns=ride_patterns,
            eats_patterns=eats_patterns,
            peak_hours={
                "rides": time_patterns.get("peak_hours", {}).get("rides", []),
                "eats": time_patterns.get("peak_hours", {}).get("eats", [])
            },
            recommendations=recommendations
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting time patterns: {str(e)}")

@router.get("/incentive-insights/{earner_id}")
async def get_incentive_insights(earner_id: str):
    """
    Get incentive program insights and optimization recommendations for an earner
    """
    try:
        incentives = enhanced_data_service.get_incentives_for_earner(earner_id)
        
        if incentives.empty:
            return {
                "earner_id": earner_id,
                "total_quests": 0,
                "completion_rate": 0,
                "total_bonuses_earned": 0,
                "recommendations": ["Start participating in weekly quest programs to maximize bonus earnings"]
            }
        
        # Calculate insights
        total_quests = len(incentives)
        completed_quests = incentives['achieved'].sum()
        completion_rate = completed_quests / total_quests if total_quests > 0 else 0
        total_bonuses = incentives[incentives['achieved']]['bonus_eur'].sum()
        
        # Generate recommendations
        recommendations = []
        
        if completion_rate < 0.5:
            recommendations.append("Focus on completing more weekly quests to improve bonus earnings")
        
        if completion_rate > 0.8:
            recommendations.append("Excellent quest completion rate! Consider taking on additional challenges")
        
        # Check for specific program performance
        rides_quests = incentives[incentives['program'] == 'rides_quest']
        eats_quests = incentives[incentives['program'] == 'eats_quest']
        
        if not rides_quests.empty:
            rides_completion = rides_quests['achieved'].mean()
            if rides_completion < 0.5:
                recommendations.append("Focus on completing rides quests for better bonus earnings")
        
        if not eats_quests.empty:
            eats_completion = eats_quests['achieved'].mean()
            if eats_completion < 0.5:
                recommendations.append("Consider focusing more on eats delivery quests")
        
        return {
            "earner_id": earner_id,
            "total_quests": total_quests,
            "completion_rate": round(completion_rate, 2),
            "total_bonuses_earned": round(total_bonuses, 2),
            "program_breakdown": {
                "rides_quests": len(rides_quests),
                "eats_quests": len(eats_quests)
            },
            "recent_performance": incentives.tail(5).to_dict('records'),
            "recommendations": recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting incentive insights: {str(e)}")

@router.get("/platform-stats")
async def get_platform_statistics():
    """
    Get comprehensive platform statistics across all services
    """
    try:
        earners = enhanced_data_service.get_earners()
        
        stats = {
            "total_earners": len(earners),
            "platform_breakdown": {
                "drivers": len(earners[earners['earner_type'] == 'driver']),
                "couriers": len(earners[earners['earner_type'] == 'courier'])
            },
            "vehicle_distribution": earners['vehicle_type'].value_counts().to_dict(),
            "fuel_type_distribution": earners['fuel_type'].value_counts().to_dict(),
            "ev_adoption": {
                "total_ev": len(earners[earners['is_ev'] == True]),
                "percentage": round(len(earners[earners['is_ev'] == True]) / len(earners) * 100, 1)
            },
            "rating_statistics": {
                "average": round(earners['rating'].mean(), 2),
                "median": round(earners['rating'].median(), 2),
                "min": round(earners['rating'].min(), 2),
                "max": round(earners['rating'].max(), 2)
            },
            "experience_distribution": {
                "average_months": round(earners['experience_months'].mean(), 1),
                "new_drivers": len(earners[earners['experience_months'] < 12]),
                "experienced_drivers": len(earners[earners['experience_months'] > 60])
            },
            "city_distribution": earners['home_city_id'].value_counts().to_dict()
        }
        
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting platform statistics: {str(e)}")

@router.get("/health")
async def advanced_health_check():
    """
    Advanced health check for the enhanced data services
    """
    try:
        # Check data availability
        data_status = {
            "enhanced_data_service": "healthy",
            "advanced_analytics_service": "healthy",
            "total_datasets_loaded": len(enhanced_data_service.data),
            "available_datasets": list(enhanced_data_service.data.keys())
        }
        
        # Test data access
        test_earner = enhanced_data_service.get_earners()
        data_status["total_earners"] = len(test_earner)
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "data_status": data_status,
            "features_available": [
                "Multi-platform earnings predictions",
                "Location intelligence",
                "Comprehensive earner insights",
                "City comparison",
                "Enhanced time patterns",
                "Incentive optimization",
                "Platform statistics"
            ]
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
