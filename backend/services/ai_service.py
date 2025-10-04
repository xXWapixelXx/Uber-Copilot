import os
import asyncio
import time
from typing import Dict, List, Optional, Any
from datetime import datetime
import json

try:
    from mistralai import Mistral, UserMessage, AssistantMessage
    MISTRAL_AVAILABLE = True
except ImportError:
    MISTRAL_AVAILABLE = False
    print("Warning: Mistral AI client not installed. Please install mistralai package.")

from models.earner import Earner, EarningsPrediction
from services.analytics_service import analytics_service
from services.data_service import data_service
from services.enhanced_data_service import enhanced_data_service
from services.advanced_analytics_service import advanced_analytics_service

class AIService:
    """Service for Mistral AI integration with context-aware responses"""
    
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        self.model = os.getenv("MISTRAL_MODEL", "mistral-large-latest")
        self.max_tokens = int(os.getenv("MISTRAL_MAX_TOKENS", "1000"))
        self.temperature = float(os.getenv("MISTRAL_TEMPERATURE", "0.7"))
        
        self.client = None
        self.rate_limit_delay = 1.0  # seconds between requests
        self.last_request_time = 0
        
        if MISTRAL_AVAILABLE and self.api_key:
            try:
                self.client = Mistral(api_key=self.api_key)
                print("✅ Mistral AI client initialized successfully")
            except Exception as e:
                print(f"❌ Failed to initialize Mistral AI client: {e}")
                self.client = None
        else:
            if not MISTRAL_AVAILABLE:
                print("❌ Mistral AI package not installed")
            if not self.api_key:
                print("❌ MISTRAL_API_KEY not found in environment variables")
    
    async def _rate_limit(self):
        """Simple rate limiting to avoid hitting API limits"""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - time_since_last)
        
        self.last_request_time = time.time()
    
    def _get_earner_context(self, earner_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive context about earner data for AI prompts using enhanced data"""
        try:
            # Get basic statistics
            stats = analytics_service.get_basic_statistics()
            
            # Get earnings data
            city_earnings = analytics_service.get_earnings_by_city()
            experience_earnings = analytics_service.get_earnings_by_experience()
            
            # Get time patterns
            time_patterns = analytics_service.get_time_patterns()
            
            # Get enhanced multi-platform data
            earners_data = enhanced_data_service.get_earners()
            time_patterns_enhanced = enhanced_data_service.get_time_patterns()
            city_comparison = enhanced_data_service.get_city_comparison()
            
            context = {
                "timestamp": datetime.now().isoformat(),
                "total_earners": stats["total_earners"],
                "earner_types": stats["earner_types"],
                "vehicle_types": stats["vehicle_types"],
                "cities": stats["cities"],
                "avg_rating": round(stats["avg_rating"], 2),
                "avg_experience_months": round(stats["avg_experience_months"], 1),
                "ev_percentage": round(stats["ev_percentage"], 1),
                "earnings_by_city": {str(k): round(v, 2) for k, v in city_earnings.items()},
                "earnings_by_experience": experience_earnings,
                "peak_hours": time_patterns["peak_hours"],
                "low_demand_hours": time_patterns["low_demand_hours"],
                "recommended_break_times": time_patterns["recommended_break_times"],
                
                # Enhanced multi-platform data
                "platform_breakdown": {
                    "drivers": len(earners_data[earners_data['earner_type'] == 'driver']),
                    "couriers": len(earners_data[earners_data['earner_type'] == 'courier']),
                    "ev_adoption": len(earners_data[earners_data['is_ev'] == True]),
                    "vehicle_types": earners_data['vehicle_type'].value_counts().to_dict(),
                    "fuel_types": earners_data['fuel_type'].value_counts().to_dict()
                },
                
                # Enhanced time patterns
                "enhanced_time_patterns": {
                    "ride_patterns": time_patterns_enhanced.get("ride_patterns", {}),
                    "eats_patterns": time_patterns_enhanced.get("eats_patterns", {}),
                    "peak_hours_enhanced": time_patterns_enhanced.get("peak_hours", {})
                },
                
                # City intelligence
                "city_intelligence": city_comparison
            }
            
            # Add specific earner context if requested
            if earner_id:
                earner_insights = analytics_service.get_earner_insights(earner_id)
                enhanced_insights = advanced_analytics_service.get_comprehensive_earner_insights(earner_id)
                
                if "error" not in earner_insights and "error" not in enhanced_insights:
                    earner_profile = enhanced_insights.get("earner_profile", {})
                    multi_platform_perf = {
                        "rides_performance": enhanced_insights.get("rides_performance", {}),
                        "eats_performance": enhanced_insights.get("eats_performance", {}),
                        "daily_earnings_summary": enhanced_insights.get("daily_earnings_summary", {}),
                        "incentive_performance": enhanced_insights.get("incentive_performance", {})
                    }
                    
                    context["current_earner"] = {
                        "earner_id": earner_id,
                        "earner_profile": earner_profile,
                        "predicted_hourly_earnings": earner_insights.get("predicted_hourly_earnings", 0),
                        "city_average_earnings": earner_insights.get("city_average_earnings", 0),
                        "performance_vs_city": earner_insights.get("performance_vs_city", 0),
                        "recommendations": earner_insights.get("recommendations", []),
                        "multi_platform_performance": multi_platform_perf,
                        "advanced_recommendations": enhanced_insights.get("recommendations", []),
                        "optimization_opportunities": enhanced_insights.get("optimization_opportunities", []),
                        "predicted_performance": enhanced_insights.get("predicted_performance", {}),
                        "location_insights": enhanced_insights.get("location_insights", {})
                    }
            
            return context
            
        except Exception as e:
            print(f"Error getting enhanced earner context: {e}")
            return {"error": f"Failed to get context: {str(e)}"}
    
    def _create_prompt_template(self, use_case: str, user_message: str, context: Dict[str, Any], earner_id: Optional[str] = None) -> str:
        """Create context-aware prompts for different use cases"""
        
        base_context = f"""
You are an advanced AI assistant for Uber drivers and couriers, helping them maximize their earnings across multiple platforms (rides, eats delivery, and jobs).

COMPREHENSIVE DATA CONTEXT:
- Total earners: {context.get('total_earners', 'N/A')}
- Platform breakdown: {json.dumps(context.get('platform_breakdown', {}), indent=2)}
- Average rating: {context.get('avg_rating', 'N/A')}
- Average experience: {context.get('avg_experience_months', 'N/A')} months
- Cities available: {context.get('cities', 'N/A')}
- EV adoption: {context.get('ev_percentage', 'N/A')}%

MULTI-PLATFORM EARNINGS INSIGHTS:
- City earnings: {json.dumps(context.get('earnings_by_city', {}), indent=2)}
- Experience earnings: {json.dumps(context.get('earnings_by_experience', {}), indent=2)}

ENHANCED TIME PATTERNS:
- Peak hours: {json.dumps(context.get('peak_hours', {}), indent=2)}
- Low demand hours: {json.dumps(context.get('low_demand_hours', {}), indent=2)}
- Recommended break times: {json.dumps(context.get('recommended_break_times', []), indent=2)}
- Ride patterns by hour: {json.dumps(context.get('enhanced_time_patterns', {}).get('ride_patterns', {}), indent=2)}
- Eats patterns by hour: {json.dumps(context.get('enhanced_time_patterns', {}).get('eats_patterns', {}), indent=2)}

CITY INTELLIGENCE:
- Multi-city performance: {json.dumps(context.get('city_intelligence', {}), indent=2)}
"""
        
        if earner_id and 'current_earner' in context:
            earner_context = context['current_earner']
            
            # Get multi-platform performance data
            multi_platform = earner_context.get('multi_platform_performance', {})
            rides_perf = multi_platform.get('rides_performance', {})
            eats_perf = multi_platform.get('eats_performance', {})
            daily_earnings = multi_platform.get('daily_earnings_summary', {})
            incentives = multi_platform.get('incentive_performance', {})
            
            base_context += f"""

CURRENT EARNER COMPREHENSIVE PROFILE:
- Earner ID: {earner_context['earner_id']}
- Vehicle: {earner_context.get('earner_profile', {}).get('vehicle_type', 'N/A')} ({earner_context.get('earner_profile', {}).get('fuel_type', 'N/A')})
- Rating: {earner_context.get('earner_profile', {}).get('rating', 'N/A')}
- Experience: {earner_context.get('earner_profile', {}).get('experience_months', 'N/A')} months
- Status: {earner_context.get('earner_profile', {}).get('status', 'N/A')}
- Home City: {earner_context.get('earner_profile', {}).get('home_city_id', 'N/A')}

MULTI-PLATFORM PERFORMANCE:
RIDES PERFORMANCE:
- Total rides: {rides_perf.get('total_rides', 0)}
- Total earnings: €{rides_perf.get('total_earnings', 0)}
- Total tips: €{rides_perf.get('total_tips', 0)}
- Avg distance: {rides_perf.get('avg_distance', 0):.2f} km
- Avg duration: {rides_perf.get('avg_duration', 0):.2f} mins

EATS PERFORMANCE:
- Total orders: {eats_perf.get('total_orders', 0)}
- Total earnings: €{eats_perf.get('total_earnings', 0)}
- Total tips: €{eats_perf.get('total_tips', 0)}
- Avg basket value: €{eats_perf.get('avg_basket_value', 0):.2f}
- Avg delivery distance: {eats_perf.get('avg_delivery_distance', 0):.2f} km

DAILY EARNINGS SUMMARY:
- Total days: {daily_earnings.get('total_days', 0)}
- Avg daily earnings: €{daily_earnings.get('avg_daily_earnings', 0):.2f}
- Best day: €{daily_earnings.get('best_day', 0):.2f}
- Total earnings: €{daily_earnings.get('total_earnings', 0):.2f}

INCENTIVE PERFORMANCE:
- Total quests: {incentives.get('total_quests', 0)}
- Completed quests: {incentives.get('completed_quests', 0)}
- Total bonuses earned: €{incentives.get('total_bonuses_earned', 0):.2f}
- Completion rate: {incentives.get('completion_rate', 0)*100:.1f}%

ADVANCED RECOMMENDATIONS:
{', '.join(earner_context.get('advanced_recommendations', []))}

OPTIMIZATION OPPORTUNITIES:
{json.dumps(earner_context.get('optimization_opportunities', []), indent=2)}

LOCATION INSIGHTS:
{json.dumps(earner_context.get('location_insights', {}), indent=2)}
"""
        
        templates = {
            "earnings_prediction": f"""
{base_context}

User Question: {user_message}

Please provide a detailed earnings prediction and optimization advice. Consider:
1. Time of day recommendations
2. City-specific insights
3. Experience level impact
4. Vehicle type considerations
5. Practical tips for maximizing earnings

Respond in a helpful, conversational tone with specific, actionable advice.
""",
            
            "rest_optimization": f"""
{base_context}

User Question: {user_message}

Please provide rest optimization advice. Consider:
1. Best times to take breaks based on demand patterns
2. How to minimize earnings loss during breaks
3. Duration recommendations
4. Location suggestions for breaks
5. Signs of fatigue to watch for

Respond with practical, safety-focused advice.
""",
            
            "general_chat": f"""
{base_context}

User Question: {user_message}

Please provide helpful advice for Uber drivers/couriers. Consider:
1. Practical tips based on the data insights
2. Safety recommendations
3. Work-life balance advice
4. Career development suggestions
5. Platform optimization tips

Respond in a friendly, supportive tone with actionable insights.
""",
            
            "default": f"""
{base_context}

User Question: {user_message}

Please provide helpful advice for this Uber driver/courier question. Use the data context to give informed, practical recommendations.
"""
        }
        
        return templates.get(use_case, templates["default"])
    
    async def chat_completion(
        self, 
        message: str, 
        use_case: str = "general_chat",
        earner_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Main chat completion function with context injection"""
        
        if not self.client:
            return {
                "error": "Mistral AI client not available. Please check API key and installation.",
                "fallback_response": self._get_fallback_response(message, use_case),
                "timestamp": datetime.now().isoformat()
            }
        
        try:
            # Rate limiting
            await self._rate_limit()
            
            # Get context
            context = self._get_earner_context(earner_id)
            
            # Create prompt
            prompt = self._create_prompt_template(use_case, message, context, earner_id)
            
            # Prepare messages
            messages = [UserMessage(content=prompt)]
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history[-5:]:  # Last 5 messages for context
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    if role == "user":
                        messages.insert(-1, UserMessage(content=content))
                    elif role == "assistant":
                        messages.insert(-1, AssistantMessage(content=content))
            
            # Make API call
            response = self.client.chat.complete(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            return {
                "response": response.choices[0].message.content,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "model": self.model,
                "timestamp": datetime.now().isoformat(),
                "context_used": bool(earner_id)
            }
            
        except Exception as e:
            error_msg = f"Mistral AI API error: {str(e)}"
            print(error_msg)
            
            return {
                "error": error_msg,
                "fallback_response": self._get_fallback_response(message, use_case),
                "timestamp": datetime.now().isoformat()
            }
    
    def _get_fallback_response(self, message: str, use_case: str) -> str:
        """Provide fallback responses when AI service is unavailable"""
        
        fallback_responses = {
            "earnings_prediction": """
Based on our data analysis, here are some general tips for maximizing earnings:

1. **Peak Hours**: Work during morning (7-9 AM) and evening (5-7 PM) rush hours
2. **City Selection**: Choose cities with higher average earnings
3. **Experience Matters**: More experienced drivers tend to earn more
4. **Maintain High Rating**: Keep your rating above 4.5 for better opportunities
5. **Vehicle Efficiency**: Consider fuel-efficient or electric vehicles

For personalized predictions, please ensure the AI service is properly configured.
""",
            
            "rest_optimization": """
Here are some rest optimization tips:

1. **Low Demand Times**: Take breaks during 2-4 PM and 2-6 AM
2. **Duration**: 15-30 minute breaks are optimal
3. **Location**: Rest near high-demand areas for quick return
4. **Signs to Watch**: Fatigue, decreased alertness, irritability
5. **Safety First**: Never drive when tired

For detailed recommendations, please ensure the AI service is properly configured.
""",
            
            "general_chat": """
I'm here to help with your Uber driving questions! Here are some general tips:

1. **Stay Safe**: Always prioritize safety over earnings
2. **Maintain Vehicle**: Keep your vehicle clean and well-maintained
3. **Customer Service**: Be friendly and professional
4. **Track Performance**: Monitor your ratings and earnings patterns
5. **Work-Life Balance**: Take regular breaks and maintain healthy boundaries

For AI-powered insights, please ensure the service is properly configured.
"""
        }
        
        return fallback_responses.get(use_case, fallback_responses["general_chat"])
    
    async def predict_earnings_with_ai(self, earner_id: str, hours: int = 8, additional_context: str = "") -> Dict[str, Any]:
        """AI-enhanced earnings prediction"""
        message = f"Predict my earnings for {hours} hours of work. {additional_context}".strip()
        
        return await self.chat_completion(
            message=message,
            use_case="earnings_prediction",
            earner_id=earner_id
        )
    
    async def get_rest_recommendations(self, earner_id: Optional[str] = None, current_time: Optional[str] = None) -> Dict[str, Any]:
        """AI-powered rest recommendations"""
        time_context = f"Current time is {current_time}. " if current_time else ""
        message = f"{time_context}When should I take a break and for how long?"
        
        return await self.chat_completion(
            message=message,
            use_case="rest_optimization",
            earner_id=earner_id
        )

# Global instance
ai_service = AIService()

