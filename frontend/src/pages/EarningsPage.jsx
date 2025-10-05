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
import { earningsAPI, advancedAPI, timeAPI } from '../services/api';

const EarningsPage = () => {
  const [earnings, setEarnings] = useState(null);
  const [multiPlatformEarnings, setMultiPlatformEarnings] = useState(null);
  const [competitiveData, setCompetitiveData] = useState(null);
  const [marketDemand, setMarketDemand] = useState(null);
  const [cityComparison, setCityComparison] = useState(null);
  const [timePatterns, setTimePatterns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hours, setHours] = useState(8);
  const [earnerId] = useState('E10000'); // Your personal profile
  const [selectedPlatform, setSelectedPlatform] = useState('both'); // rides, eats, jobs, both

  // Auto-refresh data when platform selection changes
  useEffect(() => {
    if (earnings) { // Only refresh if we already have data
      predictEarnings();
    }
  }, [selectedPlatform]);

  // Real time slots will be loaded from API

  const predictEarnings = async () => {
    setLoading(true);
    try {
      // Fetch earnings, competitive data, city comparison, and time patterns
      const [regularEarnings, multiPlatformData, cityComparisonData, timePatternsData] = await Promise.all([
        earningsAPI.predictEarnings(earnerId, hours, ''),
        advancedAPI.getMultiPlatformEarnings(earnerId, hours, selectedPlatform),
        advancedAPI.getCityComparison(),
        timeAPI.getTimePatterns(earnerId)
      ]);
      
      setEarnings(regularEarnings);
      setMultiPlatformEarnings(multiPlatformData);
      setCityComparison(cityComparisonData);
      setTimePatterns(timePatternsData);
      
      // Extract competitive intelligence and market demand from earnings data
      if (regularEarnings.competitive_intelligence) {
        setCompetitiveData(regularEarnings.competitive_intelligence);
      }
      if (regularEarnings.market_demand) {
        setMarketDemand(regularEarnings.market_demand);
      }
    } catch (error) {
      console.error('Error predicting earnings:', error);
      // No fallback data - let the UI handle empty states
      setEarnings(null);
      setMultiPlatformEarnings(null);
      setCompetitiveData(null);
      setMarketDemand(null);
      setTimePatterns(null);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">💰 Your Earnings Predictor</h1>
        <p className="text-gray-600">Personal AI-powered income forecasting</p>
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
          {hours === 1 ? '1 hour' : `${hours} hours`} • {earnings ? formatCurrency(hours * earnings.hourly_rate) : 'Loading...'}
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

      {/* Competitive Intelligence */}
      {competitiveData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-uber-600 mr-2" />
              Market Intelligence
            </h2>
            <p className="text-sm text-gray-600">How you compare to other drivers in your city</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Ranking */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">🏆 Your Performance</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">City Ranking</span>
                  <span className="font-semibold text-blue-600">{competitiveData.city_rank}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Experience Level</span>
                  <span className="font-semibold text-green-600">Top {competitiveData.experience_percentile}%</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">Rating vs Others</span>
                  <span className="font-semibold text-purple-600">Top {competitiveData.rating_percentile}%</span>
                </div>
              </div>
            </div>

            {/* Market Activity */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">📊 Market Activity</h3>
              
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Active Drivers</span>
                    <span className="font-semibold text-gray-900">
                      {competitiveData.total_earners_in_city - competitiveData.better_performers} of {competitiveData.total_earners_in_city}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-uber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${competitiveData.ranking_percentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Performance Score</div>
                  <div className="text-2xl font-bold text-yellow-600">{competitiveData.ranking_percentage}%</div>
                  <div className="text-xs text-gray-500">Better than {competitiveData.better_performers} drivers</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Market Demand Indicators */}
      {marketDemand && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-uber-600 mr-2" />
              Real-Time Market Status
            </h2>
            <p className="text-sm text-gray-600">Current demand and activity in your city</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Demand Level */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">📈 Demand Level</h3>
              
              <div className={`text-center p-6 rounded-lg border-2 ${
                marketDemand.demand_level === 'HIGH' ? 'bg-red-50 border-red-200' :
                marketDemand.demand_level === 'MEDIUM' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className={`text-3xl font-bold mb-2 ${
                  marketDemand.demand_level === 'HIGH' ? 'text-red-600' :
                  marketDemand.demand_level === 'MEDIUM' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {marketDemand.demand_level}
                </div>
                <div className="text-sm text-gray-600">{marketDemand.demand_description}</div>
                <div className="text-lg font-semibold mt-2">{marketDemand.activity_ratio}% Active</div>
              </div>
            </div>

            {/* Driver Activity */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">🚗 Driver Activity</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                  <span className="font-semibold text-green-600">{marketDemand.online_earners}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Engaged</span>
                  </div>
                  <span className="font-semibold text-blue-600">{marketDemand.engaged_earners}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Offline</span>
                  </div>
                  <span className="font-semibold text-gray-600">{marketDemand.offline_earners}</span>
                </div>
              </div>
              
              <div className="text-center p-3 bg-uber-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Total Drivers in City</div>
                <div className="text-xl font-bold text-uber-600">{marketDemand.total_earners}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

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
            
            {multiPlatformEarnings.predictions && Object.entries(multiPlatformEarnings.predictions).map(([platform, data], index) => (
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
                    <div className="text-sm text-gray-500">{formatCurrency(data.hourly_rate)}/hour</div>
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
            <div className="space-y-3">
              {multiPlatformEarnings.optimal_strategy && (
                <div className="bg-white rounded-lg p-3 border border-uber-200">
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-uber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900 mb-1">
                        {multiPlatformEarnings.optimal_strategy.recommendation}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {multiPlatformEarnings.optimal_strategy.reasoning}
                      </div>
                      <div className="text-sm font-semibold text-uber-600">
                        Expected Earnings: {formatCurrency(multiPlatformEarnings.optimal_strategy.expected_earnings)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ Real-Time Earnings Guide</h2>
        <div className="space-y-3">
          {timePatterns?.data?.time_slots ? (
            timePatterns.data.time_slots
              .filter(slot => slot.avg_earnings_per_trip > 0) // Only show hours with actual earnings
              .sort((a, b) => b.avg_earnings_per_trip - a.avg_earnings_per_trip) // Sort by earnings
              .slice(0, 8) // Show top 8 hours
              .map((slot, index) => (
                <motion.div
                  key={`${slot.hour}-${slot.label}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${slot.color}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{slot.label}</div>
                      <div className="text-sm text-gray-500">{slot.hour}:00 - {slot.hour + 1}:00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      €{slot.avg_earnings_per_trip.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {slot.trip_count} trips • {slot.surge_multiplier.toFixed(1)}x surge
                    </div>
                  </div>
                </motion.div>
              ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              {loading ? 'Loading time patterns...' : 'No time data available'}
            </div>
          )}
        </div>
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
