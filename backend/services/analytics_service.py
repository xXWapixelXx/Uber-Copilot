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
                # Return empty dict if no real data available
                print("Warning: No earnings data available from Excel sheets")
                return {}
            
            # Calculate actual city hourly earnings from real working hours
            # Join earnings with earner data to get city information
            merged = all_earnings_data.merge(earners_data, left_on='earner_id', right_on='earner_id', how='inner')
            
            # Calculate hourly rates for each city
            city_hourly_rates = {}
            for city_id in merged['home_city_id'].unique():
                city_data = merged[merged['home_city_id'] == city_id]
                total_earnings = city_data['total_net_earnings'].sum()
                total_working_mins = (city_data['rides_duration_mins'] + city_data['eats_duration_mins']).sum()
                total_working_hours = total_working_mins / 60 if total_working_mins > 0 else 1
                hourly_rate = total_earnings / total_working_hours if total_working_hours > 0 else 15.0
                city_hourly_rates[city_id] = hourly_rate
            
            return city_hourly_rates
        except Exception as e:
            print(f"Error getting city earnings from real data: {e}")
            # Return empty dict if no real data available
            return {}
    
    def get_earnings_by_experience(self) -> Dict[str, float]:
        """Calculate average earnings by experience level using real data from Excel sheets"""
        from services.enhanced_data_service import enhanced_data_service
        
        try:
            # Get all earnings data
            all_earnings_data = enhanced_data_service.data['earnings_daily']
            earners_data = enhanced_data_service.get_earners()
            
            if all_earnings_data.empty or earners_data.empty:
                print("Warning: No earnings data available for experience analysis")
                return {}
            
            # Join earnings with earner data to get experience information
            merged = all_earnings_data.merge(earners_data, left_on='earner_id', right_on='earner_id', how='inner')
            
            # Create experience categories
            merged['experience_category'] = pd.cut(
                merged['experience_months'],
                bins=[0, 12, 24, 36, 60, float('inf')],
                labels=['0-12 months', '12-24 months', '24-36 months', '36-60 months', '60+ months']
            )
            
            # Calculate actual hourly earnings by experience category using real working hours
            experience_hourly_rates = {}
            for category in merged['experience_category'].cat.categories:
                category_data = merged[merged['experience_category'] == category]
                if not category_data.empty:
                    total_earnings = category_data['total_net_earnings'].sum()
                    total_working_mins = (category_data['rides_duration_mins'] + category_data['eats_duration_mins']).sum()
                    total_working_hours = total_working_mins / 60 if total_working_mins > 0 else 1
                    hourly_rate = total_earnings / total_working_hours if total_working_hours > 0 else 15.0
                    experience_hourly_rates[str(category)] = hourly_rate
            
            experience_earnings = experience_hourly_rates
            return experience_earnings
            
        except Exception as e:
            print(f"Error getting experience earnings from real data: {e}")
            return {}
    
    def get_time_patterns(self) -> Dict[str, Any]:
        """Analyze time-based patterns using real data from Excel sheets"""
        from services.enhanced_data_service import enhanced_data_service
        
        try:
            # Get time patterns from enhanced data service
            time_patterns = enhanced_data_service.get_time_patterns()
            
            if not time_patterns:
                print("Warning: No time patterns data available from Excel sheets")
                return {}
                
            return time_patterns
            
        except Exception as e:
            print(f"Error getting time patterns from real data: {e}")
            return {}
    
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
            # Return error if no real earnings data available
            return {"error": f"No earnings data available for earner {earner_id} from Excel sheets"}
        else:
            # Calculate actual hourly earnings from real working hours
            total_earnings = earner_earnings['total_net_earnings'].sum()
            total_working_mins = (earner_earnings['rides_duration_mins'] + earner_earnings['eats_duration_mins']).sum()
            total_working_hours = total_working_mins / 60 if total_working_mins > 0 else 1
            # Use actual working hours from Excel data
            actual_earnings = total_earnings / total_working_hours if total_working_hours > 0 else 15.0

        # Get city average for comparison
        city_earnings = self.get_earnings_by_city()
        city_avg = city_earnings.get(earner.home_city_id, actual_earnings)

        # Get competitive intelligence
        competitive_data = self._get_competitive_intelligence(earner_id, earner.home_city_id)
        
        # Get market demand indicators
        demand_data = self._get_market_demand_indicators(earner.home_city_id)

        insights = {
            "earner_id": earner_id,
            "predicted_hourly_earnings": round(actual_earnings, 2),
            "city_average_earnings": round(city_avg, 2),
            "performance_vs_city": round(((actual_earnings - city_avg) / city_avg) * 100, 1),
            "competitive_intelligence": competitive_data,
            "market_demand": demand_data,
            "recommendations": self._generate_recommendations(earner, actual_earnings, city_avg)
        }

        return insights
    
    def _get_competitive_intelligence(self, earner_id: str, city_id: int) -> Dict[str, Any]:
        """Get competitive intelligence comparing user to other earners"""
        from services.enhanced_data_service import enhanced_data_service
        
        try:
            # Get all earners in the same city
            earners_df = enhanced_data_service.get_earners()
            city_earners = earners_df[earners_df['home_city_id'] == city_id]
            
            if city_earners.empty:
                return {}
            
            # Get user's current earner data
            user_earner = city_earners[city_earners['earner_id'] == earner_id]
            if user_earner.empty:
                return {}
            
            user_data = user_earner.iloc[0]
            
            # Calculate percentiles for competitive comparison
            experience_percentile = (city_earners['experience_months'] < user_data['experience_months']).mean() * 100
            rating_percentile = (city_earners['rating'] < user_data['rating']).mean() * 100
            
            # Get earnings comparison
            city_earnings = self.get_earnings_by_city()
            user_city_avg = city_earnings.get(city_id, 0)
            
            # Calculate how user ranks vs others
            better_earners = len([e for e in city_earners.itertuples() 
                                if e.rating > user_data['rating'] and e.experience_months > user_data['experience_months']])
            total_earners = len(city_earners)
            ranking_percentage = (total_earners - better_earners) / total_earners * 100 if total_earners > 0 else 0
            
            return {
                "experience_percentile": round(experience_percentile, 1),
                "rating_percentile": round(rating_percentile, 1),
                "ranking_percentage": round(ranking_percentage, 1),
                "total_earners_in_city": len(city_earners),
                "better_performers": better_earners,
                "city_rank": f"#{total_earners - better_earners} of {total_earners}" if better_earners < total_earners else f"Top {ranking_percentage:.0f}%"
            }
            
        except Exception as e:
            print(f"Error getting competitive intelligence: {e}")
            return {}
    
    def _get_market_demand_indicators(self, city_id: int) -> Dict[str, Any]:
        """Get market demand indicators for the city"""
        from services.enhanced_data_service import enhanced_data_service
        
        try:
            # Get earners in the city
            earners_df = enhanced_data_service.get_earners()
            city_earners = earners_df[earners_df['home_city_id'] == city_id]
            
            if city_earners.empty:
                return {}
            
            # Calculate market activity indicators
            online_earners = len(city_earners[city_earners['status'] == 'online'])
            engaged_earners = len(city_earners[city_earners['status'] == 'engaged'])
            offline_earners = len(city_earners[city_earners['status'] == 'offline'])
            
            total_earners = len(city_earners)
            active_earners = online_earners + engaged_earners
            
            # Calculate demand level based on activity
            activity_ratio = active_earners / total_earners if total_earners > 0 else 0
            
            if activity_ratio > 0.7:
                demand_level = "HIGH"
                demand_color = "text-red-600"
                demand_description = "Most drivers are active - high competition"
            elif activity_ratio > 0.4:
                demand_level = "MEDIUM"
                demand_color = "text-yellow-600"
                demand_description = "Moderate activity - good opportunities"
            else:
                demand_level = "LOW"
                demand_color = "text-green-600"
                demand_description = "Low activity - great time to work"
            
            # Get vehicle type distribution for market insights
            vehicle_dist = city_earners['vehicle_type'].value_counts().to_dict()
            
            return {
                "demand_level": demand_level,
                "demand_color": demand_color,
                "demand_description": demand_description,
                "active_earners": active_earners,
                "total_earners": total_earners,
                "activity_ratio": round(activity_ratio * 100, 1),
                "online_earners": online_earners,
                "engaged_earners": engaged_earners,
                "offline_earners": offline_earners,
                "vehicle_distribution": vehicle_dist
            }
            
        except Exception as e:
            print(f"Error getting market demand indicators: {e}")
            return {}
    
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
    
    def get_time_based_earnings(self, earner_id: str) -> Dict[str, Any]:
        """Get real time-based earnings data from Excel sheets"""
        from services.enhanced_data_service import enhanced_data_service
        
        try:
            # Get surge data by hour
            surge_data = enhanced_data_service.data['surge_by_hour']
            rides_data = enhanced_data_service.data['rides_trips']
            
            # Filter rides for this earner
            earner_rides = rides_data[rides_data['driver_id'] == earner_id]
            
            if earner_rides.empty:
                return {"error": f"No ride data available for earner {earner_id}"}
            
            # Extract hour from start_time and calculate hourly earnings
            # Handle different datetime formats
            try:
                earner_rides['hour'] = pd.to_datetime(earner_rides['start_time']).dt.hour
            except:
                # If datetime conversion fails, try to extract hour from string
                earner_rides['hour'] = earner_rides['start_time'].astype(str).str.extract(r'(\d{1,2}):').astype(int)
            
            # Calculate hourly earnings for each hour
            hourly_earnings = earner_rides.groupby('hour').agg({
                'net_earnings': ['sum', 'mean', 'count'],
                'surge_multiplier': 'mean'
            }).round(2)
            
            # Flatten column names
            hourly_earnings.columns = ['total_earnings', 'avg_earnings_per_trip', 'trip_count', 'avg_surge']
            hourly_earnings = hourly_earnings.reset_index()
            
            # Get city for this earner
            earners_df = enhanced_data_service.get_earners()
            earner = earners_df[earners_df['earner_id'] == earner_id]
            if earner.empty:
                return {"error": f"Earner {earner_id} not found"}
            
            city_id = earner.iloc[0]['home_city_id']
            
            # Get city-specific surge data
            city_surge = surge_data[surge_data['city_id'] == city_id]
            
            # Create time slots with real data
            time_slots = []
            for hour in range(24):
                hour_data = hourly_earnings[hourly_earnings['hour'] == hour]
                surge_data_hour = city_surge[city_surge['hour'] == hour]
                
                if not hour_data.empty:
                    avg_earnings = hour_data.iloc[0]['avg_earnings_per_trip']
                    trip_count = hour_data.iloc[0]['trip_count']
                    avg_surge = hour_data.iloc[0]['avg_surge']
                else:
                    avg_earnings = 0
                    trip_count = 0
                    avg_surge = 1.0
                
                if not surge_data_hour.empty:
                    surge_multiplier = surge_data_hour.iloc[0]['surge_multiplier']
                else:
                    surge_multiplier = 1.0
                
                # Determine time slot category and color
                if hour in [7, 8, 9]:  # Morning rush
                    label = 'Morning Rush'
                    color = 'bg-green-500'
                elif hour in [17, 18, 19]:  # Evening rush
                    label = 'Evening Rush'
                    color = 'bg-blue-500'
                elif hour in [22, 23, 0, 1]:  # Night shift
                    label = 'Night Shift'
                    color = 'bg-purple-500'
                elif hour in [14, 15, 16]:  # Low demand
                    label = 'Low Demand'
                    color = 'bg-red-500'
                else:
                    label = 'Regular Hours'
                    color = 'bg-gray-500'
                
                time_slots.append({
                    'hour': hour,
                    'label': label,
                    'surge_multiplier': surge_multiplier,
                    'avg_earnings_per_trip': avg_earnings,
                    'trip_count': trip_count,
                    'color': color
                })
            
            return {
                'time_slots': time_slots,
                'city_id': city_id,
                'total_rides': len(earner_rides),
                'avg_earnings_per_trip': earner_rides['net_earnings'].mean()
            }
            
        except Exception as e:
            print(f"Error getting time-based earnings: {e}")
            import traceback
            traceback.print_exc()
            return {"error": f"Error analyzing time data: {str(e)}"}

# Global instance
analytics_service = AnalyticsService()

