import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Coffee, 
  MapPin, 
  Zap, 
  Shield,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { restAPI } from '../services/api';

const RestPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restData, setRestData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [earnerId] = useState('E10000');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getRestRecommendations = async () => {
    setLoading(true);
    try {
      const timeString = currentTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const response = await restAPI.getRestRecommendations(timeString, earnerId);
      setRestData(response);
    } catch (error) {
      console.error('Error getting rest recommendations:', error);
      // Fallback mock data
      setRestData({
        current_time: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommended_break_times: [
          { start: "14:00", end: "15:00", reason: "Low demand period" },
          { start: "03:00", end: "05:00", reason: "Minimal activity" }
        ],
        optimal_duration: "30-60 minutes",
        ai_recommendations: "Based on current demand patterns, this is an excellent time for a break. You won't miss much earning potential during this low-demand window.",
        demand_impact: {
          current_demand_multiplier: 0.6,
          earnings_impact: "40%",
          break_recommended: true
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRestRecommendations();
  }, [currentTime.getHours()]);

  const getCurrentHour = () => currentTime.getHours();
  const getCurrentMinute = () => currentTime.getMinutes();

  const getTimeStatus = () => {
    const hour = getCurrentHour();
    if (hour >= 7 && hour < 9) return { status: 'Peak', color: 'green', icon: TrendingUp };
    if (hour >= 17 && hour < 19) return { status: 'Peak', color: 'green', icon: TrendingUp };
    if (hour >= 22 || hour < 2) return { status: 'High', color: 'blue', icon: TrendingUp };
    if (hour >= 14 && hour < 16) return { status: 'Low', color: 'red', icon: TrendingDown };
    if (hour >= 2 && hour < 6) return { status: 'Very Low', color: 'gray', icon: TrendingDown };
    return { status: 'Normal', color: 'yellow', icon: Clock };
  };

  const timeStatus = getTimeStatus();
  const StatusIcon = timeStatus.icon;

  const restLocations = [
    { name: 'Gas Station', distance: '0.2 mi', facilities: ['Restroom', 'Food', 'Parking'], rating: 4.2 },
    { name: 'Shopping Center', distance: '0.5 mi', facilities: ['Restroom', 'Food', 'WiFi'], rating: 4.5 },
    { name: 'Rest Stop', distance: '1.2 mi', facilities: ['Restroom', 'Parking', 'Vending'], rating: 3.8 },
    { name: 'Fast Food', distance: '0.3 mi', facilities: ['Restroom', 'Food', 'WiFi'], rating: 4.0 },
  ];

  const fatigueSigns = [
    { sign: 'Heavy eyelids', severity: 'High', action: 'Take immediate break' },
    { sign: 'Missing navigation prompts', severity: 'Medium', action: 'Pull over safely' },
    { sign: 'Irritability', severity: 'Medium', action: 'Take a short break' },
    { sign: 'Yawning frequently', severity: 'Low', action: 'Consider ending shift' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">😴 Rest Optimizer</h1>
        <p className="text-gray-600">Smart break recommendations</p>
      </div>

      {/* Current Time & Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {currentTime.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
            timeStatus.color === 'green' ? 'bg-green-100 text-green-800' :
            timeStatus.color === 'blue' ? 'bg-blue-100 text-blue-800' :
            timeStatus.color === 'red' ? 'bg-red-100 text-red-800' :
            timeStatus.color === 'gray' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            <StatusIcon className="w-4 h-4" />
            <span className="font-semibold">{timeStatus.status} Demand</span>
          </div>
        </div>
      </motion.div>

      {/* Rest Recommendation */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-6 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-uber-600 mx-auto mb-4" />
          <p className="text-gray-600">Analyzing rest opportunities...</p>
        </motion.div>
      ) : restData ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">💡 Rest Recommendation</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              restData.demand_impact.break_recommended 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {restData.demand_impact.break_recommended ? 'Recommended' : 'Not Recommended'}
            </div>
          </div>

          {restData.demand_impact.break_recommended ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Great time for a break!</h3>
                  <p className="text-sm text-green-700">
                    You'll only miss {restData.demand_impact.earnings_impact} of potential earnings during this low-demand period.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Consider waiting</h3>
                  <p className="text-sm text-yellow-700">
                    Demand is high right now. You might want to wait for a better break opportunity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-uber-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-uber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Insights</h3>
                <p className="text-sm text-gray-700">{restData.ai_recommendations}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Recommended Break Times */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ Best Break Times</h2>
        <div className="space-y-3">
          {restData?.recommended_break_times?.map((breakTime, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-uber-600" />
                <div>
                  <div className="font-medium text-gray-900">
                    {breakTime.start} - {breakTime.end}
                  </div>
                  <div className="text-sm text-gray-500">{breakTime.reason}</div>
                </div>
              </div>
              <div className="text-sm text-uber-600 font-medium">
                {restData.optimal_duration}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Nearby Rest Locations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Nearby Rest Spots</h2>
        <div className="space-y-3">
          {restLocations.map((location, index) => (
            <motion.div
              key={location.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-uber-600" />
                <div>
                  <div className="font-medium text-gray-900">{location.name}</div>
                  <div className="text-sm text-gray-500">
                    {location.distance} • {location.facilities.join(', ')}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-yellow-600">★</span>
                <span className="text-sm font-medium text-gray-900">{location.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fatigue Check */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Fatigue Check</h2>
        <div className="space-y-3">
          {fatigueSigns.map((sign, index) => (
            <motion.div
              key={sign.sign}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              className={`p-3 rounded-lg border ${
                sign.severity === 'High' ? 'bg-red-50 border-red-200' :
                sign.severity === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{sign.sign}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sign.severity === 'High' ? 'bg-red-100 text-red-800' :
                  sign.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {sign.severity}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">{sign.action}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Safety Reminder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
      >
        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">🛡️ Safety First</h3>
            <p className="text-sm text-blue-800">
              If you're feeling tired or notice any fatigue signs, prioritize safety over earnings. 
              Pull over immediately in a safe location and take a break.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RestPage;
