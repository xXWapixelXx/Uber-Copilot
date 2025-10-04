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
        """Get comprehensive context about earner data for AI prompts"""
        try:
            # Get basic statistics
            stats = analytics_service.get_basic_statistics()
            
            # Get earnings data
            city_earnings = analytics_service.get_earnings_by_city()
            experience_earnings = analytics_service.get_earnings_by_experience()
            
            # Get time patterns
            time_patterns = analytics_service.get_time_patterns()
            
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
                "recommended_break_times": time_patterns["recommended_break_times"]
            }
            
            # Add specific earner context if requested
            if earner_id:
                earner_insights = analytics_service.get_earner_insights(earner_id)
                if "error" not in earner_insights:
                    context["current_earner"] = {
                        "earner_id": earner_id,
                        "predicted_hourly_earnings": earner_insights["predicted_hourly_earnings"],
                        "city_average_earnings": earner_insights["city_average_earnings"],
                        "performance_vs_city": earner_insights["performance_vs_city"],
                        "recommendations": earner_insights["recommendations"]
                    }
            
            return context
            
        except Exception as e:
            print(f"Error getting earner context: {e}")
            return {"error": f"Failed to get context: {str(e)}"}
    
    def _create_prompt_template(self, use_case: str, user_message: str, context: Dict[str, Any], earner_id: Optional[str] = None) -> str:
        """Create context-aware prompts for different use cases"""
        
        base_context = f"""
You are an AI assistant for Uber drivers and couriers, helping them maximize their earnings and work-life balance.

Current Data Context:
- Total earners in system: {context.get('total_earners', 'N/A')}
- Average rating: {context.get('avg_rating', 'N/A')}
- Average experience: {context.get('avg_experience_months', 'N/A')} months
- Cities available: {context.get('cities', 'N/A')}
- EV adoption: {context.get('ev_percentage', 'N/A')}%

Earnings Insights:
- City earnings: {json.dumps(context.get('earnings_by_city', {}), indent=2)}
- Experience earnings: {json.dumps(context.get('earnings_by_experience', {}), indent=2)}

Time Patterns:
- Peak hours: {json.dumps(context.get('peak_hours', {}), indent=2)}
- Low demand hours: {json.dumps(context.get('low_demand_hours', {}), indent=2)}
- Recommended break times: {json.dumps(context.get('recommended_break_times', []), indent=2)}
"""
        
        if earner_id and 'current_earner' in context:
            earner_context = context['current_earner']
            base_context += f"""

Current Earner Profile:
- Earner ID: {earner_context['earner_id']}
- Predicted hourly earnings: ${earner_context['predicted_hourly_earnings']}
- City average: ${earner_context['city_average_earnings']}
- Performance vs city average: {earner_context['performance_vs_city']}%
- Current recommendations: {', '.join(earner_context['recommendations'])}
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
                "fallback_response": self._get_fallback_response(message, use_case)
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

