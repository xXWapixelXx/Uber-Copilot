# 🚗 Uber Smart Copilot

**Smart Copilot** is an AI-powered assistant designed for Uber drivers and couriers.  
It helps earners **maximize income, rest strategically, and stay safe** — all through predictive analytics and a conversational AI interface.

---

## 🌍 Overview

Millions of Uber earners face the same daily questions:
> "When should I go online?"  
> "Is now a good time to take a break?"  
> "How can I earn more without burning out?"

**Smart Copilot** answers these questions using mock Uber data and AI predictions, combining real-time insights with a friendly chat interface.  

Our goal is to create a balanced, optimal, and safe earning journey.

---

## 💡 Key Features

### 🔹 1. AI Earnings Forecast
Predicts expected earnings per hour based on driver attributes such as:
- Experience level  
- Rating  
- City  
- Current status (online / offline / engaged)

Example:  
> "Drivers in City 2 with 60+ months experience earn 12% more between 6–8 PM."

---

### 🔹 2. Smart Rest Optimization
Identifies the best time to rest without losing income.  
Uses demand patterns to recommend low-demand windows.

Example:  
> "Best time to rest: 3–4 PM — demand drops by 40%, so you won't miss much."

---

### 🔹 3. Earner Chat
An interactive chat assistant where drivers can ask:
- "When should I go online today?"
- "Is now a good time to take a break?"
- "How can I improve my rating?"

AI responds with personalized insights powered by the predictive model.

**NEW: 🎤 Voice Input Support**
- Hands-free interaction using speech-to-text
- Perfect for drivers on the road
- Browser-based, no extra costs
- Works on mobile and desktop

---

### 🔹 4. Dashboard (Optional)
A simple visualization showing:
- Predicted demand by city/time  
- Personal earnings trends  
- Rest recommendations  

---

## ⚙️ Tech Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | React, Material-UI, Framer Motion |
| **Backend** | Python (Flask / FastAPI) |
| **ML & Analytics** | pandas, scikit-learn, numpy |
| **Chat AI** | OpenAI API / rule-based NLP |
| **Voice Input** | Web Speech API (Browser-based) |
| **Visualization** | Plotly / Recharts |
| **Data Source** | Mock Uber earner dataset (Excel, ~600 rows) |

---

## 🧠 How It Works

1. **Data Ingestion** – Load mock earner data (experience, city, rating, etc.).  
2. **Model Training** – Use regression / clustering to find earning patterns.  
3. **Prediction Engine** – Estimate hourly earnings & low-demand rest times.  
4. **Chat Interface** – Let users query insights conversationally.  
5. **Dashboard Display** – Show charts & recommendations visually.

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/uber-smart-copilot.git
cd uber-smart-copilot
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the app

```bash
streamlit run app.py
```

---

## 📊 Dataset

The project uses a mock Uber dataset (`data/earners.xlsx`) with columns such as:

| Column            | Description                |
| ----------------- | -------------------------- |
| earner_id         | Unique ID for each driver  |
| earner_type       | driver or courier          |
| vehicle_type      | car, bike, etc.            |
| fuel_type         | gas, hybrid, EV            |
| is_ev             | True/False                 |
| experience_months | Driver experience          |
| rating            | Performance score          |
| status            | online / offline / engaged |
| home_city_id      | Driver's home city         |

---

## 🏆 Hackathon Context

This project was built for the **TU Delft x Uber Hackathon (Junction Logo)** under the challenge:

> "Design a Smart Earner Assistant that helps drivers make smarter real-time choices."

Our focus:
✅ Real-world relevance
✅ Technical execution
✅ User experience & design
✅ Scalability & storytelling

---

## 👥 Team

| Name            | Role                        |
| --------------- | --------------------------- |
| Wail Said       | Lead Developer / AI         |
| [Teammate Name] | Data Science                |
| [Teammate Name] | UI/UX                       |
| [Teammate Name] | Presentation & Storytelling |

---

## 📈 Future Work

* Integrate real Uber API data
* Add voice interaction
* Include safety alerts (e.g., fatigue detection)
* Gamify driver progress

---

## 📜 License

MIT License

---

### 💬 Quote


We used CLaude and ChatGPT to make this project.

> "Drive smarter, not harder — your AI co-pilot's got your back."
