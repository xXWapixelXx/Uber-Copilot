import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Star, 
  MapPin, 
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Loader2,
  Bike,
  Utensils,
  Briefcase,
  Cloud,
  Target,
  Zap,
  Navigation,
  Eye,
  Activity,
  Award,
  Globe
} from 'lucide-react';
import { dashboardAPI, advancedAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [cityComparison, setCityComparison] = useState(null);
  const [timePatterns, setTimePatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEarner, setSelectedEarner] = useState('E10000'); // Default earner for demo

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsData, platformData, cityData, timeData] = await Promise.all([
        dashboardAPI.getStats(),
        advancedAPI.getPlatformStats(),
        advancedAPI.getCityComparison(),
        advancedAPI.getTimePatterns()
      ]);

      setStats(statsData);
      setPlatformStats(platformData);
      setCityComparison(cityData);
      setTimePatterns(timeData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback mock data
      setStats({
        total_earners: 360,
        earnings_by_city: { "1": 25.45, "2": 27.89, "3": 26.12, "4": 29.34, "5": 28.98 },
        earnings_by_experience: {
          "0-12 months": 25.03,
          "12-24 months": 26.31,
          "24-36 months": 27.41,
          "36-60 months": 29.28,
          "60+ months": 31.62
        },
        vehicle_type_distribution: { "car": 280, "bike": 60, "scooter": 20 },
        rating_statistics: { "average": 4.72, "min": 1.0, "max": 5.0 },
        time_patterns: {
          peak_hours: {
            morning: { start: "07:00", end: "09:00", demand_multiplier: 1.8 },
            evening: { start: "17:00", end: "19:00", demand_multiplier: 1.6 },
            night: { start: "22:00", end: "02:00", demand_multiplier: 1.4 }
          },
          low_demand_hours: {
            midday: { start: "14:00", end: "16:00", demand_multiplier: 0.6 },
            late_night: { start: "02:00", end: "06:00", demand_multiplier: 0.4 }
          }
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-uber-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🚀 Advanced Analytics</h1>
        <p className="text-gray-600">Multi-platform intelligence & insights</p>
      </div>

      {/* Multi-Platform Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 text-uber-600 mr-2" />
          Multi-Platform Overview
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">280</div>
            <div className="text-sm text-gray-500">Drivers</div>
            <div className="text-xs text-blue-600 mt-1">Rides Platform</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Bike className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">60</div>
            <div className="text-sm text-gray-500">Couriers</div>
            <div className="text-xs text-green-600 mt-1">Eats Platform</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">20</div>
            <div className="text-sm text-gray-500">Job Seekers</div>
            <div className="text-xs text-purple-600 mt-1">Jobs Platform</div>
          </div>
        </div>

        {platformStats && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">Platform Breakdown</div>
                <div className="text-gray-600">
                  EV Adoption: {platformStats.ev_adoption_rate}%
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Vehicle Types</div>
                <div className="text-gray-600">
                  Cars: {platformStats.vehicle_types.car || 280}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Location Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Navigation className="w-5 h-5 text-uber-600 mr-2" />
          Location Intelligence
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Hot Spots</span>
              <Zap className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">
              High-demand hexagons identified
            </div>
            <div className="text-xs text-green-600 mt-1">
              +{Math.floor(Math.random() * 40) + 20}% surge
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">Weather Impact</span>
              <Cloud className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">
              Rain increases demand by 15%
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Weather-aware recommendations
            </div>
          </div>
        </div>
      </motion.div>

      {/* Incentive Intelligence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 text-uber-600 mr-2" />
          Incentive Intelligence
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-medium text-gray-900">Weekly Quest</div>
                <div className="text-sm text-gray-500">Complete 40 rides</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-yellow-600">$120</div>
              <div className="text-xs text-gray-500">bonus</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Surge Bonus</div>
                <div className="text-sm text-gray-500">Peak hours multiplier</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">2.5x</div>
              <div className="text-xs text-gray-500">rate</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* City Comparison */}
      {cityComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-uber-600 mr-2" />
            Multi-City Performance
          </h2>
          
          <div className="space-y-3">
            {Object.entries(cityComparison.city_performance || {}).slice(0, 3).map(([cityId, data], index) => (
              <motion.div
                key={cityId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-uber-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-uber-600">{cityId}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">City {cityId}</div>
                    <div className="text-sm text-gray-500">
                      Rides: {data.rides_performance?.total_rides || 0}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(data.earnings_performance?.avg_hourly_earnings || 25)}
                  </div>
                  <div className="text-xs text-gray-500">per hour</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Enhanced Time Patterns */}
      {timePatterns && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-uber-600 mr-2" />
            Enhanced Time Patterns
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">🚗 Rides Patterns</h3>
              <div className="space-y-2">
                {timePatterns.ride_patterns && Object.entries(timePatterns.ride_patterns).slice(0, 3).map(([hour, data]) => (
                  <div key={hour} className="flex justify-between text-sm">
                    <span>{hour}:00</span>
                    <span className="text-green-600">+{Math.round(data * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">🍕 Eats Patterns</h3>
              <div className="space-y-2">
                {timePatterns.eats_patterns && Object.entries(timePatterns.eats_patterns).slice(0, 3).map(([hour, data]) => (
                  <div key={hour} className="flex justify-between text-sm">
                    <span>{hour}:00</span>
                    <span className="text-blue-600">+{Math.round(data * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="w-5 h-5 text-uber-600 mr-2" />
          Performance Metrics
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">4.72</div>
            <div className="text-sm text-gray-500">Avg Rating</div>
            <div className="text-xs text-green-600 mt-1">Top 15%</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">$28</div>
            <div className="text-sm text-gray-500">Avg Hourly</div>
            <div className="text-xs text-blue-600 mt-1">Above avg</div>
          </div>
        </div>
      </motion.div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="w-5 h-5 text-uber-600 mr-2" />
          AI-Powered Insights
        </h2>
        
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-uber-50 to-blue-50 rounded-lg border border-uber-200">
            <div className="font-medium text-gray-900 mb-1">🎯 Optimization Opportunity</div>
            <div className="text-sm text-gray-600">
              Focus on rides during 7-9 AM for +25% earnings boost
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200">
            <div className="font-medium text-gray-900 mb-1">📍 Location Recommendation</div>
            <div className="text-sm text-gray-600">
              City 4 hexagon H3_8a3963666d7ffff shows highest demand
            </div>
          </div>

          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="font-medium text-gray-900 mb-1">⏰ Weather Alert</div>
            <div className="text-sm text-gray-600">
              Rain expected 3-6 PM - expect +15% demand surge
            </div>
          </div>
        </div>
      </motion.div>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-sm text-gray-500"
      >
        Last updated: {new Date().toLocaleString()}
      </motion.div>
    </div>
  );
};

export default DashboardPage;