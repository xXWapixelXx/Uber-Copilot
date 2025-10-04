# 🚗 Uber Smart Copilot API Examples

## 🚀 Quick Start

The server is running at: **http://localhost:8000**

Interactive API docs: **http://localhost:8000/docs**

---

## 📡 API Endpoints

### 1. 💬 Chat with AI Assistant

**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "message": "What are the best practices for Uber drivers?",
  "earner_id": "E10000",
  "conversation_history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi! How can I help you today?"}
  ]
}
```

**Response:**
```json
{
  "response": "**Hey there, Uber driver!** 🚗💨 Here are some data-backed best practices...",
  "earner_insights": {
    "earner_id": "E10000",
    "predicted_hourly_earnings": 31.78,
    "city_average_earnings": 28.98,
    "performance_vs_city": 9.7,
    "recommendations": ["Focus on peak hours", "Maintain high rating"]
  },
  "timestamp": "2024-01-01T12:00:00",
  "context_used": true
}
```

---

### 2. 💰 Earnings Prediction

**Endpoint:** `POST /api/earnings/predict`

**Request:**
```json
{
  "earner_id": "E10000",
  "hours": 8,
  "additional_context": "Working in city center during peak hours"
}
```

**Response:**
```json
{
  "predicted_earnings": 254.24,
  "hourly_rate": 31.78,
  "confidence_score": 0.85,
  "ai_insights": "Great question! Let's break down your 8-hour earnings prediction...",
  "factors": [
    "Experience: 60+ months",
    "Rating: 4.8",
    "City performance: 9.7% vs average"
  ],
  "timestamp": "2024-01-01T12:00:00"
}
```

---

### 3. 😴 Rest Optimization

**Endpoint:** `GET /api/rest/optimize?current_time=14:30&earner_id=E10000`

**Response:**
```json
{
  "current_time": "14:30",
  "recommended_break_times": [
    {
      "start": "14:00",
      "end": "15:00",
      "reason": "Low demand period"
    },
    {
      "start": "03:00",
      "end": "05:00",
      "reason": "Minimal activity"
    }
  ],
  "optimal_duration": "30-60 minutes",
  "ai_recommendations": "Here's your optimized break strategy for 14:30...",
  "demand_impact": {
    "current_demand_multiplier": 0.6,
    "earnings_impact": "40%",
    "break_recommended": true
  },
  "timestamp": "2024-01-01T12:00:00"
}
```

---

### 4. 📊 Dashboard Statistics

**Endpoint:** `GET /api/dashboard/stats`

**Response:**
```json
{
  "total_earners": 360,
  "earnings_by_city": {
    "1": 25.45,
    "2": 27.89,
    "3": 26.12,
    "4": 29.34,
    "5": 28.98
  },
  "earnings_by_experience": {
    "0-12 months": 25.03,
    "12-24 months": 26.31,
    "24-36 months": 27.41,
    "36-60 months": 29.28,
    "60+ months": 31.62
  },
  "time_patterns": {
    "peak_hours": {
      "morning": {"start": "07:00", "end": "09:00", "demand_multiplier": 1.8},
      "evening": {"start": "17:00", "end": "19:00", "demand_multiplier": 1.6},
      "night": {"start": "22:00", "end": "02:00", "demand_multiplier": 1.4}
    },
    "low_demand_hours": {
      "midday": {"start": "14:00", "end": "16:00", "demand_multiplier": 0.6},
      "late_night": {"start": "02:00", "end": "06:00", "demand_multiplier": 0.4}
    }
  },
  "vehicle_type_distribution": {
    "car": 280,
    "bike": 60,
    "scooter": 20
  },
  "rating_statistics": {
    "average": 4.72,
    "min": 1.0,
    "max": 5.0
  },
  "timestamp": "2024-01-01T12:00:00"
}
```

---

## 🧪 Testing with cURL

### Chat Test:
```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "When should I go online today?",
    "earner_id": "E10000"
  }'
```

### Earnings Prediction:
```bash
curl -X POST "http://localhost:8000/api/earnings/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "earner_id": "E10000",
    "hours": 8,
    "additional_context": "Working during peak hours"
  }'
```

### Rest Optimization:
```bash
curl "http://localhost:8000/api/rest/optimize?current_time=14:30&earner_id=E10000"
```

### Dashboard Stats:
```bash
curl "http://localhost:8000/api/dashboard/stats"
```

---

## 🔧 Request/Response Models

### ChatRequest
- `message` (required): User's message (1-1000 characters)
- `earner_id` (optional): For personalized responses
- `conversation_history` (optional): Previous conversation

### EarningsPredictRequest
- `earner_id` (required): Earner identifier
- `hours` (optional): Hours to predict (1-24, default: 8)
- `additional_context` (optional): Extra context

### RestOptimizeResponse
- Returns current time, break recommendations, AI advice, and demand impact

### DashboardStatsResponse
- Returns aggregated statistics for charts and visualizations

---

## 🎯 Key Features

✅ **AI-Powered Responses** - Real Mistral AI integration  
✅ **Data-Driven Insights** - Based on 360 real earner records  
✅ **Personalized Recommendations** - Context-aware responses  
✅ **Validation & Error Handling** - Robust request/response models  
✅ **Fallback Responses** - Works even without AI service  
✅ **Real-time Analytics** - Live data processing  

---

## 🚀 Ready for Frontend Integration!

These endpoints are designed for easy integration with React, Vue, or any frontend framework. The responses include all necessary data for building interactive dashboards and chat interfaces.
