import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star,
  Target,
  Zap,
  Calculator,
  Loader2,
  Car,
  Bike,
  Utensils,
  Briefcase,
  BarChart3,
  Globe
} from 'lucide-react';
import { earningsAPI, advancedAPI } from '../services/api';

const EarningsPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [multiPlatformEarnings, setMultiPlatformEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState(8);
  const [earnerId] = useState('E10000'); // Demo earner ID
  const [additionalContext, setAdditionalContext] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('both'); // rides, eats, jobs, both

  const timeSlots = [
    { start: '07:00', end: '09:00', label: 'Morning Rush', multiplier: 1.8, color: 'bg-green-500' },
    { start: '17:00', end: '19:00', label: 'Evening Rush', multiplier: 1.6, color: 'bg-blue-500' },
    { start: '22:00', end: '02:00', label: 'Night Shift', multiplier: 1.4, color: 'bg-purple-500' },
    { start: '14:00', end: '16:00', label: 'Low Demand', multiplier: 0.6, color: 'bg-red-500' },
  ];

  const predictEarnings = async () => {
    setLoading(true);
    try {
      // Fetch both regular and multi-platform earnings
      const [regularEarnings, multiPlatformData] = await Promise.all([
        earningsAPI.predictEarnings(earnerId, hours, additionalContext),
        advancedAPI.getMultiPlatformEarnings(earnerId, hours, selectedPlatform)
      ]);
      
      setEarnings(regularEarnings);
      setMultiPlatformEarnings(multiPlatformData);
    } catch (error) {
      console.error('Error predicting earnings:', error);
      // Fallback mock data
      setEarnings({
        predicted_earnings: hours * 25.50,
        hourly_rate: 25.50,
        confidence_score: 0.75,
        ai_insights: "Based on current demand patterns and your profile, you can expect solid earnings today. Focus on peak hours for maximum income.",
        factors: ["Peak hour availability", "Current demand", "Your experience level"],
        timestamp: new Date().toISOString()
      });
      
      // Mock multi-platform data
      setMultiPlatformEarnings({
        total_predicted_earnings: hours * 32.50,
        platform_breakdown: {
          rides: { predicted_earnings: hours * 20, percentage: 62 },
          eats: { predicted_earnings: hours * 8, percentage: 25 },
          jobs: { predicted_earnings: hours * 4.5, percentage: 14 }
        },
        optimization_insights: ["Focus on rides during peak hours", "Eats orders are profitable during lunch/dinner", "Jobs platform offers consistent base income"],
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    predictEarnings();
  }, [hours]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">💰 Earnings Predictor</h1>
        <p className="text-gray-600">AI-powered income forecasting</p>
      </div>

      {/* Hours Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Duration</h2>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Hours to work:</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setHours(Math.max(1, hours - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-bold text-gray-900 w-8 text-center">{hours}</span>
            <button
              onClick={() => setHours(Math.min(24, hours + 1))}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              +
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {hours === 1 ? '1 hour' : `${hours} hours`} • {formatCurrency(hours * 25)}
        </div>
      </motion.div>

      {/* Earnings Prediction */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-6 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-uber-600 mx-auto mb-4" />
          <p className="text-gray-600">Calculating your earnings...</p>
        </motion.div>
      ) : earnings ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-uber-600 mb-2">
              {formatCurrency(earnings.predicted_earnings)}
            </div>
            <div className="text-lg text-gray-600">
              {formatCurrency(earnings.hourly_rate)}/hour
            </div>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${
                earnings.confidence_score > 0.8 ? 'bg-green-500' :
                earnings.confidence_score > 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-500">
                {Math.round(earnings.confidence_score * 100)}% confidence
              </span>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-uber-50 to-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-uber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🤖 AI Insights</h3>
                <p className="text-sm text-gray-700">{earnings.ai_insights}</p>
              </div>
            </div>
          </div>

          {/* Key Factors */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">📊 Key Factors</h3>
            <div className="space-y-2">
              {earnings.factors.map((factor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Target className="w-4 h-4 text-uber-600" />
                  <span className="text-sm text-gray-700">{factor}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Multi-Platform Earnings */}
      {multiPlatformEarnings && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center">
              <Globe className="w-5 h-5 text-uber-600 mr-2" />
              Multi-Platform Earnings
            </h2>
            <div className="text-3xl font-bold text-uber-600 mb-2">
              {formatCurrency(multiPlatformEarnings.total_predicted_earnings || 0)}
            </div>
            <div className="text-sm text-gray-600">
              Total across all platforms
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Platform Breakdown</h3>
            
            {multiPlatformEarnings.platform_breakdown && Object.entries(multiPlatformEarnings.platform_breakdown).map(([platform, data], index) => (
              <motion.div
                key={platform}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {platform === 'rides' && <Car className="w-5 h-5 text-blue-600" />}
                  {platform === 'eats' && <Utensils className="w-5 h-5 text-green-600" />}
                  {platform === 'jobs' && <Briefcase className="w-5 h-5 text-purple-600" />}
                  <div>
                    <div className="font-medium text-gray-900 capitalize">{platform}</div>
                    <div className="text-sm text-gray-500">{data.percentage}% of total</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(data.predicted_earnings)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(data.predicted_earnings / hours)}/hr
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Optimization Insights */}
          <div className="bg-gradient-to-r from-uber-50 to-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 text-uber-600 mr-2" />
              Optimization Insights
            </h3>
            <div className="space-y-2">
              {multiPlatformEarnings.optimization_insights && multiPlatformEarnings.optimization_insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-uber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Platform Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Focus</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'both', label: 'All Platforms', icon: Globe, color: 'bg-uber-600' },
            { id: 'rides', label: 'Rides Only', icon: Car, color: 'bg-blue-600' },
            { id: 'eats', label: 'Eats Only', icon: Utensils, color: 'bg-green-600' },
            { id: 'jobs', label: 'Jobs Only', icon: Briefcase, color: 'bg-purple-600' }
          ].map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlatform === platform.id
                  ? `${platform.color} text-white border-transparent`
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <platform.icon className="w-5 h-5 mx-auto mb-2" />
              <div className="text-sm font-medium">{platform.label}</div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Peak Hours Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ Peak Hours Guide</h2>
        <div className="space-y-3">
          {timeSlots.map((slot, index) => (
            <motion.div
              key={slot.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${slot.color}`}></div>
                <div>
                  <div className="font-medium text-gray-900">{slot.label}</div>
                  <div className="text-sm text-gray-500">{slot.start} - {slot.end}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {slot.multiplier > 1 ? '+' : ''}{Math.round((slot.multiplier - 1) * 100)}%
                </div>
                <div className="text-xs text-gray-500">demand</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Additional Context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Additional Context</h2>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Tell me more about your situation (e.g., 'Working in downtown', 'Weekend shift', 'New to the area')..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-uber-500 focus:border-transparent"
          rows="3"
        />
        <button
          onClick={predictEarnings}
          className="mt-3 w-full btn-primary"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Update Prediction
        </button>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="card p-6 bg-gradient-to-r from-green-50 to-blue-50"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Pro Tips</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Maximize Peak Hours</div>
              <div className="text-sm text-gray-600">Focus on morning and evening rushes for highest earnings</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Location Matters</div>
              <div className="text-sm text-gray-600">City centers and airports typically pay more</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Maintain High Rating</div>
              <div className="text-sm text-gray-600">Better ratings = more ride requests</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EarningsPage;
