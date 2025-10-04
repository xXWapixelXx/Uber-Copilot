# Uber Smart Copilot - Backend API

FastAPI backend for the Uber Smart Copilot application.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r ../requirements.txt
   ```

2. **Add your data file:**
   - Place your Excel file at `data/uber_hackathon_v2_mock_data.xlsx`
   - The file should contain columns: earner_id, earner_type, vehicle_type, fuel_type, is_ev, experience_months, rating, status, home_city_id

3. **Configure Mistral AI (Optional):**
   - Copy `env_template.txt` to `.env`
   - Get your Mistral API key from https://console.mistral.ai/
   - Add your API key to the `.env` file

4. **Run the server:**
   ```bash
   python run.py
   ```
   
   Or directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📚 API Endpoints

### Core Endpoints
- `GET /` - Welcome message
- `GET /health` - Health check

### Earner Data
- `GET /api/v1/earners` - Get all earners
- `GET /api/v1/earners/{earner_id}` - Get specific earner
- `GET /api/v1/earners/city/{city_id}` - Get earners by city

### Analytics
- `GET /api/v1/analytics/statistics` - Basic statistics
- `GET /api/v1/analytics/earnings/by-city` - Earnings by city
- `GET /api/v1/analytics/earnings/by-experience` - Earnings by experience
- `GET /api/v1/analytics/time-patterns` - Time-based patterns
- `GET /api/v1/analytics/earner/{earner_id}/insights` - Personalized insights
- `GET /api/v1/analytics/earner/{earner_id}/predict?hours=8` - Earnings prediction

### AI Chat & Predictions
- `POST /api/v1/ai/chat` - Chat with AI assistant
- `POST /api/v1/ai/predict-earnings` - AI-enhanced earnings prediction
- `POST /api/v1/ai/rest-recommendations` - AI rest optimization advice
- `GET /api/v1/ai/chat/examples` - Example prompts
- `GET /api/v1/ai/health` - AI service health check
- `GET /api/v1/ai/models` - Available Mistral models

### New Simplified API Endpoints
- `POST /api/chat` - Chat with AI assistant (simplified)
- `POST /api/earnings/predict` - Get earnings predictions with validation
- `GET /api/rest/optimize` - Get rest optimization recommendations
- `GET /api/dashboard/stats` - Get aggregated data for dashboard charts
- `GET /api/health` - Health check for chat API

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🏗️ Project Structure

```
backend/
├── main.py                 # FastAPI app and CORS setup
├── run.py                  # Startup script
├── api/                    # API routes
│   ├── __init__.py
│   └── earner_routes.py    # Earner and analytics endpoints
├── models/                 # Pydantic models
│   ├── __init__.py
│   └── earner.py          # Earner data models
├── services/               # Business logic
│   ├── __init__.py
│   ├── data_service.py     # Data loading and management
│   ├── analytics_service.py # Analytics and predictions
│   └── ai_service.py       # Mistral AI integration
├── utils/                  # Utility functions
│   └── __init__.py
└── data/                   # Data files
    └── uber_hackathon_v2_mock_data.xlsx
```

## 🔧 Configuration

The API is configured with CORS to allow requests from:
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:3000`

## 🤖 AI Service Features

The AI service integrates with Mistral AI to provide intelligent, context-aware responses:

### **Context Injection**
- Automatically includes earner data insights
- City-specific earnings patterns
- Experience-based recommendations
- Time-based demand patterns

### **Use Cases**
1. **General Chat**: Driver support and tips
2. **Earnings Prediction**: AI-enhanced income forecasting
3. **Rest Optimization**: Smart break recommendations

### **Example AI Prompts**
```json
{
  "message": "When should I go online today?",
  "use_case": "earnings_prediction",
  "earner_id": "earner_123"
}
```

### **Fallback Responses**
- Works without API key (uses rule-based responses)
- Graceful error handling
- Rate limiting protection

## 📊 Data Format

Expected Excel file format:
| Column | Type | Description |
|--------|------|-------------|
| earner_id | string | Unique identifier |
| earner_type | string | "driver" or "courier" |
| vehicle_type | string | "car", "bike", etc. |
| fuel_type | string | "gas", "hybrid", "EV" |
| is_ev | boolean | True/False |
| experience_months | int | Months of experience |
| rating | float | Performance rating |
| status | string | "online", "offline", "engaged" |
| home_city_id | int | City identifier |
