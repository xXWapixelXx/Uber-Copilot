import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from services.enhanced_data_service import enhanced_data_service

class AdvancedAnalyticsService:
    """
    Advanced analytics service providing multi-platform insights,
    location intelligence, and predictive analytics for Uber Smart Copilot
    """
    
    def __init__(self):
        self.data_service = enhanced_data_service
    
    def get_comprehensive_earner_insights(self, earner_id: str) -> Dict[str, Any]:
        """Get comprehensive insights for a specific earner across all platforms"""
        
        # Get multi-platform performance
        performance = self.data_service.get_multi_platform_performance(earner_id)
        
        if "error" in performance:
            return performance
        
        # Calculate additional insights
        insights = {
            **performance,
            "recommendations": self._generate_earner_recommendations(performance),
            "optimization_opportunities": self._find_optimization_opportunities(performance),
            "predicted_performance": self._predict_earner_performance(performance),
            "location_insights": self._get_earner_location_insights(earner_id)
        }
        
        return insights
    
    def _generate_earner_recommendations(self, performance: Dict[str, Any]) -> List[str]:
        """Generate personalized recommendations based on performance data"""
        recommendations = []
        
        rides_perf = performance.get("rides_performance", {})
        eats_perf = performance.get("eats_performance", {})
        incentives = performance.get("incentive_performance", {})
        
        # Rides recommendations
        if rides_perf.get("total_rides", 0) > 0:
            avg_earnings_per_ride = rides_perf["total_earnings"] / rides_perf["total_rides"]
            if avg_earnings_per_ride < 15:
                recommendations.append("Consider working during peak hours for higher ride earnings")
            
            if rides_perf.get("total_tips", 0) == 0:
                recommendations.append("Focus on customer service to increase tip earnings")
        
        # Eats recommendations
        if eats_perf.get("total_orders", 0) > 0:
            avg_basket = eats_perf.get("avg_basket_value", 0)
            if avg_basket > 25:
                recommendations.append("You're getting high-value orders! Consider working more during meal times")
            
            if eats_perf.get("avg_delivery_distance", 0) > 5:
                recommendations.append("Consider focusing on shorter delivery distances for efficiency")
        
        # Multi-platform recommendations
        if rides_perf.get("total_rides", 0) > 0 and eats_perf.get("total_orders", 0) > 0:
            rides_earnings = rides_perf.get("total_earnings", 0)
            eats_earnings = eats_perf.get("total_earnings", 0)
            
            if rides_earnings > eats_earnings * 2:
                recommendations.append("You excel at rides! Consider focusing more on ride requests")
            elif eats_earnings > rides_earnings * 2:
                recommendations.append("You're great at deliveries! Consider prioritizing eats orders")
        
        # Incentive recommendations
        completion_rate = incentives.get("completion_rate", 0)
        if completion_rate < 0.5:
            recommendations.append("Focus on completing weekly quests to maximize bonus earnings")
        
        return recommendations
    
    def _find_optimization_opportunities(self, performance: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Find specific optimization opportunities"""
        opportunities = []
        
        daily_earnings = performance.get("daily_earnings_summary", {})
        avg_daily = daily_earnings.get("avg_daily_earnings", 0)
        
        if avg_daily > 0:
            # Compare with platform averages
            platform_avg = 85  # Estimated platform average
            
            if avg_daily < platform_avg * 0.8:
                opportunities.append({
                    "type": "earnings_boost",
                    "priority": "high",
                    "description": f"Your daily earnings (€{avg_daily:.2f}) are below platform average",
                    "potential_improvement": f"€{(platform_avg - avg_daily):.2f} per day"
                })
        
        # Check vehicle efficiency
        earner_profile = performance.get("earner_profile", {})
        if earner_profile.get("fuel_type") == "gas":
            opportunities.append({
                "type": "vehicle_upgrade",
                "priority": "medium",
                "description": "Consider upgrading to hybrid or EV for better earnings",
                "potential_improvement": "10-15% higher earnings potential"
            })
        
        # Check rating optimization
        rating = earner_profile.get("rating", 0)
        if rating < 4.5:
            opportunities.append({
                "type": "rating_improvement",
                "priority": "high",
                "description": f"Improve your rating from {rating:.2f} to 4.5+ for better opportunities",
                "potential_improvement": "More ride requests and higher earnings"
            })
        
        return opportunities
    
    def _predict_earner_performance(self, performance: Dict[str, Any]) -> Dict[str, Any]:
        """Predict future performance based on historical data"""
        
        daily_earnings = performance.get("daily_earnings_summary", {})
        avg_daily = daily_earnings.get("avg_daily_earnings", 0)
        
        # Simple prediction model
        predictions = {
            "next_week_earnings": avg_daily * 7,
            "next_month_earnings": avg_daily * 30,
            "confidence_level": 0.75,
            "factors": [
                "Historical performance",
                "Platform trends",
                "Seasonal patterns"
            ]
        }
        
        return predictions
    
    def _get_earner_location_insights(self, earner_id: str) -> Dict[str, Any]:
        """Get location-specific insights for an earner"""
        
        earner = self.data_service.get_earner_by_id(earner_id)
        if earner is None:
            return {"error": "Earner not found"}
        
        home_city = earner.get("home_city_id")
        if not home_city:
            return {"error": "No home city data"}
        
        # Get location intelligence for home city
        location_data = self.data_service.get_location_intelligence(home_city)
        
        # Get city-specific performance
        city_earnings = self.data_service.get_earnings_daily(earner_id)
        city_earnings = city_earnings[city_earnings['city_id'] == home_city]
        
        return {
            "home_city": home_city,
            "city_performance": {
                "avg_daily_earnings": city_earnings['total_net_earnings'].mean() if not city_earnings.empty else 0,
                "best_performing_day": city_earnings['total_net_earnings'].max() if not city_earnings.empty else 0,
                "consistency_score": 1 - (city_earnings['total_net_earnings'].std() / city_earnings['total_net_earnings'].mean()) if not city_earnings.empty and city_earnings['total_net_earnings'].mean() > 0 else 0
            },
            "location_intelligence": location_data
        }
    
    def get_multi_platform_earnings_prediction(self, earner_id: str, hours: int = 8, 
                                             platform: str = "both") -> Dict[str, Any]:
        """Predict earnings across multiple platforms"""
        
        earner = self.data_service.get_earner_by_id(earner_id)
        if earner is None:
            return {"error": "Earner not found"}
        
        performance = self.data_service.get_multi_platform_performance(earner_id)
        
        # Get time patterns
        time_patterns = self.data_service.get_time_patterns()
        current_hour = datetime.now().hour
        
        predictions = {
            "earner_id": earner_id,
            "platform": platform,
            "hours": hours,
            "predictions": {}
        }
        
        if platform in ["rides", "both"]:
            rides_prediction = self._predict_rides_earnings(performance, time_patterns, current_hour, hours)
            predictions["predictions"]["rides"] = rides_prediction
        
        if platform in ["eats", "both"]:
            eats_prediction = self._predict_eats_earnings(performance, time_patterns, current_hour, hours)
            predictions["predictions"]["eats"] = eats_prediction
        
        # Combined prediction
        if platform == "both":
            total_predicted = (
                predictions["predictions"].get("rides", {}).get("predicted_earnings", 0) +
                predictions["predictions"].get("eats", {}).get("predicted_earnings", 0)
            )
            predictions["total_predicted_earnings"] = total_predicted
            predictions["optimal_strategy"] = self._recommend_optimal_strategy(predictions["predictions"])
        
        return predictions
    
    def _predict_rides_earnings(self, performance: Dict[str, Any], time_patterns: Dict[str, Any], 
                               current_hour: int, hours: int) -> Dict[str, Any]:
        """Predict rides earnings based on historical data and time patterns"""
        
        rides_perf = performance.get("rides_performance", {})
        total_rides = rides_perf.get("total_rides", 0)
        
        if total_rides == 0:
            # Use platform averages for new earners
            avg_earnings_per_hour = 12.50
        else:
            # Calculate from historical data
            total_earnings = rides_perf.get("total_earnings", 0)
            # Estimate total hours worked (rough calculation)
            avg_duration = rides_perf.get("avg_duration", 15)  # minutes per ride
            estimated_hours = (total_rides * avg_duration) / 60
            avg_earnings_per_hour = total_earnings / estimated_hours if estimated_hours > 0 else 12.50
        
        # Adjust for time patterns
        ride_patterns = time_patterns.get("ride_patterns", {})
        surge_adjustment = 1.0
        
        for hour in range(current_hour, current_hour + hours):
            hour_data = ride_patterns.get(hour % 24, {})
            surge_multiplier = hour_data.get("surge_multiplier", 1.0)
            surge_adjustment += (surge_multiplier - 1.0) * 0.1
        
        predicted_earnings = avg_earnings_per_hour * hours * surge_adjustment
        
        return {
            "predicted_earnings": round(predicted_earnings, 2),
            "hourly_rate": round(avg_earnings_per_hour * surge_adjustment, 2),
            "confidence_score": 0.8 if total_rides > 10 else 0.6,
            "factors": [
                f"Historical performance ({total_rides} rides)",
                "Time-based surge patterns",
                "Platform demand trends"
            ]
        }
    
    def _predict_eats_earnings(self, performance: Dict[str, Any], time_patterns: Dict[str, Any], 
                              current_hour: int, hours: int) -> Dict[str, Any]:
        """Predict eats earnings based on historical data and time patterns"""
        
        eats_perf = performance.get("eats_performance", {})
        total_orders = eats_perf.get("total_orders", 0)
        
        if total_orders == 0:
            # Use platform averages for new earners
            avg_earnings_per_hour = 8.50
        else:
            # Calculate from historical data
            total_earnings = eats_perf.get("total_earnings", 0)
            avg_duration = eats_perf.get("avg_delivery_distance", 20)  # minutes per order (estimated)
            estimated_hours = (total_orders * avg_duration) / 60
            avg_earnings_per_hour = total_earnings / estimated_hours if estimated_hours > 0 else 8.50
        
        # Adjust for time patterns
        eats_patterns = time_patterns.get("eats_patterns", {})
        demand_adjustment = 1.0
        
        for hour in range(current_hour, current_hour + hours):
            hour_data = eats_patterns.get(hour % 24, {})
            # Use earnings as proxy for demand
            hour_earnings = hour_data.get("net_earnings", avg_earnings_per_hour)
            demand_adjustment += (hour_earnings / avg_earnings_per_hour - 1.0) * 0.05
        
        predicted_earnings = avg_earnings_per_hour * hours * demand_adjustment
        
        return {
            "predicted_earnings": round(predicted_earnings, 2),
            "hourly_rate": round(avg_earnings_per_hour * demand_adjustment, 2),
            "confidence_score": 0.75 if total_orders > 10 else 0.6,
            "factors": [
                f"Historical performance ({total_orders} orders)",
                "Time-based demand patterns",
                "Basket value trends"
            ]
        }
    
    def _recommend_optimal_strategy(self, predictions: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend optimal strategy based on predictions"""
        
        rides_pred = predictions.get("rides", {})
        eats_pred = predictions.get("eats", {})
        
        rides_earnings = rides_pred.get("predicted_earnings", 0)
        eats_earnings = eats_pred.get("predicted_earnings", 0)
        
        if rides_earnings > eats_earnings * 1.5:
            return {
                "strategy": "focus_rides",
                "recommendation": "Focus primarily on ride requests for maximum earnings",
                "expected_earnings": rides_earnings,
                "reasoning": "Rides show significantly higher earning potential"
            }
        elif eats_earnings > rides_earnings * 1.5:
            return {
                "strategy": "focus_eats",
                "recommendation": "Focus primarily on food delivery for maximum earnings",
                "expected_earnings": eats_earnings,
                "reasoning": "Eats delivery shows significantly higher earning potential"
            }
        else:
            return {
                "strategy": "multi_platform",
                "recommendation": "Balance between rides and eats for optimal earnings",
                "expected_earnings": rides_earnings + eats_earnings,
                "reasoning": "Both platforms offer similar earning potential"
            }
    
    def get_location_recommendations(self, city_id: int, current_time: Optional[str] = None) -> Dict[str, Any]:
        """Get location-based recommendations for optimal earnings"""
        
        location_data = self.data_service.get_location_intelligence(city_id)
        surge_data = self.data_service.get_surge_data(city_id)
        weather_data = self.data_service.get_weather_data(city_id)
        
        # Get current hour
        if current_time:
            current_hour = int(current_time.split(':')[0])
        else:
            current_hour = datetime.now().hour
        
        # Get surge multiplier for current hour
        current_surge = surge_data[surge_data['hour'] == current_hour]
        surge_multiplier = current_surge['surge_multiplier'].iloc[0] if not current_surge.empty else 1.0
        
        # Get weather impact
        today = datetime.now().strftime('%Y-%m-%d')
        today_weather = weather_data[weather_data['date'].dt.strftime('%Y-%m-%d') == today]
        weather = today_weather['weather'].iloc[0] if not today_weather.empty else 'clear'
        
        recommendations = {
            "current_conditions": {
                "hour": current_hour,
                "surge_multiplier": surge_multiplier,
                "weather": weather
            },
            "recommendations": []
        }
        
        # Generate recommendations based on conditions
        if surge_multiplier > 1.3:
            recommendations["recommendations"].append({
                "type": "high_surge",
                "priority": "high",
                "message": f"High surge detected ({surge_multiplier:.2f}x)! Great time to drive.",
                "action": "Stay online and accept rides immediately"
            })
        elif surge_multiplier < 0.8:
            recommendations["recommendations"].append({
                "type": "low_demand",
                "priority": "medium",
                "message": f"Low demand period ({surge_multiplier:.2f}x surge). Consider taking a break.",
                "action": "Consider resting or switching to eats delivery"
            })
        
        if weather == "rain":
            recommendations["recommendations"].append({
                "type": "weather_boost",
                "priority": "high",
                "message": "Rainy weather typically increases demand for rides.",
                "action": "Focus on ride requests during rain"
            })
        
        # Add location-specific recommendations
        heatmap_data = location_data.get("heatmap_insights", {})
        if heatmap_data.get("avg_earnings_per_hour", 0) > 25:
            recommendations["recommendations"].append({
                "type": "high_earning_area",
                "priority": "high",
                "message": "You're in a high-earning area!",
                "action": "Stay in this location for optimal earnings"
            })
        
        return recommendations

# Global instance
advanced_analytics_service = AdvancedAnalyticsService()
