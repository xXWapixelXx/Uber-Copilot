import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from models.earner import Earner, AnalyticsResponse, EarningsPrediction
from services.data_service import data_service

class AnalyticsService:
    """Service for performing analytics on earner data"""
    
    def __init__(self):
        self.data_service = data_service
    
    def get_basic_statistics(self) -> Dict[str, Any]:
        """Get basic statistics about the earner data"""
        df = self.data_service.get_dataframe()
        
        stats = {
            "total_earners": len(df),
            "earner_types": df['earner_type'].value_counts().to_dict(),
            "vehicle_types": df['vehicle_type'].value_counts().to_dict(),
            "fuel_types": df['fuel_type'].value_counts().to_dict(),
            "status_distribution": df['status'].value_counts().to_dict(),
            "cities": df['home_city_id'].nunique(),
            "avg_rating": df['rating'].mean(),
            "avg_experience_months": df['experience_months'].mean(),
            "ev_percentage": (df['is_ev'].sum() / len(df)) * 100
        }
        
        return stats
    
    def get_earnings_by_city(self) -> Dict[int, float]:
        """Calculate average earnings by city using actual data from earnings_daily sheet"""
        from services.enhanced_data_service import enhanced_data_service
        
        try:
            # Get all earnings data (not filtered by earner_id)
            all_earnings_data = enhanced_data_service.data['earnings_daily']
            earners_data = enhanced_data_service.get_earners()
            
            if all_earnings_data.empty or earners_data.empty:
                # Fallback to mock calculation if data not available
                df = self.data_service.get_dataframe()
                base_rate = 12.0
                df['mock_earnings'] = base_rate + (df['experience_months'] * 0.05) + (df['rating'] * 1.5)
                return df.groupby('home_city_id')['mock_earnings'].mean().to_dict()
            
            # Calculate actual city earnings from real data
            # Join earnings with earner data to get city information
            merged = all_earnings_data.merge(earners_data, left_on='earner_id', right_on='earner_id', how='inner')
            city_earnings = merged.groupby('home_city_id')['total_net_earnings'].mean().to_dict()
            
            return city_earnings
        except Exception as e:
            print(f"Error getting city earnings from real data: {e}")
            # Fallback to mock calculation
            df = self.data_service.get_dataframe()
            base_rate = 12.0
            df['mock_earnings'] = base_rate + (df['experience_months'] * 0.05) + (df['rating'] * 1.5)
            return df.groupby('home_city_id')['mock_earnings'].mean().to_dict()
    
    def get_earnings_by_experience(self) -> Dict[str, float]:
        """Calculate average earnings by experience level"""
        df = self.data_service.get_dataframe()
        
        # Create experience categories
        df['experience_category'] = pd.cut(
            df['experience_months'],
            bins=[0, 12, 24, 36, 60, float('inf')],
            labels=['0-12 months', '12-24 months', '24-36 months', '36-60 months', '60+ months']
        )
        
        # Mock earnings calculation
        base_rate = 15.0
        df['mock_earnings'] = base_rate + (df['experience_months'] * 0.1) + (df['rating'] * 2.0)
        
        experience_earnings = df.groupby('experience_category', observed=True)['mock_earnings'].mean().to_dict()
        return experience_earnings
    
    def get_time_patterns(self) -> Dict[str, Any]:
        """Analyze time-based patterns (mock data for demonstration)"""
        # Mock time pattern analysis
        time_patterns = {
            "peak_hours": {
                "morning": {"start": "07:00", "end": "09:00", "demand_multiplier": 1.8},
                "evening": {"start": "17:00", "end": "19:00", "demand_multiplier": 1.6},
                "night": {"start": "22:00", "end": "02:00", "demand_multiplier": 1.4}
            },
            "low_demand_hours": {
                "midday": {"start": "14:00", "end": "16:00", "demand_multiplier": 0.6},
                "late_night": {"start": "02:00", "end": "06:00", "demand_multiplier": 0.4}
            },
            "recommended_break_times": [
                {"start": "14:00", "end": "15:00", "reason": "Low demand period"},
                {"start": "03:00", "end": "05:00", "reason": "Minimal activity"}
            ]
        }
        
        return time_patterns
    
    def get_earner_insights(self, earner_id: str) -> Dict[str, Any]:
        """Get personalized insights for a specific earner using actual earnings data"""
        from services.enhanced_data_service import enhanced_data_service
        
        earners = self.data_service.get_all_earners()
        earner = next((e for e in earners if e.earner_id == earner_id), None)
        
        if not earner:
            return {"error": "Earner not found"}
        
        # Get actual earnings data for this earner
        try:
            earner_earnings = enhanced_data_service.get_earnings_daily(earner_id)
        except Exception as e:
            print(f"Error getting earnings for earner {earner_id}: {e}")
            earner_earnings = pd.DataFrame()  # Empty dataframe
        
        if earner_earnings.empty:
            # Fallback to mock calculation if no earnings data
            base_rate = 12.0
            actual_earnings = base_rate + (earner.experience_months * 0.05) + (earner.rating * 1.5)
        else:
            # Calculate actual hourly earnings from real data
            total_earnings = earner_earnings['total_net_earnings'].sum()
            total_days = len(earner_earnings)
            avg_daily_earnings = total_earnings / total_days if total_days > 0 else 0
            # Assuming 8 hours per day average
            actual_earnings = avg_daily_earnings / 8 if avg_daily_earnings > 0 else 12.0
        
        # Get city average for comparison
        city_earnings = self.get_earnings_by_city()
        city_avg = city_earnings.get(earner.home_city_id, actual_earnings)
        
        insights = {
            "earner_id": earner_id,
            "predicted_hourly_earnings": round(actual_earnings, 2),
            "city_average_earnings": round(city_avg, 2),
            "performance_vs_city": round(((actual_earnings - city_avg) / city_avg) * 100, 1),
            "recommendations": self._generate_recommendations(earner, actual_earnings, city_avg)
        }
        
        return insights
    
    def _generate_recommendations(self, earner: Earner, earnings: float, city_avg: float) -> List[str]:
        """Generate personalized recommendations for an earner"""
        recommendations = []
        
        if earner.rating < 4.5:
            recommendations.append("Consider focusing on improving your rating through better service")
        
        if earner.experience_months < 12:
            recommendations.append("You're still new - focus on learning the best routes and times")
        
        if earnings < city_avg:
            recommendations.append("Try working during peak hours to increase earnings")
        
        if earner.vehicle_type.value == "car" and not earner.is_ev:
            recommendations.append("Consider switching to an EV for potential cost savings")
        
        if earner.status.value == "offline":
            recommendations.append("Go online during peak hours for better earning opportunities")
        
        return recommendations
    
    def predict_earnings(self, earner_id: str, hours: int = 8) -> EarningsPrediction:
        """Predict earnings for a specific earner over a given time period"""
        insights = self.get_earner_insights(earner_id)
        
        if "error" in insights:
            return EarningsPrediction(
                predicted_earnings_per_hour=0.0,
                confidence_score=0.0,
                factors=["Earner not found"],
                recommendation="Please check earner ID"
            )
        
        hourly_rate = insights["predicted_hourly_earnings"]
        total_earnings = hourly_rate * hours
        
        # Get earner earnings data to check if we have real data
        from services.enhanced_data_service import enhanced_data_service
        try:
            earner_earnings = enhanced_data_service.get_earnings_daily(earner_id)
        except:
            earner_earnings = pd.DataFrame()
        
        # Calculate confidence based on data quality and availability
        if not earner_earnings.empty:
            # High confidence for earners with actual data
            confidence = min(0.95, max(0.8, insights["performance_vs_city"] / 100 + 0.7))
        else:
            # Lower confidence for mock calculations
            confidence = min(0.75, max(0.5, insights["performance_vs_city"] / 100 + 0.5))
        
        # Get earner data for factors
        earners = self.data_service.get_all_earners()
        earner = next((e for e in earners if e.earner_id == earner_id), None)
        
        factors = [
            f"Experience: {earner.experience_months if earner else 'N/A'} months",
            f"Rating: {earner.rating if earner else 'N/A'}",
            f"City performance: {insights['performance_vs_city']}% vs average"
        ]
        
        recommendation = f"Expected earnings: ${total_earnings:.2f} for {hours} hours"
        
        return EarningsPrediction(
            predicted_earnings_per_hour=hourly_rate,
            confidence_score=confidence,
            factors=factors,
            recommendation=recommendation
        )

# Global instance
analytics_service = AnalyticsService()

