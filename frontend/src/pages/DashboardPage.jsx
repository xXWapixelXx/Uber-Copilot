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
  const [predictiveInsights, setPredictiveInsights] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [safetyAlerts, setSafetyAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEarner, setSelectedEarner] = useState('E10000'); // Default earner for demo

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    // Fetch each API independently to avoid one failure breaking everything
    const fetchStats = async () => {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({ error: 'Failed to load dashboard stats' });
      }
    };

    const fetchPlatformStats = async () => {
      try {
        const data = await advancedAPI.getPlatformStats();
        setPlatformStats(data);
      } catch (error) {
        console.error('Error fetching platform stats:', error);
        setPlatformStats({ error: 'Failed to load platform stats' });
      }
    };

    const fetchCityComparison = async () => {
      try {
        const data = await advancedAPI.getCityComparison();
        setCityComparison(data);
      } catch (error) {
        console.error('Error fetching city comparison:', error);
        setCityComparison({ error: 'Failed to load city comparison' });
      }
    };

    const fetchTimePatterns = async () => {
      try {
        const data = await advancedAPI.getTimePatterns();
        setTimePatterns(data);
      } catch (error) {
        console.error('Error fetching time patterns:', error);
        setTimePatterns({ error: 'Failed to load time patterns' });
      }
    };

    // Run all fetches in parallel but independently
    await Promise.allSettled([
      fetchStats(),
      fetchPlatformStats(),
      fetchCityComparison(),
      fetchTimePatterns()
    ]);

    setLoading(false);
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

  // Safety check to prevent crashes
  const safeStats = stats || {};
  const safePlatformStats = platformStats || {};
  const safeCityComparison = cityComparison || {};
  const safeTimePatterns = timePatterns || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🚀 Your Analytics Dashboard</h1>
        <p className="text-gray-600">Personal multi-platform intelligence & insights</p>
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
            <div className="text-2xl font-bold text-gray-900">
              {safeStats?.error ? 'Error' : (safeStats?.vehicle_type_distribution?.car || 'Loading...')}
            </div>
            <div className="text-sm text-gray-500">Drivers</div>
            <div className="text-xs text-blue-600 mt-1">Rides Platform</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Bike className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {safeStats?.error ? 'Error' : (safeStats?.vehicle_type_distribution?.bike || 'Loading...')}
            </div>
            <div className="text-sm text-gray-500">Couriers</div>
            <div className="text-xs text-green-600 mt-1">Eats Platform</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Briefcase className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {safeStats?.error ? 'Error' : (safeStats?.vehicle_type_distribution?.scooter || 'Loading...')}
            </div>
            <div className="text-sm text-gray-500">Job Seekers</div>
            <div className="text-xs text-purple-600 mt-1">Jobs Platform</div>
          </div>
        </div>

        {safePlatformStats && !safePlatformStats.error && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900">Platform Breakdown</div>
                <div className="text-gray-600">
                  EV Adoption: {safePlatformStats?.ev_adoption?.percentage || 'Loading...'}%
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Vehicle Types</div>
                <div className="text-gray-600">
                  Cars: {safePlatformStats?.vehicle_distribution?.car || 'Loading...'}
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
            {Object.entries(safeCityComparison.cities || {}).slice(0, 3).map(([cityId, data], index) => (
              <motion.div
                key={cityId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-uber-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-uber-600">{cityId.replace('city_', '')}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">City {cityId.replace('city_', '')}</div>
                    <div className="text-sm text-gray-500">
                      {data.earnings_stats?.total_earners || 0} drivers, {data.earnings_stats?.total_rides || 0} rides
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(data.earnings_stats?.avg_daily_earnings || 0)}
                  </div>
                  <div className="text-xs text-gray-500">avg daily</div>
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
                {safeTimePatterns.ride_patterns && Object.entries(safeTimePatterns.ride_patterns).slice(0, 3).map(([hour, data]) => (
                  <div key={hour} className="flex justify-between text-sm">
                    <span>{hour}:00</span>
                    <span className="text-green-600">€{Math.round(data.net_earnings || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">🍕 Eats Patterns</h3>
              <div className="space-y-2">
                {safeTimePatterns.eats_patterns && Object.entries(safeTimePatterns.eats_patterns).slice(0, 3).map(([hour, data]) => (
                  <div key={hour} className="flex justify-between text-sm">
                    <span>{hour}:00</span>
                    <span className="text-blue-600">€{Math.round(data.net_earnings || 0)}</span>
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